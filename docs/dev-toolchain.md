# TrustLayer Dev Toolchain

This Mac has the TrustLayer frontend/backend toolchain plus the Solana/Anchor
contract build toolchain installed.

## Required Tools

- Node.js LTS with `npm`
- Rust stable
- Solana CLI
- Anchor CLI
- `cargo-build-sbf`

## Sanity Checks

```bash
node -v
npm -v
rustup --version
rustc --version
cargo --version
solana --version
anchor --version
cargo build-sbf --version
```

If a new shell cannot find Rust/Solana build helpers, reload the shell or run:

```bash
export PATH="/opt/homebrew/opt/rustup/bin:$HOME/.cargo/bin:$PATH"
```

## Local Contract Build

From the project root:

```bash
export PATH="/opt/homebrew/opt/rustup/bin:$HOME/.cargo/bin:$PATH"
anchor build
```

Current local program id:

```text
EFSdi1aqQsUg7Am9bqTDhxhKzB5EqJRJxT4Jiux3LX2s
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
