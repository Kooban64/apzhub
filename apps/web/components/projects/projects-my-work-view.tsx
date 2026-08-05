"use client";

import { useSession } from "@apzhub/auth";
import { Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import { readLastProjectId, writeLastProjectId } from "@/lib/projects/preferences";
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

export function ProjectsMyWorkView({
  permissions: _permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id ?? "";
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [assigneeSeeded, setAssigneeSeeded] = useState(false);

  useEffect(() => {
    const last = readLastProjectId();
    if (last) setProjectId(last);
  }, []);

  useEffect(() => {
    if (!assigneeSeeded && sessionUserId) {
      setAssigneeId(sessionUserId);
      setAssigneeSeeded(true);
    }
  }, [assigneeSeeded, sessionUserId]);

  const projectsQuery = useQuery({
    queryKey: projectsQueryKeys.list({ status: "active", perPage: 100, page: 1 }),
    queryFn: ({ signal }) =>
      listProjects({ status: "active", perPage: 100, page: 1 }, { signal }),
  });

  const tasksQuery = useQuery({
    queryKey: projectsQueryKeys.tasks({
      projectId,
      assigneeId: assigneeId || undefined,
      perPage: 50,
      page: 1,
    }),
    queryFn: ({ signal }) =>
      listTasks(
        {
          projectId,
          assigneeId: assigneeId || undefined,
          perPage: 50,
          page: 1,
          sort: "updatedAt",
          order: "desc",
        },
        { signal },
      ),
    enabled: Boolean(projectId),
  });

  const projects = useMemo(() => projectsQuery.data?.items ?? [], [projectsQuery.data]);
  const tasks = tasksQuery.data?.items ?? [];

  return (
    <PageShell
      title="My work"
      description="Tasks assigned to you within a selected project."
      breadcrumbs={["APZ Projects", "My work"]}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <ProjectPicker
          projects={projects}
          value={projectId}
          onChange={(next) => {
            setProjectId(next);
            writeLastProjectId(next);
          }}
          testId="projects-mywork-picker"
        />
        <Input
          label="Assignee"
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
          data-testid="projects-mywork-assignee"
        />
      </div>
      {sessionUserId ? (
        <p
          className="text-xs text-[var(--color-muted-foreground)]"
          data-testid="projects-mywork-session-hint"
        >
          Assignee defaults to you. Your last selected project is restored for this
          browser session.
        </p>
      ) : null}
      {!projectId ? (
        <EmptyState
          title="Select a project"
          description="Choose a project to see your assigned work."
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
        <EmptyState
          title="No matching tasks"
          description="No tasks match this project and assignee filter."
        />
      ) : null}
      {projectId && tasks.length > 0 ? (
        <ProjectsTable headers={["Title", "Status", "Priority", "Updated"]}>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-[var(--color-border)] last:border-0"
              data-testid={`projects-mywork-row-${task.id}`}
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
    </PageShell>
  );
}
