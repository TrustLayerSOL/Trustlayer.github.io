# TrustLayer Contracts

The first on-chain target is `programs/trustlayer_vault`.

Current scope:

- Protocol config account
- Project config account
- Project-specific SOL vault PDA
- Program-enforced fee split
- Protection reserve accounting
- Holder reward pool accounting
- Payout round account
- Merkle-style claim receipts
- Fee split timelock
- Emergency project pause

This scaffold is intentionally narrow. It does not launch tokens, replace
pump.fun, or calculate holder ownership on-chain. It locks the money path first.

## Build Target

```bash
anchor build
```

## First Review Priorities

- Confirm PDA vault funding behavior on localnet.
- Add Anchor integration tests for deposits and payout claims.
- Add SPL token support after SOL deposits are proven.
- Add protocol-fee and project-treasury withdrawal instructions with multisig
  and event logs.
- Add payout-round cancellation policy before any production funds.

## Security Posture

Do not deploy this with meaningful funds until:

- Anchor tests pass.
- A Solana developer reviews the account constraints.
- Admin keys are behind multisig.
- Upgrade authority and fee changes are timelocked.
- A small proof-of-concept launch proves deposits, manifests, and claims.
