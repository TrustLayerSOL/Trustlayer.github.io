# TrustLayer MVP Spec

## MVP Objective

Prove a token can launch with readable trust mechanics:

- Contract-backed fee flow
- Visible protection reserve
- Holder rewards based on average balance and time held
- Public dashboard
- Revocable verification

The MVP does not need to be a full launchpad. It must show that the money path
and reward logic are real.

## Primary Users

Dev:

- Wants a trusted launch narrative.
- Wants a dashboard to show buyers.
- Wants rewards without custom engineering.

Trader:

- Wants to know whether fees are being extracted or routed back.
- Wants proof before buying.
- Wants to see eligibility and payouts.

Admin:

- Wants to approve real projects.
- Wants to prevent copycats and misleading badges.
- Wants to pause or warn without hiding history.

## P0 Features

Project registration:

- Token mint
- Project name/ticker
- Social links
- Dev wallet disclosure
- Requested fee split

Vault/reward config:

- Holder reward share
- Protection reserve share
- Project treasury share
- TrustLayer fee share
- Minimum hold duration
- Minimum balance
- Epoch length

Dashboard:

- Verification tier
- Vault balance
- Reward pool
- Protection reserve
- Fee split
- Next payout
- Reward formula
- Recent events
- Warning/revocation state

Admin:

- Approve project
- Assign tier
- Flag wallets
- Review payout cycle
- Publish warning/revocation reason

## P1 Features

- Wallet connect eligibility checker
- Signed payout manifest
- Claim history
- Badge generator
- Project directory search
- Config change history
- Fee transparency score
- Reward sustainability score

## P2 Features

- Merkle claim distributor
- Public API
- Telegram/Discord alerts
- Launchpad integrations
- Dev reputation
- Automated warning triggers

## Default Split

Suggested launch-partner split:

```text
70% holder rewards
20% protection reserve
10% TrustLayer
0% upfront fee
```

Later paid tier:

```text
0.5 SOL upfront
lower TrustLayer routed fee
same public proof requirements
```

## Protected Status Requirements

To earn `Protected`:

- Project-specific vault active
- Protection reserve receiving funds
- Fee split locked or timelocked
- Dev wallets disclosed
- Mint/freeze authority status visible
- Reward rules published
- No active warning

Protected does not mean guaranteed reimbursement. It means a reserve exists,
rules are public, and the system can prove the state.
