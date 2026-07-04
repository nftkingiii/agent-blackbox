import { readFile } from "node:fs/promises";
import { createCasperBlackboxClient } from "../packages/casper/blackboxClient.mjs";

const receiptPath = process.argv[2] ?? "apps/web/public/demo-receipt.json";
const body = JSON.parse(await readFile(receiptPath, "utf8"));
const client = createCasperBlackboxClient({
  contractHash: process.env.AGENT_BLACKBOX_CONTRACT_HASH
});

console.log(JSON.stringify(client.prepareSubmitReceipt(body.receipt), null, 2));
