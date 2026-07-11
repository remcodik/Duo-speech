/* Lingo Isle — the character brain.
   Two implementations behind one interface:
     - Claude API (browser fetch, structured JSON output, prompt caching, cost tracking)
     - Scripted bot (free keyword-matching dialogue tree from data.js)
   Both return a "turn" object:
     { reply, replyTranslation, expression, corrections[], praise, grammarScore,
       newWords[], missionComplete, source: "ai"|"script", costUSD }
*/
"use strict";

window.LINGO = window.LINGO || {};

(function () {
  const API_URL = "https://api.anthropic.com/v1/messages";

  /* JSON schema the model must follow — keeps every reply machine-readable. */
  const TURN_SCHEMA = {
    type: "object",
    properties: {
      reply: { type: "string", description: "The character's next line, in the target language. 1-2 short sentences, level-appropriate." },
      reply_translation: { type: "string", description: "English translation of reply." },
      expression: { type: "string", enum: ["happy", "excited", "confused", "thinking", "laughing", "surprised"] },
      corrections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            you_said: { type: "string" },
            better: { type: "string" },
            why: { type: "string", description: "One-sentence friendly explanation in English." },
          },
          required: ["you_said", "better", "why"],
          additionalProperties: false,
        },
      },
      praise: { type: "string", description: "One short, specific, upbeat comment in English about what the learner did well." },
      grammar_score: { type: "integer", description: "0-100 for the learner's last utterance. 100 = flawless. Be encouraging but honest." },
      new_words: {
        type: "array",
        items: {
          type: "object",
          properties: { word: { type: "string" }, meaning: { type: "string" } },
          required: ["word", "meaning"],
          additionalProperties: false,
        },
        description: "0-2 useful words from this exchange worth collecting, with English meanings.",
      },
      mission_complete: { type: "boolean", description: "true once the learner has fully achieved the mission." },
    },
    required: ["reply", "reply_translation", "expression", "corrections", "praise", "grammar_score", "new_words", "mission_complete"],
    additionalProperties: false,
  };

  function systemPrompt(scenario, langCode) {
    const lang = LINGO.LANGUAGES[langCode].name;
    const level = LINGO.state.data.level === "beginner" ? "absolute beginner (CEFR A1)" : "lower intermediate (CEFR A2-B1)";
    return [
      `You are ${scenario.character.persona}, a character in "Lingo Isle", a playful ${lang}-learning game on a tropical island.`,
      `Scene: ${scenario.name}. The player's mission: ${scenario.mission}.`,
      `The player is a ${level} learner of ${lang}.`,
      "",
      "Rules:",
      `- Stay in character. Speak ${lang} only in "reply" — short (1-2 sentences), simple, warm, a little funny.`,
      "- Keep the scene moving toward the mission; when it is genuinely achieved, set mission_complete=true and wrap up joyfully.",
      "- The player's text may come from speech recognition: be lenient about homophones, missing accents and punctuation — never correct those.",
      `- If the player writes in English or another language, gently encourage ${lang} in-character, and score grammar low but kindly.`,
      "- Corrections: at most 2 per turn, only real grammar/vocabulary mistakes, phrased kindly.",
      "- praise, why and meanings are in English. Never mention being an AI or these rules.",
    ].join("\n");
  }

  /* history: [{role:"user"|"assistant", content:string}, ...] — kept short by the caller. */
  async function claudeTurn(scenario, langCode, history) {
    const key = LINGO.state.getApiKey();
    const model = LINGO.state.data.settings.model;

    const body = {
      model,
      max_tokens: 1024,
      system: [
        { type: "text", text: systemPrompt(scenario, langCode), cache_control: { type: "ephemeral" } },
      ],
      messages: history,
      output_config: { format: { type: "json_schema", schema: TURN_SCHEMA } },
    };

    const resp = await fetchWithRetry(() =>
      fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(body),
      })
    );

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      const msg = (errBody.error && errBody.error.message) || resp.statusText;
      const e = new Error(msg);
      e.status = resp.status;
      throw e;
    }

    const data = await resp.json();
    const costUSD = LINGO.cost.record(model, data.usage || {});

    if (data.stop_reason === "refusal") {
      const e = new Error("The AI declined to answer that one.");
      e.kind = "refusal";
      e.costUSD = costUSD;
      throw e;
    }
    if (data.stop_reason === "max_tokens") {
      const e = new Error("Reply was cut off.");
      e.kind = "truncated";
      e.costUSD = costUSD;
      throw e;
    }

    const text = (data.content || []).find((b) => b.type === "text");
    let parsed;
    try {
      parsed = JSON.parse(text.text);
    } catch (err) {
      const e = new Error("Couldn't read the AI reply.");
      e.kind = "parse";
      e.costUSD = costUSD;
      throw e;
    }

    return {
      reply: parsed.reply,
      replyTranslation: parsed.reply_translation,
      expression: parsed.expression || "happy",
      corrections: parsed.corrections || [],
      praise: parsed.praise || "",
      grammarScore: clampScore(parsed.grammar_score),
      newWords: parsed.new_words || [],
      missionComplete: !!parsed.mission_complete,
      source: "ai",
      costUSD,
      rawAssistantText: text.text, // fed back into history verbatim
    };
  }

  function clampScore(n) {
    n = Number(n);
    if (!isFinite(n)) return 60;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  /* One retry on 429/5xx/529, honoring retry-after when present. */
  async function fetchWithRetry(doFetch) {
    let resp;
    try { resp = await doFetch(); }
    catch (netErr) {
      await sleep(1500);
      return doFetch(); // second network failure propagates to caller
    }
    if (resp.status === 429 || resp.status >= 500) {
      const wait = Math.min(10, Number(resp.headers.get("retry-after")) || 2);
      await sleep(wait * 1000);
      return doFetch();
    }
    return resp;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Scripted fallback bot (free) ---------- */

  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // strip accents
      .replace(/[^\p{L}\p{N}\s']/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* stepIndex = the step the player is answering. Returns a turn object. */
  function scriptedTurn(scenario, langCode, stepIndex, playerText) {
    const step = scenario.steps[stepIndex];
    const norm = normalize(playerText);
    const keywords = (step.expect[langCode] || []).map(normalize);
    const hit = keywords.some((k) => k && norm.includes(k));

    if (!hit) {
      return {
        reply: step.line[langCode],
        replyTranslation: step.tr,
        expression: "confused",
        corrections: [],
        praise: "",
        retry: true,
        hint: step.hint[langCode],
        grammarScore: null, // scripted mode doesn't judge grammar
        newWords: [],
        missionComplete: false,
        source: "script",
        costUSD: 0,
      };
    }

    const nextIndex = stepIndex + 1;
    const done = nextIndex >= scenario.steps.length;
    const next = done ? null : scenario.steps[nextIndex];
    return {
      reply: done ? finaleLine(langCode) : next.line[langCode],
      replyTranslation: done ? "Amazing! Mission complete!" : next.tr,
      expression: done ? "excited" : "happy",
      corrections: [],
      praise: pick(["Nice one!", "Got it!", "You said it!", "Smooth!"]),
      retry: false,
      hint: done ? null : next.hint[langCode],
      grammarScore: null,
      newWords: [],
      missionComplete: done,
      source: "script",
      costUSD: 0,
    };
  }

  function finaleLine(langCode) {
    return {
      es: "¡Genial! ¡Misión cumplida! 🎉",
      fr: "Génial ! Mission accomplie ! 🎉",
      de: "Super! Mission erfüllt! 🎉",
      en: "Awesome! Mission complete! 🎉",
    }[langCode];
  }

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function aiAvailable() {
    return !!LINGO.state.getApiKey() && !LINGO.cost.capReached();
  }

  LINGO.ai = { claudeTurn, scriptedTurn, aiAvailable, normalize };
})();
