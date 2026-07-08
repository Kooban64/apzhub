import type { ManagedTimeEntry } from "@apzhub/law-platform/api";

import {
  createEntityMetadataCache,
  type EntityApiMetadata,
} from "../framework/entity-metadata-cache";

/** Time Entry API DTO shapes aligned with LAW-OpenAPI-v1 (LAW-014-06). */

export interface MoneyAmountV1 {
  readonly amount: string;
  readonly currency: string;
}

export interface TimeEntrySummaryV1 {
  readonly timeEntryId: string;
  readonly timeEntryReference: string;
  readonly matterId: string;
  readonly userId: string;
  readonly entryDate: string;
  readonly durationMinutes: number;
  readonly narrative: string;
  readonly billable: boolean;
  readonly billingStatus: ManagedTimeEntry["billingStatus"];
  readonly amount: MoneyAmountV1;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TimeEntryDetailV1 extends TimeEntrySummaryV1 {
  readonly version: number;
  readonly activityCode: string | null;
  readonly rate: MoneyAmountV1;
  readonly approvedByUserId: string | null;
}

export interface CreateTimeEntryV1Request {
  readonly matterId: string;
  readonly entryDate: string;
  readonly durationMinutes: number;
  readonly narrative: string;
  readonly billable: boolean;
  readonly activityCode?: string;
  readonly rate?: MoneyAmountV1;
}

export interface UpdateTimeEntryV1Request {
  readonly entryDate?: string;
  readonly durationMinutes?: number;
  readonly narrative?: string;
  readonly activityCode?: string | null;
  readonly billable?: boolean;
  readonly rate?: MoneyAmountV1;
}

export interface TimeEntryDeleteResponseV1 {
  readonly timeEntryId: string;
  readonly status: "deleted";
}

const metadataCache = createEntityMetadataCache();

export function resetTimeEntryApiMetadataCache(): void {
  metadataCache.reset();
}

export function getTimeEntryApiMetadata(timeEntryId: string): EntityApiMetadata {
  return metadataCache.get(timeEntryId);
}

export function touchTimeEntryApiMetadata(
  timeEntryId: string,
  created = false,
): EntityApiMetadata {
  return metadataCache.touch(timeEntryId, created);
}

export function toMoneyAmountV1(amount: number, currency = "AUD"): MoneyAmountV1 {
  return {
    amount: amount.toFixed(2),
    currency,
  };
}

export function moneyAmountV1ToRate(
  rate: MoneyAmountV1 | undefined,
): number | undefined {
  if (!rate) {
    return undefined;
  }

  const parsed = Number.parseFloat(rate.amount);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function mapTimeEntryToSummaryV1(
  entry: ManagedTimeEntry,
  metadata: EntityApiMetadata,
): TimeEntrySummaryV1 {
  return {
    timeEntryId: entry.timeEntryId,
    timeEntryReference: entry.timeEntryReference,
    matterId: entry.matterId,
    userId: entry.userId,
    entryDate: entry.entryDate.slice(0, 10),
    durationMinutes: entry.durationMinutes,
    narrative: entry.narrative,
    billable: entry.billable,
    billingStatus: entry.billingStatus,
    amount: toMoneyAmountV1(entry.amount),
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
  };
}

export function mapTimeEntryToDetailV1(
  entry: ManagedTimeEntry,
  metadata: EntityApiMetadata,
): TimeEntryDetailV1 {
  return {
    ...mapTimeEntryToSummaryV1(entry, metadata),
    version: metadata.version,
    activityCode: entry.activityCode ?? null,
    rate: toMoneyAmountV1(entry.rate),
    approvedByUserId: entry.approvedByUserId ?? null,
  };
}

export function booleanToBillableInput(
  value: boolean | undefined,
  defaultValue = true,
): string {
  const resolved = value ?? defaultValue;
  return resolved ? "true" : "false";
}
