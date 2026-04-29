# TrustLayer Product Roadmap

## Product Thesis

TrustLayer is a contract-backed trust and reward layer for Solana meme coins.
The first product should not try to replace pump.fun. It should give serious
builders a way to prove where fees go, reward holders publicly, and make trust
signals revocable when a project stops following its own rules.

Launchpads compete on speed, liquidity, and creator fee carrots. TrustLayer
competes on three questions buyers already care about:

- Who deserves the fee?
- Where does the fee go?
- Are the rewards real?

Creator fees and holder rewards are becoming table stakes. The durable product
is proof, accountability, and readable trust.

## Positioning

Use:

- Transparent reward layer for meme coin launches
- Contract-backed vaults
- Protection reserve
- Public payout proof
- Verification that can be revoked
- Fee transparency score
- Reward quality score
- Creator legitimacy layer

Avoid:

- Guaranteed insurance
- Rug-proof
- Risk-free
- Guaranteed yield

## MVP Goal

Launch a working TrustLayer cockpit for one proof-of-concept token where users
can see:

- Project fee deposits entering a vault
- The configured split between holder rewards, protection reserve, and platform fee
- Holder reward weights based on average balance and time held
- Reward cycle history
- Protection reserve rules and status
- Verification badge state

The MVP should prove the system, even with small reward amounts.

The sharp MVP wedge:

1. Dev registration and fee routing setup.
2. Public dashboard with verification, routing, reserve, and holder reward metrics.
3. Epoch-based reward accounting with admin-reviewed payouts.
4. Transparent protection reserve without automated insurance claims yet.
5. Admin verification and warning system.

## Revenue Model

Initial rollout:

- 0 SOL upfront for approved launch partners
- TrustLayer earns from routed inflows
- Recommended starting split: 70% holder rewards / 20% protection reserve / 10% platform
- Premium or custom splits only by manual approval

Later rollout:

- Optional 0.5 SOL onboarding fee
- Lower platform take-rate for paid onboarding
- Featured placement and launch support as premium services

## Verification Tiers

Tracked:

- Token dashboard exists
- Basic holder and vault data visible
- Not yet verified as actively routing fees

Verified Rewards:

- Vault is receiving funds
- Reward cycle rules are published
- Payout history is visible

Protected:

- Protection reserve is funded
- Dev wallets are disclosed
- Project rules and violation triggers are configured

Warning:

- Routing paused
- Unexpected wallet behavior
- Late or failed reward cycle
- Manual review required

Revoked:

- Routing stopped beyond grace period
- Dev rules broken
- Authority/liquidity abuse detected
- Dashboard remains public with revocation reason

Suggested future tier model:

- Tier 0: Unverified
- Tier 1: Basic project metadata verified
- Tier 2: Token controls verified
- Tier 3: Fee routing and reserve active
- Tier 4: Enhanced verification with team/KYC/audit/manual review

## Contract Scope

The first contract should be boring and narrow:

- Create project vault config
- Accept SOL/token deposits
- Split deposits by configured basis points
- Track holder reward pool, protection reserve, and platform balance
- Emit events for deposits, splits, cycle creation, and payout hashes
- Restrict admin powers with clear pause and emergency controls
- Create payout rounds using signed manifests or Merkle roots
- Prevent double claims with claim receipts

Do not put holder indexing or heavy reward math on-chain in v1. That is too
expensive and too rigid for launch.

On-chain should enforce what cannot be trusted:

- Vault custody
- Fee split rules
- Revenue deposits
- Payout round funding
- Double-claim prevention
- Admin pause/timelock controls

Off-chain should handle what is dynamic, subjective, or expensive:

- Holder indexing
- Reward scoring
- Verification status
- Fraud review
- Project reputation
- Dashboard APIs

## Off-Chain Scope

The backend handles:

- Holder snapshots
- Average balance over time
- Hold-time multipliers
- Wallet eligibility filters
- Reward calculations
- Payout batch generation
- Verification status updates
- Public dashboard API

Every off-chain calculation should produce a public cycle record that can be
reviewed before payout.

Every payout cycle should publish:

- Project id
- Payout round id
- Snapshot slot
- Reward asset
- Total payout amount
- Formula version
- Manifest hash or Merkle root
- Excluded wallet list and reason codes

## Reward Formula

Baseline:

```text
wallet_weight = average_balance * hold_time_multiplier
holder_payout = wallet_weight / total_eligible_weight * holder_pool
```

Suggested multipliers:

- Under 1 hour: 0x
- 1 to 6 hours: 1x
- 6 to 24 hours: 1.25x
- 1 to 3 days: 1.5x
- 3 to 7 days: 2x
- 7+ days: 3x

Potential anti-gaming:

- Minimum balance threshold
- Team wallet exclusion
- Max wallet cap
- Sybil cluster review
- Sell-down penalty for wallets dumping most of their position before the cycle

## Protection Reserve Rules

The reserve is not a guarantee. It is a rule-defined backstop.

Possible triggers:

- Dev wallet dumps beyond configured threshold
- Liquidity removed or abused
- Mint/freeze authority abuse
- Fee routing stops
- Emergency admin review

If triggered:

