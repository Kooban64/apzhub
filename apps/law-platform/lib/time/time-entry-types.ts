/** UI form model for Time Recording screens — LAW-006-01. */
import type { TimeEntry } from "@apzhub/legal-business-core";

export type {
  BillingStatus,
  TimeEntry,
  TimeSearchCriteria,
} from "@apzhub/legal-business-core";
export { BILLING_STATUSES } from "@apzhub/legal-business-core";
export { formatDurationMinutes, formatDecimalHours } from "@apzhub/legal-business-core";

/** App-layer time entry with optional task/document links and timestamps (LAW-006-01). */
export interface ManagedTimeEntry extends TimeEntry {
  readonly taskId?: string;
  readonly documentId?: string;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly createdAt: string;
}

export type TimeEntryDateFilter =
  "all" | "today" | "this_week" | "this_month" | "last_30_days";

export type TimeEntryBillableFilter = "all" | "billable" | "non_billable";

export interface TimeEntryFormValues {
  readonly timeEntryReference: string;
  readonly matterId: string;
  readonly taskId: string;
  readonly documentId: string;
  readonly userId: string;
  readonly entryDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly durationMinutes: string;
  readonly billable: string;
  readonly narrative: string;
}

export interface TimeEntryListCriteria {
  readonly query?: string;
  readonly entryDateFilter?: TimeEntryDateFilter;
  readonly matterId?: string;
  readonly taskId?: string;
  readonly userId?: string;
  readonly billableFilter?: TimeEntryBillableFilter;
}

export function timeEntryToFormValues(entry: ManagedTimeEntry): TimeEntryFormValues {
  return {
    timeEntryReference: entry.timeEntryReference,
    matterId: entry.matterId,
    taskId: entry.taskId ?? "",
    documentId: entry.documentId ?? "",
    userId: entry.userId,
    entryDate: entry.entryDate.slice(0, 10),
    startTime: entry.startTime ? entry.startTime.slice(0, 16) : "",
    endTime: entry.endTime ? entry.endTime.slice(0, 16) : "",
    durationMinutes: String(entry.durationMinutes),
    billable: entry.billable ? "true" : "false",
    narrative: entry.narrative,
  };
}

export function createEmptyTimeEntryFormValues(matterId = ""): TimeEntryFormValues {
  const today = new Date().toISOString().slice(0, 10);

  return {
    timeEntryReference: "",
    matterId,
    taskId: "",
    documentId: "",
    userId: "",
    entryDate: today,
    startTime: "",
    endTime: "",
    durationMinutes: "",
    billable: "true",
    narrative: "",
  };
}

export function parseDurationMinutesInput(value: string): number {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function computeDurationFromTimes(startTime: string, endTime: string): number {
  if (!startTime.trim() || !endTime.trim()) {
    return 0;
  }

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return Math.round((end - start) / 60_000);
}

export function resolveFormDurationMinutes(values: TimeEntryFormValues): number {
  const fromTimes = computeDurationFromTimes(values.startTime, values.endTime);
  if (fromTimes > 0) {
    return fromTimes;
  }

  return parseDurationMinutesInput(values.durationMinutes);
}
