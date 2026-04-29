import assert from "node:assert/strict";
import { calculateRewardCycle, splitInflow } from "../src/reward-engine.js";
import { demoHolders, demoProject } from "../src/demo-data.js";

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

console.log("Reward engine tests passed.");
