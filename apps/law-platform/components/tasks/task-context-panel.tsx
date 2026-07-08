"use client";

import { LawInformationCard, LawStatisticsCard, LawStatusCard } from "../ux";
import {
  formatTaskDueDate,
  getAssigneeLabel,
  getDocumentTitleForTask,
  getMatterTitleForTask,
  type ManagedTask,
} from "../../lib/tasks";
import { documentDetailRoute } from "../../lib/documents";
import { matterDetailRoute } from "../../lib/matters";

export interface TaskContextPanelProps {
  readonly task?: ManagedTask;
}

function formatLabel(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Context panel — task summary with matter/document links and placeholder activity (LAW-005-01). */
export function TaskContextPanel({ task }: TaskContextPanelProps) {
  if (!task) {
    return (
      <aside
        className="flex w-80 shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        data-testid="task-context-panel-empty"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Select a task to preview summary, matter, document, and activity placeholders.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="flex w-80 shrink-0 flex-col gap-4 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      data-testid="task-context-panel"
    >
      <LawStatisticsCard label="Task reference" value={task.taskReference} />
      <LawStatusCard
        label="Priority"
        status={formatLabel(task.taskPriority)}
        tone={
          task.taskPriority === "critical" || task.taskPriority === "high"
            ? "warning"
            : "neutral"
        }
      />
      <LawInformationCard title="Task summary">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Title</dt>
            <dd className="font-medium text-[var(--color-foreground)]">{task.title}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Matter</dt>
            <dd>
              <a
                href={matterDetailRoute(task.matterId ?? "")}
                className="font-medium text-[var(--law-accent)] hover:underline"
                data-testid="task-context-matter-link"
              >
                {getMatterTitleForTask(task.matterId)}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Document</dt>
            <dd>
              {task.documentId ? (
                <a
                  href={documentDetailRoute(task.documentId)}
                  className="font-medium text-[var(--law-accent)] hover:underline"
                  data-testid="task-context-document-link"
                >
                  {getDocumentTitleForTask(task.documentId)}
                </a>
              ) : (
                <span className="text-[var(--color-foreground)]">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Assigned to</dt>
            <dd className="text-[var(--color-foreground)]">
              {getAssigneeLabel(task.assigneeUserId)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Due date</dt>
            <dd className="text-[var(--color-foreground)]">
              {formatTaskDueDate(task.dueAt)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Status</dt>
            <dd className="capitalize text-[var(--color-foreground)]">
              {formatLabel(task.taskStatus)}
            </dd>
          </div>
        </dl>
      </LawInformationCard>
      <LawInformationCard title="Recent activities (placeholder)">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Task opened, created, completed, and archived activities will appear here when
          wired to the Activity framework.
        </p>
      </LawInformationCard>
    </aside>
  );
}
