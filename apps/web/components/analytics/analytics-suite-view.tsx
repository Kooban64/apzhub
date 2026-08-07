"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { listAnalyticsDashboards } from "@/lib/analytics/analytics-api";
import { getCuratedSuite } from "@/lib/analytics/curated-suites";
import { isAnalyticsApiError } from "@/lib/analytics/errors";
import {
  canViewAnalyticsDashboards,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import { analyticsQueryKeys } from "@/lib/analytics/query-keys";
import {
  analyticsDashboardDetailPath,
  type AnalyticsSuiteKey,
} from "@/lib/analytics/routes";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
} from "./analytics-ui";

export function AnalyticsSuiteView({
  suiteKey,
  permissions,
}: {
  readonly suiteKey: AnalyticsSuiteKey;
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const router = useRouter();
  const suite = getCuratedSuite(suiteKey);
  const canView = canViewAnalyticsDashboards(permissions);

  const query = useQuery({
    queryKey: analyticsQueryKeys.dashboards({ tag: suite?.tag, limit: 50 }),
    queryFn: ({ signal }) =>
      listAnalyticsDashboards({ tag: suite?.tag, limit: 50 }, { signal }),
    enabled: Boolean(suite) && canView,
  });

  const items = query.data?.items ?? [];

  if (!suite) {
    return (
      <PageShell
        title="Insight answer"
        breadcrumbs={["APZ Analytics", "Insight answer"]}
      >
        <EmptyState
          title="Unknown insight answer"
          description="Return to a business question to find the relevant insight."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={suite.title}
      description={`${suite.description} This is an answer surface — enter from a business question.`}
      breadcrumbs={["APZ Analytics", "Insight answer", suite.title]}
    >
      {!canView ? (
        <EmptyState
          title="No insight access"
          description="You are not authorised to view this insight answer."
        />
      ) : null}
      {canView && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isAnalyticsApiError(query.error)
              ? query.error.message
              : "Unable to load insight answers."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && !query.isLoading && !query.isError && items.length === 0 ? (
        <EmptyState
          title="No authorised insights"
          description="No insight answers in this area are available for your account."
        />
      ) : null}
      {items.length > 0 ? (
        <ul
          className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]"
          data-testid={`analytics-suite-${suiteKey}`}
        >
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
    </PageShell>
  );
}
