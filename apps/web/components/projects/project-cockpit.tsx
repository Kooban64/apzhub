"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import {
  COCKPIT_INTENTS,
  cockpitPath,
  intentLabel,
  resolveCockpitRoute,
  type CockpitIntent,
  type CockpitSurface,
} from "@/lib/projects/cockpit-intents";
import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import {
  canManageProjects,
  canManageTasks,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import {
  createTask,
  getDeliveryConfidence,
  getOperationalHealth,
  getProject,
  getProjectPulse,
  listCommitments,
  listTasks,
  updateProject,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { projectsListPath } from "@/lib/projects/routes";
import { statusOptionsFromTasks } from "@/lib/projects/status-options";
import type { Task } from "@/lib/projects/types";

import { EnterpriseContextPanel } from "./enterprise-context-panel";
import {
  ProjectActionsPanel,
  ProjectDecisionsPanel,
  ProjectDeliveryDashboardPanel,
  ProjectMilestonesPanel,
  ProjectRisksPanel,
} from "./project-delivery-panels";
import { ProjectControlSurface } from "./project-control-surface";
import { ProjectLifecyclePanel } from "./project-lifecycle-panel";
import { ProjectOperationalPanel } from "./project-operational-panel";
import { ProjectsTaskActions } from "./projects-task-actions";
import {
  ContextSection,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  PriorityBadge,
  ProjectsTable,
  ProjectsWorkspaceFrame,
  StatusBadge,
} from "./projects-ui";

function ProjectCockpitInner({
  projectId,
  pathSegment,
  permissions,
}: {
  readonly projectId: string;
  readonly pathSegment?: string;
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const resolution = resolveCockpitRoute(pathSegment, searchParams.get("surface"));
  const intent = resolution.intent;
  const surface = resolution.surface;

  const [moreOpen, setMoreOpen] = useState(
    Boolean(
      surface === "tasks" ||
      surface === "backlog" ||
      surface === "sprints" ||
      surface === "settings" ||
      surface === "lifecycle",
    ),
  );
  const [taskTitle, setTaskTitle] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSeeded, setEditSeeded] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confidenceOpen, setConfidenceOpen] = useState(false);

  const projectQuery = useQuery({
    queryKey: projectsQueryKeys.detail(projectId),
    queryFn: ({ signal }) => getProject(projectId, { signal }),
  });

  const pulseQuery = useQuery({
    queryKey: [...projectsQueryKeys.all, "ops-pulse", projectId],
    queryFn: ({ signal }) => getProjectPulse(projectId, { signal }),
  });
  const healthQuery = useQuery({
    queryKey: [...projectsQueryKeys.all, "ops-health", projectId],
    queryFn: ({ signal }) => getOperationalHealth(projectId, { signal }),
  });
  const confidenceQuery = useQuery({
    queryKey: [...projectsQueryKeys.all, "ops-confidence", projectId],
    queryFn: ({ signal }) => getDeliveryConfidence(projectId, { signal }),
  });
  const commitmentsQuery = useQuery({
    queryKey: [...projectsQueryKeys.all, "commitments", projectId],
    queryFn: ({ signal }) => listCommitments(projectId, { signal }),
  });

  const needsTasks =
    intent === "delivery" &&
    (surface === "tasks" || surface === "backlog" || surface === "sprints");

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
    enabled: needsTasks || (intent === "planning" && surface === "roadmap"),
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

  const project = projectQuery.data;

  useEffect(() => {
    if (!project || editSeeded) return;
    setEditName(project.name);
    setEditDescription(project.description ?? "");
    setEditSeeded(true);
  }, [project, editSeeded]);

  // Soft-redirect legacy entity paths to intent URLs
  useEffect(() => {
    if (!resolution.legacy || !pathSegment) return;
    if (COCKPIT_INTENTS.includes(pathSegment as CockpitIntent)) return;
    router.replace(cockpitPath(projectId, resolution.intent, resolution.surface));
  }, [resolution, pathSegment, projectId, router]);

  const tasks = tasksQuery.data?.items ?? [];
  const statusOptions = useMemo(() => statusOptionsFromTasks(tasks), [tasks]);
  const backlog = tasks.filter((task) => !task.sprintId);
  const sprintTasks = tasks.filter((task) => Boolean(task.sprintId));
  const roadmap = [...tasks]
    .filter((task) => task.dueDate)
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));

  const nextCommitment = useMemo(() => {
    const open = (commitmentsQuery.data ?? []).filter(
      (c) => c.status !== "done" && c.status !== "cancelled" && c.dueAt,
    );
    return [...open].sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)))[0];
  }, [commitmentsQuery.data]);

  const navigateIntent = (next: CockpitIntent, nextSurface?: CockpitSurface) => {
    router.push(cockpitPath(projectId, next, nextSurface));
  };

  return (
    <PageShell
      title={project?.name ?? "Project"}
      description={
        project
          ? `${project.identifier} · Updated ${formatProjectsDate(project.updatedAt)}`
          : "Project cockpit"
      }
      breadcrumbs={["APZ Projects", project?.name ?? "Project", intentLabel(intent)]}
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
      <ProjectsWorkspaceFrame
        context={
          project ? (
            <>
              <ContextSection title="Project">
                <p className="font-medium">{project.name}</p>
                <p className="text-[var(--color-muted-foreground)]">
                  {project.identifier}
                </p>
                <StatusBadge status={project.status} />
              </ContextSection>
              <EnterpriseContextPanel
                projectId={projectId}
                projectName={project.name}
                projectIdentifier={project.identifier}
              />
            </>
          ) : undefined
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
          <div
            className="flex flex-col gap-4 lg:flex-row"
            data-testid="projects-cockpit"
          >
            <nav
              aria-label="Cockpit focus"
              className="flex shrink-0 flex-row gap-1 overflow-x-auto lg:w-44 lg:flex-col"
              data-testid="projects-focus-nav"
            >
              {COCKPIT_INTENTS.map((entry) => (
                <Button
                  key={entry}
                  type="button"
                  size="sm"
                  variant={intent === entry ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => navigateIntent(entry)}
                  data-testid={`projects-intent-${entry}`}
                  aria-current={intent === entry ? "page" : undefined}
                >
                  {intentLabel(entry)}
                </Button>
              ))}
              <div className="my-1 hidden border-t border-[var(--color-border)] lg:block" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="justify-start"
                onClick={() => setMoreOpen((v) => !v)}
                data-testid="projects-intent-more"
                aria-expanded={moreOpen}
              >
                More…
              </Button>
              {moreOpen ? (
                <div className="flex flex-col gap-1 pl-1">
                  {(
                    [
                      ["tasks", "Tasks"],
                      ["backlog", "Backlog"],
                      ["sprints", "Sprints"],
                      ["lifecycle", "Lifecycle"],
                      ["settings", "Settings"],
                    ] as const
                  ).map(([key, label]) => (
                    <Button
                      key={key}
                      type="button"
                      size="sm"
                      variant={surface === key ? "default" : "outline"}
                      className="justify-start text-xs"
                      onClick={() => {
                        if (key === "lifecycle" || key === "settings") {
                          navigateIntent("overview", key);
                        } else {
                          navigateIntent("delivery", key);
                        }
                        setMoreOpen(true);
                      }}
                      data-testid={`projects-more-${key}`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </nav>

            <main className="min-w-0 flex-1 flex flex-col gap-4">
              <header
                className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] p-4"
                data-testid="projects-pulse-header"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                      Project
                    </p>
                    <h2 className="text-lg font-semibold">{project.name}</h2>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                        Health
                      </p>
                      <p className="font-semibold" data-testid="cockpit-health">
                        {String(healthQuery.data?.status ?? "—")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                        Confidence
                      </p>
                      <button
                        type="button"
                        className="font-semibold underline-offset-2 hover:underline"
                        data-testid="cockpit-confidence"
                        onClick={() => setConfidenceOpen((v) => !v)}
                      >
                        {confidenceQuery.data
                          ? `${String(confidenceQuery.data.score)} · ${String(confidenceQuery.data.band)}`
                          : "—"}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-sm" data-testid="cockpit-pulse">
                  {String(pulseQuery.data?.text ?? "Loading pulse…")}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <p data-testid="cockpit-next-commitment">
                    Next commitment:{" "}
                    {nextCommitment
                      ? `${String(nextCommitment.statement)} · ${formatProjectsDate(String(nextCommitment.dueAt))}`
                      : "None scheduled"}
                  </p>
                  {canManageProjects(permissions) ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => navigateIntent("delivery", "commitments")}
                      >
                        New commitment
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => navigateIntent("control", "decisions")}
                      >
                        Record decision
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => navigateIntent("control", "risks")}
                      >
                        Raise risk
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => navigateIntent("delivery", "waiting")}
                      >
                        Log wait
                      </Button>
                    </div>
                  ) : null}
                </div>
                {confidenceOpen && confidenceQuery.data ? (
                  <div
                    className="rounded-md border border-[var(--color-border)] p-3 text-sm"
                    data-testid="cockpit-confidence-breakdown"
                  >
                    <p className="mb-2 font-medium">Why this confidence score</p>
                    <ul className="list-disc pl-5">
                      {(
                        (confidenceQuery.data.factors as
                          | readonly { code: string; label: string; detail: string }[]
                          | undefined) ?? []
                      ).map((f) => (
                        <li key={f.code}>
                          {f.label}: {f.detail}
                        </li>
                      ))}
                      {((confidenceQuery.data.factors as unknown[] | undefined)
                        ?.length ?? 0) === 0 ? (
                        <li>No adverse factors — full predictability score.</li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}
              </header>

              {intent === "overview" ? (
                <div className="flex flex-col gap-4" data-testid="cockpit-overview">
                  <ProjectOperationalPanel projectId={projectId} />
                  {(surface === "lifecycle" || !surface) && (
                    <ProjectLifecyclePanel
                      projectId={projectId}
                      projectStatus={project.status}
                    />
                  )}
                  {surface === "settings" || canManageProjects(permissions) ? (
                    <form
                      className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] p-4"
                      data-testid="projects-detail-edit"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (editName.trim()) updateMutation.mutate();
                      }}
                    >
                      <h2 className="text-sm font-semibold">Project shell</h2>
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
                      <Button
                        type="submit"
                        size="sm"
                        disabled={updateMutation.isPending || !editName.trim()}
                        data-testid="projects-detail-edit-save"
                      >
                        Save changes
                      </Button>
                      {actionError ? (
                        <p
                          className="text-xs text-[var(--color-destructive)]"
                          role="alert"
                        >
                          {actionError}
                        </p>
                      ) : null}
                    </form>
                  ) : null}
                </div>
              ) : null}

              {intent === "delivery" ? (
                <div className="flex flex-col gap-4" data-testid="cockpit-delivery">
                  <ProjectOperationalPanel projectId={projectId} />
                  <ProjectDeliveryDashboardPanel projectId={projectId} />
                  {needsTasks ? (
                    <TaskSurface
                      surface={surface}
                      tasks={tasks}
                      backlog={backlog}
                      sprintTasks={sprintTasks}
                      statusOptions={statusOptions}
                      permissions={permissions}
                      taskTitle={taskTitle}
                      setTaskTitle={setTaskTitle}
                      onCreate={() => createMutation.mutate()}
                      createPending={createMutation.isPending}
                      loading={tasksQuery.isLoading}
                      error={tasksQuery.error}
                      onRetry={() => void tasksQuery.refetch()}
                    />
                  ) : null}
                </div>
              ) : null}

              {intent === "planning" ? (
                <div className="flex flex-col gap-4" data-testid="cockpit-planning">
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Planning trajectory — milestones and due-date roadmap. Advanced
                    Gantt remains under More when schedule mechanics are required.
                  </p>
                  <ProjectMilestonesPanel
                    projectId={projectId}
                    permissions={permissions}
                  />
                  {surface === "roadmap" || !surface ? (
                    tasksQuery.isSuccess ? (
                      <TaskSurface
                        surface="roadmap"
                        tasks={roadmap}
                        backlog={backlog}
                        sprintTasks={sprintTasks}
                        statusOptions={statusOptions}
                        permissions={permissions}
                        taskTitle={taskTitle}
                        setTaskTitle={setTaskTitle}
                        onCreate={() => undefined}
                        createPending={false}
                        loading={tasksQuery.isLoading}
                        error={tasksQuery.error}
                        onRetry={() => void tasksQuery.refetch()}
                        hideCreate
                      />
                    ) : null
                  ) : null}
                </div>
              ) : null}

              {intent === "control" ? (
                <div className="flex flex-col gap-4" data-testid="cockpit-control">
                  <ProjectControlSurface projectId={projectId} />
                  {surface === "risks" || !surface ? (
                    <ProjectRisksPanel
                      projectId={projectId}
                      permissions={permissions}
                    />
                  ) : null}
                  {surface === "decisions" ? (
                    <ProjectDecisionsPanel
                      projectId={projectId}
                      permissions={permissions}
                    />
                  ) : null}
                  {surface === "actions" ? (
                    <ProjectActionsPanel
                      projectId={projectId}
                      permissions={permissions}
                    />
                  ) : null}
                </div>
              ) : null}

              {intent === "history" ? (
                <div className="flex flex-col gap-4" data-testid="cockpit-history">
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Operational changes that matter for this project — exceptions,
                    lifecycle transitions, and delivery mutations. Object-level history
                    remains available on each register surface.
                  </p>
                  <ProjectControlSurface projectId={projectId} />
                  <ProjectLifecyclePanel
                    projectId={projectId}
                    projectStatus={project.status}
                  />
                </div>
              ) : null}
            </main>
          </div>
        ) : null}
      </ProjectsWorkspaceFrame>
    </PageShell>
  );
}

