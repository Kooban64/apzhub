"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import { readLastProjectId, writeLastProjectId } from "@/lib/projects/preferences";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import { listProjects, listTasks } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { statusOptionsFromTasks } from "@/lib/projects/status-options";
import type { Task } from "@/lib/projects/types";

import { ProjectsTaskDrawer } from "./projects-task-drawer";
import { ProjectsTasksBoard } from "./projects-tasks-board";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  PriorityBadge,
  ProjectPicker,
  ProjectsTable,
  StatusBadge,
} from "./projects-ui";

type TasksLayout = "list" | "board" | "timeline";

function sortTasksForTimeline(tasks: readonly Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aDue = a.dueDate ? Date.parse(a.dueDate) : Number.POSITIVE_INFINITY;
    const bDue = b.dueDate ? Date.parse(b.dueDate) : Number.POSITIVE_INFINITY;
    if (aDue !== bDue) return aDue - bDue;
    return a.title.localeCompare(b.title);
  });
}

export function ProjectsTasksView({
  permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const [projectId, setProjectId] = useState("");
  const [layout, setLayout] = useState<TasksLayout>("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const last = readLastProjectId();
    if (last) setProjectId(last);
  }, []);

  const projectsQuery = useQuery({
    queryKey: projectsQueryKeys.list({ status: "active", perPage: 100, page: 1 }),
    queryFn: ({ signal }) =>
      listProjects({ status: "active", perPage: 100, page: 1 }, { signal }),
  });

  const tasksQuery = useQuery({
    queryKey: projectsQueryKeys.tasks({
      projectId,
      perPage: 50,
      page: 1,
      sort: "updatedAt",
      order: "desc",
    }),
    queryFn: ({ signal }) =>
      listTasks(
        { projectId, perPage: 50, page: 1, sort: "updatedAt", order: "desc" },
        { signal },
      ),
    enabled: Boolean(projectId),
  });

  const projects = useMemo(() => projectsQuery.data?.items ?? [], [projectsQuery.data]);
  const tasks = tasksQuery.data?.items ?? [];
  const timelineTasks = useMemo(() => sortTasksForTimeline(tasks), [tasks]);
  const statusOptions = useMemo(() => statusOptionsFromTasks(tasks), [tasks]);
  const projectName = projects.find((p) => p.id === projectId)?.name;

  return (
    <PageShell
      title="Tasks"
      description="List, board, or due-date timeline — open a task drawer for quick updates and Start Timer."
      breadcrumbs={["APZ Projects", "Tasks"]}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <ProjectPicker
          projects={projects}
          value={projectId}
          onChange={(next) => {
            setProjectId(next);
            writeLastProjectId(next);
            setSelectedTask(null);
          }}
          testId="projects-tasks-picker"
        />
        <div
          className="flex gap-1 rounded-md border border-[var(--color-border)] p-0.5"
          role="tablist"
          aria-label="Tasks layout"
        >
          {(
            [
              { id: "list", label: "List" },
              { id: "board", label: "Board" },
              { id: "timeline", label: "Timeline" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={layout === tab.id}
              className={`rounded px-3 py-1.5 text-sm ${
                layout === tab.id
                  ? "bg-[var(--color-muted)] font-medium"
                  : "text-[var(--color-muted-foreground)]"
              }`}
              onClick={() => setLayout(tab.id)}
              data-testid={`projects-tasks-layout-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {!projectId ? (
        <EmptyState
          title="Select a project"
          description="Choose a project to load tasks."
        />
      ) : null}
      {projectId && tasksQuery.isLoading ? <LoadingState /> : null}
      {projectId && tasksQuery.isError ? (
        <ErrorState
          message={
            isProjectsApiError(tasksQuery.error)
              ? tasksQuery.error.message
              : "Unable to load tasks."
          }
          onRetry={() => void tasksQuery.refetch()}
        />
      ) : null}
      {projectId && tasksQuery.isSuccess && tasks.length === 0 ? (
        <EmptyState title="No tasks" description="This project has no tasks yet." />
      ) : null}

      {projectId && tasks.length > 0 && layout === "board" ? (
        <ProjectsTasksBoard
          tasks={tasks}
          selectedTaskId={selectedTask?.id}
          onSelectTask={setSelectedTask}
        />
      ) : null}

      {projectId && tasks.length > 0 && layout === "list" ? (
        <ProjectsTable headers={["Title", "Status", "Priority", "Updated"]}>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="cursor-pointer border-b border-[var(--color-border)] last:border-0 align-top hover:bg-[var(--color-muted)]/40"
              data-testid={`projects-tasks-row-${task.id}`}
              onClick={() => setSelectedTask(task)}
            >
              <td className="px-3 py-2 font-medium">{task.title}</td>
              <td className="px-3 py-2">
                <StatusBadge status={task.status} />
              </td>
              <td className="px-3 py-2">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className="px-3 py-2">{formatProjectsDate(task.updatedAt)}</td>
            </tr>
          ))}
        </ProjectsTable>
      ) : null}

      {projectId && timelineTasks.length > 0 && layout === "timeline" ? (
        <div className="space-y-2" data-testid="projects-tasks-timeline">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Due-date order for this project. Tasks without a due date appear last.
            Portfolio and delivery timelines remain under Portfolio.
          </p>
          <ol className="space-y-2">
            {timelineTasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-muted)]/30"
                  data-testid={`projects-tasks-timeline-row-${task.id}`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium">{task.title}</p>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--color-muted-foreground)]">
                    {task.dueDate ? formatProjectsDate(task.dueDate) : "No due date"}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <ProjectsTaskDrawer
        task={selectedTask}
        statusOptions={statusOptions}
        permissions={permissions}
        projectName={projectName}
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
      />
    </PageShell>
  );
}
