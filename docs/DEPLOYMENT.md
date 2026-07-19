# Deployment Notes

## Local verification

```bash
npm test
npm run check
npm run demo
npm run dev
```

The local app now serves both the dashboard and API from `http://localhost:4173`.

For production deployment, use [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md).

## Contract build

Agent Blackbox uses Casper contract crates that compile cleanly with Casper's generated-template toolchain pin:

```text
nightly-2024-07-31
```

The contract folder includes `contracts/agent-blackbox/rust-toolchain` with that value. From the project root, build with:

```bash
rustup toolchain install nightly-2024-07-31
rustup target add wasm32-unknown-unknown --toolchain nightly-2024-07-31
cargo +nightly-2024-07-31 build --release --target wasm32-unknown-unknown --manifest-path contracts/agent-blackbox/Cargo.toml
```

The expected artifact is:

```text
contracts/agent-blackbox/target/wasm32-unknown-unknown/release/agent_blackbox.wasm
```

Dependency pins in `contracts/agent-blackbox/Cargo.lock` keep the build compatible with the pinned toolchain:

```text
casper-types = 6.1.0
zeroize = 1.8.1
base64ct = 1.6.0
```

## Windows note

The WASM contract now builds on Windows. However, `casper-client v5.0.1` currently fails to compile natively on Windows because its dependency tree imports Unix-only APIs. Casper's docs recommend Linux/macOS for the full deployment workflow.

For deployment from this machine, use one of these options:

1. Install Ubuntu under WSL and install `casper-client` there.
2. Use another Linux/macOS machine for the deploy step.
3. Use a Casper SDK/CSPR.click signing flow instead of the Rust `casper-client` binary.

## Testnet deploy flow

1. Create a throwaway Casper Testnet account in Casper Wallet.
2. Fund it with the faucet at `https://testnet.cspr.live/tools/faucet`.
3. Export or generate a testnet-only signing key for deploys.
4. Pick a testnet node from `https://testnet.cspr.live/tools/peers`.
5. Deploy `agent_blackbox.wasm`.
6. Save the resulting contract hash as `AGENT_BLACKBOX_CONTRACT_HASH`.
7. Run `npm run demo` again so the adapter prepares a real contract-call payload instead of mock mode.
8. Use `node scripts/prepare-deploy.mjs` to print the `submit_receipt` runtime arguments.
9. Send the `submit_receipt` deploy and record the deploy hash in the project README.

## Current testnet deployment

```text
Network: casper-test
Account: 020227c032dc0cda3475482a27d86c2ccbd7f3444f7a17dfc08ce1a16087aafca8a1
Install transaction: 527101b5f588320530f091fdc390c852b9784df486722fae97fa518906892d0c
Contract hash: hash-11c55f283a39e492201bf3f4f7e9b76436599b364c0a0fbc385d46fb3d1e5fb8
Package hash: hash-a738b2bdb89a6b65c71c2ae11f5b688248f38abbf463b7d487ddc2c0981a7abb
Receipt ID: 28f49029-999a-496c-8e64-ce94df16b7bf
Receipt hash: 235470a706053333103e6c12741c4cfa8e147ab1d0230a1343e075c55cfac359
Receipt transaction: b59446b16e1b17baa4081ee9152b7f4ac42c48fb6ddb3d9e1b0f6e22a7dd36ad
```

Verification helpers:

```bash
node scripts/check-transaction.mjs 527101b5f588320530f091fdc390c852b9784df486722fae97fa518906892d0c
node scripts/check-transaction.mjs b59446b16e1b17baa4081ee9152b7f4ac42c48fb6ddb3d9e1b0f6e22a7dd36ad
node scripts/get-contract-keys.mjs 020227c032dc0cda3475482a27d86c2ccbd7f3444f7a17dfc08ce1a16087aafca8a1
```

## Environment variables

```text
RECEIPT_STORE_PATH=/data/receipts.json
AGENT_BLACKBOX_API_KEY=optional-server-to-server-token
AGENT_BLACKBOX_CONTRACT_HASH=hash-...
CSPR_CLOUD_API_KEY=...
CASPER_NODE_URL=https://node.testnet.casper.network/rpc
```

## CSPR.cloud integration

The prototype includes the adapter seam in `packages/casper/blackboxClient.mjs`. Once the contract is deployed, query the contract package hash or emitted events through CSPR.cloud and replace local demo data with indexed testnet receipts.
