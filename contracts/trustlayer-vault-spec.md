# TrustLayer Vault Program Spec

This is the first-contract specification for the TrustLayer pre-launchpad model.
It is written as an implementation target for an Anchor/Solana developer.

## Goals

- Create a project-specific vault.
- Enforce public fee splits.
- Separate holder rewards, protection reserve, project treasury, and protocol fee.
- Emit events the dashboard can index.
- Support payout manifests or Merkle roots.
- Prevent silent fee redirection.

## Non-Goals

- Do not calculate all holder balances on-chain.
- Do not perform subjective verification on-chain.
- Do not guarantee protection reserve reimbursement.
- Do not allow arbitrary admin withdrawals.

## Accounts

### `AdminConfig`

Fields:

- `admin_multisig`
- `emergency_pauser`
- `protocol_fee_destination`
- `upgrade_authority`
- `fee_change_timelock_seconds`
- `paused`

### `ProjectConfig`

Fields:

- `project_id`
- `token_mint`
- `project_authority`
- `project_treasury`
- `vault`
- `fee_split_config`
- `status`
- `metadata_hash`
- `created_at`
- `paused`

### `Vault`

Fields:

- `project_config`
- `reward_pool_balance`
- `protection_reserve_balance`
- `project_treasury_balance`
- `platform_fee_balance`
- `total_deposited`
- `total_distributed`

### `FeeSplitConfig`

Fields:

- `holder_rewards_bps`
- `protection_reserve_bps`
- `project_treasury_bps`
- `platform_fee_bps`
- `locked_until`
- `pending_config`
- `pending_config_activates_at`

Constraint:

```text
holder_rewards_bps + protection_reserve_bps + project_treasury_bps + platform_fee_bps = 10000
```

### `PayoutRound`

Fields:

- `project_config`
- `round_id`
- `snapshot_slot`
- `reward_asset_mint`
- `total_amount`
- `manifest_hash`
- `merkle_root`
- `formula_version`
- `claim_start`
- `claim_end`
- `cancelled`

### `ClaimReceipt`

Fields:

- `payout_round`
- `wallet`
- `amount`
- `claimed_at`

## Instructions

### `initialize_project`

Creates project config, vault, and fee split config.

Required checks:

- Project authority signs.
- Token mint is valid.
- Fee split sums to 10,000 bps.
- Lock duration meets TrustLayer minimum for protected tier.

### `deposit_revenue`

Accepts SOL or supported SPL revenue into the project vault.

Required behavior:

- Split immediately by configured bps.
- Update vault accounting.
- Emit `RevenueDeposited`.

### `propose_fee_split_change`

Creates pending fee config.

Required checks:

- Authorized signer.
- New split sums to 10,000 bps.
- Emits old and new values.
- Does not activate until timelock expires.

### `execute_fee_split_change`

Activates pending fee split after timelock.

Required checks:

- Timelock elapsed.
- Project not emergency-paused unless allowed by admin config.
- Emit `FeeSplitChanged`.

### `create_payout_round`

Locks a reward amount against a published manifest hash or Merkle root.

Required checks:

- Payout reviewer/multisig signs.
- Amount does not exceed reward pool balance.
- Manifest hash exists.
- Formula version provided.
- Emit `PayoutRoundCreated`.

### `claim_payout`

Claim-based payout for larger projects.

Required checks:

- Claim window active.
- Merkle proof valid.
- Claim receipt does not already exist.
- Transfer amount to claimant.
- Emit `PayoutClaimed`.

### `pause_project`

Emergency pause for one project.

Allowed effects:

- Stop new payout rounds.
- Stop claims only if explicitly configured for severe incidents.
- Never silently redirect funds.

### `unpause_project`

Restores normal project operation.

### `close_expired_round`

Closes expired claim round and handles unclaimed rewards according to project
rules.

Possible rules:

- Roll over to next holder reward pool.
- Return to protection reserve.
- Keep claimable until admin review.

## Events

`ProjectInitialized`

- project id
- token mint
- vault
- fee split
- lock duration

`RevenueDeposited`

- project id
- amount
- reward share
- reserve share
- treasury share
- platform share

`FeeSplitChangeProposed`

- project id
- old split
- new split
- activates at

`FeeSplitChanged`

- project id
- old split
- new split

`PayoutRoundCreated`

- project id
- round id
- snapshot slot
- amount
- manifest hash
- merkle root
- formula version

`PayoutClaimed`

- project id
- round id
- wallet
- amount

`ProjectPaused`

- project id
- reason code

`ProjectUnpaused`

- project id

## Required Tests

- Fee split sum validation.
- Deposit split math.
- Rounding behavior.
- Project-specific vault isolation.
- Unauthorized config change rejection.
- Timelock bypass rejection.
- Pause/unpause behavior.
- Payout round overfunding rejection.
- Double-claim rejection.
- Invalid Merkle proof rejection.
- Claim after expiry rejection.

## First Deployment Policy

For the proof-of-concept launch:

- Use multisig from day one.
- Keep initial split simple.
- Publish all program ids and vault addresses.
- Keep reward amounts small until reviewed.
- Run an external review before significant TVL.
