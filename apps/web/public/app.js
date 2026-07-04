async function loadDemo() {
  const response = await fetch("/demo-receipt.json");
  if (!response.ok) {
    throw new Error("Run `npm run demo` to generate the demo receipt.");
  }

  return response.json();
}

function text(id, value) {
  document.getElementById(id).textContent = value;
}

function formatMotes(value) {
  const cspr = Number(value) / 1_000_000_000;
  return `${cspr.toFixed(2)} CSPR`;
}

function renderTimeline(receipt, deployResult) {
  const items = [
    {
      label: "Intent captured",
      body: receipt.task.intent,
      time: receipt.timestamp
    },
    {
      label: "Policy checked",
      body: `${receipt.policy.decision} with risk score ${receipt.policy.riskScore}. ${receipt.policy.explanation}`,
      time: "policy"
    },
    {
      label: "Tool called",
      body: `${receipt.toolCall.method} ${receipt.toolCall.target}; request and response hashes recorded.`,
      time: "tool"
    },
    {
      label: "Receipt anchored",
      body: `${deployResult.mode}: ${deployResult.deployHash ?? deployResult.message}`,
      time: "Casper"
    }
  ];

  const list = document.getElementById("timeline");
  list.innerHTML = items
    .map(
      (item) => `
        <li>
          <time>${escapeHtml(item.time)}</time>
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <p>${escapeHtml(item.body)}</p>
          </div>
        </li>
      `
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render(data) {
  const { receipt, deployResult, verification } = data;

  text("integrityState", verification.ok ? "Verified" : "Mismatch");
  text("receiptHash", receipt.receiptHash);
  text("policyDecision", receipt.policy.decision);
  text("riskScore", `${receipt.policy.riskScore}/100`);
  text("toolCost", formatMotes(receipt.toolCall.costMotes));
  text("deployMode", deployResult.mode);
  text("receiptId", receipt.receiptId);
  text("agentName", receipt.agent.name);
  text("agentWallet", receipt.agent.wallet);
  text("intentHash", receipt.task.intentHash);
  text("policyHash", receipt.policy.policyHash);
  text("toolName", receipt.toolCall.tool);

  renderTimeline(receipt, deployResult);
  text("payloadJson", JSON.stringify(deployResult.payload, null, 2));
}

document.getElementById("copyPayload").addEventListener("click", async () => {
  const payload = document.getElementById("payloadJson").textContent;
  await navigator.clipboard.writeText(payload);
  document.getElementById("copyPayload").textContent = "Copied";
  window.setTimeout(() => {
    document.getElementById("copyPayload").textContent = "Copy JSON";
  }, 1200);
});

loadDemo()
  .then(render)
  .catch((error) => {
    text("integrityState", "Missing demo");
    text("receiptHash", error.message);
    text("payloadJson", error.stack ?? error.message);
  });
