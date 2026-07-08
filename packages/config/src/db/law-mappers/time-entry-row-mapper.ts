import type { TimeEntry } from "@apzhub/legal-business-core";

import { lawTimeEntry } from "../legal-schema";

type TimeEntryRow = typeof lawTimeEntry.$inferSelect;

/** Time entry persistence shape including app-layer ManagedTimeEntry fields. */
export interface LawTimeEntryPersistenceModel extends TimeEntry {
  readonly taskId?: string;
  readonly documentId?: string;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly createdAt: string;
}

export function timeEntryToRow(
  entry: LawTimeEntryPersistenceModel,
  tenantId: string,
): typeof lawTimeEntry.$inferInsert {
  return {
    timeEntryId: entry.timeEntryId,
    tenantId,
    matterId: entry.matterId,
    taskId: entry.taskId ?? null,
    documentId: entry.documentId ?? null,
    timeEntryReference: entry.timeEntryReference,
    userId: entry.userId,
    entryDate: new Date(entry.entryDate),
    durationMinutes: entry.durationMinutes,
    narrative: entry.narrative,
    activityCode: entry.activityCode ?? null,
    billable: entry.billable,
    billingStatus: entry.billingStatus,
    rate: entry.rate,
    amount: entry.amount,
    approvedByUserId: entry.approvedByUserId ?? null,
    startTime: entry.startTime ? new Date(entry.startTime) : null,
    endTime: entry.endTime ? new Date(entry.endTime) : null,
    createdAt: new Date(entry.createdAt),
  };
}

export function rowToTimeEntry(row: TimeEntryRow): LawTimeEntryPersistenceModel {
  return {
    timeEntryId: row.timeEntryId,
    timeEntryReference: row.timeEntryReference,
    matterId: row.matterId,
    userId: row.userId,
    entryDate: row.entryDate.toISOString().slice(0, 10),
    durationMinutes: row.durationMinutes,
    narrative: row.narrative,
    activityCode: row.activityCode ?? undefined,
    billable: row.billable,
    billingStatus: row.billingStatus as TimeEntry["billingStatus"],
    rate: row.rate,
    amount: row.amount,
    approvedByUserId: row.approvedByUserId ?? undefined,
    taskId: row.taskId ?? undefined,
    documentId: row.documentId ?? undefined,
    startTime: row.startTime?.toISOString(),
    endTime: row.endTime?.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}
