const SOLANA_ADDRESS_PATTERN = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
const ZERO_WIDTH_PATTERN = /[\u200B-\u200D\uFEFF]/g;

export function extractSolanaAddressInput(value) {
  const normalized = String(value ?? "").replace(ZERO_WIDTH_PATTERN, "").trim();

  if (!normalized) return "";

  const matches = normalized.match(SOLANA_ADDRESS_PATTERN) || [];
  return matches[0] || "";
}
