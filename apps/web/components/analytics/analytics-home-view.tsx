"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { listAnalyticsDashboards } from "@/lib/analytics/analytics-api";
import { ANALYTICS_CURATED_SUITES } from "@/lib/analytics/curated-suites";
import { isAnalyticsApiError } from "@/lib/analytics/errors";
import {
  canViewAnalyticsDashboards,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import { analyticsQueryKeys } from "@/lib/analytics/query-keys";
import {
  analyticsDashboardDetailPath,
  analyticsDatasetsPath,
  analyticsDiagnosticsPath,
  analyticsHealthPath,
  analyticsReportsPath,
  analyticsSavedPath,
  analyticsSearchPath,
  analyticsSuitePath,
} from "@/lib/analytics/routes";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
} from "./analytics-ui";

export function AnalyticsHomeView({
  permissions,
}: {
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewAnalyticsDashboards(permissions);

  const query = useQuery({
    queryKey: analyticsQueryKeys.dashboards({ limit: 8 }),
    queryFn: ({ signal }) => listAnalyticsDashboards({ limit: 8 }, { signal }),
    enabled: canView,
  });

  const items = query.data?.items ?? [];

  return (
    <PageShell
      title="Analytics Home"
      description="Curated dashboards across Projects, Time, Support, and platform health."
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(analyticsSearchPath())}
            data-testid="analytics-home-search"
          >
            Search
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(analyticsHealthPath())}
            data-testid="analytics-home-health"
          >
            Health
          </Button>
        </>
      }
    >
      <section data-testid="analytics-home-suites">
        <h2 className="mb-2 text-sm font-semibold">Release 1.0 suites</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ANALYTICS_CURATED_SUITES.map((suite) => (
            <Button
              key={suite.key}
              type="button"
              size="sm"
              variant="outline"
              className="justify-start"
              onClick={() => router.push(analyticsSuitePath(suite.key))}
              data-testid={`analytics-suite-link-${suite.key}`}
            >
              {suite.title}
            </Button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2" data-testid="analytics-home-links">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(analyticsSavedPath())}
        >
          Saved Dashboards
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(analyticsDatasetsPath())}
        >
          Datasets
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(analyticsReportsPath())}
        >
          Reports
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(analyticsDiagnosticsPath())}
        >
          Diagnostics
        </Button>
      </div>

      <section data-testid="analytics-home-recent">
        <h2 className="mb-2 text-sm font-semibold">Recent catalogue</h2>
        {!canView ? (
          <EmptyState
            title="No dashboard access"
            description="You are not authorised to view Analytics dashboards."
          />
        ) : null}
        {canView && query.isLoading ? <LoadingState /> : null}
        {canView && query.isError ? (
          <ErrorState
            message={
              isAnalyticsApiError(query.error)
                ? query.error.message
                : "Unable to load dashboards."
            }
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {canView && !query.isLoading && !query.isError && items.length === 0 ? (
          <EmptyState
            title="No dashboards available"
            description="No authorised dashboards were returned for your account."
          />
        ) : null}
        {items.length > 0 ? (
          <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left hover:bg-[var(--color-muted)]/40"
                  onClick={() => router.push(analyticsDashboardDetailPath(item.id))}
                  data-testid={`analytics-dashboard-row-${item.id}`}
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.description ? (
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <StatusBadge status={item.status} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </PageShell>
  );
}
