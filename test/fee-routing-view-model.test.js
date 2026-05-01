import assert from "node:assert/strict";
import { toFeeRoutingViewModel } from "../src/fee-routing-view-model.js";

const missingConfig = toFeeRoutingViewModel({
  ok: false,
  status: "invalid_request",
  error: {
    code: "missing_expected_recipient",
    message: "TRUSTLAYER_FEE_RECIPIENT is not configured.",
    retryable: false,
  },
  copy: {
    headline: "Invalid fee-routing request",
    body: "TrustLayer could not run the fee-routing check because the request is missing required config.",
  },
});

assert.equal(missingConfig.status, "missing_expected_recipient");
assert.equal(missingConfig.label, "Not configured");
assert.equal(missingConfig.variant, "watch");
assert.match(missingConfig.headline, /not configured/i);
assert.doesNotMatch(missingConfig.headline, /invalid/i);

const parserPending = toFeeRoutingViewModel({
  ok: true,
  result: {
    status: "parser_pending",
    mint: "So11111111111111111111111111111111111111112",
    network: "mainnet-beta",
    integration: "pumpfun",
    routeAddress: "Route1111111111111111111111111111111111111",
  },
});

assert.equal(parserPending.status, "parser_pending");
assert.equal(parserPending.label, "Parser pending");
assert.equal(parserPending.mint, "So11111111111111111111111111111111111111112");
assert.equal(parserPending.routeAddress, "Route1111111111111111111111111111111111111");

const locked = toFeeRoutingViewModel({
  ok: true,
  result: {
    status: "locked",
    expectedRecipient: "TrustLayerFee111111111111111111111111111111",
    actual: {
      allocationBps: 250,
      authorityStatus: "revoked",
    },
    checks: [
      { label: "Recipient matches", passed: true },
      { label: "Authority revoked", passed: true },
    ],
  },
});

assert.equal(locked.label, "Routing locked");
assert.equal(locked.variant, "good");
assert.equal(locked.expectedRecipient, "TrustLayerFee111111111111111111111111111111");
assert.equal(locked.allocationBps, 250);
assert.equal(locked.authorityStatus, "revoked");
assert.equal(locked.checks.length, 2);

const notLocked = toFeeRoutingViewModel({
  ok: true,
  result: {
    status: "not_locked",
    checks: [{ label: "Recipient matches", passed: false }],
  },
});

assert.equal(notLocked.label, "Routing not locked");
assert.equal(notLocked.variant, "danger");
assert.match(notLocked.body, /did not pass/i);

console.log("Fee-routing view-model tests passed.");
