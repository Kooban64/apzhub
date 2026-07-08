"use client";

import {
  formatTimeEntryDate,
  formatTimeEntryDuration,
  getAttorneyLabel,
  getMatterTitleForTimeEntry,
  getTaskTitleForTimeEntry,
  type ManagedTimeEntry,
} from "../../lib/time";
import { LawListTableShell } from "../ux/data-table/law-list-table-shell";

export interface TimeEntryListTableProps {
  readonly entries: readonly ManagedTimeEntry[];
  readonly selectedTimeEntryId?: string;
  readonly onSelect?: (entry: ManagedTimeEntry) => void;
  readonly onOpen?: (entry: ManagedTimeEntry) => void;
}

const COLUMNS: ReadonlyArray<{
  readonly id: string;
  readonly header: string;
  readonly width?: string;
}> = [
  { id: "timeEntryReference", header: "Reference", width: "10rem" },
  { id: "entryDate", header: "Date", width: "8rem" },
  { id: "narrative", header: "Description" },
  { id: "matter", header: "Matter", width: "12rem" },
  { id: "task", header: "Task", width: "10rem" },
  { id: "userId", header: "Attorney", width: "10rem" },
  { id: "durationMinutes", header: "Duration", width: "8rem" },
  { id: "billable", header: "Billable", width: "7rem" },
] as const;

/** Time entry list table — standardised shell (LAW-013-05). */
export function TimeEntryListTable({
  entries,
  selectedTimeEntryId,
  onSelect,
  onOpen,
}: TimeEntryListTableProps) {
  return (
    <LawListTableShell
      columns={COLUMNS}
      testId="time-entry-list-table"
      isEmpty={entries.length === 0}
      emptyMessage="No time entries match the current filters."
    >
      {entries.map((entry) => {
        const selected = entry.timeEntryId === selectedTimeEntryId;

        return (
          <tr
            key={entry.timeEntryId}
            data-testid={`time-entry-list-row-${entry.timeEntryReference}`}
            className={selected ? "bg-[var(--color-muted)]/30" : undefined}
            onClick={() => onSelect?.(entry)}
          >
            <td className="px-4 py-3 font-mono text-xs text-[var(--color-foreground)]">
              {entry.timeEntryReference}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {formatTimeEntryDate(entry.entryDate)}
            </td>
            <td className="px-4 py-3 text-[var(--color-foreground)]">
              {entry.narrative}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {getMatterTitleForTimeEntry(entry.matterId)}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {getTaskTitleForTimeEntry(entry.taskId)}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {getAttorneyLabel(entry.userId)}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {formatTimeEntryDuration(entry.durationMinutes)}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {entry.billable ? "Yes" : "No"}
            </td>
            <td className="px-4 py-3 text-right">
              <button
                type="button"
                className="text-sm font-medium text-[var(--law-accent)] hover:underline"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen?.(entry);
                }}
                data-testid={`time-entry-open-${entry.timeEntryReference}`}
              >
                Open
              </button>
            </td>
          </tr>
        );
      })}
    </LawListTableShell>
  );
}
