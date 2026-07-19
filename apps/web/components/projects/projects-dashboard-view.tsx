"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import {
  canManageProjects,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import { listProjects } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import {
  projectCreatePath,
  projectDetailPath,
  projectsListPath,
} from "@/lib/projects/routes";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  ProjectsTable,
  StatusBadge,
} from "./projects-ui";

export function ProjectsDashboardView({
  permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const query = useQuery({
    queryKey: projectsQueryKeys.list({ status: "active", perPage: 10, page: 1 }),
    queryFn: ({ signal }) =>
      listProjects({ status: "active", perPage: 10, page: 1 }, { signal }),
  });

  const canCreate = canManageProjects(permissions);
  const items = query.data?.items ?? [];

  return (
    <PageShell
      title="Dashboard"
      description="Overview of active projects in your workspace."
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(projectsListPath())}
            data-testid="projects-dashboard-all"
          >
            All projects
          </Button>
          {canCreate ? (
            <Button
              type="button"
              size="sm"
              onClick={() => router.push(projectCreatePath())}
              data-testid="projects-dashboard-create"
            >
              New project
            </Button>
          ) : null}
        </>
      }
    >
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isProjectsApiError(query.error)
              ? query.error.message
              : "Unable to load projects."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && items.length === 0 ? (
        <EmptyState
          title="No active projects"
          description="Create a project to start planning work."
          action={
            canCreate ? (
              <Button
                type="button"
                size="sm"
                onClick={() => router.push(projectCreatePath())}
              >
                New project
              </Button>
            ) : null
          }
        />
      ) : null}
      {query.isSuccess && items.length > 0 ? (
        <ProjectsTable headers={["Name", "Identifier", "Status", "Updated"]}>
          {items.map((project) => (
            <tr
              key={project.id}
              className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/20"
              onClick={() => router.push(projectDetailPath(project.id))}
              data-testid={`projects-row-${project.id}`}
            >
              <td className="px-3 py-2 font-medium">{project.name}</td>
              <td className="px-3 py-2">{project.identifier}</td>
              <td className="px-3 py-2">
                <StatusBadge status={project.status} />
              </td>
              <td className="px-3 py-2">{formatProjectsDate(project.updatedAt)}</td>
            </tr>
          ))}
        </ProjectsTable>
      ) : null}
    </PageShell>
  );
}
