"use client";

import { useQuery } from "@tanstack/react-query";

import { isProjectsApiError } from "@/lib/projects/errors";
import { getProjectsPlatformHealth } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { createHttpSearchClient } from "@/lib/search/search-client";

import { ErrorState, LoadingState, PageShell } from "./projects-ui";

const searchClient = createHttpSearchClient();

/**
 * Product health / diagnostics / audit surface.
 * Consumes existing Platform health + Search diagnostics — no platform redesign.
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

  return (
    <PageShell
      title="Health & diagnostics"
      description="Platform health, search diagnostics, and audit for the Projects product."
    >
      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="projects-health-platform"
      >
        <h2 className="text-sm font-semibold">Platform API health</h2>
        {healthQuery.isLoading ? <LoadingState /> : null}
        {healthQuery.isError ? (
          <ErrorState
            message={
              isProjectsApiError(healthQuery.error)
                ? healthQuery.error.message
                : "Unable to load platform health."
            }
            onRetry={() => void healthQuery.refetch()}
          />
        ) : null}
        {healthQuery.data ? (
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd data-testid="projects-health-status">{healthQuery.data.status}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Version</dt>
              <dd>{healthQuery.data.version ?? "—"}</dd>
            </div>
            {healthQuery.data.checks
              ? Object.entries(healthQuery.data.checks).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-[var(--color-muted-foreground)]">{key}</dt>
                    <dd>{value}</dd>
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
        <h2 className="text-sm font-semibold">Search health</h2>
        {searchHealthQuery.isLoading ? (
          <LoadingState label="Loading search health…" />
        ) : null}
        {searchHealthQuery.data ? (
          <pre className="mt-3 overflow-x-auto text-xs">
            {JSON.stringify(searchHealthQuery.data, null, 2)}
          </pre>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="projects-diagnostics"
      >
        <h2 className="text-sm font-semibold">Search diagnostics</h2>
        {searchDiagnosticsQuery.isLoading ? (
          <LoadingState label="Loading diagnostics…" />
        ) : null}
        {searchDiagnosticsQuery.data ? (
          <pre className="mt-3 overflow-x-auto text-xs">
            {JSON.stringify(searchDiagnosticsQuery.data, null, 2)}
          </pre>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="projects-audit"
      >
        <h2 className="text-sm font-semibold">Search audit (recent)</h2>
        {searchAuditQuery.isLoading ? <LoadingState label="Loading audit…" /> : null}
        {searchAuditQuery.data ? (
          <pre className="mt-3 overflow-x-auto text-xs">
            {JSON.stringify(searchAuditQuery.data.items.slice(0, 10), null, 2)}
          </pre>
        ) : null}
      </section>
    </PageShell>
  );
}
