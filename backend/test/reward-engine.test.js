import assert from "node:assert/strict";
import { calculateRewardCycle, splitInflow } from "../src/reward-engine.js";
import { demoHolders, demoProject } from "../src/demo-data.js";
import { createManifestHash } from "../src/manifest-hash.js";
import { validateFeeSplit, validateProjectApplication } from "../src/project-validator.js";
import { evaluateTokenSafety, TOKEN_PROGRAMS } from "../src/token-safety-scanner.js";

const pools = splitInflow(18.42, demoProject.splitBps);

assert.equal(pools.holderRewards, 12.894);
assert.equal(pools.protectionReserve, 3.684);
assert.equal(pools.projectTreasury, 0);
assert.equal(pools.platformFee, 1.842);

const cycle = calculateRewardCycle({
  holders: demoHolders,
  totalInflow: demoProject.totalInflow,
  splitBps: demoProject.splitBps,
  rules: demoProject.rules,
});

assert.equal(cycle.eligibleHolderCount, 4);
assert.equal(cycle.totalEligibleWeight, 10_345_000);
assert.equal(cycle.payouts[0].wallet, "7Qb...9k2");
assert.equal(cycle.payouts[0].payoutAmount, 6.805339778);

const excluded = Object.fromEntries(
  cycle.payouts.filter((row) => row.excludedReason).map((row) => [row.wallet, row.excludedReason]),
);

assert.equal(excluded["Team...001"], "team_wallet");
assert.equal(excluded["New...Bot"], "below_minimum_hold_time");
assert.equal(excluded["Dust...77"], "below_minimum_average_balance");

assert.throws(() => {
  splitInflow(1, {
    holderRewards: 7000,
    protectionReserve: 2000,
    projectTreasury: 0,
    platformFee: 999,
  });
}, /10000 bps/);

assert.equal(validateFeeSplit(demoProject.splitBps).ok, true);

const badSplit = validateFeeSplit({
  holderRewards: 5000,
  protectionReserve: 500,
  projectTreasury: 3000,
  platformFee: 1500,
});

assert.equal(badSplit.ok, false);
assert.ok(badSplit.errors.includes("holderRewards must be at least 6000 bps"));
assert.ok(badSplit.errors.includes("protectionReserve must be at least 1000 bps"));
assert.ok(badSplit.errors.includes("projectTreasury cannot exceed 1500 bps"));

const application = validateProjectApplication({
  projectName: "Trust Demo",
  ticker: "TRUSTDEMO",
  tokenMint: demoProject.tokenMint,
  devWallets: ["DevWallet111111111111111111111111111111111"],
  splitBps: demoProject.splitBps,
});

assert.equal(application.ok, true);

const manifestHash = createManifestHash({
  manifestVersion: "trustlayer-payout-v0",
  projectId: "trustdemo",
});

assert.equal(manifestHash.length, 64);

const cleanToken = evaluateTokenSafety({
  mint: demoProject.tokenMint,
  tokenProgram: TOKEN_PROGRAMS.splToken,
  mintAuthorityPresent: false,
  freezeAuthorityPresent: false,
  extensions: [],
});

assert.equal(cleanToken.ok, true);
assert.equal(cleanToken.status, "verified");

const blockedSafetyCases = [
  {
    name: "mint authority",
    facts: { tokenProgram: TOKEN_PROGRAMS.splToken, mintAuthorityPresent: true },
    code: "mint_authority_present",
  },
  {
    name: "freeze authority",
    facts: { tokenProgram: TOKEN_PROGRAMS.splToken, freezeAuthorityPresent: true },
    code: "freeze_authority_present",
  },
  {
    name: "permanentDelegate",
    facts: { tokenProgram: TOKEN_PROGRAMS.token2022, extensions: ["permanentDelegate"] },
    code: "blocked_extension_permanentDelegate",
  },
  {
    name: "nonTransferable",
    facts: { tokenProgram: TOKEN_PROGRAMS.token2022, extensions: ["nonTransferable"] },
    code: "blocked_extension_nonTransferable",
  },
  {
    name: "default frozen account state",
    facts: { tokenProgram: TOKEN_PROGRAMS.token2022, defaultAccountState: "frozen" },
    code: "default_account_state_frozen",
  },
  {
    name: "transferHook",
    facts: { tokenProgram: TOKEN_PROGRAMS.token2022, extensions: ["transferHook"] },
    code: "blocked_extension_transferHook",
  },
  {
    name: "transferFeeConfig",
    facts: { tokenProgram: TOKEN_PROGRAMS.token2022, extensions: ["transferFeeConfig"] },
    code: "blocked_extension_transferFeeConfig",
  },
  {
    name: "pausableConfig",
    facts: { tokenProgram: TOKEN_PROGRAMS.token2022, extensions: ["pausableConfig"] },
    code: "blocked_extension_pausableConfig",
  },
  {
    name: "unknown extension",
    facts: { tokenProgram: TOKEN_PROGRAMS.token2022, extensions: ["mysteryExtension"] },
    code: "unknown_extension_mysteryExtension",
  },
];

for (const testCase of blockedSafetyCases) {
  const result = evaluateTokenSafety(testCase.facts);
  assert.equal(result.ok, false, `${testCase.name} should fail TrustLayer safety validation`);
  assert.equal(result.status, "rejected");
  assert.ok(
    result.hardBlocks.some((block) => block.code === testCase.code),
    `${testCase.name} should include ${testCase.code}`,
  );
}

const knownSafeExtension = evaluateTokenSafety({
  tokenProgram: TOKEN_PROGRAMS.token2022,
  extensions: ["metadataPointer"],
});

assert.equal(knownSafeExtension.ok, true);

const initializedDefaultAccountState = evaluateTokenSafety({
  tokenProgram: TOKEN_PROGRAMS.token2022,
  defaultAccountState: "initialized",
  extensions: ["defaultAccountState"],
});

assert.equal(initializedDefaultAccountState.ok, true);

console.log("Reward engine tests passed.");
