# Token Safety Scanner

TrustLayer's token safety scanner is a technical verification gate. It checks
whether a Solana mint contains token-level controls that TrustLayer does not
allow for verified projects.

Scanner approval does not mean a token is a good investment, cannot lose value,
or cannot be rugged through social, liquidity, wallet, or operational behavior.
It only means the mint meets TrustLayer's defined token-level safety standard.

## Output Shape

```json
{
  "ok": false,
  "status": "rejected",
  "checkedAt": "2026-04-29T00:00:00.000Z",
  "mint": "TOKEN_MINT",
  "tokenProgram": "token-2022",
  "tokenProgramLabel": "Token-2022",
  "hardBlocks": [
    {
      "code": "blocked_extension_permanentDelegate",
      "label": "Blocked extension: permanentDelegate",
      "detail": "permanentDelegate is not allowed for TrustLayer verification."
    }
  ],
  "info": [],
  "summary": "Token does not meet TrustLayer's technical token safety standard."
}
```

## Hard-Block Rules

A token is rejected if any of the following are present:

- `permanentDelegate`
- `nonTransferable`
- default frozen account state
- `transferHook`
- `transferFeeConfig`
- unknown Token-2022 extensions
- mint authority present
- freeze authority present

## Current Implementation

The policy evaluator lives in:

```text
backend/src/token-safety-scanner.js
```

It currently accepts normalized mint facts and returns a deterministic
`verified` or `rejected` result with hard-block reasons. The next step is wiring
it to Solana RPC mint parsing so live token addresses can be scanned.

## Marketing Language

Use this:

> No hidden token controls. No surprise extensions. No live mint/freeze
> authority. No hooks. No transfer traps. No fee rerouting inside the token.

Avoid this:

> Safe, risk-free, rug-proof, guaranteed, insured, or guaranteed rewards.
