"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import {
  canManageProjects,
  canManageTasks,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import {
  archiveProject,
  createTask,
  getProject,
  listTasks,
  updateProject,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { projectDetailPath, projectsListPath } from "@/lib/projects/routes";
import { statusOptionsFromTasks } from "@/lib/projects/status-options";
import type { ProjectStatus, Task } from "@/lib/projects/types";

import { ProjectsTaskActions } from "./projects-task-actions";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  PriorityBadge,
  ProjectsTable,
  StatusBadge,
} from "./projects-ui";

const TABS = ["overview", "tasks", "backlog", "sprints", "roadmap"] as const;

const PROJECT_STATUSES: readonly ProjectStatus[] = [
  "draft",
  "active",
  "on_hold",
  "completed",
  "archived",
];

export function ProjectDetailView({
  projectId,
  tab = "overview",
  permissions,
}: {
  readonly projectId: string;
  readonly tab?: string;
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeTab = TABS.includes(tab as (typeof TABS)[number])
    ? (tab as (typeof TABS)[number])
    : "overview";
  const [taskTitle, setTaskTitle] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<ProjectStatus>("active");
  const [editSeeded, setEditSeeded] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const projectQuery = useQuery({
    queryKey: projectsQueryKeys.detail(projectId),
    queryFn: ({ signal }) => getProject(projectId, { signal }),
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
    enabled: activeTab !== "overview",
  });

  const createMutation = useMutation({
    mutationFn: () => createTask({ projectId, title: taskTitle.trim() }),
    onSuccess: async () => {
      setTaskTitle("");
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProject(projectId, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        status: editStatus,
      }),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setActionError(
        isProjectsApiError(err) ? err.message : "Unable to update project.",
      );
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveProject(projectId),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
      router.push(projectsListPath());
    },
    onError: (err: unknown) => {
      setActionError(
        isProjectsApiError(err) ? err.message : "Unable to archive project.",
      );
    },
  });

  const project = projectQuery.data;

  useEffect(() => {
    if (!project || editSeeded) return;
    setEditName(project.name);
    setEditDescription(project.description ?? "");
    setEditStatus(project.status);
    setEditSeeded(true);
  }, [project, editSeeded]);

  const tasks = tasksQuery.data?.items ?? [];
  const statusOptions = useMemo(() => statusOptionsFromTasks(tasks), [tasks]);
  const backlog = tasks.filter((task) => !task.sprintId);
  const sprintTasks = tasks.filter((task) => Boolean(task.sprintId));
  const roadmap = [...tasks]
    .filter((task) => task.dueDate)
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));

  return (
    <PageShell
      title={project?.name ?? "Project"}
      description={
        project
          ? `${project.identifier} · Updated ${formatProjectsDate(project.updatedAt)}`
          : "Project details"
      }
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(projectsListPath())}
          data-testid="projects-detail-back"
        >
          Back to list
        </Button>
      }
    >
      {projectQuery.isLoading ? <LoadingState /> : null}
      {projectQuery.isError ? (
        <ErrorState
          message={
            isProjectsApiError(projectQuery.error)
              ? projectQuery.error.message
              : "Unable to load project."
          }
          onRetry={() => void projectQuery.refetch()}
        />
      ) : null}

      {project ? (
        <>
          <div className="flex flex-wrap gap-2" data-testid="projects-detail-tabs">
            {TABS.map((entry) => (
              <Button
                key={entry}
                type="button"
                size="sm"
                variant={activeTab === entry ? "default" : "outline"}
                onClick={() =>
                  router.push(
                    entry === "overview"
                      ? projectDetailPath(projectId)
                      : projectDetailPath(projectId, entry),
                  )
                }
                data-testid={`projects-tab-${entry}`}
              >
                {entry[0]?.toUpperCase()}
                {entry.slice(1)}
              </Button>
            ))}
          </div>

          {activeTab === "overview" ? (
            <div className="flex flex-col gap-4" data-testid="projects-detail-overview">
              <div className="grid gap-4 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                    Status
                  </p>
                  <StatusBadge status={project.status} />
                </div>
                <div>
                  <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                    Workspace
                  </p>
                  <p className="text-sm">{project.workspaceId}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                    Description
                  </p>
                  <p className="text-sm">
                    {project.description?.trim() || "No description provided."}
                  </p>
                </div>
              </div>

              {canManageProjects(permissions) ? (
                <form
                  className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] p-4"
                  data-testid="projects-detail-edit"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (editName.trim()) updateMutation.mutate();
                  }}
                >
                  <h2 className="text-sm font-semibold">Edit project</h2>
                  <Input
                    label="Name"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    data-testid="projects-detail-edit-name"
                  />
                  <Input
                    label="Description"
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    data-testid="projects-detail-edit-description"
                  />
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Status</span>
                    <select
                      className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
                      value={editStatus}
                      onChange={(event) =>
                        setEditStatus(event.target.value as ProjectStatus)
                      }
                      data-testid="projects-detail-edit-status"
                    >
                      {PROJECT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={updateMutation.isPending || !editName.trim()}
                      data-testid="projects-detail-edit-save"
                    >
                      Save changes
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={archiveMutation.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Archive this project? It will leave the active project list.",
                          )
                        ) {
                          archiveMutation.mutate();
                        }
                      }}
                      data-testid="projects-detail-archive"
                    >
                      Archive project
                    </Button>
                  </div>
                  {actionError ? (
                    <p className="text-xs text-[var(--color-destructive)]" role="alert">
                      {actionError}
                    </p>
                  ) : null}
                </form>
              ) : null}
            </div>
          ) : null}

          {activeTab !== "overview" ? (
            <>
              {activeTab === "sprints" ? (
                <p
                  className="text-sm text-[var(--color-muted-foreground)]"
                  data-testid="projects-detail-sprints-honesty"
                >
                  Sprint grouping is derived from each task&apos;s sprint field.
                  Dedicated sprint list/CRUD HTTP is not part of this release.
                </p>
              ) : null}
              {activeTab === "roadmap" ? (
                <p
                  className="text-sm text-[var(--color-muted-foreground)]"
                  data-testid="projects-detail-roadmap-honesty"
                >
                  Roadmap lists Platform tasks that have due dates, ordered by due date
                  — not a separate roadmap engine API.
                </p>
              ) : null}

              {tasksQuery.isLoading ? <LoadingState label="Loading tasks…" /> : null}
              {tasksQuery.isError ? (
                <ErrorState
                  message={
                    isProjectsApiError(tasksQuery.error)
                      ? tasksQuery.error.message
                      : "Unable to load tasks."
                  }
                  onRetry={() => void tasksQuery.refetch()}
                />
              ) : null}

              {activeTab === "tasks" && canManageTasks(permissions) ? (
                <form
                  className="flex flex-wrap items-end gap-2"
                  data-testid="projects-detail-task-create"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (taskTitle.trim()) createMutation.mutate();
                  }}
                >
                  <Input
                    label="New task"
                    value={taskTitle}
                    onChange={(event) => setTaskTitle(event.target.value)}
                    data-testid="projects-detail-task-title"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createMutation.isPending || !taskTitle.trim()}
                    data-testid="projects-detail-task-submit"
                  >
                    Add task
                  </Button>
                </form>
              ) : null}

              {tasksQuery.isSuccess ? (
                <TaskTable
                  tasks={
                    activeTab === "backlog"
                      ? backlog
                      : activeTab === "sprints"
                        ? sprintTasks
                        : activeTab === "roadmap"
                          ? roadmap
                          : tasks
                  }
                  statusOptions={statusOptions}
                  permissions={permissions}
                  showActions={activeTab === "tasks"}
                  emptyTitle={
                    activeTab === "backlog"
                      ? "Backlog is empty"
                      : activeTab === "sprints"
                        ? "No sprint-assigned tasks"
                        : activeTab === "roadmap"
                          ? "No tasks with due dates"
                          : "No tasks yet"
                  }
                />
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </PageShell>
  );
}

