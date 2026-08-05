"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import { listProjects, listTasks } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

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

export function ProjectsBacklogView({
  permissions: _permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const [projectId, setProjectId] = useState("");

  const projectsQuery = useQuery({
    queryKey: projectsQueryKeys.list({ status: "active", perPage: 100, page: 1 }),
    queryFn: ({ signal }) =>
      listProjects({ status: "active", perPage: 100, page: 1 }, { signal }),
  });

  const tasksQuery = useQuery({
    queryKey: projectsQueryKeys.tasks({ projectId, perPage: 100, page: 1 }),
    queryFn: ({ signal }) =>
      listTasks({ projectId, perPage: 100, page: 1 }, { signal }),
    enabled: Boolean(projectId),
  });

  const projects = useMemo(() => projectsQuery.data?.items ?? [], [projectsQuery.data]);
  const backlog = (tasksQuery.data?.items ?? []).filter((task) => !task.sprintId);

  return (
    <PageShell
      title="Backlog"
      description="Tasks not yet assigned to a sprint."
      breadcrumbs={["APZ Projects", "Backlog"]}
    >
      <ProjectPicker
        projects={projects}
        value={projectId}
        onChange={setProjectId}
        testId="projects-backlog-picker"
      />
      {!projectId ? <EmptyState title="Select a project" /> : null}
      {projectId && tasksQuery.isLoading ? <LoadingState /> : null}
      {projectId && tasksQuery.isError ? (
        <ErrorState
          message={
            isProjectsApiError(tasksQuery.error)
              ? tasksQuery.error.message
              : "Unable to load backlog."
          }
          onRetry={() => void tasksQuery.refetch()}
        />
      ) : null}
      {projectId && tasksQuery.isSuccess && backlog.length === 0 ? (
        <EmptyState title="Backlog is empty" />
      ) : null}
      {projectId && backlog.length > 0 ? (
        <ProjectsTable headers={["Title", "Status", "Priority"]}>
          {backlog.map((task) => (
            <tr
              key={task.id}
              className="border-b border-[var(--color-border)] last:border-0"
              data-testid={`projects-backlog-row-${task.id}`}
            >
              <td className="px-3 py-2 font-medium">{task.title}</td>
              <td className="px-3 py-2">
                <StatusBadge status={task.status} />
              </td>
              <td className="px-3 py-2">
                <PriorityBadge priority={task.priority} />
              </td>
            </tr>
          ))}
        </ProjectsTable>
      ) : null}
    </PageShell>
  );
}
