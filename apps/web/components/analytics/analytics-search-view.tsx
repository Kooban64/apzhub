"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { listAnalyticsDashboards } from "@/lib/analytics/analytics-api";
import { isAnalyticsApiError } from "@/lib/analytics/errors";
import {
  canViewAnalyticsDashboards,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import { analyticsQueryKeys } from "@/lib/analytics/query-keys";
import { analyticsDashboardDetailPath } from "@/lib/analytics/routes";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
} from "./analytics-ui";

export function AnalyticsSearchView({
  permissions,
}: {
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewAnalyticsDashboards(permissions);
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");

  const query = useQuery({
    queryKey: analyticsQueryKeys.dashboards({ limit: 100 }),
    queryFn: ({ signal }) => listAnalyticsDashboards({ limit: 100 }, { signal }),
    enabled: canView,
  });

  const results = useMemo(() => {
    const needle = submitted.trim().toLowerCase();
    const items = query.data?.items ?? [];
    if (!needle) return items;
    return items.filter((item) => {
      const haystack =
        `${item.title} ${item.description ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [query.data?.items, submitted]);

  return (
    <PageShell
      title="Search"
      description="Find dashboards by title, description, or tag (catalogue filter)."
    >
      {!canView ? (
        <EmptyState
          title="No search access"
          description="You are not authorised to search Analytics dashboards."
        />
      ) : (
        <>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(q);
            }}
            data-testid="analytics-search-form"
          >
            <input
              className="min-w-[16rem] flex-1 rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search dashboards…"
              aria-label="Search dashboards"
              data-testid="analytics-search-q"
            />
            <Button type="submit" size="sm" data-testid="analytics-search-submit">
              Search
            </Button>
          </form>

          {query.isLoading ? <LoadingState /> : null}
          {query.isError ? (
            <ErrorState
              message={
                isAnalyticsApiError(query.error)
                  ? query.error.message
                  : "Unable to search dashboards."
              }
              onRetry={() => void query.refetch()}
            />
          ) : null}
          {!query.isLoading && !query.isError ? (
            <ul
              className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]"
              data-testid="analytics-search-results"
            >
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-[var(--color-muted-foreground)]">
                  No matching dashboards.
                </li>
              ) : (
                results.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left hover:bg-[var(--color-muted)]/40"
                      onClick={() => router.push(analyticsDashboardDetailPath(item.id))}
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
                ))
              )}
            </ul>
          ) : null}
        </>
      )}
    </PageShell>
  );
}
