"use client";

import { LawInformationCard, LawStatisticsCard, LawStatusCard } from "../ux";
import {
  formatTimeEntryAmount,
  formatTimeEntryDate,
  formatTimeEntryDuration,
  getAttorneyLabel,
  getDocumentTitleForTimeEntry,
  getMatterTitleForTimeEntry,
  getTaskTitleForTimeEntry,
  type ManagedTimeEntry,
} from "../../lib/time";
import { documentDetailRoute } from "../../lib/documents";
import { matterDetailRoute } from "../../lib/matters";
import { taskDetailRoute } from "../../lib/tasks";

export interface TimeEntryContextPanelProps {
  readonly timeEntry?: ManagedTimeEntry;
}

/** Context panel — time summary with matter/task links and placeholder activity (LAW-006-01). */
export function TimeEntryContextPanel({ timeEntry }: TimeEntryContextPanelProps) {
  if (!timeEntry) {
    return (
      <aside
        className="flex w-80 shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        data-testid="time-entry-context-panel-empty"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Select a time entry to preview summary, matter, task, and activity
          placeholders.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="flex w-80 shrink-0 flex-col gap-4 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      data-testid="time-entry-context-panel"
    >
      <LawStatisticsCard label="Reference" value={timeEntry.timeEntryReference} />
      <LawStatusCard
        label="Billable"
        status={timeEntry.billable ? "Billable" : "Non-billable"}
        tone={timeEntry.billable ? "success" : "neutral"}
      />
      <LawInformationCard title="Time summary">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Description</dt>
            <dd className="font-medium text-[var(--color-foreground)]">
              {timeEntry.narrative}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Date</dt>
            <dd className="text-[var(--color-foreground)]">
              {formatTimeEntryDate(timeEntry.entryDate)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Matter</dt>
            <dd>
              <a
                href={matterDetailRoute(timeEntry.matterId)}
                className="font-medium text-[var(--law-accent)] hover:underline"
                data-testid="time-entry-context-matter-link"
              >
                {getMatterTitleForTimeEntry(timeEntry.matterId)}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Task</dt>
            <dd>
              {timeEntry.taskId ? (
                <a
                  href={taskDetailRoute(timeEntry.taskId)}
                  className="font-medium text-[var(--law-accent)] hover:underline"
                  data-testid="time-entry-context-task-link"
                >
                  {getTaskTitleForTimeEntry(timeEntry.taskId)}
                </a>
              ) : (
                <span className="text-[var(--color-foreground)]">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Document</dt>
            <dd>
              {timeEntry.documentId ? (
                <a
                  href={documentDetailRoute(timeEntry.documentId)}
                  className="font-medium text-[var(--law-accent)] hover:underline"
                >
                  {getDocumentTitleForTimeEntry(timeEntry.documentId)}
                </a>
              ) : (
                <span className="text-[var(--color-foreground)]">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Duration</dt>
            <dd className="text-[var(--color-foreground)]">
              {formatTimeEntryDuration(timeEntry.durationMinutes)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Amount</dt>
            <dd className="text-[var(--color-foreground)]">
              {formatTimeEntryAmount(timeEntry.amount, timeEntry.billable)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Attorney</dt>
            <dd className="text-[var(--color-foreground)]">
              {getAttorneyLabel(timeEntry.userId)}
            </dd>
          </div>
        </dl>
      </LawInformationCard>
      <LawInformationCard title="Recent activities (placeholder)">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Time entry opened, created, edited, and deleted activities will appear here
          when wired to the Activity framework.
        </p>
      </LawInformationCard>
    </aside>
  );
}