- Freeze new eligibility at the event snapshot
- Exclude disclosed team wallets
- Calculate eligible holder reimbursements by pre-event holder weight
- Publish the event reason and payout record

If no trigger occurs:

- Keep a rolling reserve
- Release a scheduled maturity bonus to holders
- Allocate a small success fee to the platform
- Optionally support liquidity or buyback rules for that project

## Dev Gaming Risks

Dev can try to game TrustLayer by:

- Routing fees briefly to get verified, then stopping
- Using undisclosed wallets to farm holder rewards
- Launching copycat names to confuse buyers
- Creating artificial volume to inflate reward attention
- Dumping through undisclosed wallets while public dev wallet looks clean
- Sending low-value deposits to appear active
- Creating circular self-funded deposits to fake traction
- Changing fee settings after marketing the original split
- Using fee claims as hidden extraction while calling the project protected

Controls:

- Verification requires sustained routing, not one deposit
- Badge status updates automatically when routing pauses
- Require disclosed wallets and social/project ownership checks
- Manual approval for early projects
- Public warning state instead of silent removal
- Show deposit size and timing clearly
- Require project-specific vaults so one project cannot hide behind another
- Distinguish verified external revenue from self-funded deposits
- Lock fee split changes behind a visible delay
- Publish all config changes with before/after values
- Use multisig for high-impact admin actions

## Admin MVP

Admin must be able to:

- Approve/reject projects
- Assign verification tier
- Pause payouts
- Flag wallets
- Mark disclosed team wallets
- Review reward cycles before payout
- Publish revocation reasons

Manual approval is a strength at launch. It prevents spam before the standard
has market trust.

Admin roles should be separated early:

- Verifier
- Payout reviewer
- Emergency pauser
- Wallet labeler
- Read-only auditor

Avoid one key having full power over vaults, verification, payouts, and upgrades.

## Dashboard Metrics

The public project page should prioritize speed of understanding. A trader
should know the status in under 10 seconds.

Top-level:

- Verification tier
- Routing active yes/no
- Rewards active yes/no
- Reserve active yes/no
- Active warnings
- Last indexed transaction

Fee routing:

- Total fees routed lifetime
- Fees routed in current epoch
- Holder reward percentage
- Protection reserve percentage
- Treasury percentage
- TrustLayer fee percentage
- Routing lock expiration
- Last routing config change

Rewards:

- Current epoch
- Epoch start/end
- Current reward pool
- Lifetime rewards distributed
- Eligible holder count
- Minimum balance
- Minimum hold duration
- Formula version
- User estimated share after wallet connect

Protection reserve:

- Current reserve balance
- Reserve inflows/outflows
- Reserve control type
- Withdrawal delay
- Reserve health
- Trigger policy

Risk:

- Mint authority status
- Freeze authority status
- LP/pool status
- Top 10 holder percentage
- Team wallet percentage
- Excluded wallet percentage
- Routing pause events
- Large reserve withdrawals

## Market Notes

Competitive reference points as of April 29, 2026:

- pump.fun remains the default Solana meme launch venue. Its advantage is speed,
  distribution, and trader mindshare.
- Raydium LaunchLab is infrastructure-oriented and supports programmable launch
  economics, but is more complex for casual builders.
- Bags-style products normalize creator royalties and claimable creator fees.
- Bonk/LaunchLab-style products use ecosystem incentives and deployer rewards.
- BLIMP-like products show demand for creator fees being converted into visible
  buybacks, airdrops, or holder rewards.

TrustLayer should not compete on being the fastest launch button. It should be
the trust and accountability layer that other launch flows can point to.

## Build Phases

Phase 1: Public product shell

- Live site
- Product cockpit mock
- Fleet board mock
- Early access CTA

Phase 2: Data MVP

- Backend project model
- Manual project intake
- Solana holder snapshots
- Vault balance tracking
- Reward calculation preview

Phase 3: Payout MVP

- Admin-reviewed payout cycle
- Signed payout manifest
- Export/send payout batch for small projects
- Prepare Merkle-claim design for larger projects
- Public cycle history
- Public transaction links

Phase 4: Contract-backed vault

- Project vault contract
- Deposit splitting
- Protection reserve accounting
- Platform fee accounting
- Event logs for dashboard
- Multisig-controlled admin
- Timelocked fee config changes
- Payout round account or manifest hash

Phase 5: Verified launch partners

- First proof-of-concept token
- Real deposits
- Real small payouts
- Public case study

Phase 6: Open onboarding

- Dev application flow
- Automatic verification checks
- Badge generator
- Paid onboarding tier

Phase 7: Trust infrastructure

- Public API
- Badge endpoint
- Fee transparency score
- Reward sustainability score
- Creator legitimacy checks
- Alerts for routing pauses, reserve withdrawals, and config changes

## Near-Term Decisions

- Choose exact initial split.
- Decide whether proof-of-concept rewards pay SOL only or token + SOL.
- Define minimum routing cadence needed to keep verified status.
- Define project rejection rules for clone/copycat launches.
- Decide first contract framework and audit path.
- Decide whether first real payout is direct batch or Merkle claim.
- Choose multisig provider and admin signer policy.
- Define how long fee splits must be locked for "Protected" status.
