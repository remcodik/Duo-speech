/* Lingo Isle — player state & persistence (localStorage, best-effort). */
"use strict";

window.LINGO = window.LINGO || {};

(function () {
  const KEY = "lingo-isle-v1";

  const DEFAULTS = () => ({
    lang: null,               // "es" | "fr" | "de" | "en"
    level: "beginner",        // "beginner" | "intermediate"
    xp: 0,
    utterances: 0,            // things the player has said/typed in scenarios
    miniGames: 0,             // mini-game rounds played
    stars: {},                // scenarioId -> 0..3
    words: {},                // word -> meaning (collected vocabulary)
    skills: { speaking: 0, grammar: 0, vocab: 0 },   // 0..100 rolling
    grammarSamples: 0,
    badges: [],               // earned badge ids
    settings: {
      model: "claude-opus-4-8",
      capUSD: 1.0,
    },
  });

  let data = DEFAULTS();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        data = Object.assign(DEFAULTS(), saved);
        data.settings = Object.assign(DEFAULTS().settings, saved.settings || {});
        data.skills = Object.assign(DEFAULTS().skills, saved.skills || {});
      }
    } catch (e) { /* private browsing / corrupt state: run stateless */ }
    return data;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* best effort */ }
  }

  function reset() {
    data = DEFAULTS();
    try { localStorage.removeItem(KEY); } catch (e) {}
    try { sessionStorage.removeItem("lingo-isle-key"); } catch (e) {}
  }

  /* API key lives separately so "reset progress" alone doesn't nuke it, and
     it never travels inside the main state blob. */
  function getApiKey() {
    try { return localStorage.getItem("lingo-isle-key") || ""; } catch (e) { return ""; }
  }
  function setApiKey(k) {
    try {
      if (k) localStorage.setItem("lingo-isle-key", k);
      else localStorage.removeItem("lingo-isle-key");
    } catch (e) {}
  }

  function addXP(n) {
    data.xp += n;
    save();
    if (LINGO.ui) LINGO.ui.refreshXP();
  }

  function totalStars() {
    return Object.values(data.stars).reduce((a, b) => a + b, 0);
  }

  function setStars(scenarioId, stars) {
    data.stars[scenarioId] = Math.max(data.stars[scenarioId] || 0, stars);
    save();
  }

  function addWord(word, meaning) {
    if (!word) return;
    if (!(word in data.words)) data.words[word] = meaning || "";
    save();
  }

  /* Rolling skill update: gentle exponential average so one bad round never tanks you. */
  function bumpSkill(name, score /* 0..100 */) {
    const cur = data.skills[name] || 0;
    data.skills[name] = Math.round(cur * 0.8 + score * 0.2);
    if (name === "grammar") data.grammarSamples++;
    save();
  }

  /* Returns newly earned badges (array of badge objects). */
  function checkBadges() {
    const fresh = [];
    for (const b of LINGO.BADGES) {
      if (!data.badges.includes(b.id) && b.test(data)) {
        data.badges.push(b.id);
        fresh.push(b);
      }
    }
    if (fresh.length) save();
    return fresh;
  }

  LINGO.state = {
    load, save, reset, addXP, totalStars, setStars, addWord, bumpSkill, checkBadges,
    getApiKey, setApiKey,
    get data() { return data; },
  };
})();
