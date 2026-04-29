export const DEFAULT_ALLOWED_SPLIT = {
  minHolderRewardsBps: 6000,
  minProtectionReserveBps: 1000,
  maxPlatformFeeBps: 1500,
  maxProjectTreasuryBps: 1500,
};

export function validateFeeSplit(splitBps, policy = DEFAULT_ALLOWED_SPLIT) {
  const requiredKeys = ["holderRewards", "protectionReserve", "projectTreasury", "platformFee"];
  const errors = [];

  for (const key of requiredKeys) {
    if (!Number.isInteger(splitBps[key])) errors.push(`${key} must be an integer bps value`);
    if (splitBps[key] < 0) errors.push(`${key} cannot be negative`);
  }

  const total = requiredKeys.reduce((sum, key) => sum + (splitBps[key] || 0), 0);
  if (total !== 10_000) errors.push(`fee split must equal 10000 bps, received ${total}`);

  if (splitBps.holderRewards < policy.minHolderRewardsBps) {
    errors.push(`holderRewards must be at least ${policy.minHolderRewardsBps} bps`);
  }

  if (splitBps.protectionReserve < policy.minProtectionReserveBps) {
    errors.push(`protectionReserve must be at least ${policy.minProtectionReserveBps} bps`);
  }

  if (splitBps.platformFee > policy.maxPlatformFeeBps) {
    errors.push(`platformFee cannot exceed ${policy.maxPlatformFeeBps} bps`);
  }

  if (splitBps.projectTreasury > policy.maxProjectTreasuryBps) {
    errors.push(`projectTreasury cannot exceed ${policy.maxProjectTreasuryBps} bps`);
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateProjectApplication(application) {
  const errors = [];

  if (!application.projectName || application.projectName.trim().length < 2) {
    errors.push("projectName is required");
  }

  if (!application.ticker || application.ticker.trim().length < 2) {
    errors.push("ticker is required");
  }

  if (!application.tokenMint || application.tokenMint.trim().length < 32) {
    errors.push("tokenMint must look like a Solana mint address");
  }

  if (!application.devWallets || application.devWallets.length === 0) {
    errors.push("at least one dev wallet must be disclosed");
  }

  const split = validateFeeSplit(application.splitBps || {});
  errors.push(...split.errors);

  return {
    ok: errors.length === 0,
    errors,
  };
}
