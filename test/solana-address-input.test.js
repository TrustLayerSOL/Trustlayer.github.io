import assert from "node:assert/strict";
import { extractSolanaAddressInput } from "../src/solana-address-input.js";

const wrappedSol = "So11111111111111111111111111111111111111112";

assert.equal(extractSolanaAddressInput(wrappedSol), wrappedSol);
assert.equal(extractSolanaAddressInput(`  ${wrappedSol}\n`), wrappedSol);
assert.equal(extractSolanaAddressInput(`CA: ${wrappedSol}`), wrappedSol);
assert.equal(extractSolanaAddressInput(`https://pump.fun/coin/${wrappedSol}`), wrappedSol);
assert.equal(
  extractSolanaAddressInput(`https://dexscreener.com/solana/pairaddress?token=${wrappedSol}`),
  wrappedSol,
);
assert.equal(extractSolanaAddressInput(`\u200B${wrappedSol}\u200B`), wrappedSol);
assert.equal(extractSolanaAddressInput("not a mint"), "");
assert.equal(extractSolanaAddressInput(""), "");

console.log("Solana address input tests passed.");
