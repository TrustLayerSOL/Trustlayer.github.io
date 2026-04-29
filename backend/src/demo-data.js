export const demoProject = {
  id: "trustdemo",
  name: "Trust Demo",
  ticker: "TRUSTDEMO",
  tokenMint: "DemoMint111111111111111111111111111111111111",
  vaultAddress: "TrustVault1111111111111111111111111111111111",
  totalInflow: 18.42,
  splitBps: {
    holderRewards: 7000,
    protectionReserve: 2000,
    projectTreasury: 0,
    platformFee: 1000,
  },
  rules: {
    minimumAverageBalance: 10000,
    minimumHoldSeconds: 60 * 60,
  },
};

export const demoHolders = [
  {
    wallet: "7Qb...9k2",
    averageBalance: 1_820_000,
    heldSeconds: 8 * 24 * 60 * 60,
  },
  {
    wallet: "A1p...Lx8",
    averageBalance: 1_420_000,
    heldSeconds: 4 * 24 * 60 * 60,
  },
  {
    wallet: "Hn4...0Pa",
    averageBalance: 980_000,
    heldSeconds: 30 * 60 * 60,
  },
  {
    wallet: "3Tb...Vz3",
    averageBalance: 460_000,
    heldSeconds: 12 * 60 * 60,
  },
  {
    wallet: "Team...001",
    averageBalance: 3_000_000,
    heldSeconds: 9 * 24 * 60 * 60,
    excluded: true,
    excludedReason: "team_wallet",
  },
  {
    wallet: "New...Bot",
    averageBalance: 700_000,
    heldSeconds: 18 * 60,
  },
  {
    wallet: "Dust...77",
    averageBalance: 2_500,
    heldSeconds: 7 * 24 * 60 * 60,
  },
];
