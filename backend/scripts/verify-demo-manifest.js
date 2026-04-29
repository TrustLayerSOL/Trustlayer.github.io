import { readFile } from "node:fs/promises";
import { verifyManifestHash } from "../src/manifest-hash.js";

const raw = await readFile("data/demo-payout-manifest.json", "utf8");
const manifest = JSON.parse(raw);
const result = verifyManifestHash(manifest);

if (!result.ok) {
  console.error("Manifest hash mismatch");
  console.error(`Expected: ${result.expected}`);
  console.error(`Actual: ${result.actual}`);
  process.exit(1);
}

console.log(`Manifest hash verified: ${result.actual}`);
