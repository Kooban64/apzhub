"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  archiveAnalyticsSaved,
  createAnalyticsSaved,
  listAnalyticsDashboards,
  listAnalyticsSaved,
} from "@/lib/analytics/analytics-api";
import { isAnalyticsApiError } from "@/lib/analytics/errors";
import {
  canManageAnalyticsSaved,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import { analyticsQueryKeys } from "@/lib/analytics/query-keys";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  AnalyticsTable,
} from "./analytics-ui";

export function AnalyticsSavedView({
  permissions,
}: {
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const canManage = canManageAnalyticsSaved(permissions);
  const queryClient = useQueryClient();
  const [name, setName] = useState("My saved view");
  const [dashboardId, setDashboardId] = useState("");

  const savedQuery = useQuery({
    queryKey: analyticsQueryKeys.saved(),
    queryFn: ({ signal }) => listAnalyticsSaved({ signal }),
    enabled: canManage,
  });

  const dashboardsQuery = useQuery({
    queryKey: analyticsQueryKeys.dashboards({ limit: 50 }),
    queryFn: ({ signal }) => listAnalyticsDashboards({ limit: 50 }, { signal }),
    enabled: canManage,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createAnalyticsSaved({
        dashboardId,
        name,
        status: "draft",
      }),
    onSuccess: async () => {
      setName("My saved view");
      await queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.saved() });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (savedId: string) => archiveAnalyticsSaved(savedId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.saved() });
    },
  });

  const items = savedQuery.data ?? [];
  const dashboards = dashboardsQuery.data?.items ?? [];

  return (
    <PageShell
      title="Saved insights"
      description="Personal and organisation saved insight preferences."
      breadcrumbs={["APZ Analytics", "Saved insights"]}
    >
      {!canManage ? (
        <EmptyState
          title="No saved-insight access"
          description="You are not authorised to manage saved Analytics insights."
        />
      ) : null}

      {canManage ? (
        <section
          className="rounded-lg border border-[var(--color-border)] p-4"
          data-testid="analytics-saved-create"
        >
          <h2 className="text-sm font-semibold">Save an insight</h2>
          <div className="mt-3 flex flex-col gap-2 md:flex-row">
            <input
              className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label="Saved insight name"
              data-testid="analytics-saved-name"
            />
            <select
              className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              value={dashboardId}
              onChange={(event) => setDashboardId(event.target.value)}
              aria-label="Insight to save"
              data-testid="analytics-saved-dashboard"
            >
              <option value="">Select insight…</option>
              {dashboards.map((dashboard) => (
                <option key={dashboard.id} value={dashboard.id}>
                  {dashboard.title}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              disabled={!dashboardId || !name.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
              data-testid="analytics-saved-create-submit"
            >
              Save
            </Button>
          </div>
          {createMutation.isError ? (
            <p className="mt-2 text-sm text-[var(--color-destructive)]" role="alert">
              {isAnalyticsApiError(createMutation.error)
                ? createMutation.error.message
                : "Unable to save insight."}
            </p>
          ) : null}
        </section>
      ) : null}

      {canManage && savedQuery.isLoading ? <LoadingState /> : null}
      {canManage && savedQuery.isError ? (
        <ErrorState
          message={
            isAnalyticsApiError(savedQuery.error)
              ? savedQuery.error.message
              : "Unable to load saved insights."
          }
          onRetry={() => void savedQuery.refetch()}
        />
      ) : null}
      {canManage && !savedQuery.isLoading && items.length === 0 ? (
        <EmptyState
          title="No saved insights"
          description="Save an insight answer to begin."
        />
      ) : null}
      {items.length > 0 ? (
        <AnalyticsTable headers={["Name", "Insight", "Status", "Actions"]}>
          {items.map((item) => (
            <tr key={item.id} data-testid={`analytics-saved-row-${item.id}`}>
              <td className="px-3 py-2">{item.name}</td>
              <td className="px-3 py-2 font-mono text-xs">{item.dashboardId}</td>
              <td className="px-3 py-2">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-3 py-2">
                {item.status !== "archived" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={archiveMutation.isPending}
                    onClick={() => archiveMutation.mutate(item.id)}
                    data-testid={`analytics-saved-archive-${item.id}`}
                  >
                    Archive
                  </Button>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </AnalyticsTable>
      ) : null}
    </PageShell>
  );
}
