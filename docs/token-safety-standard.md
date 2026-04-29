# TrustLayer Token Safety Standard

## Prepared Marketing Slogan

For $RECEIPTS, this is non-negotiable. If any of these controls exist, the token
should not be TrustLayer verified.

No hidden token controls. No surprise extensions. No live mint/freeze authority.
No hooks. No transfer traps. No fee rerouting inside the token.

## What This Means

This standard refers to dangerous or high-risk Solana token controls that can
allow a token creator or privileged authority to change holder expectations
after launch, restrict transfers, freeze accounts, reroute fees, or create
hidden control paths.

For TrustLayer tokens, these are not allowed:

- `permanentDelegate`
- `nonTransferable`
- default frozen account state
- `transferHook`
- `transferFeeConfig`
- unknown Token-2022 extensions
- mint authority present
- freeze authority present

If any of the above are detected, the token should be rejected from TrustLayer
verification until the issue is removed or, where possible, the authority is
revoked.

## Plain-English Explanation

TrustLayer verification should mean the token does not contain hidden controls
that can surprise buyers later.

This does not make a meme coin risk-free. It means TrustLayer is checking for
specific token-level controls that could create transfer traps, hidden fee
routing, frozen accounts, surprise minting, or privileged token movement.

The goal is simple: if a coin claims to be powered by TrustLayer, holders should
not have to wonder whether the token itself contains hidden mechanics working
against them.
