"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { toEngineeringIntelligenceUserMessage } from "@/lib/testing/engineering-intelligence-errors";
import type { TrendSeriesViewModel } from "@/lib/testing/engineering-intelligence-types";
import {
  canViewEngineeringIntelligence,
  type TestingPermissionSource,
} from "@/lib/testing/permissions";
import { testingQueryKeys } from "@/lib/testing/query-keys";
import {
  TESTING_BASE,
  testingCertificationPath,
  testingPipelinesPath,
} from "@/lib/testing/routes";
import {
  compareEngineeringBenchmark,
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
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  Panel,
  StatusBadge,
  TestingStatCard,
  TestingTable,
} from "./testing-ui";

type EiPanel =
  "overview" | "score" | "health" | "trends" | "risk" | "benchmarks" | "historical";

const PANELS: readonly { readonly id: EiPanel; readonly label: string }[] = [
  { id: "overview", label: "Executive Overview" },
  { id: "score", label: "Quality Score" },
  { id: "health", label: "Engineering Health" },
  { id: "trends", label: "Trends" },
  { id: "risk", label: "Risk Overview" },
  { id: "benchmarks", label: "Benchmarks" },
  { id: "historical", label: "Historical Analysis" },
];

function ForbiddenEi() {
  return (
    <PageShell
      title="Engineering Intelligence"
      description="Executive quality analytics"
    >
      <EmptyState
        title="Engineering Intelligence unavailable"
        description="You need engineering.view or analytics.view permission to view this workspace."
      />
    </PageShell>
  );
}

function filterTrends(
  items: readonly TrendSeriesViewModel[],
  query: string,
  kindFilter: string,
): TrendSeriesViewModel[] {
  const q = query.trim().toLowerCase();
  return items
    .filter((t) => (kindFilter === "all" ? true : t.kind === kindFilter))
    .filter((t) =>
      q.length === 0
        ? true
        : t.kind.includes(q) ||
          t.direction.includes(q) ||
          t.id.toLowerCase().includes(q),
    )
    .slice()
    .sort((a, b) => a.kind.localeCompare(b.kind));
}

