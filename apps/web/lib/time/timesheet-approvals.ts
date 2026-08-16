/**
 * Stream 4 — APZ manager timesheet approval overlay (not engine SoR).
 * Applies to stopped timesheets; Kimai remains authoritative for entries.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type TimesheetApprovalState = "pending" | "approved" | "returned";

export type TimesheetApprovalRecord = {
  readonly timesheetId: string;
  readonly organisationId: string;
  readonly state: TimesheetApprovalState;
  readonly reason?: string;
  readonly decidedBy?: string;
  readonly updatedAt: string;
  readonly createdAt: string;
};

type Store = { records: TimesheetApprovalRecord[] };

let store: Store = { records: [] };
let hydrated = false;

function persistEnabled(): boolean {
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") {
    return false;
  }
  return true;
}

function dataDir(): string {
  return (
    process.env.APZHUB_TIME_APPROVAL_DATA_DIR?.trim() ||
    join(process.cwd(), ".data", "time-approvals")
  );
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = readFileSync(join(dataDir(), "ledger.json"), "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (Array.isArray(parsed.records)) store = { records: parsed.records };
  } catch {
    store = { records: [] };
  }
}

function persistAll(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(join(dataDir(), "ledger.json"), JSON.stringify(store, null, 2), "utf8");
}

export function resetTimesheetApprovalsForTests(): void {
  store = { records: [] };
  hydrated = false;
}

export function getTimesheetApproval(
  timesheetId: string,
): TimesheetApprovalRecord | undefined {
  hydrate();
  return store.records.find((row) => row.timesheetId === timesheetId);
}

export function listTimesheetApprovals(filter: {
  readonly organisationId: string;
  readonly state?: TimesheetApprovalState;
}): readonly TimesheetApprovalRecord[] {
  hydrate();
  return store.records.filter(
    (row) =>
      row.organisationId === filter.organisationId &&
      (filter.state ? row.state === filter.state : true),
  );
}

export function upsertTimesheetApproval(input: {
  readonly timesheetId: string;
  readonly organisationId: string;
  readonly state: TimesheetApprovalState;
  readonly reason?: string;
  readonly decidedBy?: string;
}): TimesheetApprovalRecord {
  hydrate();
  const now = new Date().toISOString();
  const existing = store.records.findIndex(
    (row) => row.timesheetId === input.timesheetId,
  );
  const next: TimesheetApprovalRecord = {
    timesheetId: input.timesheetId,
    organisationId: input.organisationId,
    state: input.state,
    reason: input.reason?.trim() || undefined,
    decidedBy: input.decidedBy,
    createdAt: existing >= 0 ? store.records[existing]!.createdAt : now,
    updatedAt: now,
  };
  if (existing >= 0) store.records[existing] = next;
  else store.records.unshift(next);
  persistAll();
  return next;
}

export function submitTimesheetForApproval(input: {
  readonly timesheetId: string;
  readonly organisationId: string;
  readonly decidedBy?: string;
}): TimesheetApprovalRecord {
  return upsertTimesheetApproval({
    ...input,
    state: "pending",
    reason: undefined,
  });
}

export function approveTimesheet(input: {
  readonly timesheetId: string;
  readonly organisationId: string;
  readonly decidedBy: string;
  readonly reason?: string;
}): TimesheetApprovalRecord {
  return upsertTimesheetApproval({
    ...input,
    state: "approved",
  });
}

export function returnTimesheet(input: {
  readonly timesheetId: string;
  readonly organisationId: string;
  readonly decidedBy: string;
  readonly reason: string;
}): TimesheetApprovalRecord {
  const reason = input.reason.trim();
  if (!reason) throw new Error("time.approval.reason_required");
  return upsertTimesheetApproval({
    ...input,
    state: "returned",
    reason,
  });
}
