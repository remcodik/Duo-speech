/* Lingo Isle — game logic: the conversation engine and the two mini-games.
   All DOM work is delegated to LINGO.ui; this file owns rules and scoring. */
"use strict";

window.LINGO = window.LINGO || {};

(function () {
  /* ---------------- Conversation engine ---------------- */

  const convo = {
    scenario: null,
    stepIndex: 0,       // scripted-mode pointer
    history: [],        // AI-mode message history [{role, content}]
    exchanges: 0,
    mistakes: 0,
    done: false,
    busy: false,
  };

  function startScenario(scenario) {
    convo.scenario = scenario;
    convo.stepIndex = 0;
    convo.history = [];
    convo.exchanges = 0;
    convo.mistakes = 0;
    convo.done = false;
    convo.busy = false;

    const lang = LINGO.state.data.lang;
    const opening = scenario.steps[0];
    // Both modes open with the scripted first line; in AI mode it seeds the history.
    convo.history.push({ role: "assistant", content: JSON.stringify({ reply: opening.line[lang] }) });
    LINGO.ui.showConvo(scenario, {
      reply: opening.line[lang],
      replyTranslation: opening.tr,
      hint: opening.hint[lang],
      expression: "happy",
    });
  }

  async function playerSays(text) {
    if (!text || convo.busy || convo.done) return;
    convo.busy = true;
    const lang = LINGO.state.data.lang;
    const scenario = convo.scenario;
    LINGO.ui.showPlayerBubble(text);
    LINGO.ui.setThinking(true);

    LINGO.state.data.utterances++;
    let turn;
    if (LINGO.ai.aiAvailable()) {
      try {
        convo.history.push({ role: "user", content: text });
        trimHistory();
        turn = await LINGO.ai.claudeTurn(scenario, lang, convo.history);
        convo.history.push({ role: "assistant", content: turn.rawAssistantText });
      } catch (err) {
        convo.history.pop(); // roll back the failed user turn
        LINGO.ui.toast(aiErrorMessage(err));
        turn = LINGO.ai.scriptedTurn(scenario, lang, convo.stepIndex, text);
      }
    } else {
      turn = LINGO.ai.scriptedTurn(scenario, lang, convo.stepIndex, text);
    }

    // Scripted-mode step advance
    if (turn.source === "script" && !turn.retry && !turn.missionComplete) convo.stepIndex++;
    if (turn.retry) convo.mistakes++;

    convo.exchanges++;
    applyScores(turn, text);
    LINGO.ui.setThinking(false);
    LINGO.ui.renderTurn(turn);

    if (turn.missionComplete) {
      convo.done = true;
      finishScenario(turn);
    }
    convo.busy = false;
  }

  function trimHistory() {
    // Keep the seed line + the last 12 turns so cost stays flat in long chats.
    if (convo.history.length > 13) {
      convo.history = [convo.history[0], ...convo.history.slice(-12)];
    }
  }

  function applyScores(turn, playerText) {
    const st = LINGO.state;
    // Speaking skill: participation-based (you spoke, in any mode).
    st.bumpSkill("speaking", Math.min(100, 40 + playerText.split(/\s+/).length * 8));
    if (turn.grammarScore != null) st.bumpSkill("grammar", turn.grammarScore);
    for (const w of turn.newWords || []) st.addWord(w.word, w.meaning);
    st.bumpSkill("vocab", Math.min(100, Object.keys(st.data.words).length * 4));
    st.addXP(turn.retry ? 2 : 10);
  }

  function finishScenario(turn) {
    // Stars: 3 = clean run, 2 = a few retries, 1 = got there eventually.
    const s = convo.mistakes === 0 ? 3 : convo.mistakes <= 2 ? 2 : 1;
    LINGO.state.setStars(convo.scenario.id, s);
    LINGO.state.addXP(25 * s);
    const fresh = LINGO.state.checkBadges();
    LINGO.ui.celebrate(convo.scenario, s, fresh);
  }

  function aiErrorMessage(err) {
    if (err.status === 401) return "🔑 That API key was rejected — check it in Settings. Switching to scripted mode.";
    if (err.status === 429) return "🐢 The AI is rate-limited right now. Switching to scripted mode.";
    if (err.kind === "refusal") return "🤐 The AI skipped that one. Try phrasing it differently.";
    return "📡 Couldn't reach the AI — playing scripted mode for now.";
  }

  /* ---------------- Mini-games ---------------- */

  const game = { kind: null, phrase: null, order: null, picked: null };

  function nextPhrase() {
    const list = LINGO.PHRASES[LINGO.state.data.lang];
    return list[Math.floor(Math.random() * list.length)];
  }

  function startEcho() {
    game.kind = "echo";
    game.phrase = nextPhrase();
    LINGO.ui.showEcho(game.phrase);
  }

  /* Score = fraction of target words present in the transcript. */
  function scoreEcho(transcript) {
    const norm = LINGO.ai.normalize;
    const target = norm(game.phrase.text).split(" ").filter(Boolean);
    const said = new Set(norm(transcript).split(" ").filter(Boolean));
    const hits = target.filter((w) => said.has(w)).length;
    const pct = Math.round((hits / target.length) * 100);
    LINGO.state.data.miniGames++;
    LINGO.state.bumpSkill("speaking", pct);
    LINGO.state.addXP(Math.round(pct / 10));
    const fresh = LINGO.state.checkBadges();
    LINGO.ui.showEchoResult(pct, transcript, fresh);
  }

  function startSalad() {
    game.kind = "salad";
    game.phrase = nextPhrase();
    const words = game.phrase.text.split(/\s+/);
    game.order = words;
    game.picked = [];
    let shuffled;
    do { shuffled = [...words].sort(() => Math.random() - 0.5); }
    while (words.length > 1 && shuffled.join(" ") === words.join(" "));
    LINGO.ui.showSalad(game.phrase, shuffled);
  }

  function saladPick(word, el) {
    game.picked.push(word);
    LINGO.ui.saladPicked(word, el, game.picked.length === game.order.length);
  }

  function saladUndo() {
    game.picked.pop();
  }

  function checkSalad() {
    const ok = game.picked.join(" ") === game.order.join(" ");
    LINGO.state.data.miniGames++;
    LINGO.state.addXP(ok ? 12 : 3);
    LINGO.state.bumpSkill("vocab", ok ? 90 : 40);
    const fresh = LINGO.state.checkBadges();
    LINGO.ui.showSaladResult(ok, game.phrase, fresh);
  }

  LINGO.game = { convo, game, startScenario, playerSays, startEcho, scoreEcho, startSalad, saladPick, saladUndo, checkSalad };
})();
