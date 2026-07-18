import type {
  SupportRequestPriority,
  SupportRequestStatus,
  SupportSearchHitKind,
} from "./types";

const STATUS_LABELS: Record<SupportRequestStatus, string> = {
  new: "New",
  open: "Open",
  pending: "Pending",
  closed: "Closed",
  merged: "Merged",
  unknown: "Unknown",
};

const PRIORITY_LABELS: Record<SupportRequestPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

const SEARCH_KIND_LABELS: Record<SupportSearchHitKind, string> = {
  support_request: "Request",
  organization: "Organization",
  group: "Group",
  user: "User",
  article: "Article",
};

export function formatSupportDate(value: string | undefined | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatSupportStatus(status: SupportRequestStatus | string): string {
  return STATUS_LABELS[status as SupportRequestStatus] ?? String(status);
}

export function formatSupportPriority(
  priority: SupportRequestPriority | string,
): string {
  return PRIORITY_LABELS[priority as SupportRequestPriority] ?? String(priority);
}

export function formatSearchHitKind(kind: SupportSearchHitKind | string): string {
  return SEARCH_KIND_LABELS[kind as SupportSearchHitKind] ?? String(kind);
}

export function formatBytes(sizeBytes: number | undefined): string {
  if (sizeBytes === undefined || Number.isNaN(sizeBytes)) return "—";
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
