import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const DEFAULT_STORE_PATH = resolve(process.cwd(), ".data", "receipts.json");

export class ReceiptStore {
  constructor(path = process.env.RECEIPT_STORE_PATH ?? DEFAULT_STORE_PATH) {
    this.path = resolve(path);
    this.ready = this.#ensureStore();
  }

  async list(limit = 25) {
    const data = await this.#read();
    return Object.values(data.receipts)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async get(receiptId) {
    const data = await this.#read();
    return data.receipts[receiptId] ?? null;
  }

  async put(record) {
    const data = await this.#read();
    const existing = data.receipts[record.receiptId];
    const now = new Date().toISOString();
    const next = {
      ...existing,
      ...record,
      createdAt: existing?.createdAt ?? record.createdAt ?? now,
      updatedAt: now
    };

    data.receipts[record.receiptId] = next;
    await this.#write(data);
    return next;
  }

  async markAnchor(receiptId, anchor) {
    const record = await this.get(receiptId);
    if (!record) return null;

    return this.put({
      ...record,
      anchor: {
        ...record.anchor,
        ...anchor,
        updatedAt: new Date().toISOString()
      }
    });
  }

  async #ensureStore() {
    await mkdir(dirname(this.path), { recursive: true });

    try {
      await readFile(this.path, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      await this.#write({ receipts: {} });
    }
  }

  async #read() {
    await this.ready;
    const raw = await readFile(this.path, "utf8");
    return JSON.parse(raw);
  }

  async #write(data) {
    await mkdir(dirname(this.path), { recursive: true });
    const tempPath = `${this.path}.${process.pid}.tmp`;
    await writeFile(tempPath, JSON.stringify(data, null, 2));
    await rename(tempPath, this.path);
  }
}
