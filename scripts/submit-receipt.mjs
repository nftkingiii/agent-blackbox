import { readFile } from "node:fs/promises";
import { mnemonicToSeedSync } from "bip39";
import HDKey from "hdkey";
import sdk from "casper-js-sdk";

const {
  Args,
  CLValue,
  ContractCallBuilder,
  HttpHandler,
  KeyAlgorithm,
  PrivateKey,
  RpcClient
} = sdk;

const cliArgs = new Set(process.argv.slice(2));
const dryRun = cliArgs.has("--dry-run");
const expectedPublicKey = process.env.CASPER_PUBLIC_KEY?.toLowerCase();
const contractHash = (process.env.AGENT_BLACKBOX_CONTRACT_HASH ?? "").replace(/^hash-/, "");
const rpcUrl = process.env.CASPER_RPC_URL ?? "https://node.testnet.casper.network/rpc";
const chainName = process.env.CASPER_CHAIN_NAME ?? "casper-test";
const paymentAmount = process.env.CASPER_CALL_PAYMENT ?? "5000000000";
const receiptPath = process.env.AGENT_BLACKBOX_RECEIPT ?? "apps/web/public/demo-receipt.json";

if (!expectedPublicKey) {
  console.error("Set CASPER_PUBLIC_KEY to the burner wallet public key before running.");
  process.exit(1);
}

if (!contractHash) {
  console.error("Set AGENT_BLACKBOX_CONTRACT_HASH to the deployed contract hash before running.");
  process.exit(1);
}

const privateKey = await privateKeyFromStdin(expectedPublicKey);
const demo = JSON.parse(await readFile(receiptPath, "utf8"));
const receipt = demo.receipt ?? demo;
const runtimeArgs = Args.fromMap({
  receipt_id: CLValue.newCLString(receipt.receiptId),
  receipt_hash: CLValue.newCLString(receipt.receiptHash),
  agent_id: CLValue.newCLString(receipt.agent.id),
  policy_hash: CLValue.newCLString(receipt.policy.policyHash),
  cost_motes: CLValue.newCLString(String(receipt.toolCall.costMotes)),
  tool: CLValue.newCLString(receipt.toolCall.tool),
  decision: CLValue.newCLString(receipt.policy.decision),
  timestamp: CLValue.newCLString(receipt.timestamp)
});

const tx = new ContractCallBuilder()
  .from(privateKey.publicKey)
  .chainName(chainName)
  .payment(Number(paymentAmount))
  .byHash(contractHash)
  .entryPoint("submit_receipt")
  .runtimeArgs(runtimeArgs)
  .build();

tx.sign(privateKey);

if (dryRun) {
  console.log(JSON.stringify({
    ok: true,
    mode: "dry-run",
    publicKey: privateKey.publicKey.toHex(),
    contractHash,
    chainName,
    rpcUrl,
    paymentAmount,
    receiptId: receipt.receiptId,
    receiptHash: receipt.receiptHash,
    transactionHash: tx.hash?.toHex?.() ?? null
  }, null, 2));
  process.exit(0);
}

const rpc = new RpcClient(new HttpHandler(rpcUrl));
const result = await rpc.putTransaction(tx);

console.log(JSON.stringify({
  ok: true,
  mode: "sent",
  publicKey: privateKey.publicKey.toHex(),
  receiptId: receipt.receiptId,
  receiptHash: receipt.receiptHash,
  transactionHash: tx.hash?.toHex?.() ?? result.transactionHash?.toHex?.() ?? null,
  raw: result.rawJSON ?? result
}, null, 2));

async function privateKeyFromStdin(expected) {
  let mnemonic = "";
  process.stdin.setEncoding("utf8");

  for await (const chunk of process.stdin) mnemonic += chunk;

  mnemonic = mnemonic.trim().replace(/\s+/g, " ");
  const seed = mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive("m/44'/506'/0'/0/0");
  const privateKeyHex = child.privateKey.toString("hex");
  const privateKey = PrivateKey.fromHex(privateKeyHex, KeyAlgorithm.SECP256K1);

  if (privateKey.publicKey.toHex().toLowerCase() !== expected) {
    throw new Error("Derived public key did not match CASPER_PUBLIC_KEY. Refusing to sign.");
  }

  return privateKey;
}
