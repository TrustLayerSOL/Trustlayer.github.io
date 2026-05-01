import assert from "node:assert/strict";
import { toReceiptProofViewModel } from "../src/receipt-proof-view-model.js";

const manifest = {
  manifestVersion: "trustlayer-payout-v1",
  projectId: "receipts-demo",
  tokenMint: "ReceiptsMint111111111111111111111111111111111",
  vaultAddress: "TrustVault1111111111111111111111111111111111",
  network: "mainnet-beta",
  cycleId: "receipts-cycle-001",
  cycleStartedAt: "2026-05-01T12:00:00.000Z",
  cycleEndedAt: "2026-05-01T18:00:00.000Z",
  generatedAt: "2026-05-01T18:02:00.000Z",
  snapshot: {
    slot: 337420512,
    takenAt: "2026-05-01T18:00:00.000Z",
    source: "demo-holder-indexer",
    holderCount: 7,
  },
  feeRouting: {
    integration: "pumpfun",
    status: "locked",
    checkedAt: "2026-05-01T18:01:00.000Z",
    feeRecipient: "Du1WSkrW7WX5ZwADx5fyJ4rhhcJBSSS8xnFq6APLuLSN",
    allocationBps: 1000,
    evidenceAccount: "RouteEvidence111111111111111111111111111111",
  },
  formula: {
    version: "avg-balance-time-v1",
    minimumHoldSeconds: 3600,
    minimumAverageBalanceRaw: "10000",
    multipliers: [
      { minSeconds: 604800, multiplierBps: 30000 },
      { minSeconds: 259200, multiplierBps: 20000 },
      { minSeconds: 86400, multiplierBps: 15000 },
      { minSeconds: 21600, multiplierBps: 12500 },
      { minSeconds: 3600, multiplierBps: 10000 },
    ],
  },
  splitBps: {
    holderRewards: 7000,
    protectionReserve: 2000,
    projectTreasury: 0,
    platformFee: 1000,
  },
  inputTotals: {
    feeInflowLamports: "18420000000",
    rewardPoolLamports: "12894000000",
    protectionReserveLamports: "3684000000",
    projectTreasuryLamports: "0",
    platformFeeLamports: "1842000000",
  },
  recipients: [
    {
      wallet: "7Qb111111111111111111111111111111111119k2",
      averageBalanceRaw: "1820000",
      heldSeconds: 691200,
      multiplierBps: 30000,
      weightRaw: "54600000000",
      excludedReason: null,
      payoutLamports: "6805339778",
    },
    {
      wallet: "Team1111111111111111111111111111111111001",
      averageBalanceRaw: "3000000",
      heldSeconds: 777600,
      multiplierBps: 0,
      weightRaw: "0",
      excludedReason: "team_wallet",
      payoutLamports: "0",
    },
  ],
  manifestHash: "aeeab816434ba8df78975af002ebd6b05bd55eda230689c5a40fe635d5dc0b28",
};

const viewModel = toReceiptProofViewModel(manifest);

assert.equal(viewModel.state, "ready");
assert.equal(viewModel.projectLabel, "$RECEIPTS demo");
assert.equal(viewModel.status.label, "Proof manifest");
assert.equal(viewModel.status.variant, "good");
assert.equal(viewModel.metrics.feeInflow, "18.420 SOL");
assert.equal(viewModel.metrics.holderRewards, "12.894 SOL");
assert.equal(viewModel.metrics.protectionReserve, "3.684 SOL");
assert.equal(viewModel.metrics.platformFee, "1.842 SOL");
assert.equal(viewModel.splitLabels.holderRewards, "70%");
assert.equal(viewModel.splitLabels.protectionReserve, "20%");
assert.equal(viewModel.splitLabels.platformFee, "10%");
assert.equal(viewModel.payableRecipientCount, 1);
assert.equal(viewModel.excludedRecipientCount, 1);
assert.equal(viewModel.recipients[0].wallet, "7Qb1...9k2");
assert.equal(viewModel.recipients[0].payout, "6.805 SOL");
assert.equal(viewModel.recipients[0].holdTime, "8d 0h");
assert.equal(viewModel.recipients[0].multiplier, "3x");
assert.equal(viewModel.recipients[1].excludedReason, "Team wallet");
assert.equal(viewModel.hash.short, "aeeab816...5dc0b28");
assert.match(viewModel.disclaimer, /not guarantee/i);

const unavailable = toReceiptProofViewModel(null);
assert.equal(unavailable.state, "empty");
assert.equal(unavailable.status.variant, "watch");

console.log("Receipt proof view-model tests passed.");
