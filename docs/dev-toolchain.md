# TrustLayer Dev Toolchain

This Mac currently has the bundled Codex `node`, but not the full Solana build
toolchain. Use the newer development machine for contract compilation.

## Required Tools

- Node.js LTS with `npm`
- Rust stable
- Solana CLI
- Anchor CLI

## Sanity Checks

```bash
node -v
npm -v
rustc --version
cargo --version
solana --version
anchor --version
```

## Local Contract Build

From the project root:

```bash
anchor build
```

## Backend Prototype Checks

These do not need npm dependencies:

```bash
node backend/scripts/write-demo-manifest.js
node backend/scripts/verify-demo-manifest.js
node backend/test/reward-engine.test.js
```

## Frontend Build

Once npm is available:

```bash
npm install
npm run build
```

Vercel already builds the public site from GitHub.
