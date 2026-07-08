import type {
  ManagedTimeEntry,
  TimeEntryBillableFilter,
  TimeEntryDateFilter,
  TimeEntryListCriteria,
} from "./time-entry-types";

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function matchesDateFilter(
  entry: ManagedTimeEntry,
  filter?: TimeEntryDateFilter,
): boolean {
  if (!filter || filter === "all") {
    return true;
  }

  const entryDay = startOfDay(new Date(entry.entryDate));
  const today = startOfDay(new Date());

  if (filter === "today") {
    return entryDay.getTime() === today.getTime();
  }

  if (filter === "this_week") {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return (
      entryDay.getTime() >= weekStart.getTime() &&
      entryDay.getTime() < weekEnd.getTime()
    );
  }

  if (filter === "this_month") {
    return (
      entryDay.getFullYear() === today.getFullYear() &&
      entryDay.getMonth() === today.getMonth()
    );
  }

  if (filter === "last_30_days") {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 30);
    return (
      entryDay.getTime() >= cutoff.getTime() && entryDay.getTime() <= today.getTime()
    );
  }

  return true;
}

function matchesBillableFilter(
  entry: ManagedTimeEntry,
  filter?: TimeEntryBillableFilter,
): boolean {
  if (!filter || filter === "all") {
    return true;
  }

  if (filter === "billable") {
    return entry.billable;
  }

  return !entry.billable;
}

export function matchesTimeEntryCriteria(
  entry: ManagedTimeEntry,
  criteria?: TimeEntryListCriteria,
): boolean {
  if (!criteria) {
    return true;
  }

  if (
    criteria.matterId &&
    criteria.matterId !== "all" &&
    entry.matterId !== criteria.matterId
  ) {
    return false;
  }

  if (
    criteria.taskId &&
    criteria.taskId !== "all" &&
    entry.taskId !== criteria.taskId
  ) {
    return false;
  }

  if (
    criteria.userId &&
    criteria.userId !== "all" &&
    entry.userId !== criteria.userId
  ) {
    return false;
  }

  if (!matchesDateFilter(entry, criteria.entryDateFilter)) {
    return false;
  }

  if (!matchesBillableFilter(entry, criteria.billableFilter)) {
    return false;
  }

  const query = criteria.query?.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    entry.narrative,
    entry.timeEntryReference,
    entry.matterId,
    entry.taskId ?? "",
    entry.documentId ?? "",
    entry.userId,
    entry.activityCode ?? "",
    entry.billingStatus,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function sortTimeEntriesByEntryDate(
  entries: readonly ManagedTimeEntry[],
): ManagedTimeEntry[] {
  return [...entries].sort((left, right) =>
    right.entryDate.localeCompare(left.entryDate),
  );
}
