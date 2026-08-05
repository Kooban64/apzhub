"use client";

import { useQuery } from "@tanstack/react-query";

import { isTimeApiError } from "@/lib/time/errors";
import { timeQueryKeys } from "@/lib/time/query-keys";
import { createHttpSearchClient } from "@/lib/search/search-client";
import { getTimeDiagnostics, getTimeHealth } from "@/lib/time/time-api";

import { DeveloperDetails, ErrorState, LoadingState, PageShell } from "./time-ui";

const searchClient = createHttpSearchClient();

/**
 * Operator health surface — user-friendly status first; JSON behind disclosure.
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
      description="Operator health for APZ Time. End-user work continues from Overview and Timesheets."
      breadcrumbs={["APZ Time", "Health"]}
    >
      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="time-health-platform"
      >
        <h2 className="text-sm font-semibold">APZ Time status</h2>
        {healthQuery.isLoading ? <LoadingState /> : null}
        {healthQuery.isError ? (
          <ErrorState
            message={
              isTimeApiError(healthQuery.error)
                ? healthQuery.error.message
                : "Unable to load APZ Time health."
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
        className="space-y-3 rounded-lg border border-[var(--color-border)] p-4"
        data-testid="time-health-diagnostics"
      >
        <h2 className="text-sm font-semibold">Support details</h2>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Expand only for support investigations. Values are redacted for safe display.
        </p>
        {diagnosticsQuery.isLoading ? (
          <LoadingState label="Loading diagnostics…" />
        ) : null}
        {diagnosticsQuery.isError ? (
          <ErrorState
            message={
              isTimeApiError(diagnosticsQuery.error)
                ? diagnosticsQuery.error.message
                : "Unable to load APZ Time diagnostics."
            }
            onRetry={() => void diagnosticsQuery.refetch()}
          />
        ) : null}
        {diagnosticsQuery.data ? (
          <DeveloperDetails
            title="Platform diagnostics"
            value={diagnosticsQuery.data}
          />
        ) : null}
        {searchHealthQuery.isLoading ? (
          <LoadingState label="Loading search health…" />
        ) : null}
        {searchHealthQuery.data ? (
          <DeveloperDetails
            title="Search health detail"
            value={searchHealthQuery.data}
            testId="time-health-search"
          />
        ) : null}
        {searchDiagnosticsQuery.data ? (
          <DeveloperDetails
            title="Search diagnostics detail"
            value={searchDiagnosticsQuery.data}
            testId="time-health-search-diagnostics"
          />
        ) : null}
        {searchAuditQuery.data ? (
          <DeveloperDetails
            title="Recent search audit"
            value={searchAuditQuery.data.items.slice(0, 10)}
            testId="time-health-audit"
          />
        ) : null}
      </section>
    </PageShell>
  );
}
