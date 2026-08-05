"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatSprintGroupLabel } from "@/lib/projects/format";
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

/**
 * Sprint board: groups tasks that already belong to a sprint.
 * Product-safe labels only — no engine/API honesty chrome.
 */
export function ProjectsSprintsView({
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
  const sprintGroups = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of tasksQuery.data?.items ?? []) {
      if (!task.sprintId) continue;
      map.set(task.sprintId, (map.get(task.sprintId) ?? 0) + 1);
    }
    return [...map.entries()].map(([sprintId, count], index) => ({
      sprintId,
      count,
      label: formatSprintGroupLabel(sprintId, index),
    }));
  }, [tasksQuery.data]);

  const sprintLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of sprintGroups) {
      map.set(group.sprintId, group.label);
    }
    return map;
  }, [sprintGroups]);

  const sprintTasks = (tasksQuery.data?.items ?? []).filter((task) =>
    Boolean(task.sprintId),
  );

  return (
    <PageShell
      title="Sprints"
      description="Tasks grouped by sprint for the selected project."
      breadcrumbs={["APZ Projects", "Sprints"]}
    >
      <ProjectPicker
        projects={projects}
        value={projectId}
        onChange={setProjectId}
        testId="projects-sprints-picker"
      />
      {!projectId ? (
        <EmptyState
          title="Select a project"
          description="Choose a project to review sprint groupings."
        />
      ) : null}
      {projectId && tasksQuery.isLoading ? <LoadingState /> : null}
      {projectId && tasksQuery.isError ? (
        <ErrorState
          message={
            isProjectsApiError(tasksQuery.error)
              ? tasksQuery.error.message
              : "Unable to load sprint tasks."
          }
          onRetry={() => void tasksQuery.refetch()}
        />
      ) : null}
      {projectId && tasksQuery.isSuccess && sprintGroups.length === 0 ? (
        <EmptyState
          title="No sprint assignments"
          description="Tasks assigned to a sprint will appear here."
        />
      ) : null}
      {projectId && sprintGroups.length > 0 ? (
        <>
          <ProjectsTable headers={["Sprint", "Tasks"]}>
            {sprintGroups.map((group) => (
              <tr
                key={group.sprintId}
                className="border-b border-[var(--color-border)] last:border-0"
                data-testid={`projects-sprint-group-${group.sprintId}`}
              >
                <td className="px-3 py-2 font-medium">{group.label}</td>
                <td className="px-3 py-2">{group.count}</td>
              </tr>
            ))}
          </ProjectsTable>
          <ProjectsTable headers={["Title", "Status", "Sprint"]}>
            {sprintTasks.map((task) => (
              <tr
                key={task.id}
                className="border-b border-[var(--color-border)] last:border-0"
              >
                <td className="px-3 py-2 font-medium">{task.title}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-3 py-2">
                  {task.sprintId
                    ? (sprintLabelById.get(task.sprintId) ?? "Sprint")
                    : "Unavailable"}
                </td>
              </tr>
            ))}
          </ProjectsTable>
        </>
      ) : null}
    </PageShell>
  );
}
