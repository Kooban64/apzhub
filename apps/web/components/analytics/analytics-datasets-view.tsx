"use client";

import { useQuery } from "@tanstack/react-query";

import { listAnalyticsDatasets } from "@/lib/analytics/analytics-api";
import { isAnalyticsApiError } from "@/lib/analytics/errors";
import {
  canViewAnalyticsDatasets,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import { analyticsQueryKeys } from "@/lib/analytics/query-keys";

import {
  AnalyticsTable,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
} from "./analytics-ui";

export function AnalyticsDatasetsView({
  permissions,
}: {
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const canView = canViewAnalyticsDatasets(permissions);
  const query = useQuery({
    queryKey: analyticsQueryKeys.datasets(),
    queryFn: ({ signal }) => listAnalyticsDatasets({ signal }),
    enabled: canView,
  });
  const items = query.data ?? [];

  return (
    <PageShell
      title="Datasets"
      description="Logical dataset descriptors registered for Analytics surfaces."
    >
      {!canView ? (
        <EmptyState
          title="No dataset access"
          description="You are not authorised to view Analytics datasets."
        />
      ) : null}
      {canView && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isAnalyticsApiError(query.error)
              ? query.error.message
              : "Unable to load datasets."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && !query.isLoading && items.length === 0 ? (
        <EmptyState
          title="No datasets"
          description="No authorised datasets were returned."
        />
      ) : null}
      {items.length > 0 ? (
        <div data-testid="analytics-datasets-table">
          <AnalyticsTable headers={["Name", "Key", "Status"]}>
            {items.map((item) => (
              <tr key={item.id} data-testid={`analytics-dataset-row-${item.id}`}>
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{item.key}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </AnalyticsTable>
        </div>
      ) : null}
    </PageShell>
  );
}
