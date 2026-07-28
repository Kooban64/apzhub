"use client";

import { useQuery } from "@tanstack/react-query";

import { listAnalyticsReports } from "@/lib/analytics/analytics-api";
import { isAnalyticsApiError } from "@/lib/analytics/errors";
import {
  canViewAnalyticsReports,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import { analyticsQueryKeys } from "@/lib/analytics/query-keys";

import {
  AnalyticsTable,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
} from "./analytics-ui";

export function AnalyticsReportsView({
  permissions,
}: {
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const canView = canViewAnalyticsReports(permissions);
  const query = useQuery({
    queryKey: analyticsQueryKeys.reports(),
    queryFn: ({ signal }) => listAnalyticsReports({ signal }),
    enabled: canView,
  });
  const items = query.data ?? [];

  return (
    <PageShell
      title="Reports"
      description="Report links from the Analytics catalogue (Reporting SoR remains authoritative)."
    >
      {!canView ? (
        <EmptyState
          title="No report access"
          description="You are not authorised to view Analytics reports."
        />
      ) : null}
      {canView && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isAnalyticsApiError(query.error)
              ? query.error.message
              : "Unable to load reports."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && !query.isLoading && items.length === 0 ? (
        <EmptyState
          title="No reports"
          description="No authorised report links were returned."
        />
      ) : null}
      {items.length > 0 ? (
        <div data-testid="analytics-reports-table">
          <AnalyticsTable headers={["Title", "Key"]}>
            {items.map((item) => (
              <tr key={item.id} data-testid={`analytics-report-row-${item.id}`}>
                <td className="px-3 py-2">{item.title}</td>
                <td className="px-3 py-2 font-mono text-xs">{item.key}</td>
              </tr>
            ))}
          </AnalyticsTable>
        </div>
      ) : null}
    </PageShell>
  );
}
