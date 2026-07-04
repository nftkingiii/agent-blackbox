# Agent Blackbox Architecture

## Core idea

Agent Blackbox turns agent actions into verifiable execution receipts. A receipt is a canonical JSON object with a deterministic hash. Private or bulky evidence can stay off-chain, while Casper stores the receipt digest and enough metadata to make the action discoverable.

## Components

### Agent runtime

The agent runtime wraps high-risk operations:

- paid API calls
- MCP tool calls
- wallet signing
- contract deploys
- policy decisions

Before execution, the runtime checks policy. After execution, it creates a receipt and passes it to the Casper adapter.

### Receipt core

`packages/core/receipt.mjs` owns:

- canonical JSON sorting
- SHA-256 hashing
- receipt creation
- integrity verification
- contract runtime argument conversion

### Casper adapter

`packages/casper/blackboxClient.mjs` prepares the `submit_receipt` deploy payload. In local mode, it creates a deterministic mock deploy hash so the dashboard can be demoed before wallet signing is connected.

### Smart contract

The contract exposes `submit_receipt` and stores receipt records in a dictionary keyed by `receipt_id`. The stored value includes:

- receipt hash
- agent id
- policy hash
- cost
- tool
- decision
- timestamp

This keeps the on-chain state compact while preserving auditability.

### Dashboard

The dashboard presents the receipt as a replayable timeline:

1. intent captured
2. policy checked
3. tool called
4. receipt anchored

It also shows the prepared Casper payload so judges can see the transaction-producing component.

## Next integrations

- Replace mock deploy mode with Casper SDK signing.
- Add CSPR.click wallet creation/signing support.
- Query contract events or dictionary state through CSPR.cloud.
- Store large evidence blobs on IPFS, Walrus, or a simple object store.
- Add policy templates for x402 spending caps and approved MCP servers.
