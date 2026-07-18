"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { toEngineeringIntelligenceUserMessage } from "@/lib/testing/engineering-intelligence-errors";
import {
  EXECUTIVE_DASHBOARD_CATEGORIES,
  EXECUTIVE_DASHBOARD_LABELS,
  DEFAULT_EXECUTIVE_DASHBOARD_FILTERS,
  loadSavedExecutiveDashboardFilters,
  resolveExecutiveDashboardCategory,
  saveExecutiveDashboardFilters,
  type ExecutiveDashboardCategory,
  type ExecutiveDashboardFilterState,
} from "@/lib/testing/executive-dashboard-categories";
import {
  canViewExecutiveDashboards,
  type TestingPermissionSource,
} from "@/lib/testing/permissions";
import { testingQueryKeys } from "@/lib/testing/query-keys";
import {
  TESTING_BASE,
  testingCertificationPath,
  testingExecutiveDashboardsPath,
  testingPipelinesPath,
} from "@/lib/testing/routes";
import {
  getEngineeringHealth,
  getEngineeringQualityScore,
  getEngineeringRisk,
  listEngineeringBaselines,
  listEngineeringBenchmarks,
  listEngineeringHistorical,
  listEngineeringSnapshots,
  listEngineeringTrends,
} from "@/lib/testing/testing-api";

import {
  ExecutiveDashboardPanel,
  type ExecutiveDashboardData,
} from "./executive-dashboard-panels";
import {
  EmptyState,
  ErrorState,
  FilterBar,
  LoadingState,
  PageShell,
} from "./testing-ui";

function ForbiddenDashboards() {
  return (
    <PageShell
      title="Executive Dashboards"
      description="Engineering Intelligence dashboards"
    >
      <EmptyState
        title="Executive Dashboards unavailable"
        description="You need engineering.view, analytics.view, or related permissions to view dashboards."
      />
    </PageShell>
  );
}

