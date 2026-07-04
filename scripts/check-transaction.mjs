import sdk from "casper-js-sdk";

const hash = process.argv[2];
const rpcUrl = process.env.CASPER_RPC_URL ?? "https://node.testnet.casper.network/rpc";

if (!hash) {
  console.error("Usage: node scripts/check-transaction.mjs <transaction-hash>");
  process.exit(1);
}

const rpc = new sdk.RpcClient(new sdk.HttpHandler(rpcUrl));
const result = await rpc.getTransactionByTransactionHash(hash);
const raw = result.rawJSON ?? result;
const txHash = raw.transaction_hash ?? raw.transaction?.hash ?? raw.Transaction?.hash ?? hash;
const executionInfo = raw.execution_info ?? raw.executionInfo ?? raw.execution_result ?? raw.ExecutionResult;
const executionResult = executionInfo?.execution_result ?? executionInfo?.ExecutionResult ?? executionInfo;

console.log(JSON.stringify({
  apiVersion: raw.api_version ?? raw.apiVersion ?? null,
  transactionHash: txHash,
  found: Boolean(raw.transaction ?? raw.Transaction ?? raw),
  hasExecutionInfo: Boolean(executionInfo),
  executionKeys: executionInfo ? Object.keys(executionInfo) : [],
  executionResultKeys: executionResult ? Object.keys(executionResult) : [],
  errorMessage: executionResult?.Failure?.error_message
    ?? executionResult?.failure?.error_message
    ?? executionResult?.error_message
    ?? null,
  cost: executionResult?.Success?.cost
    ?? executionResult?.success?.cost
    ?? executionResult?.cost
    ?? null
}, null, 2));
