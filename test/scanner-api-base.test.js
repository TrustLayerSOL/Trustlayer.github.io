import assert from "node:assert/strict";
import { resolveScannerApiBase } from "../src/scanner-api-base.js";

assert.equal(
  resolveScannerApiBase({
    windowOverride: "https://override.example",
    envOverride: "https://env.example",
    storedOverride: "https://stored.example",
    hostname: "www.trustlayer.fun",
  }),
  "https://override.example",
);

assert.equal(
  resolveScannerApiBase({
    envOverride: "https://env.example",
    storedOverride: "https://stored.example",
    hostname: "www.trustlayer.fun",
  }),
  "https://env.example",
);

assert.equal(
  resolveScannerApiBase({
    storedOverride: "https://stored.example",
    hostname: "localhost",
  }),
  "https://stored.example",
);

assert.equal(
  resolveScannerApiBase({
    hostname: "www.trustlayer.fun",
  }),
  "https://trustlayer-scanner-api.vercel.app",
);

assert.equal(
  resolveScannerApiBase({
    hostname: "localhost",
  }),
  "http://127.0.0.1:8787",
);

console.log("Scanner API base tests passed.");
