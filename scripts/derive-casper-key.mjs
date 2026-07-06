import { mnemonicToSeedSync } from "bip39";
import { HDKey } from "@scure/bip32";
import { getPublicKey } from "@noble/secp256k1";

const expectedPublicKey = process.argv[2]?.toLowerCase();
if (!expectedPublicKey) {
  console.error("Usage: node scripts/derive-casper-key.mjs <expected-public-key>");
  process.exit(1);
}

let mnemonic = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) mnemonic += chunk;
mnemonic = mnemonic.trim().replace(/\s+/g, " ");

const candidatePaths = [
  "m/44'/506'/0'/0/0",
  "m/44'/506'/0'/0",
  "m/44'/506'/0'",
  "m/44'/506'/0'/0/1",
  "m/44'/506'/1'/0/0",
  "m/44'/506'/1'/0",
  "m/44'/506'/0'/1/0",
  "m/44'/506'/0'/1",
];

const seed = mnemonicToSeedSync(mnemonic);
const root = HDKey.fromMasterSeed(seed);
const matches = [];

for (const path of candidatePaths) {
  const child = root.derive(path);
  if (!child.privateKey) continue;
  const compressedPublicKey = Buffer.from(getPublicKey(child.privateKey, true));
  const casperPublicKey = "02" + compressedPublicKey.toString("hex");
  if (casperPublicKey.toLowerCase() === expectedPublicKey) {
    matches.push({ path, casperPublicKey });
  }
}

if (matches.length === 0) {
  console.log(JSON.stringify({ ok: false, checked: candidatePaths }, null, 2));
  process.exit(2);
}

console.log(JSON.stringify({
  ok: true,
  path: matches[0].path,
  publicKey: matches[0].casperPublicKey,
  matched: true
}, null, 2));
