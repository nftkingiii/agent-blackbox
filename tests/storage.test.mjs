import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { ReceiptStore } from "../apps/api/storage.mjs";

test("ReceiptStore persists and updates receipt records", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agent-blackbox-store-"));
  const storePath = join(dir, "receipts.json");

  try {
    const store = new ReceiptStore(storePath);
    const created = await store.put({
      receiptId: "receipt-1",
      receiptHash: "hash-1",
      receipt: { receiptId: "receipt-1", receiptHash: "hash-1" },
      verification: { ok: true }
    });

    assert.equal(created.receiptId, "receipt-1");
    assert.equal((await store.get("receipt-1")).receiptHash, "hash-1");

    const anchored = await store.markAnchor("receipt-1", {
      status: "prepared",
      contractHash: "hash-contract"
    });

    assert.equal(anchored.anchor.status, "prepared");
    assert.equal((await store.list()).length, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
