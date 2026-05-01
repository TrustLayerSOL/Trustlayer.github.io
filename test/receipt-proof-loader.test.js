import assert from "node:assert/strict";
import { loadReceiptManifest } from "../src/receipt-proof-loader.js";

const apiPayload = {
  ok: true,
  manifest: {
    manifestVersion: "trustlayer-payout-v1",
    projectId: "receipts-demo",
    cycleId: "api-cycle",
  },
};
const staticManifest = {
  manifestVersion: "trustlayer-payout-v1",
  projectId: "receipts-demo",
  cycleId: "static-cycle",
};

const apiLoaded = await loadReceiptManifest({
  apiBase: "https://trustlayer-scanner-api.vercel.app",
  projectId: "receipts-demo",
  fallbackPath: "/data/receipts-demo-manifest.json",
  fetchJson: async (url) => {
    assert.equal(url, "https://trustlayer-scanner-api.vercel.app/api/projects/receipts-demo/manifests/latest");
    return apiPayload;
  },
});

assert.equal(apiLoaded.source, "api");
assert.equal(apiLoaded.manifest.cycleId, "api-cycle");

const fallbackLoaded = await loadReceiptManifest({
  apiBase: "https://trustlayer-scanner-api.vercel.app",
  projectId: "receipts-demo",
  fallbackPath: "/data/receipts-demo-manifest.json",
  fetchJson: async (url) => {
    if (url.includes("/api/projects/")) {
      throw new Error("API unavailable");
    }
    assert.equal(url, "/data/receipts-demo-manifest.json");
    return staticManifest;
  },
});

assert.equal(fallbackLoaded.source, "static");
assert.equal(fallbackLoaded.manifest.cycleId, "static-cycle");
assert.equal(fallbackLoaded.apiError.message, "API unavailable");

const wrapped = await loadReceiptManifest({
  apiBase: "",
  projectId: "receipts-demo",
  fallbackPath: "/data/receipts-demo-manifest.json",
  fetchJson: async (url) => {
    assert.equal(url, "/data/receipts-demo-manifest.json");
    return staticManifest;
  },
});

assert.equal(wrapped.source, "static");

console.log("Receipt proof loader tests passed.");