function TaskSurface({
  surface,
  tasks,
  backlog,
  sprintTasks,
  statusOptions,
  permissions,
  taskTitle,
  setTaskTitle,
  onCreate,
  createPending,
  loading,
  error,
  onRetry,
  hideCreate,
}: {
  readonly surface?: CockpitSurface;
  readonly tasks: readonly Task[];
  readonly backlog: readonly Task[];
  readonly sprintTasks: readonly Task[];
  readonly statusOptions: ReturnType<typeof statusOptionsFromTasks>;
  readonly permissions?: ProjectsPermissionSource;
  readonly taskTitle: string;
  readonly setTaskTitle: (v: string) => void;
  readonly onCreate: () => void;
  readonly createPending: boolean;
  readonly loading: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
  readonly hideCreate?: boolean;
}) {
  const rows =
    surface === "backlog"
      ? backlog
      : surface === "sprints"
        ? sprintTasks
        : surface === "roadmap"
          ? tasks
          : tasks;
  const emptyTitle =
    surface === "backlog"
      ? "Backlog is empty"
      : surface === "sprints"
        ? "No sprint-assigned tasks"
        : surface === "roadmap"
          ? "No tasks with due dates"
          : "No tasks yet";

  return (
    <div className="flex flex-col gap-3" data-testid="cockpit-task-surface">
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Legacy work-management surface (More…). Commitments remain the operational SoR
        for delivery.
      </p>
      {loading ? <LoadingState label="Loading tasks…" /> : null}
      {error ? (
        <ErrorState
          message={isProjectsApiError(error) ? error.message : "Unable to load tasks."}
          onRetry={onRetry}
        />
      ) : null}
      {!hideCreate && surface === "tasks" && canManageTasks(permissions) ? (
        <form
          className="flex flex-wrap items-end gap-2"
          data-testid="projects-detail-task-create"
          onSubmit={(event) => {
            event.preventDefault();
            if (taskTitle.trim()) onCreate();
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
            disabled={createPending || !taskTitle.trim()}
            data-testid="projects-detail-task-submit"
          >
            Add task
          </Button>
        </form>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <ProjectsTable
          headers={
            surface === "tasks"
              ? ["Title", "Status", "Priority", "Sprint", "Due", "Actions"]
              : ["Title", "Status", "Priority", "Sprint", "Due"]
          }
        >
          {rows.map((task) => (
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
              {surface === "tasks" ? (
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
      )}
    </div>
  );
}

/** W002 Project Cockpit — Focus Navigation replaces entity tab strip. */
export function ProjectCockpit(props: {
  readonly projectId: string;
  readonly pathSegment?: string;
  readonly permissions?: ProjectsPermissionSource;
}) {
  return (
    <Suspense fallback={<LoadingState label="Loading cockpit…" />}>
      <ProjectCockpitInner {...props} />
    </Suspense>
  );
}
