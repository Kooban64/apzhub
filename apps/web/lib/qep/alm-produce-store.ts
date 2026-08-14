/**
 * Flagship F16 — ALM produce ledger (Projects task / Support ticket intents).
 * File-backed outside tests. Soft-fail friendly.
 */

import {
  isQepLedgerPersistEnabled,
  readJsonLedgerSnapshot,
  resolveQepDataRoot,
  writeJsonLedgerSnapshot,
} from "@/lib/qep/qep-ledger-fs";

export type AlmProduceChannel = "projects" | "support";

export type AlmProduceStatus = "recorded" | "created" | "failed" | "skipped";

export type AlmProduceRecord = {
  readonly produceId: string;
  readonly tenantId: string;
  readonly defectId: string;
  readonly changeEventId?: string;
  readonly channel: AlmProduceChannel;
  readonly status: AlmProduceStatus;
  readonly mode: "record_only" | "live";
  readonly correlationId: string;
  readonly createdAt: string;
  readonly externalRef?: string;
  readonly platformEntityId?: string;
  readonly detail?: string;
  readonly title: string;
};

const records: AlmProduceRecord[] = [];
const MAX = 500;
let hydrated = false;

function dataDir(): string {
  return resolveQepDataRoot("qep-alm-produce");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  const snap = readJsonLedgerSnapshot<AlmProduceRecord[]>(dataDir(), "ledger.json");
  if (Array.isArray(snap)) {
    records.push(...snap.slice(0, MAX));
  }
}

function persistAll(): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerSnapshot(dataDir(), "ledger.json", records.slice(0, MAX));
}

export function resetAlmProduceStoreForTests(): void {
  records.splice(0, records.length);
  hydrated = false;
}

export function listAlmProduceRecords(filter?: {
  readonly tenantId?: string;
  readonly defectId?: string;
  readonly changeEventId?: string;
  readonly limit?: number;
}): readonly AlmProduceRecord[] {
  hydrate();
  const limit = filter?.limit ?? 50;
  return records
    .filter((row) => (filter?.tenantId ? row.tenantId === filter.tenantId : true))
    .filter((row) => (filter?.defectId ? row.defectId === filter.defectId : true))
    .filter((row) =>
      filter?.changeEventId ? row.changeEventId === filter.changeEventId : true,
    )
    .slice(0, Math.max(0, limit));
}

export function appendAlmProduceRecord(record: AlmProduceRecord): AlmProduceRecord {
  hydrate();
  records.unshift(record);
  if (records.length > MAX) {
    records.splice(MAX);
  }
  persistAll();
  return record;
}
