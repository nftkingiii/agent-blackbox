import sdk from "casper-js-sdk";

const publicKeyHex = process.argv[2] ?? process.env.CASPER_PUBLIC_KEY;
const rpcUrl = process.env.CASPER_RPC_URL ?? "https://node.testnet.casper.network/rpc";

if (!publicKeyHex) {
  console.error("Usage: node scripts/get-contract-keys.mjs <public-key>");
  process.exit(1);
}

const rpc = new sdk.RpcClient(new sdk.HttpHandler(rpcUrl));
const publicKey = sdk.PublicKey.fromHex(publicKeyHex);
const result = await rpc.getAccountInfo(null, { publicKey });
const account = result.rawJSON?.account ?? result.rawJSON?.Account ?? result.account ?? result.Account;
const namedKeys = account?.named_keys ?? account?.namedKeys ?? [];
const agentKeys = namedKeys.filter((entry) => {
  const name = entry.name ?? entry.Name ?? "";
  return name.includes("agent_blackbox");
});

console.log(JSON.stringify({
  publicKey: publicKeyHex,
  accountHash: account?.account_hash ?? account?.accountHash ?? null,
  agentKeys
}, null, 2));
