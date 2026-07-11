# 🏝️ Lingo Isle

Talk your way around a tropical island and learn a language by *speaking* it.
No streaks, no guilt — your island just grows as you play.

- 🗣️ **Speak or type** — free browser speech recognition, big friendly mic button
- 🤖 **AI characters & grammar coach** (optional) — Claude plays quirky islanders, corrects
  your grammar kindly, and reacts with animated expressions
- 💸 **Cost is always visible** — you bring your own Claude API key; every reply shows its real
  price, with a session spend cap you control. **No key? Fully playable scripted mode, free.**
- 🎮 **Mini-games** — Echo Battle (repeat the phrase) and Word Salad (rebuild the sentence), 100% free
- 📈 **Progress without pressure** — XP grows your island, stars per mission, skill meters for
  Speaking / Grammar / Words, badges, and a word collection

Learnable languages: **Spanish, French, German, English** (UI in English).

## Run it

It's a static site — no build, no server code. Serve the folder over HTTP
(the mic requires a secure context, and `localhost` counts):

```bash
cd Duo-speech
python3 -m http.server 8080
# or: npx serve
```

Open http://localhost:8080 in **Chrome, Edge or Safari** (best speech support).
Firefox works too, with typing instead of the mic.

## Enabling the AI coach

1. Get an API key at https://console.anthropic.com — ideally a dedicated key with a spend limit.
2. In the game, open ⚙️ Settings → paste the key → pick a model:

   | Model | Price (in/out per MTok) | ≈ per exchange |
   |---|---|---|
   | Claude Opus 4.8 (default) | $5 / $25 | ~$0.02 |
   | Claude Sonnet 5 | $3 / $15 | ~$0.01 |
   | Claude Haiku 4.5 | $1 / $5 | ~$0.004 |

3. Set a session spend cap (default $1.00). AI calls stop automatically when it's reached.

The key is stored only in your browser's localStorage and sent only to `api.anthropic.com`
(enforced by the page's Content-Security-Policy). Clear it anytime in Settings.

**Privacy note:** in some browsers (e.g. Chrome) speech recognition sends your audio to the
browser vendor's servers for transcription. In AI mode your *text* goes to Anthropic. For a
fully-offline experience: type your answers and play scripted mode.

## Project layout

```
index.html        app shell (all screens) + CSP
css/styles.css    tropical, animated UI
js/data.js        languages, scenarios, scripted dialogues, mini-game phrases
js/state.js       progress & settings (localStorage)
js/cost.js        model prices, real usage-based cost meter, spend cap
js/speech.js      Web Speech API wrappers (STT + TTS), graceful fallbacks
js/ai.js          Claude Messages API client (structured JSON output) + scripted bot
js/game.js        conversation engine, scoring, mini-games
js/ui.js          rendering (all dynamic text via textContent — no innerHTML injection)
js/main.js        event wiring
```

Design decisions, architecture and the security red-team are in [PLAN.md](PLAN.md).
