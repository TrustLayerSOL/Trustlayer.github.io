import { mkdir, writeFile } from "node:fs/promises";
import { calculateRewardCycle, createPayoutManifest } from "../src/reward-engine.js";
import { demoHolders, demoProject } from "../src/demo-data.js";
import { createManifestHash } from "../src/manifest-hash.js";

const cycle = calculateRewardCycle({
  holders: demoHolders,
  totalInflow: demoProject.totalInflow,
  splitBps: demoProject.splitBps,
  rules: demoProject.rules,
});

const manifest = createPayoutManifest({
  project: demoProject,
  cycle,
  snapshotSlot: 337_420_512,
  formulaVersion: "avg-balance-time-v0.1",
});

const manifestHash = createManifestHash(manifest);
const output = {
  ...manifest,
  manifestHash,
  generatedAt: new Date().toISOString(),
};

await mkdir("data", { recursive: true });
await writeFile("data/demo-payout-manifest.json", `${JSON.stringify(output, null, 2)}\n`);

console.log(`Wrote data/demo-payout-manifest.json`);
console.log(`Manifest hash: ${manifestHash}`);
