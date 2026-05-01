const LAMPORTS_PER_SOL = 1_000_000_000n;

const EXCLUDED_REASON_LABELS = {
  team_wallet: "Team wallet",
  below_minimum_hold_time: "Below minimum hold time",
  below_minimum_average_balance: "Below minimum average balance",
  excluded_wallet: "Excluded wallet",
};

export function toReceiptProofViewModel(manifest) {
  const payload = manifest;
  const manifestSource = payload?.manifest || payload;
  const verification = payload?.verification;
  const copy = payload?.copy;

  if (!manifestSource) {
    return {
      state: "empty",
      status: {
        label: "Manifest pending",
        variant: "watch",
      },
      headline: "No payout manifest loaded yet.",
      body: "The proof page will show the cycle receipt once a manifest is published.",
    };
  }

  manifest = manifestSource;
  const recipients = Array.isArray(manifest.recipients) ? manifest.recipients : [];
  const payableRecipients = recipients.filter((recipient) => BigInt(recipient.payoutLamports || "0") > 0n);
  const excludedRecipients = recipients.filter((recipient) => recipient.excludedReason);

  return {
    state: "ready",
    projectLabel: manifest.projectId === "receipts-demo" ? "$RECEIPTS demo" : manifest.projectId,
    status: {
      label: verification?.ok ? "Verified proof manifest" : "Proof manifest",
      variant: manifest.manifestVersion === "trustlayer-payout-v1" && verification?.ok !== false ? "good" : "watch",
    },
    cycleId: manifest.cycleId,
    network: manifest.network || "mainnet-beta",
    tokenMint: manifest.tokenMint,
    vaultAddress: manifest.vaultAddress,
    snapshotSlot: manifest.snapshot?.slot ?? "pending",
    generatedAt: formatDate(manifest.generatedAt),
    cycleWindow: `${formatDate(manifest.cycleStartedAt)} -> ${formatDate(manifest.cycleEndedAt)}`,
    routing: {
      integration: manifest.feeRouting?.integration || "unknown",
      status: manifest.feeRouting?.status || "unknown",
      allocation: formatBps(manifest.feeRouting?.allocationBps || 0),
      recipient: manifest.feeRouting?.feeRecipient || "pending",
      evidenceAccount: manifest.feeRouting?.evidenceAccount || "pending",
    },
    metrics: {
      feeInflow: formatLamports(manifest.inputTotals?.feeInflowLamports),
      holderRewards: formatLamports(manifest.inputTotals?.rewardPoolLamports),
      protectionReserve: formatLamports(manifest.inputTotals?.protectionReserveLamports),
      platformFee: formatLamports(manifest.inputTotals?.platformFeeLamports),
    },
    splitLabels: {
      holderRewards: formatBps(manifest.splitBps?.holderRewards || 0),
      protectionReserve: formatBps(manifest.splitBps?.protectionReserve || 0),
      projectTreasury: formatBps(manifest.splitBps?.projectTreasury || 0),
      platformFee: formatBps(manifest.splitBps?.platformFee || 0),
    },
    formula: {
      version: manifest.formula?.version || "pending",
      minimumHold: formatDuration(manifest.formula?.minimumHoldSeconds || 0),
      minimumAverageBalance: manifest.formula?.minimumAverageBalanceRaw || "0",
    },
    holderCount: manifest.snapshot?.holderCount || recipients.length,
    payableRecipientCount: payableRecipients.length,
    excludedRecipientCount: excludedRecipients.length,
    recipients: recipients.map(toRecipientViewModel),
    hash: {
      full: manifest.manifestHash || "",
      short: shortHash(manifest.manifestHash),
    },
    manifestVersion: manifest.manifestVersion,
    disclaimer:
      copy?.disclaimer ||
      "This manifest is a public accounting receipt. It does not guarantee project behavior, market price, liquidity, rewards, or protection outcomes.",
  };
}

function toRecipientViewModel(recipient) {
  return {
    wallet: shortAddress(recipient.wallet),
    averageBalance: recipient.averageBalanceRaw || "0",
    holdTime: formatDuration(recipient.heldSeconds || 0),
    multiplier: formatMultiplier(recipient.multiplierBps || 0),
    weight: recipient.weightRaw || "0",
    payout: formatLamports(recipient.payoutLamports),
    excludedReason: recipient.excludedReason
      ? EXCLUDED_REASON_LABELS[recipient.excludedReason] || titleize(recipient.excludedReason)
      : null,
  };
}

function formatLamports(value = "0") {
  const lamports = BigInt(value || "0");
  const whole = lamports / LAMPORTS_PER_SOL;
  const fraction = lamports % LAMPORTS_PER_SOL;
  const decimals = (fraction * 1000n) / LAMPORTS_PER_SOL;
  return `${whole}.${decimals.toString().padStart(3, "0")} SOL`;
}

function formatBps(value) {
  const percent = Number(value) / 100;
  return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(2)}%`;
}

function formatDuration(seconds) {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}

function formatMultiplier(multiplierBps) {
  const multiplier = multiplierBps / 10_000;
  return Number.isInteger(multiplier) ? `${multiplier}x` : `${multiplier.toFixed(2)}x`;
}

function formatDate(value) {
  if (!value) return "pending";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

function shortAddress(value) {
  if (!value || value.length < 12) return value || "pending";
  return `${value.slice(0, 4)}...${value.slice(-3)}`;
}

function shortHash(value) {
  if (!value || value.length < 18) return value || "pending";
  return `${value.slice(0, 8)}...${value.slice(-7)}`;
}

function titleize(value) {
  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
