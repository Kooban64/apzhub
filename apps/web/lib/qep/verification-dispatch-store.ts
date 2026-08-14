/**
 * Flagship F10/F11 — verification dispatch ledger (advisory ops view).
 * File-backed outside tests. Runners remain authoritative for tool results.
 */

import {
  isQepLedgerPersistEnabled,
  readJsonLedgerSnapshot,
  resolveQepDataRoot,
  writeJsonLedgerSnapshot,
} from "@/lib/qep/qep-ledger-fs";

export type VerificationDispatchStatus = "queued" | "dispatched" | "failed" | "skipped";

export type VerificationDispatchRecord = {
  readonly dispatchId: string;
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly repositoryId?: string;
  readonly repositoryFullName?: string;
  readonly domains: readonly string[];
  readonly channel: "github_actions" | "webhook" | "none";
  readonly status: VerificationDispatchStatus;
  readonly correlationId: string;
  readonly createdAt: string;
  readonly externalRef?: string;
  readonly detail?: string;
  /** e.g. f10_verification_dispatch | f11_security_dispatch */
  readonly assistOrigin: string;
  readonly pack?: "quality" | "security";
};

const records: VerificationDispatchRecord[] = [];
const MAX = 500;
let hydrated = false;

function dataDir(): string {
  return resolveQepDataRoot("qep-verification-dispatches");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  const snap = readJsonLedgerSnapshot<VerificationDispatchRecord[]>(
    dataDir(),
    "ledger.json",
  );
  if (Array.isArray(snap)) {
    records.push(...snap.slice(0, MAX));
  }
}

function persistAll(): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerSnapshot(dataDir(), "ledger.json", records.slice(0, MAX));
}

export function resetVerificationDispatchStoreForTests(): void {
  records.splice(0, records.length);
  hydrated = false;
}

export function listVerificationDispatches(filter?: {
  readonly tenantId?: string;
  readonly changeEventId?: string;
  readonly limit?: number;
}): readonly VerificationDispatchRecord[] {
  hydrate();
  const limit = filter?.limit ?? 50;
  return records
    .filter((row) => (filter?.tenantId ? row.tenantId === filter.tenantId : true))
    .filter((row) =>
      filter?.changeEventId ? row.changeEventId === filter.changeEventId : true,
    )
    .slice(0, Math.max(0, limit));
}

export function hasDispatchForChange(
  changeEventId: string,
  assistOrigin?: string,
): boolean {
  hydrate();
  return records.some(
    (row) =>
      row.changeEventId === changeEventId &&
      (row.status === "dispatched" || row.status === "queued") &&
      (assistOrigin ? row.assistOrigin === assistOrigin : true),
  );
}

export function appendVerificationDispatch(
  record: VerificationDispatchRecord,
): VerificationDispatchRecord {
  hydrate();
  records.unshift(record);
  if (records.length > MAX) {
    records.splice(MAX);
  }
  persistAll();
  return record;
}
