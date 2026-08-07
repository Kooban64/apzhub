"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getAnalyticsDashboard } from "@/lib/analytics/analytics-api";
import { isAnalyticsApiError } from "@/lib/analytics/errors";
import {
  canManageAnalyticsSaved,
  canViewAnalyticsDashboards,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import { analyticsQueryKeys } from "@/lib/analytics/query-keys";
import { analyticsHomePath, analyticsSavedPath } from "@/lib/analytics/routes";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
} from "./analytics-ui";

export function AnalyticsDashboardDetailView({
  dashboardId,
  permissions,
}: {
  readonly dashboardId: string;
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewAnalyticsDashboards(permissions);
  const canSave = canManageAnalyticsSaved(permissions);

  const query = useQuery({
    queryKey: analyticsQueryKeys.dashboard(dashboardId),
    queryFn: ({ signal }) => getAnalyticsDashboard(dashboardId, { signal }),
    enabled: canView,
  });

  return (
    <PageShell
      title={query.data?.title ?? "Insight answer"}
      description="Supporting evidence for a business question. This visualisation is an answer — not the destination."
      breadcrumbs={["APZ Analytics", "Insight answer"]}
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(analyticsHomePath())}
          >
            Home
          </Button>
          {canSave ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(analyticsSavedPath())}
              data-testid="analytics-detail-saved"
            >
              Saved insights
            </Button>
          ) : null}
        </>
      }
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
              : "Unable to load insight answer."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.data ? (
        <section
          className="rounded-lg border border-[var(--color-border)] p-4"
          data-testid="analytics-dashboard-detail"
        >
          <h2 className="mb-3 text-sm font-semibold">Supporting evidence</h2>
          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Title</dt>
              <dd data-testid="analytics-dashboard-title">{query.data.title}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd>
                <StatusBadge status={query.data.status} />
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-[var(--color-muted-foreground)]">Description</dt>
              <dd>{query.data.description ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Evidence ID</dt>
              <dd className="font-mono text-xs">{query.data.id}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Updated</dt>
              <dd>{query.data.updatedAt}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Tags</dt>
              <dd>{query.data.tags?.join(", ") || "—"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">
            Live visual embed is not exposed by the Analytics HTTP API in this
            programme. Evidence metadata is served through APZHUB only — no engine
            branding. Return to a business question to complete Question → Insight →
            Decision.
          </p>
        </section>
      ) : null}
    </PageShell>
  );
}
