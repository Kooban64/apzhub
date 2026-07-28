"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getAnalyticsCapabilities,
  getAnalyticsHealth,
  getAnalyticsReadiness,
} from "@/lib/analytics/analytics-api";
import { isAnalyticsApiError } from "@/lib/analytics/errors";
import { analyticsQueryKeys } from "@/lib/analytics/query-keys";

import { ErrorState, LoadingState, PageShell } from "./analytics-ui";

export function AnalyticsHealthView() {
  const healthQuery = useQuery({
    queryKey: analyticsQueryKeys.health(),
    queryFn: ({ signal }) => getAnalyticsHealth({ signal }),
  });
  const readinessQuery = useQuery({
    queryKey: analyticsQueryKeys.readiness(),
    queryFn: ({ signal }) => getAnalyticsReadiness({ signal }),
  });
  const capabilitiesQuery = useQuery({
    queryKey: analyticsQueryKeys.capabilities(),
    queryFn: ({ signal }) => getAnalyticsCapabilities({ signal }),
  });

  return (
    <PageShell
      title="Health"
      description="Analytics platform health, readiness, and capability discovery."
    >
      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="analytics-health-platform"
      >
        <h2 className="text-sm font-semibold">Analytics API health</h2>
        {healthQuery.isLoading ? <LoadingState /> : null}
        {healthQuery.isError ? (
          <ErrorState
            message={
              isAnalyticsApiError(healthQuery.error)
                ? healthQuery.error.message
                : "Unable to load Analytics health."
            }
            onRetry={() => void healthQuery.refetch()}
          />
        ) : null}
        {healthQuery.data ? (
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd data-testid="analytics-health-status">{healthQuery.data.status}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Checked</dt>
              <dd>{healthQuery.data.checkedAt}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="analytics-readiness-panel"
      >
        <h2 className="text-sm font-semibold">Readiness</h2>
        {readinessQuery.isLoading ? <LoadingState /> : null}
        {readinessQuery.data ? (
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">State</dt>
              <dd data-testid="analytics-readiness-state">
                {readinessQuery.data.readiness}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Provider</dt>
              <dd>{readinessQuery.data.providerId}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="analytics-capabilities-panel"
      >
        <h2 className="text-sm font-semibold">Capabilities</h2>
        {capabilitiesQuery.isLoading ? <LoadingState /> : null}
        {capabilitiesQuery.data ? (
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">HTTP API</dt>
              <dd>{capabilitiesQuery.data.httpApiVersion}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Workbench ready</dt>
              <dd data-testid="analytics-workbench-ready">
                {String(capabilitiesQuery.data.workbenchReady)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Ops mode</dt>
              <dd>{capabilitiesQuery.data.opsMode}</dd>
            </div>
          </dl>
        ) : null}
      </section>
    </PageShell>
  );
}
