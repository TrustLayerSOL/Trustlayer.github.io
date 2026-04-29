# TrustLayer Technical Architecture

## Architecture Principle

TrustLayer should be flexible where judgment is needed and strict where money
moves.

On-chain:

- Vault custody
- Fee split enforcement
- Project-specific accounts
- Payout round funding
- Double-claim prevention
- Pause/timelock controls

Off-chain:

- Holder indexing
- Average balance and time-held scoring
- Wallet labels and exclusions
- Verification status
- Fraud review
- Public dashboard APIs

This keeps expensive computation off-chain while making the money path hard to
game.

## Core Components

### 1. Project Vault Program

Each onboarded project gets a program-derived vault and immutable or timelocked
configuration.

Primary account model:

- `ProjectConfig`
- `Vault`
- `FeeSplitConfig`
- `PayoutRound`
- `ClaimReceipt`
- `AdminConfig`

Primary instructions:

- `initialize_project`
- `deposit_revenue`
- `split_revenue`
- `create_payout_round`
- `claim_payout`
- `pause_project`
- `unpause_project`
- `propose_fee_split_change`
- `execute_fee_split_change`

Minimum enforced split:

```text
routed_inflow = holder_rewards + protection_reserve + project_treasury + trustlayer_fee
```

All percentages should be basis points and must sum to 10,000.

### 2. Holder Indexer

The indexer reconstructs holder state from Solana data.

Responsibilities:

- Fetch token accounts for a mint.
- Track balances across time.
- Store snapshots by slot/time.
- Calculate average balance per epoch.
- Apply hold-time multipliers.
- Exclude team, treasury, LP, and flagged wallets.
- Produce reward manifests.

Indexer outputs must be reproducible:

- Snapshot slot
- Formula version
- Wallet rows
- Exclusion reason codes
- Total eligible weight
- Manifest hash or Merkle root

### 3. Payout Engine

MVP can support admin-reviewed batch payouts for small holder sets.

V1 should move to Merkle claims:

1. Vault accumulates reward pool.
2. Indexer computes eligibility.
3. Backend creates payout manifest.
4. Contract stores manifest hash or Merkle root.
5. Wallets claim against their proof.
6. Claim receipts prevent double claims.

This avoids huge batch transfers and keeps each user allocation exact.

### 4. Verification Engine

Verification is not custody. It is a public label and status history.

Statuses:

- `tracked`
- `verified_rewards`
- `protected`
- `warning`
- `revoked`

Status changes require:

- Reason code
- Actor
- Timestamp
- Evidence link or note
- Before/after state

High-impact changes should require two approvals once real funds are involved.

### 5. Admin Console

Admin roles should be separated:

- Verifier
- Payout reviewer
- Wallet labeler
- Emergency pauser
- Read-only auditor

Avoid one wallet or one login controlling vaults, payouts, verification, and
upgrades.

## MVP Data Flow

```text
Dev registers token
  -> TrustLayer creates project config
  -> Fee routing instructions are shown
  -> Deposits enter project vault
  -> Backend indexes holders
  -> Reward engine creates epoch manifest
  -> Admin reviews payout
  -> Payout transaction or claim round is published
  -> Dashboard shows proof and status
```

## Security Requirements

Before meaningful TVL:

- Multisig admin
- Timelocked config changes
- Program audit
- Payout manifest replay tests
- Split math property tests
- Double-claim tests
- Pause/unpause tests
- Public incident response policy

## Major Risks

Fee routing manipulation:

- Mitigation: program-enforced splits and timelocked changes.

Fake revenue:

- Mitigation: distinguish gross deposits from verified external fee source.

Snapshot gaming:

- Mitigation: average balance, minimum hold time, and sell-down penalty.

Insider payout edits:

- Mitigation: public manifests, formula versions, and review logs.

Upgrade rug:

- Mitigation: multisig, timelock, audit, and eventual reduced upgrade power.
