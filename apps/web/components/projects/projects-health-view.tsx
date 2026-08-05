"use client";

import { useQuery } from "@tanstack/react-query";

import { isProjectsApiError } from "@/lib/projects/errors";
import { getProjectsPlatformHealth } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { createHttpSearchClient } from "@/lib/search/search-client";

import { ErrorState, LoadingState, PageShell } from "./projects-ui";

const searchClient = createHttpSearchClient();

function statusLabel(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "boolean") return value ? "Healthy" : "Unavailable";
  if (value == null) return "Unavailable";
  return "Available";
}

/**
 * Operator readiness surface for APZ Projects — human summary only.
 * Never dumps raw diagnostics JSON into the product UI.
 */
export function ProjectsHealthView() {
  const healthQuery = useQuery({
    queryKey: projectsQueryKeys.health(),
    queryFn: ({ signal }) => getProjectsPlatformHealth({ signal }),
  });

  const searchHealthQuery = useQuery({
    queryKey: [...projectsQueryKeys.health(), "search"],
    queryFn: ({ signal }) => searchClient.getHealth({ signal }),
  });

  const searchDiagnosticsQuery = useQuery({
    queryKey: [...projectsQueryKeys.health(), "search-diagnostics"],
    queryFn: ({ signal }) => searchClient.getDiagnostics({ signal }),
  });

  const searchAuditQuery = useQuery({
    queryKey: [...projectsQueryKeys.health(), "search-audit"],
    queryFn: ({ signal }) => searchClient.listAudit({ signal }),
  });

  const searchStatus = statusLabel(
    (searchHealthQuery.data as { status?: string } | undefined)?.status ??
      searchHealthQuery.data,
  );
  const diagnosticsReady = Boolean(searchDiagnosticsQuery.data);
  const recentAuditCount = searchAuditQuery.data?.items?.length ?? 0;

  return (
    <PageShell
      title="Readiness"
      description="Operator summary of APZ Projects availability inside APZHUB."
      breadcrumbs={["APZ Projects", "Readiness"]}
    >
      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="projects-health-platform"
      >
        <h2 className="text-sm font-semibold">Product availability</h2>
        {healthQuery.isLoading ? <LoadingState /> : null}
        {healthQuery.isError ? (
          <ErrorState
            message={
              isProjectsApiError(healthQuery.error)
                ? healthQuery.error.message
                : "Unable to load product readiness."
            }
            onRetry={() => void healthQuery.refetch()}
          />
        ) : null}
        {healthQuery.data ? (
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd data-testid="projects-health-status">
                {statusLabel(healthQuery.data.status)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Version</dt>
              <dd>{healthQuery.data.version ?? "—"}</dd>
            </div>
            {healthQuery.data.checks
              ? Object.entries(healthQuery.data.checks).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-[var(--color-muted-foreground)]">{key}</dt>
                    <dd>{statusLabel(value)}</dd>
                  </div>
                ))
              : null}
          </dl>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="projects-health-search"
      >
        <h2 className="text-sm font-semibold">Search readiness</h2>
        {searchHealthQuery.isLoading ? (
          <LoadingState label="Loading search readiness…" />
        ) : null}
        {searchHealthQuery.isSuccess ? (
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Search status</dt>
              <dd>{searchStatus}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Diagnostics</dt>
              <dd>{diagnosticsReady ? "Available" : "Unavailable"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Recent activity</dt>
              <dd>
                {searchAuditQuery.isLoading
                  ? "Loading…"
                  : `${Math.min(recentAuditCount, 10)} recent entries`}
              </dd>
            </div>
          </dl>
        ) : null}
        {searchHealthQuery.isError ? (
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Search readiness is temporarily unavailable.
          </p>
        ) : null}
      </section>
    </PageShell>
  );
}
