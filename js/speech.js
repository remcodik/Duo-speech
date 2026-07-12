/* Lingo Isle — speech in/out via the free browser Web Speech APIs.
   STT: SpeechRecognition (Chrome/Edge/Safari — may not exist in Firefox).
   TTS: speechSynthesis (near-universal).
   Everything degrades gracefully: no STT -> typing only; no TTS -> silent bubbles. */
"use strict";

window.LINGO = window.LINGO || {};

(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  const support = {
    stt: !!SR,
    tts: "speechSynthesis" in window,
  };

  let activeRec = null;

  /* Listen once in the given BCP-47 language.
     callbacks: onResult(transcript), onError(kind), onEnd() */
  function listen(bcp47, { onResult, onError, onEnd, onPartial }) {
    if (!SR) { onError && onError("unsupported"); return null; }
    stop();
    const rec = new SR();
    activeRec = rec;
    rec.lang = bcp47;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let finalText = "";

    rec.onresult = (ev) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) finalText += t;
        else interim += t;
      }
      if (interim && onPartial) onPartial(interim);
      if (finalText && onResult) { onResult(finalText.trim()); finalText = ""; }
    };
    rec.onerror = (ev) => {
      // "no-speech" and "aborted" are routine; "not-allowed" means mic denied.
      onError && onError(ev.error || "error");
    };
    rec.onend = () => {
      if (activeRec === rec) activeRec = null;
      onEnd && onEnd();
    };
    try { rec.start(); } catch (e) { onError && onError("start-failed"); }
    return rec;
  }

  function stop() {
    if (activeRec) {
      try { activeRec.stop(); } catch (e) {}
      activeRec = null;
    }
  }

  /* Speak text aloud in the target language. Picks the best-matching voice. */
  function speak(text, bcp47) {
    if (!support.tts || !text) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = bcp47;
      u.rate = 0.92; // slightly slow for learners
      const voices = speechSynthesis.getVoices();
      const lang2 = bcp47.slice(0, 2);
      const voice =
        voices.find((v) => v.lang === bcp47) ||
        voices.find((v) => v.lang && v.lang.startsWith(lang2));
      if (voice) u.voice = voice;
      speechSynthesis.speak(u);
    } catch (e) { /* stay silent */ }
  }

  // Some browsers populate voices asynchronously.
  if (support.tts) {
    try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; } catch (e) {}
  }

  LINGO.speech = { support, listen, stop, speak };
})();
