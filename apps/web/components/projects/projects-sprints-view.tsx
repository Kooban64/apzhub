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
  ProjectPicker,
  ProjectsTable,
  StatusBadge,
} from "./projects-ui";

/**
 * Sprint board (Phase 1): groups Platform tasks by sprintId.
 * Dedicated sprint CRUD HTTP is out of scope unless added over existing ProjectService
 * without adapter changes — Wave 1 sprint entities remain available via task.sprintId.
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
    return [...map.entries()].map(([sprintId, count]) => ({ sprintId, count }));
  }, [tasksQuery.data]);

  const sprintTasks = (tasksQuery.data?.items ?? []).filter((task) =>
    Boolean(task.sprintId),
  );

  return (
    <PageShell
      title="Sprints"
      description="Groups Platform tasks by their sprint field. This is not a dedicated sprint board API — sprint list/CRUD HTTP is out of scope for Release 1.1."
    >
      <p
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/20 px-3 py-2 text-sm text-[var(--color-muted-foreground)]"
        data-testid="projects-sprints-honesty"
      >
        Honesty: sprint names/entities are not listed via HTTP. Counts below come from{" "}
        <code className="text-xs">task.sprintId</code> on loaded project tasks.
      </p>
      <ProjectPicker
        projects={projects}
        value={projectId}
        onChange={setProjectId}
        testId="projects-sprints-picker"
      />
      {!projectId ? <EmptyState title="Select a project" /> : null}
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
          description="Tasks with sprint IDs will appear here."
        />
      ) : null}
      {projectId && sprintGroups.length > 0 ? (
        <>
          <ProjectsTable headers={["Sprint ID", "Tasks"]}>
            {sprintGroups.map((group) => (
              <tr
                key={group.sprintId}
                className="border-b border-[var(--color-border)] last:border-0"
                data-testid={`projects-sprint-group-${group.sprintId}`}
              >
                <td className="px-3 py-2 font-mono text-xs">{group.sprintId}</td>
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
                <td className="px-3 py-2 font-mono text-xs">{task.sprintId}</td>
              </tr>
            ))}
          </ProjectsTable>
        </>
      ) : null}
    </PageShell>
  );
}
