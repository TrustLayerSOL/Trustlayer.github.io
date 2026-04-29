# TrustLayer Backend Prototype

This folder holds dependency-free prototype logic for TrustLayer reward cycles.
It is intentionally simple so the math can be inspected before it is connected
to Solana RPC, a database, or a vault program.

Run the demo:

```bash
node backend/scripts/run-reward-cycle.js
```

Run tests:

```bash
node backend/test/reward-engine.test.js
```

Verify the demo payout manifest:

```bash
node backend/scripts/verify-demo-manifest.js
```

Current scope:

- Average balance weighting
- Hold-time multipliers
- Minimum hold time
- Minimum balance
- Excluded wallets
- Holder pool allocation
- Protection reserve and platform split preview
- Fee split policy validation
- Project application validation
- Payout manifest hashing and verification

Next backend steps:

- Replace demo data with Solana token account snapshots.
- Store snapshots in Postgres/Supabase.
- Generate signed payout manifests.
- Add wallet labels and review workflow.
