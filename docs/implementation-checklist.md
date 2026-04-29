# TrustLayer Implementation Checklist

## Phase 0: Public Product Shell

- Live product page on `trustlayer.fun`.
- Demo cockpit with vault split, manifest hash, reward formula, and eligibility exclusions.
- Public demo payout manifest at `/data/demo-payout-manifest.json`.
- Product roadmap, MVP spec, market research, and vault program spec in the repo.

## Phase 1: Contract-Backed Proof of Concept

- Build Anchor vault program from `contracts/trustlayer-vault-spec.md`.
- Create project-specific vault accounts.
- Enforce basis-point split on every deposit.
- Emit revenue and payout-round events.
- Store payout manifest hash on-chain.
- Use multisig/admin separation before meaningful funds.

## Phase 2: Holder Indexer

- Pull token accounts for an onboarded mint.
- Snapshot balances by slot/time.
- Compute average balance per reward epoch.
- Apply hold-time multipliers.
- Exclude team, treasury, LP, below-minimum, and flagged wallets.
- Write reproducible payout manifests with formula version and snapshot slot.

## Phase 3: Dashboard API

- Store projects, vaults, snapshots, payout rounds, and verification events.
- Serve public project dashboard JSON.
- Serve public project directory data.
- Show verification history and warning reasons.
- Add wallet eligibility checker.

## Phase 4: Payout Flow

- Start with admin-reviewed manifests.
- Publish manifest hash before payout.
- Send small controlled payouts for proof of concept.
- Move to Merkle claim rounds for larger holder sets.
- Add claim receipts and double-claim tests.

## Phase 5: Onboarding and Revenue

- Keep launch-partner onboarding at 0 SOL upfront.
- Default early split: 70% holders, 20% protection reserve, 10% TrustLayer.
- Require manual approval for first projects.
- Roll out a later 0.5 SOL upfront tier with lower routed take-rate.
- Keep all badge language tied to live verification, not guaranteed safety.

## Phase 6: Launchpad Expansion

- Add native token creation only after the vault/reward system works in public.
- Require safety rails by default.
- Add dev reputation, project history, configurable presets, and KOL launch rooms.
- Keep TrustLayer positioned as proof infrastructure first, launch infrastructure second.
