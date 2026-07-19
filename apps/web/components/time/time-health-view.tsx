"use client";

import { useQuery } from "@tanstack/react-query";

import { isTimeApiError } from "@/lib/time/errors";
import { formatSafeDiagnosticsJson } from "@/lib/time/format";
import { timeQueryKeys } from "@/lib/time/query-keys";
import { createHttpSearchClient } from "@/lib/search/search-client";
import { getTimeDiagnostics, getTimeHealth } from "@/lib/time/time-api";

import { ErrorState, LoadingState, PageShell } from "./time-ui";

const searchClient = createHttpSearchClient();

/**
 * Product health / diagnostics / audit surface.
 * Consumes Time health + optional Search diagnostics — no platform redesign.
 */
export function TimeHealthView() {
  const healthQuery = useQuery({
    queryKey: timeQueryKeys.health(),
    queryFn: ({ signal }) => getTimeHealth({ signal }),
  });

  const diagnosticsQuery = useQuery({
    queryKey: timeQueryKeys.diagnostics(),
    queryFn: ({ signal }) => getTimeDiagnostics({ signal }),
  });

  const searchHealthQuery = useQuery({
    queryKey: [...timeQueryKeys.health(), "search"],
    queryFn: ({ signal }) => searchClient.getHealth({ signal }),
  });

  const searchDiagnosticsQuery = useQuery({
    queryKey: [...timeQueryKeys.health(), "search-diagnostics"],
    queryFn: ({ signal }) => searchClient.getDiagnostics({ signal }),
  });

  const searchAuditQuery = useQuery({
    queryKey: [...timeQueryKeys.health(), "search-audit"],
    queryFn: ({ signal }) => searchClient.listAudit({ signal }),
  });

  return (
    <PageShell
      title="Health"
      description="Time platform health, diagnostics, and optional search audit."
    >
      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="time-health-platform"
      >
        <h2 className="text-sm font-semibold">Time API health</h2>
        {healthQuery.isLoading ? <LoadingState /> : null}
        {healthQuery.isError ? (
          <ErrorState
            message={
              isTimeApiError(healthQuery.error)
                ? healthQuery.error.message
                : "Unable to load Time health."
            }
            onRetry={() => void healthQuery.refetch()}
          />
        ) : null}
        {healthQuery.data ? (
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd data-testid="time-health-status">{healthQuery.data.status}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Version</dt>
              <dd>{healthQuery.data.version ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Observed</dt>
              <dd>{healthQuery.data.observedAt ?? "—"}</dd>
            </div>
            {Array.isArray(healthQuery.data.checks)
              ? healthQuery.data.checks.map((check) => (
                  <div key={check.name}>
                    <dt className="text-[var(--color-muted-foreground)]">
                      {check.name}
                    </dt>
                    <dd>{check.status}</dd>
                  </div>
                ))
              : healthQuery.data.checks
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
        data-testid="time-health-diagnostics"
      >
        <h2 className="text-sm font-semibold">Time diagnostics</h2>
        {diagnosticsQuery.isLoading ? (
          <LoadingState label="Loading diagnostics…" />
        ) : null}
        {diagnosticsQuery.isError ? (
          <ErrorState
            message={
              isTimeApiError(diagnosticsQuery.error)
                ? diagnosticsQuery.error.message
                : "Unable to load Time diagnostics."
            }
            onRetry={() => void diagnosticsQuery.refetch()}
          />
        ) : null}
        {diagnosticsQuery.data ? (
          <pre className="mt-3 overflow-x-auto text-xs">
            {formatSafeDiagnosticsJson(diagnosticsQuery.data)}
          </pre>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="time-health-search"
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
        data-testid="time-health-search-diagnostics"
      >
        <h2 className="text-sm font-semibold">Search diagnostics</h2>
        {searchDiagnosticsQuery.isLoading ? (
          <LoadingState label="Loading search diagnostics…" />
        ) : null}
        {searchDiagnosticsQuery.data ? (
          <pre className="mt-3 overflow-x-auto text-xs">
            {JSON.stringify(searchDiagnosticsQuery.data, null, 2)}
          </pre>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="time-health-audit"
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
