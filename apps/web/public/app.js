const TESTNET_PROOF = {
  contractHash: "hash-11c55f283a39e492201bf3f4f7e9b76436599b364c0a0fbc385d46fb3d1e5fb8",
  contractPackageHash: "hash-a738b2bdb89a6b65c71c2ae11f5b688248f38abbf463b7d487ddc2c0981a7abb",
  installTransaction: "527101b5f588320530f091fdc390c852b9784df486722fae97fa518906892d0c",
  receiptTransaction: "b59446b16e1b17baa4081ee9152b7f4ac42c48fb6ddb3d9e1b0f6e22a7dd36ad",
  receiptHash: "235470a706053333103e6c12741c4cfa8e147ab1d0230a1343e075c55cfac359",
  receiptId: "28f49029-999a-496c-8e64-ce94df16b7bf"
};

let demoData = null;
let apiConfig = null;

async function loadDemo() {
  const response = await fetch("/demo-receipt.json");
  if (!response.ok) {
    throw new Error("Run `npm run demo` to generate the demo receipt.");
  }

  return response.json();
}

async function loadApiConfig() {
  const response = await fetch("/api/config");
  if (!response.ok) {
    throw new Error("API config is unavailable.");
  }

  return response.json();
}

async function persistReceipt(receipt) {
  const response = await fetch("/api/receipts", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(receipt)
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error ?? "Receipt API rejected the record.");
  }

  return body.record;
}

function text(id, value) {
  document.getElementById(id).textContent = value;
}

function setHref(id, value) {
  const element = document.getElementById(id);
  element.href = value;
  element.setAttribute("aria-disabled", "false");
}

function formatMotes(value) {
  const cspr = Number(value) / 1_000_000_000;
  return `${cspr.toFixed(2)} CSPR`;
}

function shortHash(value, start = 10, end = 8) {
  const input = String(value ?? "");
  if (input.length <= start + end + 3) return input;
  return `${input.slice(0, start)}...${input.slice(-end)}`;
}

function explorerTransaction(hash) {
  return `https://testnet.cspr.live/transaction/${hash}`;
}

function explorerContract(hash) {
  return `https://testnet.cspr.live/contract/${hash.replace(/^hash-/, "")}`;
}

function canonicalJson(value) {
  return JSON.stringify(sortForCanonicalJson(value));
}

function sortForCanonicalJson(value) {
  if (Array.isArray(value)) {
    return value.map(sortForCanonicalJson);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortForCanonicalJson(value[key]);
        return acc;
      }, {});
  }

  return value;
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashObject(value) {
  return sha256Hex(canonicalJson(value));
}

async function verifyReceiptObject(receipt) {
  const { receiptHash, ...body } = receipt;
  const actual = await hashObject(body);
  return {
    ok: receiptHash === actual,
    expected: receiptHash ?? "-",
    actual
  };
}