export function TestingEngineeringIntelligenceView({
  permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const router = useRouter();
  const [panel, setPanel] = useState<EiPanel>("overview");
  const [trendQuery, setTrendQuery] = useState("");
  const [trendKind, setTrendKind] = useState("all");
  const [releaseFilter, setReleaseFilter] = useState("");

  const enabled = canViewEngineeringIntelligence(permissions);

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

  const filteredTrends = useMemo(
    () => filterTrends(trendsQuery.data?.items ?? [], trendQuery, trendKind),
    [trendsQuery.data?.items, trendQuery, trendKind],
  );

  if (!enabled) return <ForbiddenEi />;

  const loading =
    scoreQuery.isLoading ||
    healthQuery.isLoading ||
    riskQuery.isLoading ||
    trendsQuery.isLoading;

  if (loading) {
    return (
      <PageShell
        title="Engineering Intelligence"
        description="Executive quality analytics"
      >
        <LoadingState label="Loading engineering intelligence…" />
      </PageShell>
    );
  }

  const firstError =
    scoreQuery.error ?? healthQuery.error ?? riskQuery.error ?? trendsQuery.error;

  if (firstError) {
    return (
      <PageShell
        title="Engineering Intelligence"
        description="Executive quality analytics"
      >
        <ErrorState
          message={toEngineeringIntelligenceUserMessage(firstError)}
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

  const score = scoreQuery.data;
  const health = healthQuery.data;
  const risk = riskQuery.data;

  return (
    <PageShell
      title="Engineering Intelligence"
      description="Read-only executive quality analytics from existing platform data"
    >
      <div
        className="mb-4 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Engineering Intelligence panels"
      >
        {PANELS.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant={panel === p.id ? "default" : "outline"}
            size="sm"
            role="tab"
            aria-selected={panel === p.id}
            onClick={() => setPanel(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>Release filter</span>
          <Input
            value={releaseFilter}
            onChange={(e) => setReleaseFilter(e.target.value)}
            placeholder="e.g. v1.2"
            aria-label="Release selection filter"
          />
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void scoreQuery.refetch();
            void healthQuery.refetch();
            void riskQuery.refetch();
            void trendsQuery.refetch();
            void snapshotsQuery.refetch();
            void benchmarksQuery.refetch();
            void baselinesQuery.refetch();
            void historicalQuery.refetch();
          }}
        >
          Refresh
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
          onClick={() => router.push(testingPipelinesPath())}
        >
          Open Pipeline
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push(`${TESTING_BASE}/release-readiness`)}
        >
          Open Release
        </Button>
      </div>

      {panel === "overview" && score && health && risk ? (
        <div className="grid gap-4 md:grid-cols-3">
          <TestingStatCard
            label="Quality Score"
            value={score.score.toFixed(1)}
            tone="success"
          />
          <TestingStatCard
            label="Engineering Health"
            value={`${health.overallScore.toFixed(1)} (${health.status})`}
            tone={
              health.status === "healthy"
                ? "success"
                : health.status === "watch"
                  ? "warning"
                  : "danger"
            }
          />
          <TestingStatCard
            label="Risk"
            value={`${risk.overallScore.toFixed(1)} (${risk.overallLevel})`}
            tone={
              risk.overallLevel === "low"
                ? "success"
                : risk.overallLevel === "medium"
                  ? "warning"
                  : "danger"
            }
          />
          <TestingStatCard label="Coverage" value={health.coverageScore.toFixed(1)} />
          <TestingStatCard
            label="Automation"
            value={health.automationScore.toFixed(1)}
          />
          <TestingStatCard
            label="Certification"
            value={health.certificationScore.toFixed(1)}
          />
          <p className="sr-only" aria-label={`Quality score ${score.score}`}>
            {score.score}
          </p>
        </div>
      ) : null}

      {panel === "score" && score ? (
        <Panel title="Quality Score breakdown">
          <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
            Computed at {score.computedAt}
            {releaseFilter ? ` · filter: ${releaseFilter}` : ""}
          </p>
          {score.components.length === 0 ? (
            <EmptyState title="No score components" />
          ) : (
            <TestingTable
              caption="Quality score components"
              columns={["Component", "Input", "Weight", "Contribution", "Inverted"]}
              rows={score.components.map((r) => ({
                id: r.key,
                cells: [
                  r.key,
                  String(r.input),
                  String(r.weight),
                  String(r.contribution),
                  r.inverted ? "yes" : "no",
                ],
              }))}
            />
          )}
        </Panel>
      ) : null}

      {panel === "health" && health ? (
        <Panel title="Engineering Health">
          <div className="mb-3 flex flex-wrap gap-2">
            <StatusBadge status={health.status} />
            <StatusBadge status="advisory_only" />
          </div>
          <TestingTable
            caption="Engineering health metrics"
            columns={["Metric", "Value"]}
            rows={[
              { id: "overall", cells: ["Overall", String(health.overallScore)] },
              { id: "quality", cells: ["Quality", String(health.qualityScore)] },
              {
                id: "stability",
                cells: ["Stability", String(health.stabilityScore)],
              },
              {
                id: "release",
                cells: ["Release readiness", String(health.releaseReadinessScore)],
              },
              {
                id: "coverage",
                cells: ["Coverage", String(health.coverageScore)],
              },
              {
                id: "automation",
                cells: ["Automation", String(health.automationScore)],
              },
              {
                id: "certification",
                cells: ["Certification", String(health.certificationScore)],
              },
              {
                id: "pipeline",
                cells: ["Pipeline health", String(health.pipelineHealthScore)],
              },
              { id: "risk", cells: ["Risk", String(health.riskScore)] },
            ]}
          />
        </Panel>
      ) : null}

      {panel === "trends" ? (
        <Panel title="Quality & delivery trends">
          <div className="mb-3 flex flex-wrap gap-3">
            <Input
              value={trendQuery}
              onChange={(e) => setTrendQuery(e.target.value)}
              placeholder="Search trends…"
              aria-label="Search trends"
            />
            <label className="flex items-center gap-2 text-sm">
              <span>Kind</span>
              <select
                className="rounded border bg-background px-2 py-1"
                value={trendKind}
                onChange={(e) => setTrendKind(e.target.value)}
                aria-label="Trend kind filter"
              >
                <option value="all">All</option>
                <option value="quality">Quality</option>
                <option value="coverage">Coverage</option>
                <option value="automation">Automation</option>
                <option value="execution">Manual testing</option>
                <option value="release">Release</option>
                <option value="certification">Certification</option>
                <option value="defect">Defect</option>
              </select>
            </label>
          </div>
          {filteredTrends.length === 0 ? (
            <EmptyState
              title="No trends"
              description="No trend series match the current filters."
            />
          ) : (
            <TestingTable
              caption="Trend series"
              columns={["Kind", "Direction", "Delta", "Period", "Points"]}
              rows={filteredTrends.map((r) => ({
                id: r.id,
                cells: [
                  r.kind,
                  <StatusBadge key="dir" status={r.direction} />,
                  String(r.delta),
                  r.periodKind,
                  String(r.points.length),
                ],
              }))}
            />
          )}
        </Panel>
      ) : null}

      {panel === "risk" && risk ? (
        <Panel title="Risk overview">
          <div className="mb-3">
            <StatusBadge status={risk.overallLevel} />
            <span className="ml-2 text-sm text-[var(--color-muted-foreground)]">
              ({risk.overallScore.toFixed(1)})
            </span>
          </div>
          {risk.factors.length === 0 ? (
            <EmptyState title="No risk factors" />
          ) : (
            <TestingTable
              caption="Risk factors"
              columns={["Factor", "Score", "Level", "Reasons"]}
              rows={risk.factors.map((r) => ({
                id: r.key,
                cells: [
                  r.key,
                  String(r.score),
                  <StatusBadge key="level" status={r.level} />,
                  r.reasons.join("; ") || "—",
                ],
              }))}
            />
          )}
        </Panel>
      ) : null}

      {panel === "benchmarks" ? (
        <div className="grid gap-4">
          <Panel title="Benchmarks">
            {benchmarksQuery.isLoading ? (
              <LoadingState label="Loading benchmarks…" />
            ) : (benchmarksQuery.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="No benchmarks" />
            ) : (
              <TestingTable
                caption="Benchmarks"
                columns={["Metric", "Current", "Previous", "Baseline", "Direction"]}
                rows={(benchmarksQuery.data?.items ?? []).map((r) => ({
                  id: r.id,
                  cells: [
                    r.metricKey,
                    String(r.comparison.current),
                    String(r.comparison.previous ?? "—"),
                    String(r.comparison.baseline ?? "—"),
                    <StatusBadge key="dir" status={r.comparison.direction} />,
                  ],
                }))}
              />
            )}
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void compareEngineeringBenchmark({
                    metricKey: "coverage",
                    values: [70, 75, 80],
                    baselineValue: 70,
                    label: "workbench-compare",
                  }).then(() => benchmarksQuery.refetch());
                }}
              >
                Compare Baselines
              </Button>
            </div>
          </Panel>
          <Panel title="Baselines">
            {baselinesQuery.isLoading ? (
              <LoadingState label="Loading baselines…" />
            ) : (baselinesQuery.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="No baselines" />
            ) : (
              <TestingTable
                caption="Baselines"
                columns={["Kind", "Metric", "Value", "Label"]}
                rows={(baselinesQuery.data?.items ?? []).map((r) => ({
                  id: r.id,
                  cells: [r.kind, r.metricKey, String(r.value), r.label ?? "—"],
                }))}
              />
            )}
          </Panel>
        </div>
      ) : null}

      {panel === "historical" ? (
        <div id="export">
          <Panel title="Historical snapshots">
            {historicalQuery.isLoading || snapshotsQuery.isLoading ? (
              <LoadingState label="Loading historical data…" />
            ) : (
              <>
                <h3 className="mb-2 text-sm font-medium">Immutable period captures</h3>
                {(historicalQuery.data?.items.length ?? 0) === 0 ? (
                  <EmptyState title="No historical snapshots" />
                ) : (
                  <TestingTable
                    caption="Historical snapshots"
                    columns={["Period", "Quality", "Health", "Immutable"]}
                    rows={(historicalQuery.data?.items ?? []).map((r) => ({
                      id: r.id,
                      cells: [
                        r.period.label ?? r.period.kind,
                        String(r.qualityScore),
                        String(r.engineeringHealthScore),
                        r.immutable ? "yes" : "no",
                      ],
                    }))}
                  />
                )}
                <h3 className="mb-2 mt-6 text-sm font-medium">Engineering snapshots</h3>
                {(snapshotsQuery.data?.items.length ?? 0) === 0 ? (
                  <EmptyState title="No engineering snapshots" />
                ) : (
                  <TestingTable
                    caption="Engineering snapshots"
                    columns={["ID", "Label", "Score", "Health"]}
                    rows={(snapshotsQuery.data?.items ?? []).map((r) => ({
                      id: r.id,
                      cells: [
                        r.id,
                        r.label ?? "—",
                        String(r.qualityScore.score),
                        <StatusBadge key="h" status={r.health.status} />,
                      ],
                    }))}
                  />
                )}
              </>
            )}
          </Panel>
        </div>
      ) : null}
    </PageShell>
  );
}
