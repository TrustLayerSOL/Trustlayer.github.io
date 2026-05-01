const STATUS_COPY = {
  locked: {
    label: "Routing locked",
    variant: "good",
    headline: "Fee route matches the TrustLayer standard.",
    body:
      "The route evidence points to the expected recipient, allocation, and locked authority state.",
  },
  not_locked: {
    label: "Routing not locked",
    variant: "danger",
    headline: "Fee route does not meet the TrustLayer standard.",
    body:
      "The route exists, but one or more recipient, allocation, or authority checks did not pass.",
  },
  account_not_found: {
    label: "No route found",
    variant: "watch",
    headline: "No Pump.fun fee-sharing route was found for this mint.",
    body:
      "This mint may not be configured for the checked integration, or routing may use another path.",
  },
  parser_pending: {
    label: "Parser pending",
    variant: "watch",
    headline: "Route account found; layout parser is pending.",
    body:
      "TrustLayer located route evidence, but this account layout still needs a verified decoder before approval.",
  },
  missing_expected_recipient: {
    label: "Not configured",
    variant: "watch",
    headline: "Live fee-route approval is not configured yet.",
    body:
      "The hosted API is online, but the official TrustLayer fee recipient has not been set for live route checks.",
  },
  rpc_unavailable: {
    label: "Check unavailable",
    variant: "danger",
    headline: "Fee-route check is temporarily unavailable.",
    body:
      "The scanner could not reach Solana RPC for this route check. Try again after the connection recovers.",
  },
  invalid_request: {
    label: "Invalid request",
    variant: "danger",
    headline: "Fee-route check could not run.",
    body: "The request was rejected before a route could be checked.",
  },
};

export function toFeeRoutingViewModel(payload) {
  const result = payload?.result || payload || {};
  const errorCode = payload?.error?.code;
  const status =
    errorCode === "missing_expected_recipient"
      ? "missing_expected_recipient"
      : result.status || payload?.status || errorCode || "unknown";
  const copy = STATUS_COPY[status] || {
    label: "Unknown",
    variant: "watch",
    headline: "Fee-route status is unknown.",
    body: "The API returned a route status this version of the site does not recognize yet.",
  };
  const shouldUseApiCopy = status === result.status || status === payload?.status;

  return {
    state: "result",
    status,
    label: copy.label,
    variant: copy.variant,
    headline: (shouldUseApiCopy && (result.copy?.headline || payload?.copy?.headline)) || copy.headline,
    body: (shouldUseApiCopy && (result.copy?.body || payload?.copy?.body)) || copy.body,
    network: result.network || payload?.network || "mainnet-beta",
    mint: result.mint || payload?.mint,
    integration: result.integration || payload?.integration || "pumpfun",
    expectedRecipient: result.expectedRecipient,
    routeAddress: result.routeAddress || result.evidence?.address,
    allocationBps: result.actual?.allocationBps,
    authorityStatus: result.actual?.authorityStatus,
    checks: Array.isArray(result.checks) ? result.checks : [],
  };
}
