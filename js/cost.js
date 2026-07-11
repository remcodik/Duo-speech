/* Lingo Isle — cost transparency: model prices, session spend, cap enforcement.
   Prices are per million tokens (USD). Cache writes bill at 1.25x input, reads at 0.1x. */
"use strict";

window.LINGO = window.LINGO || {};

(function () {
  const MODELS = {
    "claude-opus-4-8": { label: "Claude Opus 4.8 — best coach", inUSD: 5.0, outUSD: 25.0 },
    "claude-sonnet-5": { label: "Claude Sonnet 5 — great & cheaper", inUSD: 3.0, outUSD: 15.0 },
    "claude-haiku-4-5": { label: "Claude Haiku 4.5 — fastest & cheapest", inUSD: 1.0, outUSD: 5.0 },
  };

  /* Session spend lives in memory only — a "session" is this tab's lifetime. */
  const session = { usd: 0, calls: 0, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0 };

  function priceFor(model) { return MODELS[model] || MODELS["claude-opus-4-8"]; }

  /* Cost of one completed call, from the API's real usage block. */
  function costOfUsage(model, usage) {
    const p = priceFor(model);
    const inTok = usage.input_tokens || 0;
    const outTok = usage.output_tokens || 0;
    const cacheWrite = usage.cache_creation_input_tokens || 0;
    const cacheRead = usage.cache_read_input_tokens || 0;
    return (
      (inTok * p.inUSD +
        cacheWrite * p.inUSD * 1.25 +
        cacheRead * p.inUSD * 0.1 +
        outTok * p.outUSD) / 1e6
    );
  }

  function record(model, usage) {
    const usd = costOfUsage(model, usage);
    session.usd += usd;
    session.calls++;
    session.inputTokens += (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0);
    session.cacheReadTokens += usage.cache_read_input_tokens || 0;
    session.outputTokens += usage.output_tokens || 0;
    return usd;
  }

  /* Rough pre-flight estimate for one exchange (chars/4 heuristic + typical reply). */
  function estimateExchangeUSD(model) {
    const p = priceFor(model);
    return (1500 * p.inUSD + 400 * p.outUSD) / 1e6;
  }

  function capReached() {
    return session.usd >= (LINGO.state.data.settings.capUSD || 1.0);
  }

  function fmtUSD(v) {
    if (v === 0) return "$0.00";
    if (v < 0.005) return "<$0.01 (" + (v * 100).toFixed(2) + "¢)";
    return "$" + v.toFixed(2);
  }

  LINGO.cost = { MODELS, priceFor, costOfUsage, record, estimateExchangeUSD, capReached, fmtUSD, session };
})();
