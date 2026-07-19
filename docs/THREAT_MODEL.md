# Threat Model

Agent Blackbox is an accountability layer. It makes important AI agent actions verifiable after the fact.

## Helps prevent

- Silent modification of action records after execution.
- Claims that an agent performed an action without a matching receipt.
- Loss of policy decision context.
- Audit trails that depend only on screenshots or internal logs.
- Publishing private prompts or raw documents on-chain.

## Helps detect

- Receipt body tampering.
- Policy, cost, or tool metadata changes after receipt creation.
- Mismatch between off-chain receipts and anchored Casper proofs.
- Missing or inconsistent evidence hashes.

## Does not prevent

- A malicious agent from acting before it is instrumented.
- A compromised evidence source from creating false raw evidence.
- Loss of off-chain receipt storage if the operator does not back it up.
- Incorrect policy rules being approved by the developer.
- Smart contract risks outside the receipt registry's scope.

## Assumptions

- The receipt creator records honest action data at runtime.
- Private evidence storage remains available to auditors.
- The Casper transaction proof remains accessible through a node, explorer, or indexer.
- Developers use the receipt verifier before trusting a receipt.

