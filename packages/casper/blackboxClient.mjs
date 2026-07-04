import { createHash } from "node:crypto";
import { toContractRuntimeArgs } from "../core/receipt.mjs";

export function createCasperBlackboxClient(config = {}) {
  return {
    network: config.network ?? "casper-test",
    nodeUrl: config.nodeUrl ?? "https://node.testnet.casper.network/rpc",
    csprCloudUrl: config.csprCloudUrl ?? "https://api.testnet.cspr.cloud",
    contractHash: config.contractHash ?? null,
    apiKey: config.apiKey ?? null,

    prepareSubmitReceipt(receipt) {
      return {
        network: this.network,
        nodeUrl: this.nodeUrl,
        contractHash: this.contractHash,
        entryPoint: "submit_receipt",
        runtimeArgs: toContractRuntimeArgs(receipt)
      };
    },

    async submitReceipt(receipt) {
      const payload = this.prepareSubmitReceipt(receipt);

      if (!this.contractHash) {
        return createMockDeployResult(payload);
      }

      return {
        mode: "prepared",
        message: "Connect Casper SDK, CSPR.click, or Casper CLI signing to send this deploy.",
        payload
      };
    },

    async fetchReceiptEvents() {
      if (!this.apiKey) {
        return {
          mode: "offline",
          events: [],
          message: "Set CSPR_CLOUD_API_KEY to query indexed Casper events."
        };
      }

      return {
        mode: "prepared",
        events: [],
        message: "CSPR.cloud event query adapter is ready for contract-specific endpoint wiring."
      };
    }
  };
}

function createMockDeployResult(payload) {
  const hash = createHash("sha256")
    .update(JSON.stringify(payload.runtimeArgs))
    .digest("hex");

  return {
    mode: "mock-testnet",
    deployHash: `mock-${hash.slice(0, 32)}`,
    payload,
    explorerUrl: null,
    message: "No contract hash configured; generated a deterministic mock deploy hash for local demo."
  };
}
