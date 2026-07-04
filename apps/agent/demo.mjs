import { writeFile } from "node:fs/promises";
import { createReceipt, sha256Hex, verifyReceipt } from "../../packages/core/receipt.mjs";
import { createCasperBlackboxClient } from "../../packages/casper/blackboxClient.mjs";

const demoReceipt = createReceipt({
  agent: {
    id: "agent-risk-ops-01",
    name: "RiskOps Autopilot",
    wallet: "account-hash-demo-agent",
    model: "gpt-5-casper-policy-runner"
  },
  task: {
    user: "account-hash-demo-user",
    intent: "Call a paid risk API only if the total cost is below 2500000000 motes and record the result for audit."
  },
  policy: {
    policyHash: sha256Hex("max_daily_spend=10000000000;allowed_tools=risk-api,cspr-cloud;human_review_above=2500000000"),
    decision: "approved",
    rules: ["allowed_tool", "under_single_call_limit", "under_daily_budget"],
    riskScore: 18,
    explanation: "The request uses an approved endpoint and stays below the configured single-call threshold."
  },
  toolCall: {
    tool: "risk-api",
    target: "https://api.example.test/risk-score",
    method: "POST",
    request: {
      asset: "CSPR",
      window: "24h",
      checks: ["liquidity", "volatility", "deploy-anomalies"]
    },
    response: {
      score: 31,
      level: "moderate",
      signals: ["normal deploy rate", "no abnormal transfer burst"]
    },
    costMotes: 1200000000,
    status: "ok"
  },
  chain: {
    network: "casper-test",
    contractPackageHash: "pending-testnet-deploy",
    deployHash: "pending",
    blockHash: "pending"
  },
  evidence: [
    {
      label: "policy snapshot",
      uri: "ipfs://demo/policy-snapshot.json"
    },
    {
      label: "tool response",
      uri: "ipfs://demo/risk-response.json"
    }
  ]
});

const client = createCasperBlackboxClient({
  contractHash: process.env.AGENT_BLACKBOX_CONTRACT_HASH
});

const deployResult = await client.submitReceipt(demoReceipt);
const verification = verifyReceipt(demoReceipt);
const demoOutput = {
  receipt: demoReceipt,
  deployResult,
  verification
};

await writeFile("apps/web/public/demo-receipt.json", JSON.stringify(demoOutput, null, 2));

console.log("Agent Blackbox demo receipt generated.");
console.log(`Receipt ID: ${demoReceipt.receiptId}`);
console.log(`Receipt hash: ${demoReceipt.receiptHash}`);
console.log(`Deploy mode: ${deployResult.mode}`);
console.log(`Integrity check: ${verification.ok ? "passed" : "failed"}`);
