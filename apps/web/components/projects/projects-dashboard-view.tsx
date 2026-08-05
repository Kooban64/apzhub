"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import {
  canManageProjects,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import {
  readOnboardingDismissed,
  writeOnboardingDismissed,
} from "@/lib/projects/preferences";
import { listProjects } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import {
  projectCreatePath,
  projectDetailPath,
  projectsHelpPath,
  projectsListPath,
  projectsSearchPath,
} from "@/lib/projects/routes";

import {
  ContextSection,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  ProjectsTable,
  ProjectsWorkspaceFrame,
  StatusBadge,
} from "./projects-ui";

export function ProjectsDashboardView({
  permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const query = useQuery({
    queryKey: projectsQueryKeys.list({ status: "active", perPage: 10, page: 1 }),
    queryFn: ({ signal }) =>
      listProjects({ status: "active", perPage: 10, page: 1 }, { signal }),
  });

  useEffect(() => {
    setShowOnboarding(!readOnboardingDismissed());
  }, []);

  const canCreate = canManageProjects(permissions);
  const items = query.data?.items ?? [];

  return (
    <PageShell
      title="Dashboard"
      description="Overview of active projects in your APZHUB workspace."
      breadcrumbs={["APZ Projects", "Dashboard"]}
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
      <ProjectsWorkspaceFrame
        context={
          <>
            <ContextSection title="Quick actions">
              <div className="flex flex-col gap-2" data-testid="projects-quick-actions">
                {canCreate ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => router.push(projectCreatePath())}
                  >
                    New project
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(projectsSearchPath())}
                >
                  Search APZ Projects
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(projectsHelpPath())}
                >
                  Open help
                </Button>
              </div>
            </ContextSection>
          </>
        }
      >
        {showOnboarding ? (
          <div
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/10 px-4 py-3"
            data-testid="projects-onboarding-tip"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]">
                  Getting started with APZ Projects
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  Create a project, organise tasks, and keep delivery visible inside
                  APZHUB.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  writeOnboardingDismissed(true);
                  setShowOnboarding(false);
                }}
                data-testid="projects-onboarding-dismiss"
              >
                Dismiss
              </Button>
            </div>
          </div>
        ) : null}

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
            description="Create a project to start planning work in APZ Projects."
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
      </ProjectsWorkspaceFrame>
    </PageShell>
  );
}
