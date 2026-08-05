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

import { ProjectsTaskActions } from "./projects-task-actions";
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

export function ProjectsTasksView({
  permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const [projectId, setProjectId] = useState("");

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
  const statusOptions = useMemo(() => statusOptionsFromTasks(tasks), [tasks]);

  return (
    <PageShell
      title="Tasks"
      description="Tasks for the selected project in APZ Projects."
      breadcrumbs={["APZ Projects", "Tasks"]}
    >
      <ProjectPicker
        projects={projects}
        value={projectId}
        onChange={(next) => {
          setProjectId(next);
          writeLastProjectId(next);
        }}
        testId="projects-tasks-picker"
      />
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
      {projectId && tasks.length > 0 ? (
        <ProjectsTable headers={["Title", "Status", "Priority", "Updated", "Actions"]}>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-[var(--color-border)] last:border-0 align-top"
              data-testid={`projects-tasks-row-${task.id}`}
            >
              <td className="px-3 py-2 font-medium">{task.title}</td>
              <td className="px-3 py-2">
                <StatusBadge status={task.status} />
              </td>
              <td className="px-3 py-2">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className="px-3 py-2">{formatProjectsDate(task.updatedAt)}</td>
              <td className="px-3 py-2">
                <ProjectsTaskActions
                  task={task}
                  statusOptions={statusOptions}
                  permissions={permissions}
                />
              </td>
            </tr>
          ))}
        </ProjectsTable>
      ) : null}
    </PageShell>
  );
}
