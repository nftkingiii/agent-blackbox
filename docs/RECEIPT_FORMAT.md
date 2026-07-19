# Receipt Format

The sample receipt lives at `apps/web/public/demo-receipt.json`.

## Top-level fields

- `version`: schema version used by Agent Blackbox.
- `receiptId`: stable ID for this agent action.
- `timestamp`: when the receipt was created.
- `receiptHash`: SHA-256 hash of the canonical receipt body.

## Agent

- `id`: stable agent identifier.
- `name`: human-readable agent name.
- `wallet`: account or wallet identity linked to the action.
- `model`: model or agent runtime used.

## Task

- `intent`: user or system intent for the action.
- `intentHash`: hash of the intent text.
- `user`: user identity or account reference.

## Policy

- `policyHash`: hash of the active policy snapshot.
- `decision`: policy result, such as `approved` or `blocked`.
- `rules`: rules applied during evaluation.
- `riskScore`: numeric risk score.
- `explanation`: human-readable reason.

## Tool Call

- `tool`: tool name.
- `target`: endpoint or system called.
- `method`: action method.
- `requestHash`: hash of private request details.
- `responseHash`: hash of private response details.
- `costMotes`: recorded cost.
- `status`: execution result.

## Chain

- `network`: Casper network.
- `contractPackageHash`: registry package hash.
- `deployHash`: transaction hash when available.
- `blockHash`: block hash when available.

## Evidence

Evidence entries link private records without exposing raw data on-chain.

- `label`: short evidence name.
- `uri`: off-chain evidence location.
- `hash`: hash of the evidence record.