function renderTimeline(receipt, deployResult) {
  const payload = deployResult.payload ?? {};
  const items = [
    {
      label: "Intent captured",
      body: receipt.task.intent,
      time: new Date(receipt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
      body: `${payload.entryPoint ?? "submit_receipt"} on ${payload.network ?? "casper-test"}; transaction ${shortHash(TESTNET_PROOF.receiptTransaction, 12, 10)}.`,
      time: "Casper"
    }
  ];

  const list = document.getElementById("timeline");
  list.innerHTML = items
    .map(
      (item, index) => `
        <li>
          <span class="step-index">${String(index + 1).padStart(2, "0")}</span>
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
  demoData = data;
  const { receipt, deployResult, verification } = data;
  const payload = deployResult.payload ?? {};
  const integrity = document.getElementById("integrityState");

  text("integrityState", verification.ok ? "Verified" : "Mismatch");
  integrity.classList.toggle("is-risk", !verification.ok);
  text("receiptHash", receipt.receiptHash);
  text("policyDecision", receipt.policy.decision);
  text("riskScore", `${receipt.policy.riskScore}/100`);
  text("agentName", receipt.agent.name);
  text("toolCost", formatMotes(receipt.toolCall.costMotes));
  text("deployMode", deployResult.mode);
  text("apiStatus", "Syncing");
  text("toolName", receipt.toolCall.tool);
  text("receiptId", receipt.receiptId);
  text("agentWallet", receipt.agent.wallet);
  text("intentHash", receipt.task.intentHash);
  text("policyHash", receipt.policy.policyHash);
  text("contractHash", payload.contractHash ?? TESTNET_PROOF.contractHash);

  setHref("contractLink", explorerContract(payload.contractHash ?? TESTNET_PROOF.contractHash));
  setHref("receiptTxLink", explorerTransaction(TESTNET_PROOF.receiptTransaction));
  setHref("contractExplorerLink", explorerContract(payload.contractHash ?? TESTNET_PROOF.contractHash));
  setHref("installTxExplorerLink", explorerTransaction(TESTNET_PROOF.installTransaction));
  setHref("receiptTxExplorerLink", explorerTransaction(TESTNET_PROOF.receiptTransaction));
  text("contractExplorerLabel", shortHash(payload.contractHash ?? TESTNET_PROOF.contractHash, 12, 10));
  text("installTxExplorerLabel", shortHash(TESTNET_PROOF.installTransaction, 12, 10));
  text("receiptTxExplorerLabel", shortHash(TESTNET_PROOF.receiptTransaction, 12, 10));

  renderTimeline(receipt, deployResult);
  text("payloadJson", JSON.stringify({
    ...payload,
    proof: TESTNET_PROOF
  }, null, 2));

  loadReceiptIntoVerifier(receipt);
  syncReceiptRecord(receipt).catch((error) => {
    text("apiStatus", "Offline");
    renderApiMessage("API sync unavailable", error.message, false);
  });
}

async function syncReceiptRecord(receipt) {
  const record = await persistReceipt(receipt);
  text("apiStatus", "Persisted");
  renderApiMessage(
    "Receipt persisted",
    `Stored by the product API as ${shortHash(record.receiptId, 10, 6)} with ${record.anchor.status} Casper proof state.`,
    true
  );
}

function renderApiMessage(title, body, ok) {
  const panel = document.getElementById("apiMessage");
  panel.classList.toggle("is-risk", ok === false);
  panel.classList.toggle("is-ok", ok === true);
  text("apiMessageTitle", title);
  text("apiMessageBody", body);
}

function loadReceiptIntoVerifier(receipt) {
  document.getElementById("receiptInput").value = JSON.stringify(receipt, null, 2);
  renderVerifierMessage({
    state: "Ready",
    ok: true,
    summary: "Demo receipt loaded. Click Verify receipt to recompute the canonical hash.",
    expected: receipt.receiptHash,
    actual: "-",
    anchor: "Not checked yet"
  });
}

function renderVerifierMessage(result) {
  const state = document.getElementById("verifierState");
  state.textContent = result.state;
  state.classList.toggle("is-risk", result.ok === false);
  state.classList.toggle("is-ok", result.ok === true);
  text("verifierSummary", result.summary);
  text("verifierExpected", result.expected ?? "-");
  text("verifierActual", result.actual ?? "-");
  text("verifierAnchor", result.anchor ?? "-");
}

function parseReceiptInput() {
  const parsed = JSON.parse(document.getElementById("receiptInput").value);
  return parsed.receipt ?? parsed;
}

async function verifyReceiptFromInput() {
  try {
    const receipt = parseReceiptInput();
    const verification = await verifyReceiptObject(receipt);
    const anchorMatchesDemo =
      receipt.receiptId === TESTNET_PROOF.receiptId &&
      verification.actual === TESTNET_PROOF.receiptHash;
    const localOnly = verification.ok && !anchorMatchesDemo;

    renderVerifierMessage({
      state: verification.ok ? "Valid" : "Tampered",
      ok: verification.ok,
      summary: verification.ok
        ? localOnly
          ? "The receipt is internally consistent. It does not match the bundled Casper Testnet sample proof."
          : "The receipt hash matches the recomputed canonical hash and the bundled Casper Testnet sample proof."
        : "The receipt body no longer matches its recorded receiptHash.",
      expected: verification.expected,
      actual: verification.actual,
      anchor: anchorMatchesDemo
        ? `Matches ${shortHash(TESTNET_PROOF.receiptTransaction, 12, 10)}`
        : "No matching bundled Testnet proof"
    });
  } catch (error) {
    renderVerifierMessage({
      state: "Invalid JSON",
      ok: false,
      summary: error.message,
      expected: "-",
      actual: "-",
      anchor: "-"
    });
  }
}

function tamperReceiptInput() {
  try {
    const receipt = parseReceiptInput();
    receipt.policy = receipt.policy ?? {};
    receipt.policy.riskScore = Number(receipt.policy.riskScore ?? 0) + 41;
    receipt.policy.explanation = "Tampered locally after the receipt hash was created.";
    document.getElementById("receiptInput").value = JSON.stringify(receipt, null, 2);
    renderVerifierMessage({
      state: "Tamper staged",
      ok: false,
      summary: "A policy field was changed without updating receiptHash. Run verification to see the mismatch.",
      expected: receipt.receiptHash,
      actual: "-",
      anchor: "Pending verification"
    });
  } catch (error) {
    renderVerifierMessage({
      state: "Invalid JSON",
      ok: false,
      summary: error.message,
      expected: "-",
      actual: "-",
      anchor: "-"
    });
  }
}

document.getElementById("copyPayload").addEventListener("click", async () => {
  const payload = document.getElementById("payloadJson").textContent;
  await navigator.clipboard.writeText(payload);
  document.getElementById("copyPayload").textContent = "Copied";
  window.setTimeout(() => {
    document.getElementById("copyPayload").textContent = "Copy JSON";
  }, 1200);
});

document.getElementById("verifyReceipt").addEventListener("click", verifyReceiptFromInput);

document.getElementById("tamperReceipt").addEventListener("click", tamperReceiptInput);

document.getElementById("loadDemoReceipt").addEventListener("click", () => {
  if (demoData?.receipt) {
    loadReceiptIntoVerifier(demoData.receipt);
  }
});

document.getElementById("receiptFile").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  document.getElementById("receiptInput").value = await file.text();
  await verifyReceiptFromInput();
});

Promise.allSettled([loadApiConfig(), loadDemo()])
  .then(([configResult, demoResult]) => {
    if (configResult.status === "fulfilled") {
      apiConfig = configResult.value;
      Object.assign(TESTNET_PROOF, {
        contractHash: apiConfig.contractHash,
        contractPackageHash: apiConfig.contractPackageHash,
        installTransaction: apiConfig.installTransaction,
        receiptTransaction: apiConfig.sampleReceiptTransaction,
        receiptHash: apiConfig.sampleReceiptHash,
        receiptId: apiConfig.sampleReceiptId
      });
      renderApiMessage("API connected", "The dashboard is reading Casper proof config from the backend.", true);
    } else {
      renderApiMessage("API offline", configResult.reason.message, false);
    }

    if (demoResult.status === "rejected") {
      throw demoResult.reason;
    }

    render(demoResult.value);
  })
  .catch((error) => {
    const integrity = document.getElementById("integrityState");
    text("integrityState", "Missing demo");
    integrity.classList.add("is-risk");
    text("receiptHash", error.message);
    text("apiStatus", "Unavailable");
    text("payloadJson", error.stack ?? error.message);
  });