function TaskTable({
  tasks,
  emptyTitle,
  statusOptions,
  permissions,
  showActions,
}: {
  readonly tasks: readonly Task[];
  readonly emptyTitle: string;
  readonly statusOptions: ReturnType<typeof statusOptionsFromTasks>;
  readonly permissions?: ProjectsPermissionSource;
  readonly showActions: boolean;
}) {
  if (tasks.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }
  return (
    <ProjectsTable
      headers={
        showActions
          ? ["Title", "Status", "Priority", "Sprint", "Due", "Actions"]
          : ["Title", "Status", "Priority", "Sprint", "Due"]
      }
    >
      {tasks.map((task) => (
        <tr
          key={task.id}
          className="border-b border-[var(--color-border)] last:border-0 align-top"
          data-testid={`projects-task-row-${task.id}`}
        >
          <td className="px-3 py-2 font-medium">{task.title}</td>
          <td className="px-3 py-2">
            <StatusBadge status={task.status} />
          </td>
          <td className="px-3 py-2">
            <PriorityBadge priority={task.priority} />
          </td>
          <td className="px-3 py-2 font-mono text-xs">
            {task.sprintId ? task.sprintId.slice(0, 16) : "—"}
          </td>
          <td className="px-3 py-2">{formatProjectsDate(task.dueDate)}</td>
          {showActions ? (
            <td className="px-3 py-2">
              <ProjectsTaskActions
                task={task}
                statusOptions={statusOptions}
                permissions={permissions}
              />
            </td>
          ) : null}
        </tr>
      ))}
    </ProjectsTable>
  );
}
