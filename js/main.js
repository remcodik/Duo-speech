/* Lingo Isle — event wiring / app boot. */
"use strict";

(function () {
  const $ = (id) => document.getElementById(id);

  document.addEventListener("DOMContentLoaded", () => {
    LINGO.state.load();
    LINGO.ui.renderLangPicker();

    // Returning player? Skip the welcome screen.
    if (LINGO.state.data.lang) {
      LINGO.ui.refreshTopbar();
      goMap();
    }

    /* ----- welcome ----- */
    document.querySelectorAll(".level-btn").forEach((b) =>
      b.addEventListener("click", () => {
        document.querySelectorAll(".level-btn").forEach((x) => x.classList.remove("selected"));
        b.classList.add("selected");
      })
    );

    $("btn-start").addEventListener("click", () => {
      const langBtn = document.querySelector(".lang-btn.selected");
      if (!langBtn) return;
      LINGO.state.data.lang = langBtn.dataset.lang;
      LINGO.state.data.level = document.querySelector(".level-btn.selected").dataset.level;
      if (!LINGO.state.data.settings.modelChosenByUser) {
        LINGO.state.data.settings.model = LINGO.cost.suggestModel(LINGO.state.data.level);
      }
      LINGO.state.save();
      LINGO.ui.refreshTopbar();
      goMap();
    });

    /* ----- navigation ----- */
    function goMap() {
      LINGO.speech.stop();
      LINGO.ui.renderMap();
      LINGO.ui.show("screen-map");
    }
    $("btn-home").addEventListener("click", goMap);
    $("btn-convo-back").addEventListener("click", goMap);
    $("btn-games-back").addEventListener("click", goMap);
    $("btn-progress-back").addEventListener("click", goMap);
    $("btn-progress").addEventListener("click", () => LINGO.ui.renderProgress());
    $("btn-minigames").addEventListener("click", () => {
      LINGO.ui.show("screen-games");
      $("game-arena").classList.add("hidden");
    });

    /* ----- conversation input ----- */
    function submitText() {
      const v = $("text-input").value.trim();
      if (!v) return;
      $("text-input").value = "";
      LINGO.game.playerSays(v);
    }
    $("btn-send").addEventListener("click", submitText);
    $("text-input").addEventListener("keydown", (e) => { if (e.key === "Enter") submitText(); });

    let listening = false;
    $("btn-mic").addEventListener("click", () => {
      if (listening) { LINGO.speech.stop(); return; }
      const bcp47 = LINGO.LANGUAGES[LINGO.state.data.lang].bcp47;
      listening = true;
      LINGO.ui.setMicActive(true);
      LINGO.speech.listen(bcp47, {
        onResult: (text) => { LINGO.speech.stop(); LINGO.game.playerSays(text); },
        onPartial: (text) => LINGO.ui.showPlayerBubble(text + "…"),
        onError: (kind) => {
          if (kind === "not-allowed") LINGO.ui.toast("🎤 Mic blocked — allow it in the address bar, or just type!");
          else if (kind !== "no-speech" && kind !== "aborted") LINGO.ui.toast("🎤 Didn't catch that — try again or type it.");
        },
        onEnd: () => { listening = false; LINGO.ui.setMicActive(false); },
      });
    });

    $("btn-replay").addEventListener("click", () => {
      LINGO.speech.speak($("npc-text").textContent, LINGO.LANGUAGES[LINGO.state.data.lang].bcp47);
    });
    $("btn-translate").addEventListener("click", () => $("npc-translation").classList.toggle("hidden"));
    $("btn-hint").addEventListener("click", () => {
      const h = $("npc-hint");
      const hint = LINGO.ui.currentHint;
      h.textContent = hint ? `💡 Try: “${hint}”` : "💡 Just answer naturally — short and simple is perfect!";
      h.classList.toggle("hidden");
    });

    /* ----- mini-games ----- */
    document.querySelectorAll(".game-card").forEach((b) =>
      b.addEventListener("click", () => {
        if (b.dataset.game === "echo") LINGO.game.startEcho();
        else LINGO.game.startSalad();
      })
    );
    $("btn-game-hear").addEventListener("click", () => {
      LINGO.speech.speak(LINGO.game.game.phrase.text, LINGO.LANGUAGES[LINGO.state.data.lang].bcp47);
    });
    let gameListening = false;
    $("btn-game-mic").addEventListener("click", () => {
      if (gameListening) { LINGO.speech.stop(); return; }
      gameListening = true;
      $("btn-game-mic").classList.add("recording");
      LINGO.speech.listen(LINGO.LANGUAGES[LINGO.state.data.lang].bcp47, {
        onResult: (text) => { LINGO.speech.stop(); LINGO.game.scoreEcho(text); },
        onError: (kind) => {
          if (kind === "not-allowed") LINGO.ui.toast("🎤 Mic blocked — allow it in the address bar.");
        },
        onEnd: () => { gameListening = false; $("btn-game-mic").classList.remove("recording"); },
      });
    });
    $("btn-game-check").addEventListener("click", () => LINGO.game.checkSalad());
    $("btn-game-next").addEventListener("click", () => {
      if (LINGO.game.game.kind === "echo") LINGO.game.startEcho();
      else LINGO.game.startSalad();
    });

    /* ----- settings ----- */
    $("btn-settings").addEventListener("click", () => LINGO.ui.openSettings());
    $("btn-settings-close").addEventListener("click", () => {
      LINGO.state.setApiKey($("api-key-input").value.trim());
      if ($("model-select").value !== LINGO.state.data.settings.model) {
        LINGO.state.data.settings.modelChosenByUser = true; // manual override sticks
      }
      LINGO.state.data.settings.model = $("model-select").value;
      const cap = parseFloat($("cap-input").value);
      if (isFinite(cap) && cap > 0) LINGO.state.data.settings.capUSD = cap;
      LINGO.state.save();
      LINGO.ui.closeSettings();
      LINGO.ui.refreshAiPill();
    });
    $("btn-key-clear").addEventListener("click", () => {
      $("api-key-input").value = "";
      LINGO.state.setApiKey("");
      LINGO.ui.refreshCostMeter();
    });
    $("model-select") && $("settings-modal").addEventListener("change", (e) => {
      if (e.target.id === "model-select") LINGO.ui.refreshModelPriceNote();
    });
    $("modal-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "modal-backdrop") $("btn-settings-close").click();
    });
    $("btn-reset").addEventListener("click", () => {
      if (confirm("Reset all progress and remove your API key from this browser?")) {
        LINGO.state.reset();
        location.reload();
      }
    });
  });
})();
