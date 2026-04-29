export const DEFAULT_MULTIPLIERS = [
  { minSeconds: 7 * 24 * 60 * 60, multiplier: 3 },
  { minSeconds: 3 * 24 * 60 * 60, multiplier: 2 },
  { minSeconds: 24 * 60 * 60, multiplier: 1.5 },
  { minSeconds: 6 * 60 * 60, multiplier: 1.25 },
  { minSeconds: 60 * 60, multiplier: 1 },
  { minSeconds: 0, multiplier: 0 },
];

export function getHoldMultiplier(heldSeconds, multipliers = DEFAULT_MULTIPLIERS) {
  const match = multipliers.find((tier) => heldSeconds >= tier.minSeconds);
  return match ? match.multiplier : 0;
}

export function splitInflow(totalAmount, splitBps) {
  const totalBps =
    splitBps.holderRewards + splitBps.protectionReserve + splitBps.projectTreasury + splitBps.platformFee;

  if (totalBps !== 10_000) {
    throw new Error(`Fee split must equal 10000 bps. Received ${totalBps}.`);
  }

  return {
    holderRewards: roundAmount((totalAmount * splitBps.holderRewards) / 10_000),
    protectionReserve: roundAmount((totalAmount * splitBps.protectionReserve) / 10_000),
    projectTreasury: roundAmount((totalAmount * splitBps.projectTreasury) / 10_000),
    platformFee: roundAmount((totalAmount * splitBps.platformFee) / 10_000),
  };
}

export function calculateRewardCycle({ holders, totalInflow, splitBps, rules }) {
  const pools = splitInflow(totalInflow, splitBps);

  const rows = holders.map((holder) => {
    const excludedReason = getExclusionReason(holder, rules);
    const multiplier = excludedReason ? 0 : getHoldMultiplier(holder.heldSeconds);
    const weight = excludedReason ? 0 : holder.averageBalance * multiplier;

    return {
      wallet: holder.wallet,
      averageBalance: holder.averageBalance,
      heldSeconds: holder.heldSeconds,
      multiplier,
      weight,
      excludedReason,
    };
  });

  const totalEligibleWeight = rows.reduce((sum, row) => sum + row.weight, 0);

  const payouts = rows.map((row) => {
    const share = totalEligibleWeight > 0 ? row.weight / totalEligibleWeight : 0;

    return {
      ...row,
      rewardShare: share,
      payoutAmount: roundAmount(pools.holderRewards * share),
    };
  });

  return {
    totalInflow,
    pools,
    totalEligibleWeight,
    eligibleHolderCount: payouts.filter((row) => row.weight > 0).length,
    payouts: payouts.sort((a, b) => b.payoutAmount - a.payoutAmount),
  };
}

export function createPayoutManifest({ project, cycle, snapshotSlot, formulaVersion }) {
  return {
    manifestVersion: "trustlayer-payout-v0",
    projectId: project.id,
    tokenMint: project.tokenMint,
    vaultAddress: project.vaultAddress,
    snapshotSlot,
    formulaVersion,
    totalInflow: cycle.totalInflow,
    pools: cycle.pools,
    totalEligibleWeight: cycle.totalEligibleWeight,
    eligibleHolderCount: cycle.eligibleHolderCount,
    payouts: cycle.payouts.map((row) => ({
      wallet: row.wallet,
      averageBalance: row.averageBalance,
      heldSeconds: row.heldSeconds,
      multiplier: row.multiplier,
      weight: row.weight,
      rewardShare: row.rewardShare,
      payoutAmount: row.payoutAmount,
      excludedReason: row.excludedReason,
    })),
  };
}

function getExclusionReason(holder, rules) {
  if (holder.excluded) return holder.excludedReason || "excluded_wallet";
  if (holder.averageBalance < rules.minimumAverageBalance) return "below_minimum_average_balance";
  if (holder.heldSeconds < rules.minimumHoldSeconds) return "below_minimum_hold_time";
  return null;
}

function roundAmount(value) {
  return Math.round(value * 1_000_000_000) / 1_000_000_000;
}
