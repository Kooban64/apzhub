"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import {
  canManageProjects,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import { listProjects } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { projectCreatePath, projectDetailPath } from "@/lib/projects/routes";
import type { ProjectListParams } from "@/lib/projects/types";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  ProjectsTable,
  StatusBadge,
} from "./projects-ui";

function readParams(searchParams: URLSearchParams): ProjectListParams {
  const status = searchParams.get("status");
  return {
    status:
      status === "active" || status === "archived" || status === "all"
        ? status
        : "active",
    sort: searchParams.get("sort") ?? "updatedAt",
    order: (searchParams.get("order") as "asc" | "desc" | null) ?? "desc",
    page: Number(searchParams.get("page") ?? "1") || 1,
    perPage: Number(searchParams.get("perPage") ?? "20") || 20,
  };
}

export function ProjectsListView({
  permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useMemo(() => readParams(searchParams), [searchParams]);
  const filterText = searchParams.get("q") ?? "";

  const query = useQuery({
    queryKey: projectsQueryKeys.list(params),
    queryFn: ({ signal }) => listProjects(params, { signal }),
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const canCreate = canManageProjects(permissions);
  const items = (query.data?.items ?? []).filter((project) => {
    if (!filterText.trim()) return true;
    const needle = filterText.trim().toLowerCase();
    return (
      project.name.toLowerCase().includes(needle) ||
      project.identifier.toLowerCase().includes(needle)
    );
  });

  return (
    <PageShell
      title="All projects"
      description="Searchable directory of projects in APZ Projects."
      breadcrumbs={["APZ Projects", "All projects"]}
      actions={
        canCreate ? (
          <Button
            type="button"
            size="sm"
            onClick={() => router.push(projectCreatePath())}
            data-testid="projects-list-create"
          >
            New project
          </Button>
        ) : null
      }
    >
      <div
        className="grid gap-3 rounded-lg border border-[var(--color-border)] p-3 md:grid-cols-3"
        data-testid="projects-list-filters"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Status</span>
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
            value={params.status ?? "active"}
            onChange={(event) => updateParam("status", event.target.value)}
            data-testid="projects-filter-status"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </label>
        <Input
          label="Filter"
          value={filterText}
          onChange={(event) => updateParam("q", event.target.value)}
          data-testid="projects-filter-search"
        />
      </div>

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
          title="No projects found"
          description="Adjust filters or create a new project in APZ Projects."
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
              data-testid={`projects-list-row-${project.id}`}
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
