/* Lingo Isle — all rendering. Security rule: model/user text only ever lands in
   the DOM via textContent — never innerHTML. innerHTML is used solely for
   clearing containers and for app-authored static SVG. */
"use strict";

window.LINGO = window.LINGO || {};

(function () {
  const $ = (id) => document.getElementById(id);

  /* ---------------- screens ---------------- */

  function show(screenId) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(screenId).classList.add("active");
    $("topbar").classList.toggle("hidden", screenId === "screen-welcome");
    window.scrollTo(0, 0);
  }

  /* ---------------- welcome ---------------- */

  function renderLangPicker() {
    const wrap = $("lang-picker");
    wrap.innerHTML = "";
    for (const [code, l] of Object.entries(LINGO.LANGUAGES)) {
      const b = document.createElement("button");
      b.className = "lang-btn";
      b.dataset.lang = code;
      const flag = document.createElement("span");
      flag.className = "lang-flag";
      flag.textContent = l.flag;
      const name = document.createElement("span");
      name.textContent = l.name;
      b.append(flag, name);
      b.addEventListener("click", () => {
        wrap.querySelectorAll(".lang-btn").forEach((x) => x.classList.remove("selected"));
        b.classList.add("selected");
        $("btn-start").disabled = false;
      });
      wrap.appendChild(b);
    }
  }

  /* ---------------- top bar ---------------- */

  function refreshXP() {
    $("xp-value").textContent = LINGO.state.data.xp;
    const chip = $("xp-chip");
    chip.classList.remove("pop");
    void chip.offsetWidth; // restart animation
    chip.classList.add("pop");
  }

  function refreshTopbar() {
    const lang = LINGO.LANGUAGES[LINGO.state.data.lang];
    $("topbar-lang").textContent = lang ? lang.flag : "";
    refreshXP();
  }

  /* ---------------- island map ---------------- */

  const MAP_SPOTS = { cafe: [26, 34], market: [68, 26], taxi: [30, 68], party: [70, 66] };

  function renderMap() {
    const holder = $("island-map");
    holder.innerHTML = ISLAND_SVG; // app-authored static markup
    const svg = holder.querySelector("svg");
    const stars = LINGO.state.totalStars();

    for (const sc of LINGO.SCENARIOS) {
      const [x, y] = MAP_SPOTS[sc.id];
      const locked = stars < sc.unlockStars;
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "map-spot" + (locked ? " locked" : ""));
      g.setAttribute("transform", `translate(${x} ${y})`);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", "9");
      circle.setAttribute("fill", locked ? "#94a3b8" : sc.color);
      const em = document.createElementNS("http://www.w3.org/2000/svg", "text");
      em.setAttribute("text-anchor", "middle");
      em.setAttribute("dy", "2.5");
      em.setAttribute("font-size", "9");
      em.textContent = locked ? "🔒" : sc.emoji;
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "spot-label");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("y", "16");
      label.textContent = locked ? `${sc.unlockStars}⭐ to unlock` : sc.name;
      const starRow = document.createElementNS("http://www.w3.org/2000/svg", "text");
      starRow.setAttribute("class", "spot-stars");
      starRow.setAttribute("text-anchor", "middle");
      starRow.setAttribute("y", "-12");
      starRow.textContent = "⭐".repeat(LINGO.state.data.stars[sc.id] || 0);

      g.append(circle, em, label, starRow);
      if (!locked) {
        g.addEventListener("click", () => LINGO.game.startScenario(sc));
      }
      svg.appendChild(g);
    }
    refreshAiPill();
  }

  function refreshAiPill() {
    const pill = $("ai-status-pill");
    pill.innerHTML = "";
    const key = LINGO.state.getApiKey();
    const dot = document.createElement("span");
    dot.className = "dot";
    const txt = document.createElement("span");
    if (key && LINGO.cost.capReached()) {
      dot.classList.add("amber");
      txt.textContent = `AI paused — session cap ${LINGO.cost.fmtUSD(LINGO.state.data.settings.capUSD)} reached`;
    } else if (key) {
      dot.classList.add("green");
      const est = LINGO.cost.estimateExchangeUSD(LINGO.state.data.settings.model);
      txt.textContent = `AI coach on · ~${LINGO.cost.fmtUSD(est)}/exchange · session ${LINGO.cost.fmtUSD(LINGO.cost.session.usd)}`;
    } else {
      dot.classList.add("gray");
      txt.textContent = "Scripted mode (free) — add a Claude key in ⚙️ for AI conversations";
    }
    pill.append(dot, txt);
  }

  const ISLAND_SVG = `
  <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-label="Island map">
    <defs>
      <radialGradient id="sea" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#0ea5e9"/>
      </radialGradient>
      <radialGradient id="sand" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#fbbf24"/>
      </radialGradient>
    </defs>
    <rect width="100" height="100" fill="url(#sea)"/>
    <ellipse class="wave" cx="14" cy="14" rx="5" ry="1.1" fill="#e0f2fe" opacity=".8"/>
    <ellipse class="wave w2" cx="88" cy="46" rx="6" ry="1.2" fill="#e0f2fe" opacity=".8"/>
    <ellipse class="wave w3" cx="16" cy="88" rx="5" ry="1.1" fill="#e0f2fe" opacity=".8"/>
    <path d="M50 8 C82 12 94 38 88 62 C83 84 62 96 44 93 C22 89 8 72 10 50 C12 26 26 10 50 8 Z" fill="url(#sand)"/>
    <path d="M50 14 C76 18 87 39 82 59 C78 78 60 89 45 86 C27 83 15 69 17 51 C19 31 30 15 50 14 Z" fill="#4ade80"/>
    <text x="50" y="52" font-size="7" text-anchor="middle" opacity=".55">🌴</text>
    <text x="43" y="24" font-size="5" text-anchor="middle" opacity=".55">⛰️</text>
    <text x="58" y="80" font-size="5" text-anchor="middle" opacity=".55">🌺</text>
  </svg>`;

  /* ---------------- conversation ---------------- */

  let currentTurnHint = null;

  function showConvo(scenario, opening) {
    show("screen-convo");
    $("avatar-emoji").textContent = scenario.character.emoji;
    $("avatar-name").textContent = scenario.character.name;
    $("mission-text").textContent = `🎯 ${scenario.mission}`;
    $("mission-stars").textContent = "";
    $("feedback-area").innerHTML = "";
    $("player-bubble").classList.add("hidden");
    $("text-input").value = "";
    document.documentElement.style.setProperty("--scenario-color", scenario.color);
    renderNpc(opening.reply, opening.replyTranslation, opening.expression);
    currentTurnHint = opening.hint;
    refreshMicUi();
  }

  function renderNpc(text, translation, expression) {
    $("npc-text").textContent = text;
    $("npc-translation").textContent = translation || "";
    $("npc-translation").classList.add("hidden");
    $("npc-hint").classList.add("hidden");
    setExpression(expression || "happy");
    const bubble = $("npc-bubble");
    bubble.classList.remove("pop-in");
    void bubble.offsetWidth;
    bubble.classList.add("pop-in");
    LINGO.speech.speak(text, LINGO.LANGUAGES[LINGO.state.data.lang].bcp47);
  }

  const EXPRESSION_EMOJI = {
    happy: null, // character's own emoji
    excited: "🤩", confused: "🤨", thinking: "🤔", laughing: "😂", surprised: "😮",
  };

  function setExpression(expr) {
    const av = $("avatar");
    av.dataset.expression = expr;
    const base = LINGO.game.convo.scenario ? LINGO.game.convo.scenario.character.emoji : "😀";
    $("avatar-emoji").textContent = EXPRESSION_EMOJI[expr] || base;
  }

  function showPlayerBubble(text) {
    $("player-text").textContent = text;
    $("player-bubble").classList.remove("hidden");
  }

  function setThinking(on) {
    $("avatar").classList.toggle("thinking", on);
    if (on) {
      $("npc-text").textContent = "…";
      $("npc-translation").classList.add("hidden");
      $("npc-hint").classList.add("hidden");
    }
  }

  function renderTurn(turn) {
    renderNpc(turn.reply, turn.replyTranslation, turn.expression);
    currentTurnHint = turn.hint || null;

    const area = $("feedback-area");
    area.innerHTML = "";

    if (turn.praise) {
      const p = document.createElement("div");
      p.className = "praise-card";
      p.textContent = `💚 ${turn.praise}`;
      area.appendChild(p);
    }

    for (const c of turn.corrections || []) {
      const card = document.createElement("div");
      card.className = "fix-card";
      const said = document.createElement("div");
      said.className = "fix-said";
      said.textContent = `🗣️ ${c.you_said}`;
      const better = document.createElement("div");
      better.className = "fix-better";
      better.textContent = `✨ ${c.better}`;
      const why = document.createElement("div");
      why.className = "fix-why";
      why.textContent = c.why;
      card.append(said, better, why);
      area.appendChild(card);
    }

    if (turn.grammarScore != null) {
      const g = document.createElement("div");
      g.className = "score-chip";
      const face = turn.grammarScore >= 85 ? "🏄" : turn.grammarScore >= 60 ? "👍" : "🌱";
      g.textContent = `${face} Grammar ${turn.grammarScore}/100`;
      area.appendChild(g);
    }

    for (const w of turn.newWords || []) {
      const chip = document.createElement("div");
      chip.className = "word-chip";
      chip.textContent = `📖 ${w.word} — ${w.meaning}`;
      area.appendChild(chip);
    }

    if (turn.source === "ai" && turn.costUSD != null) {
      const c = document.createElement("div");
      c.className = "cost-chip";
      c.textContent = `💸 this reply: ${LINGO.cost.fmtUSD(turn.costUSD)} · session: ${LINGO.cost.fmtUSD(LINGO.cost.session.usd)}`;
      area.appendChild(c);
    }
    if (turn.source === "script" && LINGO.state.getApiKey() === "") {
      const c = document.createElement("div");
      c.className = "cost-chip muted";
      c.textContent = "🆓 scripted mode — add an API key in ⚙️ for grammar coaching";
      area.appendChild(c);
    }
  }

  function celebrate(scenario, stars, freshBadges) {
    $("mission-stars").textContent = "⭐".repeat(stars);
    confetti();
    setTimeout(() => {
      toast(`🎉 Mission complete: ${scenario.name} — ${"⭐".repeat(stars)} (+${25 * stars} XP)`);
      for (const b of freshBadges) toast(`🏅 New badge: ${b.emoji} ${b.name}`);
    }, 400);
  }

  /* ---------------- mic ---------------- */

  function refreshMicUi() {
    const supported = LINGO.speech.support.stt;
    $("btn-mic").classList.toggle("hidden", !supported);
    $("btn-game-mic").classList.toggle("hidden", true);
    $("mic-status").textContent = supported
      ? "Tap 🎤 and speak — or type below. Retries are free!"
      : "🎤 isn't supported in this browser — typing works great too!";
  }

  function setMicActive(on) {
    $("btn-mic").classList.toggle("recording", on);
    $("mic-status").textContent = on ? "Listening… 👂" : "Tap 🎤 and speak — or type below.";
  }

  /* ---------------- mini-games ---------------- */

  function resetArena() {
    $("game-arena").classList.remove("hidden");
    $("game-prompt").innerHTML = "";
    $("game-board").innerHTML = "";
    $("game-result").innerHTML = "";
    ["btn-game-mic", "btn-game-hear", "btn-game-check", "btn-game-next"].forEach((id) => $(id).classList.add("hidden"));
  }

  function showEcho(phrase) {
    resetArena();
    const p = $("game-prompt");
    const title = document.createElement("h3");
    title.textContent = "🦜 Echo Battle — say this:";
    const big = document.createElement("div");
    big.className = "echo-phrase";
    big.textContent = phrase.text;
    const tr = document.createElement("div");
    tr.className = "echo-tr";
    tr.textContent = phrase.tr;
    p.append(title, big, tr);
    $("btn-game-hear").classList.remove("hidden");
    if (LINGO.speech.support.stt) $("btn-game-mic").classList.remove("hidden");
    else {
      const note = document.createElement("p");
      note.className = "echo-tr";
      note.textContent = "(Speech recognition unavailable in this browser — try Word Salad instead!)";
      p.appendChild(note);
    }
    LINGO.speech.speak(phrase.text, LINGO.LANGUAGES[LINGO.state.data.lang].bcp47);
  }

  function showEchoResult(pct, transcript, freshBadges) {
    const r = $("game-result");
    r.innerHTML = "";
    const heard = document.createElement("div");
    heard.className = "echo-heard";
    heard.textContent = `The parrot heard: “${transcript}”`;
    const verdict = document.createElement("div");
    verdict.className = "echo-verdict";
    verdict.textContent =
      pct >= 90 ? `🏆 ${pct}% — squawk-tacular!` :
      pct >= 60 ? `😎 ${pct}% — pretty smooth!` :
      pct >= 30 ? `🙃 ${pct}% — the parrot squints…` :
                  `🫠 ${pct}% — the parrot fell off its perch. Again?`;
    r.append(heard, verdict);
    $("btn-game-next").classList.remove("hidden");
    for (const b of freshBadges) toast(`🏅 New badge: ${b.emoji} ${b.name}`);
    if (pct >= 60) confetti(12);
  }

  function showSalad(phrase, shuffledWords) {
    resetArena();
    const p = $("game-prompt");
    const title = document.createElement("h3");
    title.textContent = "🥗 Word Salad — rebuild the sentence:";
    const tr = document.createElement("div");
    tr.className = "echo-tr";
    tr.textContent = `Meaning: ${phrase.tr}`;
    p.append(title, tr);

    const board = $("game-board");
    const line = document.createElement("div");
    line.className = "salad-line";
    line.id = "salad-line";
    const pool = document.createElement("div");
    pool.className = "salad-pool";
    for (const w of shuffledWords) {
      const b = document.createElement("button");
      b.className = "salad-word";
      b.textContent = w;
      b.addEventListener("click", () => {
        if (b.disabled) return;
        b.disabled = true;
        LINGO.game.saladPick(w, b);
      });
      pool.appendChild(b);
    }
    board.append(line, pool);
  }

  function saladPicked(word, sourceBtn, complete) {
    const line = $("salad-line");
    const chip = document.createElement("button");
    chip.className = "salad-word placed";
    chip.textContent = word;
    chip.addEventListener("click", () => {
      // Undo: only the last word can be taken back (keeps logic simple & honest)
      if (line.lastElementChild === chip) {
        LINGO.game.saladUndo();
        chip.remove();
        sourceBtn.disabled = false;
        $("btn-game-check").classList.add("hidden");
      }
    });
    line.appendChild(chip);
    $("btn-game-check").classList.toggle("hidden", !complete);
  }

  function showSaladResult(ok, phrase, freshBadges) {
    const r = $("game-result");
    r.innerHTML = "";
    const verdict = document.createElement("div");
    verdict.className = "echo-verdict";
    verdict.textContent = ok ? "🥳 Crisp! Perfect salad!" : `🥀 Wilted… it was: “${phrase.text}”`;
    r.appendChild(verdict);
    $("btn-game-check").classList.add("hidden");
    $("btn-game-next").classList.remove("hidden");
    if (ok) confetti(12);
    for (const b of freshBadges) toast(`🏅 New badge: ${b.emoji} ${b.name}`);
    LINGO.speech.speak(phrase.text, LINGO.LANGUAGES[LINGO.state.data.lang].bcp47);
  }

  /* ---------------- progress ---------------- */

  function renderProgress() {
    show("screen-progress");
    const d = LINGO.state.data;

    // Garden: island grows with XP — one plant per 30 XP, buildings at milestones.
    const garden = $("garden");
    garden.innerHTML = "";
    const plants = ["🌱", "🌿", "🌴", "🌺", "🌻", "🦩", "🏖️", "⛵", "🏠", "🗼"];
    const n = Math.min(40, Math.floor(d.xp / 30) + 1);
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "garden-item";
      s.textContent = plants[i % plants.length];
      s.style.animationDelay = `${(i % 10) * 0.06}s`;
      garden.appendChild(s);
    }
    const cap = document.createElement("p");
    cap.className = "garden-cap";
    cap.textContent = `✨ ${d.xp} XP · ${LINGO.state.totalStars()} ⭐ · next sprout at ${(Math.floor(d.xp / 30) + 1) * 30} XP`;
    garden.appendChild(cap);

    $("meter-speaking").style.width = d.skills.speaking + "%";
    $("meter-grammar").style.width = d.skills.grammar + "%";
    $("meter-vocab").style.width = d.skills.vocab + "%";

    const badges = $("badges");
    badges.innerHTML = "";
    for (const b of LINGO.BADGES) {
      const el = document.createElement("div");
      el.className = "badge" + (d.badges.includes(b.id) ? "" : " locked");
      el.textContent = `${b.emoji} ${b.name}`;
      badges.appendChild(el);
    }

    const wb = $("wordbook");
    wb.innerHTML = "";
    const entries = Object.entries(d.words);
    if (!entries.length) {
      const p = document.createElement("p");
      p.className = "garden-cap";
      p.textContent = "Words you learn in conversations land here. 📖";
      wb.appendChild(p);
    }
    for (const [w, m] of entries) {
      const chip = document.createElement("div");
      chip.className = "word-chip";
      chip.textContent = m ? `${w} — ${m}` : w;
      wb.appendChild(chip);
    }

    const cr = $("cost-report");
    cr.innerHTML = "";
    const s = LINGO.cost.session;
    const h = document.createElement("h3");
    h.textContent = "💸 AI cost this session";
    const p = document.createElement("p");
    p.textContent = s.calls
      ? `${s.calls} AI replies · ${LINGO.cost.fmtUSD(s.usd)} total · ${s.inputTokens + s.cacheReadTokens} tokens in (${s.cacheReadTokens} from cache) / ${s.outputTokens} out`
      : "No AI calls yet this session — everything so far was free.";
    cr.append(h, p);
  }

  /* ---------------- settings ---------------- */

  function openSettings() {
    const d = LINGO.state.data;
    $("api-key-input").value = LINGO.state.getApiKey();
    const sel = $("model-select");
    sel.innerHTML = "";
    for (const [id, m] of Object.entries(LINGO.cost.MODELS)) {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = m.label;
      sel.appendChild(opt);
    }
    sel.value = d.settings.model;
    $("cap-input").value = d.settings.capUSD;
    refreshModelPriceNote();
    refreshCostMeter();
    $("speech-support-note").textContent = LINGO.speech.support.stt
      ? "✅ Speech recognition is available in this browser."
      : "⚠️ Speech recognition isn't available in this browser (try Chrome, Edge or Safari). Typing works everywhere.";
    $("modal-backdrop").classList.remove("hidden");
  }

  function refreshModelPriceNote() {
    const id = $("model-select").value;
    const m = LINGO.cost.priceFor(id);
    const est = LINGO.cost.estimateExchangeUSD(id);
    $("model-price-note").textContent =
      `$${m.inUSD}/M input · $${m.outUSD}/M output tokens ≈ ${LINGO.cost.fmtUSD(est)} per exchange (less with caching).`;
  }

  function refreshCostMeter() {
    const el = $("cost-meter");
    const s = LINGO.cost.session;
    const cap = LINGO.state.data.settings.capUSD;
    const pct = Math.min(100, Math.round((s.usd / cap) * 100));
    el.innerHTML = "";
    const label = document.createElement("div");
    label.className = "cost-meter-label";
    label.textContent = `Session: ${LINGO.cost.fmtUSD(s.usd)} of ${LINGO.cost.fmtUSD(cap)} cap (${s.calls} calls)`;
    const bar = document.createElement("div");
    bar.className = "meter";
    const fill = document.createElement("div");
    fill.className = "meter-fill cost";
    fill.style.width = pct + "%";
    bar.appendChild(fill);
    el.append(label, bar);
  }

  function closeSettings() { $("modal-backdrop").classList.add("hidden"); }

  /* ---------------- toast & confetti ---------------- */

  let toastTimer = null;
  const toastQueue = [];
  function toast(msg) {
    toastQueue.push(msg);
    if (!toastTimer) drainToast();
  }
  function drainToast() {
    const el = $("toast");
    const msg = toastQueue.shift();
    if (msg == null) { toastTimer = null; el.classList.add("hidden"); return; }
    el.textContent = msg;
    el.classList.remove("hidden");
    toastTimer = setTimeout(() => { el.classList.add("hidden"); setTimeout(drainToast, 250); }, 2600);
  }

  function confetti(count = 24) {
    const layer = $("confetti-layer");
    const bits = ["🎉", "✨", "🌟", "🎊", "💛", "🩵"];
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "confetto";
      s.textContent = bits[i % bits.length];
      s.style.left = Math.random() * 100 + "vw";
      s.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      s.style.fontSize = 14 + Math.random() * 16 + "px";
      layer.appendChild(s);
      setTimeout(() => s.remove(), 3200);
    }
  }

  LINGO.ui = {
    show, renderLangPicker, refreshXP, refreshTopbar, renderMap, refreshAiPill,
    showConvo, renderTurn, showPlayerBubble, setThinking, celebrate,
    refreshMicUi, setMicActive,
    showEcho, showEchoResult, showSalad, saladPicked, showSaladResult, resetArena,
    renderProgress, openSettings, closeSettings, refreshModelPriceNote, refreshCostMeter,
    toast, confetti,
    get currentHint() { return currentTurnHint; },
  };
})();
