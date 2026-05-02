import assert from "node:assert/strict";
import { toScannerViewModel } from "../src/scanner-view-model.js";

const verifiedPayload = {
  ok: true,
  contractVersion: "2026-04-30",
  status: "verified",
  mint: "So11111111111111111111111111111111111111112",
  network: "mainnet-beta",
  copy: {
    headline: "Meets technical token standard",
    body: "This scan did not find token-level controls blocked by TrustLayer.",
  },
  hardBlocks: [],
  facts: {
    tokenProgram: "spl-token",
    mintAuthorityPresent: false,
    freezeAuthorityPresent: false,
    extensions: [],
  },
};

const verified = toScannerViewModel(verifiedPayload);
assert.equal(verified.state, "result");
assert.equal(verified.isVerified, true);
assert.equal(verified.statusLabel, "Verified candidate");
assert.equal(verified.headline, "Meets technical token standard");
assert.equal(verified.mint, verifiedPayload.mint);
assert.equal(verified.network, "mainnet-beta");
assert.deepEqual(verified.hardBlockLabels, []);

const rejectedPayload = {
  ok: false,
  contractVersion: "2026-04-30",
  status: "rejected",
  mint: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  network: "devnet",
  copy: {
    headline: "Does not meet technical token standard",
    body: "TrustLayer found token-level controls that block verification.",
  },
  hardBlocks: [
    {
      code: "blocked_extension_permanentDelegate",
      label: "Blocked extension: permanentDelegate",
    },
  ],
  facts: {
    tokenProgram: "token-2022",
    isToken2022: true,
    mintAuthorityPresent: false,
    freezeAuthorityPresent: true,
    freezeAuthority: "11111111111111111111111111111111",
    extensions: ["permanentDelegate"],
  },
};

const rejected = toScannerViewModel(rejectedPayload);
assert.equal(rejected.state, "result");
assert.equal(rejected.isVerified, false);
assert.equal(rejected.statusLabel, "Rejected");
assert.equal(rejected.statusVariant, "danger");
assert.equal(rejected.tokenProgramHint, "Token-2022 mint");
assert.equal(rejected.freezeAuthorityPresent, true);
assert.deepEqual(rejected.hardBlockLabels, ["Blocked extension: permanentDelegate"]);
assert.deepEqual(rejected.extensions, ["permanentDelegate"]);

const error = toScannerViewModel({
  ok: false,
  contractVersion: "2026-04-30",
  status: "invalid_request",
  error: {
    code: "invalid_mint",
    message: "Enter a valid Solana mint address.",
    retryable: false,
  },
});

assert.equal(error.state, "error");
assert.equal(error.message, "Enter a valid Solana mint address.");
assert.equal(error.errorCode, "invalid_mint");
assert.equal(error.statusLabel, "Request rejected");
assert.equal(error.connectionLabel, "Connected");
assert.equal(
  error.helpText,
  "Check the mint address and try again. If you pasted a link, TrustLayer will use the first Solana-style address it finds.",
);

const retryableError = toScannerViewModel({
  ok: false,
  contractVersion: "2026-04-30",
  status: "rpc_unavailable",
  error: {
    code: "rpc_unavailable",
    message: "Scanner temporarily unavailable.",
    retryable: true,
  },
});

assert.equal(retryableError.state, "error");
assert.equal(retryableError.statusLabel, "Scanner unavailable");
assert.equal(retryableError.connectionLabel, "Offline");
assert.equal(
  retryableError.helpText,
  "The hosted scanner API did not return a usable response. Try again shortly.",
);

console.log("Scanner view-model tests passed.");
