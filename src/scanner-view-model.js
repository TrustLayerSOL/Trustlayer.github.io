export function toScannerViewModel(payload) {
  if (!payload || payload.error) {
    const retryable = payload?.error?.retryable === true;
    return {
      state: "error",
      message: payload?.error?.message || "The scanner rejected the request.",
      statusLabel: retryable ? "Scanner unavailable" : "Request rejected",
      connectionLabel: retryable ? "Offline" : "Connected",
      connectionVariant: retryable ? "danger" : "watch",
    };
  }

  const result = payload.result || payload;
  const facts = result.facts || {};
  const hardBlocks = Array.isArray(result.hardBlocks) ? result.hardBlocks : [];
  const extensions = Array.isArray(facts.extensions) ? facts.extensions : [];
  const isVerified = result.status === "verified";

  return {
    state: "result",
    isVerified,
    statusLabel: isVerified ? "Verified candidate" : "Rejected",
    statusVariant: isVerified ? "good" : "danger",
    verdictClass: isVerified ? "verified" : "rejected",
    headline: payload.copy?.headline || (isVerified ? "Token standard passed." : "Token standard rejected."),
    body:
      payload.copy?.body ||
      "This is a technical verification result, not a statement about price, profit, or trading safety.",
    mint: result.mint || result.mintAddress || facts.mint,
    network: result.network || "mainnet-beta",
    tokenProgram: facts.tokenProgram || "unknown",
    tokenProgramHint: facts.isToken2022 ? "Token-2022 mint" : "Standard SPL token",
    mintAuthorityPresent: Boolean(facts.mintAuthorityPresent),
    mintAuthority: facts.mintAuthority,
    freezeAuthorityPresent: Boolean(facts.freezeAuthorityPresent),
    freezeAuthority: facts.freezeAuthority,
    hardBlockLabels: hardBlocks.map((item) => item.label || item.rule || item),
    extensions,
  };
}
