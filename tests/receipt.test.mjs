import assert from "node:assert/strict";
import test from "node:test";
import { canonicalJson, createReceipt, sha256Hex, verifyReceipt } from "../packages/core/receipt.mjs";

const input = {
  agent: {
    id: "agent-1",
    name: "Test Agent",
    wallet: "account-hash-test",
    model: "test-model"
  },
  task: {
    user: "account-hash-user",
    intent: "Spend below the policy cap and record the result."
  },
  policy: {
    policyHash: sha256Hex("policy"),
    decision: "approved",
    rules: ["under_cap"],
    riskScore: 9,
    explanation: "Within cap."
  },
  toolCall: {
    tool: "mock-api",
    target: "https://example.test",
    method: "POST",
    request: { b: 2, a: 1 },
    response: { ok: true },
    costMotes: 10,
    status: "ok"
  },
  chain: {
    network: "casper-test",
    contractPackageHash: "hash",
    deployHash: "deploy",
    blockHash: "block"
  },
  evidence: [{ label: "fixture", uri: "memory://fixture" }]
};

test("canonicalJson sorts object keys recursively", () => {
  assert.equal(canonicalJson({ z: 1, a: { y: 2, b: 3 } }), '{"a":{"b":3,"y":2},"z":1}');
});

test("createReceipt generates a verifiable receipt hash", () => {
  const receipt = createReceipt(input);
  assert.equal(verifyReceipt(receipt).ok, true);
  assert.equal(receipt.task.intentHash, sha256Hex(input.task.intent));
});

test("verifyReceipt detects tampering", () => {
  const receipt = createReceipt(input);
  const tampered = {
    ...receipt,
    policy: {
      ...receipt.policy,
      decision: "denied"
    }
  };
  assert.equal(verifyReceipt(tampered).ok, false);
});
