"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import { listProjects, listTasks } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  ProjectPicker,
  ProjectsTable,
  StatusBadge,
} from "./projects-ui";

/** Roadmap: due-date ordered tasks for the selected project. */
export function ProjectsRoadmapView({
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
  const roadmap = useMemo(
    () =>
      [...(tasksQuery.data?.items ?? [])]
        .filter((task) => task.dueDate)
        .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate))),
    [tasksQuery.data],
  );

  return (
    <PageShell
      title="Roadmap"
      description="Tasks with due dates, ordered for planning."
      breadcrumbs={["APZ Projects", "Roadmap"]}
    >
      <ProjectPicker
        projects={projects}
        value={projectId}
        onChange={setProjectId}
        testId="projects-roadmap-picker"
      />
      {!projectId ? (
        <EmptyState
          title="Select a project"
          description="Choose a project to review dated work."
        />
      ) : null}
      {projectId && tasksQuery.isLoading ? <LoadingState /> : null}
      {projectId && tasksQuery.isError ? (
        <ErrorState
          message={
            isProjectsApiError(tasksQuery.error)
              ? tasksQuery.error.message
              : "Unable to load roadmap."
          }
          onRetry={() => void tasksQuery.refetch()}
        />
      ) : null}
      {projectId && tasksQuery.isSuccess && roadmap.length === 0 ? (
        <EmptyState
          title="No dated tasks"
          description="Tasks with due dates appear here."
        />
      ) : null}
      {projectId && roadmap.length > 0 ? (
        <ProjectsTable headers={["Due", "Title", "Status"]}>
          {roadmap.map((task) => (
            <tr
              key={task.id}
              className="border-b border-[var(--color-border)] last:border-0"
              data-testid={`projects-roadmap-row-${task.id}`}
            >
              <td className="px-3 py-2">{formatProjectsDate(task.dueDate)}</td>
              <td className="px-3 py-2 font-medium">{task.title}</td>
              <td className="px-3 py-2">
                <StatusBadge status={task.status} />
              </td>
            </tr>
          ))}
        </ProjectsTable>
      ) : null}
    </PageShell>
  );
}
