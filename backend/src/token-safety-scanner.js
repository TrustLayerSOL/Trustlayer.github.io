export const TOKEN_PROGRAMS = {
  splToken: "spl-token",
  token2022: "token-2022",
  unknown: "unknown",
};

export const HARD_BLOCKED_EXTENSIONS = new Set([
  "permanentDelegate",
  "nonTransferable",
  "transferHook",
  "transferFeeConfig",
  "pausableConfig",
]);

export const KNOWN_SAFE_TOKEN_2022_EXTENSIONS = new Set([
  "metadataPointer",
  "tokenMetadata",
  "interestBearingConfig",
  "memoTransfer",
  "immutableOwner",
  "cpiGuard",
  "confidentialTransferMint",
  "confidentialTransferFeeConfig",
  "groupPointer",
  "tokenGroup",
  "groupMemberPointer",
  "tokenGroupMember",
  "scaledUiAmountConfig",
  "defaultAccountState",
]);

export const TOKEN_SAFETY_POLICY = {
  hardBlockedExtensions: HARD_BLOCKED_EXTENSIONS,
  knownSafeToken2022Extensions: KNOWN_SAFE_TOKEN_2022_EXTENSIONS,
  failUnknownToken2022Extensions: true,
  hardBlockMintAuthority: true,
  hardBlockFreezeAuthority: true,
  hardBlockDefaultFrozenState: true,
};

const TOKEN_PROGRAM_LABELS = {
  "spl-token": "SPL Token",
  "token-2022": "Token-2022",
  unknown: "Unknown token program",
};

export function evaluateTokenSafety(facts, policy = TOKEN_SAFETY_POLICY) {
  const normalized = normalizeMintFacts(facts);
  const hardBlocks = [];
  const info = [];

  if (normalized.tokenProgram === TOKEN_PROGRAMS.unknown) {
    hardBlocks.push({
      code: "unknown_token_program",
      label: "Unknown token program",
      detail: "TrustLayer can only verify standard SPL Token or Token-2022 mints.",
    });
  }

  if (policy.hardBlockMintAuthority && normalized.mintAuthorityPresent) {
    hardBlocks.push({
      code: "mint_authority_present",
      label: "Mint authority present",
      detail: "A live mint authority can create additional supply after launch.",
    });
  }

  if (policy.hardBlockFreezeAuthority && normalized.freezeAuthorityPresent) {
    hardBlocks.push({
      code: "freeze_authority_present",
      label: "Freeze authority present",
      detail: "A live freeze authority can freeze token accounts.",
    });
  }

  if (policy.hardBlockDefaultFrozenState && normalized.defaultAccountState === "frozen") {
    hardBlocks.push({
      code: "default_account_state_frozen",
      label: "Default account state is frozen",
      detail: "New token accounts can initialize frozen by default.",
    });
  }

  for (const extension of normalized.extensions) {
    if (policy.hardBlockedExtensions.has(extension)) {
      hardBlocks.push({
        code: `blocked_extension_${extension}`,
        label: `Blocked extension: ${extension}`,
        detail: `${extension} is not allowed for TrustLayer verification.`,
      });
      continue;
    }

    if (
      normalized.tokenProgram === TOKEN_PROGRAMS.token2022 &&
      policy.failUnknownToken2022Extensions &&
      !policy.knownSafeToken2022Extensions.has(extension)
    ) {
      hardBlocks.push({
        code: `unknown_extension_${extension}`,
        label: `Unknown Token-2022 extension: ${extension}`,
        detail: "Unknown Token-2022 extensions fail closed under the TrustLayer safety standard.",
      });
    } else {
      info.push({
        code: `extension_${extension}`,
        label: `Extension detected: ${extension}`,
      });
    }
  }

  return {
    ok: hardBlocks.length === 0,
    status: hardBlocks.length === 0 ? "verified" : "rejected",
    checkedAt: normalized.checkedAt,
    mint: normalized.mint,
    tokenProgram: normalized.tokenProgram,
    tokenProgramLabel: TOKEN_PROGRAM_LABELS[normalized.tokenProgram] || TOKEN_PROGRAM_LABELS.unknown,
    hardBlocks,
    info,
    facts: normalized,
    summary:
      hardBlocks.length === 0
        ? "Token meets TrustLayer's technical token safety standard."
        : "Token does not meet TrustLayer's technical token safety standard.",
  };
}

export function normalizeMintFacts(facts = {}) {
  const extensions = Array.isArray(facts.extensions)
    ? [...new Set(facts.extensions.map((extension) => normalizeExtensionName(extension)).filter(Boolean))]
    : [];

  return {
    mint: facts.mint || null,
    checkedAt: facts.checkedAt || new Date().toISOString(),
    tokenProgram: normalizeTokenProgram(facts.tokenProgram),
    mintAuthorityPresent: Boolean(facts.mintAuthorityPresent),
    freezeAuthorityPresent: Boolean(facts.freezeAuthorityPresent),
    defaultAccountState: normalizeAccountState(facts.defaultAccountState),
    extensions,
    raw: facts.raw || null,
  };
}

export function normalizeTokenProgram(tokenProgram) {
  if (!tokenProgram) return TOKEN_PROGRAMS.unknown;
  const value = String(tokenProgram).trim();

  if (
    value === TOKEN_PROGRAMS.splToken ||
    value === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" ||
    value.toLowerCase() === "spl token"
  ) {
    return TOKEN_PROGRAMS.splToken;
  }

  if (
    value === TOKEN_PROGRAMS.token2022 ||
    value === "TokenzQdBNbLqP5VEhdkAS6EPFNozQk9Q7FEZyiNwAJb" ||
    value.toLowerCase() === "token-2022" ||
    value.toLowerCase() === "token 2022"
  ) {
    return TOKEN_PROGRAMS.token2022;
  }

  return TOKEN_PROGRAMS.unknown;
}

export function normalizeAccountState(defaultAccountState) {
  if (!defaultAccountState) return "initialized";
  const value = String(defaultAccountState).trim().toLowerCase();

  if (value === "frozen" || value === "freeze") return "frozen";
  if (value === "initialized" || value === "active") return "initialized";

  return value;
}

export function normalizeExtensionName(extension) {
  if (!extension) return "";
  const raw = String(extension).trim();
  const compact = raw.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  const aliases = {
    permanentdelegate: "permanentDelegate",
    nontransferable: "nonTransferable",
    defaultaccountstate: "defaultAccountState",
    transferhook: "transferHook",
    transferfeeconfig: "transferFeeConfig",
    metadatapointer: "metadataPointer",
    tokenmetadata: "tokenMetadata",
    interestbearingconfig: "interestBearingConfig",
    memotransfer: "memoTransfer",
    immutableowner: "immutableOwner",
    cpiguard: "cpiGuard",
    confidentialtransfermint: "confidentialTransferMint",
    confidentialtransferfeeconfig: "confidentialTransferFeeConfig",
    grouppointer: "groupPointer",
    tokengroup: "tokenGroup",
    groupmemberpointer: "groupMemberPointer",
    tokengroupmember: "tokenGroupMember",
    scaleduiamountconfig: "scaledUiAmountConfig",
    pausableconfig: "pausableConfig",
  };

  return aliases[compact] || raw;
}