export function TestingExecutiveDashboardsView({
  category: categoryProp,
  permissions,
}: {
  readonly category?: ExecutiveDashboardCategory | string;
  readonly permissions?: TestingPermissionSource;
}) {
  const router = useRouter();
  const category = resolveExecutiveDashboardCategory(categoryProp);
  const enabled = canViewExecutiveDashboards(permissions);

  const [filters, setFilters] = useState<ExecutiveDashboardFilterState>(
    DEFAULT_EXECUTIVE_DASHBOARD_FILTERS,
  );
  const [filtersHydrated, setFiltersHydrated] = useState(false);

  useEffect(() => {
    setFilters(loadSavedExecutiveDashboardFilters());
    setFiltersHydrated(true);
  }, []);

  useEffect(() => {
    if (!filtersHydrated) return;
    saveExecutiveDashboardFilters(filters);
  }, [filters, filtersHydrated]);

  const scoreQuery = useQuery({
    queryKey: testingQueryKeys.engineeringIntelligence.score(),
    queryFn: ({ signal }) => getEngineeringQualityScore({ signal }),
    enabled,
  });
  const healthQuery = useQuery({
    queryKey: testingQueryKeys.engineeringIntelligence.health(),
    queryFn: ({ signal }) => getEngineeringHealth({ signal }),
    enabled,
  });
  const riskQuery = useQuery({
    queryKey: testingQueryKeys.engineeringIntelligence.risk(),
    queryFn: ({ signal }) => getEngineeringRisk({ signal }),
    enabled,
  });
  const trendsQuery = useQuery({
    queryKey: testingQueryKeys.engineeringIntelligence.trends(),
    queryFn: ({ signal }) => listEngineeringTrends({ signal }),
    enabled,
  });
  const snapshotsQuery = useQuery({
    queryKey: testingQueryKeys.engineeringIntelligence.snapshots(),
    queryFn: ({ signal }) => listEngineeringSnapshots({ signal }),
    enabled,
  });
  const benchmarksQuery = useQuery({
    queryKey: testingQueryKeys.engineeringIntelligence.benchmarks(),
    queryFn: ({ signal }) => listEngineeringBenchmarks({ signal }),
    enabled,
  });
  const baselinesQuery = useQuery({
    queryKey: testingQueryKeys.engineeringIntelligence.baselines(),
    queryFn: ({ signal }) => listEngineeringBaselines({ signal }),
    enabled,
  });
  const historicalQuery = useQuery({
    queryKey: testingQueryKeys.engineeringIntelligence.historical(),
    queryFn: ({ signal }) => listEngineeringHistorical({ signal }),
    enabled,
  });

  const loading =
    scoreQuery.isLoading ||
    healthQuery.isLoading ||
    riskQuery.isLoading ||
    trendsQuery.isLoading;

  const firstError =
    scoreQuery.error ?? healthQuery.error ?? riskQuery.error ?? trendsQuery.error;

  const data: ExecutiveDashboardData | null = useMemo(() => {
    if (!scoreQuery.data || !healthQuery.data || !riskQuery.data || !trendsQuery.data) {
      return null;
    }
    return {
      score: scoreQuery.data,
      health: healthQuery.data,
      risk: riskQuery.data,
      trends: trendsQuery.data.items,
      snapshots: snapshotsQuery.data?.items ?? [],
      benchmarks: benchmarksQuery.data?.items ?? [],
      baselines: baselinesQuery.data?.items ?? [],
      historical: historicalQuery.data?.items ?? [],
    };
  }, [
    scoreQuery.data,
    healthQuery.data,
    riskQuery.data,
    trendsQuery.data,
    snapshotsQuery.data,
    benchmarksQuery.data,
    baselinesQuery.data,
    historicalQuery.data,
  ]);

  if (!enabled) return <ForbiddenDashboards />;

  if (loading) {
    return (
      <PageShell
        title="Executive Dashboards"
        description="Engineering Intelligence dashboards"
      >
        <LoadingState label="Loading executive dashboards…" />
      </PageShell>
    );
  }

  if (firstError || !data) {
    return (
      <PageShell
        title="Executive Dashboards"
        description="Engineering Intelligence dashboards"
      >
        <ErrorState
          message={toEngineeringIntelligenceUserMessage(
            firstError ?? new Error("Unable to load dashboards."),
          )}
          onRetry={() => {
            void scoreQuery.refetch();
            void healthQuery.refetch();
            void riskQuery.refetch();
            void trendsQuery.refetch();
          }}
        />
      </PageShell>
    );
  }

  const refetchAll = () => {
    void scoreQuery.refetch();
    void healthQuery.refetch();
    void riskQuery.refetch();
    void trendsQuery.refetch();
    void snapshotsQuery.refetch();
    void benchmarksQuery.refetch();
    void baselinesQuery.refetch();
    void historicalQuery.refetch();
  };

  return (
    <PageShell
      title="Executive Dashboards"
      description={`${EXECUTIVE_DASHBOARD_LABELS[category]} — read-only views over Engineering Intelligence`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={refetchAll}>
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                comparison: prev.comparison === "baseline" ? "previous" : "baseline",
              }))
            }
          >
            Compare
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(`${TESTING_BASE}/release-readiness`)}
          >
            Open Release
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(testingCertificationPath())}
          >
            Open Certification
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(testingPipelinesPath())}
          >
            Open Pipeline
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(`${TESTING_BASE}/coverage`)}
          >
            Open Coverage
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(`${TESTING_BASE}/evidence`)}
          >
            Open Evidence
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(TESTING_BASE)}
          >
            Open Testing
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(`${TESTING_BASE}/quality`)}
          >
            Open Quality
          </Button>
        </div>
      }
    >
      <nav
        className="mb-4 flex flex-wrap gap-2"
        aria-label="Dashboard categories"
        role="tablist"
      >
        {EXECUTIVE_DASHBOARD_CATEGORIES.map((id) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={category === id ? "default" : "outline"}
            role="tab"
            aria-selected={category === id}
            onClick={() => router.push(testingExecutiveDashboardsPath(id))}
          >
            {EXECUTIVE_DASHBOARD_LABELS[id]}
          </Button>
        ))}
      </nav>

      <FilterBar>
        <label className="flex flex-col gap-1 text-sm">
          <span>Search</span>
          <Input
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            aria-label="Search dashboards"
            placeholder="Search trends…"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Product</span>
          <Input
            value={filters.product}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, product: e.target.value }))
            }
            aria-label="Product selection"
            placeholder="Product filter"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Release</span>
          <Input
            value={filters.release}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, release: e.target.value }))
            }
            aria-label="Release selection"
            placeholder="Release filter"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Date from</span>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
            }
            aria-label="Date range from"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Date to</span>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
            }
            aria-label="Date range to"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Comparison</span>
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
            value={filters.comparison}
            aria-label="Comparison period"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                comparison: e.target
                  .value as ExecutiveDashboardFilterState["comparison"],
              }))
            }
          >
            <option value="none">None</option>
            <option value="previous">Previous</option>
            <option value="baseline">Baseline</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Sort</span>
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
            value={filters.sort}
            aria-label="Sort trends"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sort: e.target.value as ExecutiveDashboardFilterState["sort"],
              }))
            }
          >
            <option value="kind">Kind</option>
            <option value="direction">Direction</option>
            <option value="delta">Delta</option>
            <option value="period">Period</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Order</span>
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
            value={filters.order}
            aria-label="Sort order"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                order: e.target.value as ExecutiveDashboardFilterState["order"],
              }))
            }
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </FilterBar>

      <p
        className="mt-2 text-xs text-[var(--color-muted-foreground)]"
        aria-live="polite"
      >
        Comparison mode: {filters.comparison}
        {filters.dateFrom || filters.dateTo
          ? ` · Range ${filters.dateFrom || "…"} → ${filters.dateTo || "…"}`
          : ""}
      </p>

      <div className="mt-4">
        <ExecutiveDashboardPanel category={category} data={data} filters={filters} />
      </div>
    </PageShell>
  );
}
