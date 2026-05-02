import assert from "node:assert/strict";
import { fetchScannerPayload } from "../src/scanner-client.js";

const invalidEnvelope = {
  ok: false,
  contractVersion: "2026-04-30",
  status: "invalid_request",
  error: {
    code: "invalid_mint",
    message: "Enter a valid Solana mint address.",
    retryable: false,
  },
};

const payload = await fetchScannerPayload({
  scannerApiBase: "https://trustlayer-scanner-api.vercel.app",
  mint: "not-a-mint",
  network: "mainnet-beta",
  fetchFn: async () => ({
    ok: false,
    status: 400,
    async json() {
      return invalidEnvelope;
    },
  }),
});

assert.deepEqual(payload, invalidEnvelope);

await assert.rejects(
  () =>
    fetchScannerPayload({
      scannerApiBase: "https://trustlayer-scanner-api.vercel.app",
      mint: "So11111111111111111111111111111111111111112",
      network: "mainnet-beta",
      fetchFn: async () => ({
        ok: false,
        status: 502,
        async json() {
          return null;
        },
      }),
    }),
  /Scanner returned HTTP 502/,
);

console.log("Scanner client tests passed.");
