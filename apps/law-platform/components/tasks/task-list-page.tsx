"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  LawEmptyState,
  LawFilterBar,
  LawListPageLayout,
  LawPageHeader,
  LawPageHeaderButton,
  LawPagination,
  LawSearchBar,
  LawTableLoadingSkeleton,
} from "../ux";
import { TaskContextPanel } from "./task-context-panel";
import { TaskListTable } from "./task-list-table";
import { useTaskWorkflow } from "../../lib/tasks/task-workflow-context";
import {
  SEED_TASK_ASSIGNEES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  getSharedTaskRepository,
  taskCreateRoute,
  taskDetailRoute,
  type ManagedTask,
  type TaskDueDateFilter,
  type TaskPriority,
  type TaskStatus,
} from "../../lib/tasks";
import { getSharedMatterRepository } from "../../lib/matters";

const PAGE_SIZE = 10;

export interface TaskListPageProps {
  readonly initialQuery?: string;
}

function formatLabel(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Task list page — LawListPageLayout with workflow search (LAW-005-01). */
export function TaskListPage({ initialQuery = "" }: TaskListPageProps) {
  const router = useRouter();
  const workflow = useTaskWorkflow();
  const repository = getSharedTaskRepository();
  const matters = useMemo(() => getSharedMatterRepository().list(), []);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [matterFilter, setMatterFilter] = useState<string>("all");
  const [dueDateFilter, setDueDateFilter] = useState<TaskDueDateFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<ManagedTask | undefined>();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  function resetFiltersPage() {
    setPage(1);
  }

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = window.setTimeout(() => {
      workflow.searchTasks({
        query,
        taskStatus: statusFilter,
        taskPriority: priorityFilter,
        assigneeUserId: assigneeFilter,
        matterId: matterFilter,
        dueDateFilter,
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [
    loading,
    query,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    matterFilter,
    dueDateFilter,
    workflow,
  ]);

  const filteredTasks = useMemo(
    () =>
      repository.list({
        query,
        taskStatus: statusFilter,
        taskPriority: priorityFilter,
        assigneeUserId: assigneeFilter,
        matterId: matterFilter,
        dueDateFilter,
      }),
    [
      repository,
      query,
      statusFilter,
      priorityFilter,
      assigneeFilter,
      matterFilter,
      dueDateFilter,
    ],
  );

  const pageCount = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const pageTasks = filteredTasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectClassName =
    "h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm";

  return (
    <div data-testid="task-list-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Task Management"
            title="Tasks"
            subtitle="Browse and search firm tasks linked to matters. Data is in-memory only for UX validation."
            primaryAction={
              <LawPageHeaderButton
                onClick={() => router.push(taskCreateRoute())}
                data-testid="task-create-button"
              >
                Create Task
              </LawPageHeaderButton>
            }
          />
        }
        toolbar={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("");
                resetFiltersPage();
              }}
            >
              Clear search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push(taskCreateRoute())}
              data-testid="task-toolbar-create"
            >
              Create task
            </Button>
          </div>
        }
        searchArea={
          <LawSearchBar
            placeholder="Search tasks by title, reference, assignee, matter, or tag…"
            value={query}
            onChange={(value) => {
              setQuery(value);
              resetFiltersPage();
            }}
            data-testid="task-search-bar"
          />
        }
        filtersArea={
          <LawFilterBar label="Task filters">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Status</span>
              <select
                className={selectClassName}
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as TaskStatus | "all");
                  resetFiltersPage();
                }}
                data-testid="task-filter-status"
              >
                <option value="all">All statuses</option>
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatLabel(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Priority</span>
              <select
                className={selectClassName}
                value={priorityFilter}
                onChange={(event) => {
                  setPriorityFilter(event.target.value as TaskPriority | "all");
                  resetFiltersPage();
                }}
                data-testid="task-filter-priority"
              >
                <option value="all">All priorities</option>
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {formatLabel(priority)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Assigned to</span>
              <select
                className={selectClassName}
                value={assigneeFilter}
                onChange={(event) => {
                  setAssigneeFilter(event.target.value);
                  resetFiltersPage();
                }}
                data-testid="task-filter-assignee"
              >
                <option value="all">All assignees</option>
                {SEED_TASK_ASSIGNEES.map((assignee) => (
                  <option key={assignee.assigneeUserId} value={assignee.assigneeUserId}>
                    {assignee.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Matter</span>
              <select
                className={selectClassName}
                value={matterFilter}
                onChange={(event) => {
                  setMatterFilter(event.target.value);
                  resetFiltersPage();
                }}
                data-testid="task-filter-matter"
              >
                <option value="all">All matters</option>
                {matters.map((matter) => (
                  <option key={matter.matterId} value={matter.matterId}>
                    {matter.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Due date</span>
              <select
                className={selectClassName}
                value={dueDateFilter}
                onChange={(event) => {
                  setDueDateFilter(event.target.value as TaskDueDateFilter);
                  resetFiltersPage();
                }}
                data-testid="task-filter-due-date"
              >
                <option value="all">All due dates</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due today</option>
                <option value="this_week">Due this week</option>
                <option value="no_due_date">No due date</option>
              </select>
            </label>
          </LawFilterBar>
        }
        table={
          loading ? (
            <LawTableLoadingSkeleton />
          ) : pageTasks.length === 0 ? (
            <LawEmptyState
              variant={repository.count() === 0 ? "no-results" : "no-results"}
            />
          ) : (
            <TaskListTable
              tasks={pageTasks}
              selectedTaskId={selectedTask?.taskId}
              onSelect={setSelectedTask}
              onOpen={(task) => router.push(taskDetailRoute(task.taskId))}
            />
          )
        }
        pagination={
          loading ? null : (
            <LawPagination
              page={page}
              pageCount={pageCount}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => Math.min(pageCount, current + 1))}
            />
          )
        }
        contextPanel={<TaskContextPanel task={selectedTask} />}
      />
    </div>
  );
}
