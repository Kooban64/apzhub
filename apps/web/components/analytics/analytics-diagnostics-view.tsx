"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getAnalyticsCapabilities,
  getAnalyticsHealth,
  getAnalyticsReadiness,
  listAnalyticsCategories,
} from "@/lib/analytics/analytics-api";
import { isAnalyticsApiError } from "@/lib/analytics/errors";
import { analyticsQueryKeys } from "@/lib/analytics/query-keys";

import { ErrorState, LoadingState, PageShell } from "./analytics-ui";

export function AnalyticsDiagnosticsView() {
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
  const categoriesQuery = useQuery({
    queryKey: analyticsQueryKeys.categories(),
    queryFn: ({ signal }) => listAnalyticsCategories({ signal }),
  });

  const loading =
    healthQuery.isLoading ||
    readinessQuery.isLoading ||
    capabilitiesQuery.isLoading ||
    categoriesQuery.isLoading;

  const error =
    healthQuery.error ||
    readinessQuery.error ||
    capabilitiesQuery.error ||
    categoriesQuery.error;

  return (
    <PageShell
      title="Diagnostics"
      description="Read-only Analytics diagnostics for operators."
    >
      {loading ? <LoadingState label="Loading diagnostics…" /> : null}
      {error ? (
        <ErrorState
          message={
            isAnalyticsApiError(error)
              ? error.message
              : "Unable to load Analytics diagnostics."
          }
          onRetry={() => {
            void healthQuery.refetch();
            void readinessQuery.refetch();
            void capabilitiesQuery.refetch();
            void categoriesQuery.refetch();
          }}
        />
      ) : null}
      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="analytics-diagnostics-panel"
      >
        <h2 className="text-sm font-semibold">Diagnostic snapshot</h2>
        <pre
          className="mt-3 overflow-x-auto rounded-md bg-[var(--color-muted)]/30 p-3 text-xs"
          data-testid="analytics-diagnostics-json"
        >
          {JSON.stringify(
            {
              health: healthQuery.data ?? null,
              readiness: readinessQuery.data ?? null,
              capabilities: capabilitiesQuery.data ?? null,
              categories: categoriesQuery.data ?? null,
            },
            null,
            2,
          )}
        </pre>
      </section>
    </PageShell>
  );
}
