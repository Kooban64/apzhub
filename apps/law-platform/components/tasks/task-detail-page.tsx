"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  LawBreadcrumbs,
  LawDetailPageLayout,
  LawEmptyState,
  LawInformationCard,
  LawPageHeader,
  LawPageHeaderButton,
  LawStatisticsCard,
  LawStatusCard,
  LawTabs,
} from "../ux";
import { TaskContextPanel } from "./task-context-panel";
import { useTaskWorkflow } from "../../lib/tasks/task-workflow-context";
import {
  formatTaskDate,
  formatTaskDueDate,
  getAssigneeLabel,
  getDocumentTitleForTask,
  getMatterTitleForTask,
  getSharedTaskRepository,
  taskEditRoute,
  taskListRoute,
  type ManagedTask,
} from "../../lib/tasks";
import { documentDetailRoute } from "../../lib/documents";
import { matterDetailRoute } from "../../lib/matters";

const DETAIL_TABS = [
  { id: "notes", label: "Notes" },
  { id: "activities", label: "Activities" },
  { id: "timeline", label: "Timeline" },
] as const;

export interface TaskDetailPageProps {
  readonly taskId: string;
}

function formatLabel(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function PropertyGrid({ task }: { readonly task: ManagedTask }) {
  const entries: Array<{
    label: string;
    value: string;
    href?: string;
    testId?: string;
  }> = [
    { label: "Task ID", value: task.taskId },
    { label: "Reference", value: task.taskReference },
    { label: "Title", value: task.title },
    { label: "Status", value: formatLabel(task.taskStatus) },
    { label: "Priority", value: formatLabel(task.taskPriority) },
    {
      label: "Matter",
      value: getMatterTitleForTask(task.matterId),
      href: matterDetailRoute(task.matterId ?? ""),
      testId: "task-detail-matter-link",
    },
    { label: "Matter ID", value: task.matterId ?? "—" },
    {
      label: "Document",
      value: task.documentId ? getDocumentTitleForTask(task.documentId) : "—",
      href: task.documentId ? documentDetailRoute(task.documentId) : undefined,
      testId: "task-detail-document-link",
    },
    { label: "Assigned attorney", value: getAssigneeLabel(task.assigneeUserId) },
    { label: "Due date", value: formatTaskDueDate(task.dueAt) },
    { label: "Created", value: formatTaskDate(task.createdAt) },
    { label: "Completed", value: formatTaskDate(task.completedAt) },
    { label: "Description", value: task.description || "—" },
    { label: "Tags", value: task.tags.length > 0 ? task.tags.join(", ") : "—" },
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2" data-testid="task-detail-properties">
      {entries.map((entry) => (
        <div key={entry.label}>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {entry.label}
          </dt>
          <dd className="mt-1 text-sm text-[var(--color-foreground)]">
            {entry.href ? (
              <a
                href={entry.href}
                className="font-medium text-[var(--law-accent)] hover:underline"
                data-testid={entry.testId}
              >
                {entry.value}
              </a>
            ) : (
              entry.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Task detail page — LawDetailPageLayout with workflow open/complete/archive (LAW-005-01). */
export function TaskDetailPage({ taskId }: TaskDetailPageProps) {
  const router = useRouter();
  const workflow = useTaskWorkflow();
  const repository = getSharedTaskRepository();
  const task = useMemo(() => repository.getById(taskId), [repository, taskId]);
  const [activeTab, setActiveTab] = useState<string>("notes");
  const openedTaskIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!task || openedTaskIdRef.current === task.taskId) {
      return;
    }

    openedTaskIdRef.current = task.taskId;
    workflow.openTask(task.taskId);
  }, [task, workflow]);

  function handleComplete() {
    const result = workflow.completeTask(taskId);
    if (result.ok && result.task) {
      openedTaskIdRef.current = undefined;
    }
  }

  function handleArchive() {
    const result = workflow.archiveTask(taskId);
    if (result.ok) {
      router.push(taskListRoute());
    }
  }

  if (!task) {
    return (
      <LawDetailPageLayout
        header={
          <LawPageHeader
            eyebrow="Task Management"
            title="Task not found"
            subtitle="The requested task is not in the in-memory repository."
            primaryAction={
              <LawPageHeaderButton onClick={() => router.push(taskListRoute())}>
                Back to tasks
              </LawPageHeaderButton>
            }
          />
        }
        properties={<LawEmptyState variant="no-results" />}
      />
    );
  }

  const canComplete =
    task.taskStatus !== "completed" && task.taskStatus !== "cancelled";

  return (
    <LawDetailPageLayout
      header={
        <>
          <LawBreadcrumbs
            items={[{ label: "Tasks", href: taskListRoute() }, { label: task.title }]}
          />
          <LawPageHeader
            eyebrow="Task Management"
            title={task.title}
            subtitle={task.taskReference}
            primaryAction={
              <LawPageHeaderButton
                onClick={() => router.push(taskEditRoute(task.taskId))}
              >
                Edit Task
              </LawPageHeaderButton>
            }
            secondaryActions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(taskListRoute())}
                >
                  Back to list
                </Button>
                {canComplete ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleComplete}
                    data-testid="task-complete-button"
                  >
                    Mark Complete
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleArchive}
                  data-testid="task-archive-button"
                >
                  Archive Task
                </Button>
              </>
            }
          />
        </>
      }
      summaryCards={
        <>
          <LawStatisticsCard label="Reference" value={task.taskReference} />
          <LawStatusCard
            label="Status"
            status={formatLabel(task.taskStatus)}
            tone={task.taskStatus === "completed" ? "success" : "neutral"}
          />
          <LawStatisticsCard
            label="Matter"
            value={getMatterTitleForTask(task.matterId)}
          />
          <LawStatisticsCard label="Due date" value={formatTaskDueDate(task.dueAt)} />
        </>
      }
      tabs={
        <>
          <LawTabs items={DETAIL_TABS} activeId={activeTab} onChange={setActiveTab} />
          <LawInformationCard
            title={`${DETAIL_TABS.find((tab) => tab.id === activeTab)?.label ?? "Tab"} (placeholder)`}
          >
            <p
              className="text-sm text-[var(--color-muted-foreground)]"
              data-testid={`task-tab-${activeTab}`}
            >
              {activeTab === "notes" && "Task notes will be managed in a future story."}
              {activeTab === "activities" &&
                "Activity entries will be sourced from the Activity framework."}
              {activeTab === "timeline" &&
                "Timeline events will be sourced from the Activity & Timeline framework."}
            </p>
          </LawInformationCard>
        </>
      }
      properties={
        <LawInformationCard title="Properties">
          <PropertyGrid task={task} />
        </LawInformationCard>
      }
      timeline={
        <LawInformationCard title="Timeline (placeholder)">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Timeline integration is registered but not wired to live updates in
            LAW-005-01.
          </p>
        </LawInformationCard>
      }
      documents={
        <LawInformationCard title="Linked document">
          {task.documentId ? (
            <a
              href={documentDetailRoute(task.documentId)}
              className="text-sm font-medium text-[var(--law-accent)] hover:underline"
            >
              {getDocumentTitleForTask(task.documentId)}
            </a>
          ) : (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No document linked to this task.
            </p>
          )}
        </LawInformationCard>
      }
      activity={
        <LawInformationCard title="Activity (placeholder)">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Task opened, created, completed, and archived activities are registered as
            placeholders.
          </p>
        </LawInformationCard>
      }
      contextPanel={<TaskContextPanel task={task} />}
    />
  );
}
