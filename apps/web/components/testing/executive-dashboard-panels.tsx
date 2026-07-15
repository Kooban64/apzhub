"use client";

/**
 * Executive dashboard panels (APZTCMS-023) — presentation only.
 * All values come from existing Engineering Intelligence view models.
 */

import type {
  BaselineViewModel,
  BenchmarkViewModel,
  EngineeringHealthViewModel,
  EngineeringRiskViewModel,
  EngineeringSnapshotViewModel,
  HistoricalSnapshotViewModel,
  QualityScoreViewModel,
  TrendSeriesViewModel,
} from "@/lib/testing/engineering-intelligence-types";
import {
  directionTone,
  filterTrendRows,
  healthTone,
  riskTone,
  type ExecutiveDashboardCategory,
  type ExecutiveDashboardFilterState,
} from "@/lib/testing/executive-dashboard-categories";

import {
  EmptyState,
  Panel,
  StatusBadge,
  TestingStatCard,
  TestingTable,
} from "./testing-ui";

export type ExecutiveDashboardData = {
  readonly score: QualityScoreViewModel;
  readonly health: EngineeringHealthViewModel;
  readonly risk: EngineeringRiskViewModel;
  readonly trends: readonly TrendSeriesViewModel[];
  readonly snapshots: readonly EngineeringSnapshotViewModel[];
  readonly benchmarks: readonly BenchmarkViewModel[];
  readonly baselines: readonly BaselineViewModel[];
  readonly historical: readonly HistoricalSnapshotViewModel[];
};

function trendsOfKind(
  trends: readonly TrendSeriesViewModel[],
  kinds: readonly string[],
  filters: ExecutiveDashboardFilterState,
): TrendSeriesViewModel[] {
  return filterTrendRows(
    trends.filter((t) => kinds.includes(t.kind)),
    filters,
  );
}

function TrendTable({
  title,
  rows,
}: {
  readonly title: string;
  readonly rows: readonly TrendSeriesViewModel[];
}) {
  return (
    <Panel title={title}>
      {rows.length === 0 ? (
        <EmptyState title="No trends" description="No series match the current filters." />
      ) : (
        <TestingTable
          caption={title}
          columns={["Kind", "Direction", "Delta", "Period", "Points"]}
          rows={rows.map((r) => ({
            id: r.id,
            cells: [
              r.kind,
              <StatusBadge key="d" status={r.direction} />,
              String(r.delta),
              r.periodKind,
              String(r.points.length),
            ],
          }))}
        />
      )}
    </Panel>
  );
}

function HeatMapFromHistorical({
  items,
}: {
  readonly items: readonly HistoricalSnapshotViewModel[];
}) {
  if (items.length === 0) {
    return <EmptyState title="No historical heat map data" />;
  }
  return (
    <div
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
      role="list"
      aria-label="Historical quality heat map"
    >
      {items.map((item) => {
        const tone = healthTone(
          item.engineeringHealthScore >= 80
            ? "healthy"
            : item.engineeringHealthScore >= 60
              ? "watch"
              : "at_risk",
        );
        return (
          <div
            key={item.id}
            role="listitem"
            data-testid="dashboard-heatmap-cell"
            data-tone={tone}
            className="rounded-md border border-[var(--color-border)] p-3"
          >
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {item.period.label ?? item.period.kind}
            </p>
            <p className="mt-1 text-lg font-semibold">{item.qualityScore.toFixed(1)}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Health {item.engineeringHealthScore.toFixed(1)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ProgressBar({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1" aria-label={`${label} ${clamped.toFixed(0)} percent`}>
      <div className="flex justify-between text-xs text-[var(--color-muted-foreground)]">
        <span>{label}</span>
        <span>{clamped.toFixed(1)}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded bg-[var(--color-muted)]"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full bg-[var(--color-primary)]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function ExecutiveDashboardPanel({
  category,
  data,
  filters,
}: {
  readonly category: ExecutiveDashboardCategory;
  readonly data: ExecutiveDashboardData;
  readonly filters: ExecutiveDashboardFilterState;
}) {
  const { score, health, risk, trends, snapshots, benchmarks, baselines, historical } =
    data;
  const filteredTrends = filterTrendRows(trends, filters);

  if (category === "executive") {
    return (
      <div className="space-y-4" data-testid="dashboard-executive">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TestingStatCard
            label="Engineering Health"
            value={`${health.overallScore.toFixed(1)} (${health.status})`}
            tone={healthTone(health.status)}
          />
          <TestingStatCard
            label="Quality Score"
            value={score.score.toFixed(1)}
            tone="success"
          />
          <TestingStatCard
            label="Release Readiness"
            value={health.releaseReadinessScore.toFixed(1)}
            tone={health.releaseReadinessScore >= 75 ? "success" : "warning"}
          />
          <TestingStatCard
            label="Certification"
            value={health.certificationScore.toFixed(1)}
            tone={health.certificationScore >= 80 ? "success" : "warning"}
          />
          <TestingStatCard
            label="Risk"
            value={`${risk.overallScore.toFixed(1)} (${risk.overallLevel})`}
            tone={riskTone(risk.overallLevel)}
          />
          <TestingStatCard
            label="Open Defects"
            value={String(score.inputs.openDefects ?? "—")}
            tone={(score.inputs.openDefects ?? 0) > 15 ? "danger" : "neutral"}
          />
          <TestingStatCard
            label="Coverage"
            value={health.coverageScore.toFixed(1)}
          />
          <TestingStatCard
            label="Automation"
            value={health.automationScore.toFixed(1)}
          />
          <TestingStatCard
            label="Manual Testing"
            value={String(score.inputs.manualExecution ?? "—")}
          />
          <TestingStatCard
            label="Pipeline Status"
            value={health.pipelineHealthScore.toFixed(1)}
            tone={health.pipelineHealthScore >= 90 ? "success" : "warning"}
          />
        </div>
        <TrendTable title="Trend Summary" rows={filteredTrends} />
        <Panel title="Recent Releases / Snapshots">
          {snapshots.length === 0 ? (
            <EmptyState title="No snapshots" />
          ) : (
            <TestingTable
              caption="Engineering snapshots"
              columns={["Label", "Score", "Health", "Computed"]}
              rows={snapshots.map((s) => ({
                id: s.id,
                cells: [
                  s.label ?? s.id,
                  String(s.qualityScore.score),
                  <StatusBadge key="h" status={s.health.status} />,
                  s.computedAt,
                ],
              }))}
            />
          )}
        </Panel>
      </div>
    );
  }

  if (category === "engineering") {
    return (
      <div className="space-y-4" data-testid="dashboard-engineering">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TestingStatCard label="Quality" value={health.qualityScore.toFixed(1)} />
          <TestingStatCard label="Stability" value={health.stabilityScore.toFixed(1)} />
          <TestingStatCard
            label="Pipeline"
            value={health.pipelineHealthScore.toFixed(1)}
          />
          <TestingStatCard
            label="Risk"
            value={String(health.riskScore)}
            tone={riskTone(risk.overallLevel)}
          />
        </div>
        <TrendTable
          title="Execution Trends"
          rows={trendsOfKind(trends, ["execution"], filters)}
        />
        <TrendTable
          title="Coverage Trends"
          rows={trendsOfKind(trends, ["coverage"], filters)}
        />
        <TrendTable
          title="Automation Trends"
          rows={trendsOfKind(trends, ["automation"], filters)}
        />
        <TrendTable
          title="Regression / Defect Trends"
          rows={trendsOfKind(trends, ["defect", "regression"], filters)}
        />
        <TrendTable
          title="Certification Trends"
          rows={trendsOfKind(trends, ["certification"], filters)}
        />
        <Panel title="Historical Comparisons">
          <HeatMapFromHistorical items={historical} />
        </Panel>
        <Panel title="Quality Indicators">
          <div className="grid gap-3 md:grid-cols-2">
            <ProgressBar label="Coverage" value={health.coverageScore} />
            <ProgressBar label="Automation" value={health.automationScore} />
            <ProgressBar label="Certification" value={health.certificationScore} />
            <ProgressBar label="Release readiness" value={health.releaseReadinessScore} />
          </div>
        </Panel>
      </div>
    );
  }

  if (category === "qa") {
    return (
      <div className="space-y-4" data-testid="dashboard-qa">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TestingStatCard
            label="Manual Execution"
            value={String(score.inputs.manualExecution ?? "—")}
          />
          <TestingStatCard
            label="Automation"
            value={health.automationScore.toFixed(1)}
          />
          <TestingStatCard
            label="Coverage"
            value={health.coverageScore.toFixed(1)}
          />
          <TestingStatCard
            label="Failed Tests"
            value={String(score.inputs.failedTests ?? "—")}
            tone={(score.inputs.failedTests ?? 0) > 10 ? "danger" : "neutral"}
          />
          <TestingStatCard
            label="Defects"
            value={String(score.inputs.openDefects ?? "—")}
          />
          <TestingStatCard
            label="Approvals"
            value={String(score.inputs.approvals ?? "—")}
          />
          <TestingStatCard
            label="Certification"
            value={health.certificationScore.toFixed(1)}
          />
          <TestingStatCard
            label="Risk"
            value={risk.overallLevel}
            tone={riskTone(risk.overallLevel)}
          />
        </div>
        <TrendTable
          title="QA Trends"
          rows={trendsOfKind(
            trends,
            ["execution", "automation", "coverage", "defect"],
            filters,
          )}
        />
        <Panel title="Evidence / Drill-down">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Use Open Evidence / Open Coverage commands to drill into related Testing
            workspaces. Dashboards remain read-only.
          </p>
        </Panel>
      </div>
    );
  }

  if (category === "release" || category === "release-readiness") {
    return (
      <div className="space-y-4" data-testid="dashboard-release">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TestingStatCard
            label="Current Release Readiness"
            value={health.releaseReadinessScore.toFixed(1)}
            tone={health.releaseReadinessScore >= 75 ? "success" : "warning"}
          />
          <TestingStatCard
            label="Approvals"
            value={String(score.inputs.approvals ?? "—")}
          />
          <TestingStatCard
            label="Certification"
            value={health.certificationScore.toFixed(1)}
          />
          <TestingStatCard
            label="Coverage"
            value={health.coverageScore.toFixed(1)}
          />
          <TestingStatCard
            label="Open Risks"
            value={`${risk.overallScore.toFixed(1)} (${risk.overallLevel})`}
            tone={riskTone(risk.overallLevel)}
          />
          <TestingStatCard
            label="Blocking Issues"
            value={String(score.inputs.failedTests ?? "—")}
            tone={(score.inputs.failedTests ?? 0) > 0 ? "warning" : "success"}
          />
        </div>
        <Panel title="Risk Factors">
          <TestingTable
            caption="Risk factors"
            columns={["Factor", "Score", "Level", "Reasons"]}
            rows={risk.factors.map((f) => ({
              id: f.key,
              cells: [
                f.key,
                String(f.score),
                <StatusBadge key="l" status={f.level} />,
                f.reasons.join("; ") || "—",
              ],
            }))}
          />
        </Panel>
        <TrendTable
          title="Release Trends"
          rows={trendsOfKind(trends, ["release", "certification"], filters)}
        />
        <Panel title="Dependencies / Snapshots">
          {snapshots.length === 0 ? (
            <EmptyState title="No release snapshots" />
          ) : (
            <TestingTable
              caption="Release-related snapshots"
              columns={["Label", "Score", "Status"]}
              rows={snapshots.map((s) => ({
                id: s.id,
                cells: [
                  s.label ?? s.id,
                  String(s.qualityScore.score),
                  <StatusBadge key="s" status={s.health.status} />,
                ],
              }))}
            />
          )}
        </Panel>
      </div>
    );
  }

  if (category === "certification") {
    return (
      <div className="space-y-4" data-testid="dashboard-certification">
        <TestingStatCard
          label="Certification Score"
          value={health.certificationScore.toFixed(1)}
          tone={health.certificationScore >= 80 ? "success" : "warning"}
        />
        <TrendTable
          title="Certification Trends"
          rows={trendsOfKind(trends, ["certification"], filters)}
        />
        <Panel title="Approvals Input">
          <p className="text-sm">
            Approvals input: {String(score.inputs.approvals ?? "—")}
          </p>
        </Panel>
      </div>
    );
  }

  if (category === "quality") {
    return (
      <div className="space-y-4" data-testid="dashboard-quality">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <TestingStatCard label="Quality Score" value={score.score.toFixed(1)} />
          <TestingStatCard label="Quality Health" value={health.qualityScore.toFixed(1)} />
          <TestingStatCard
            label="Status"
            value={health.status}
            tone={healthTone(health.status)}
          />
        </div>
        <Panel title="Score Components">
          <TestingTable
            caption="Quality components"
            columns={["Component", "Input", "Weight", "Contribution"]}
            rows={score.components.map((c) => ({
              id: c.key,
              cells: [
                c.key,
                String(c.input),
                String(c.weight),
                String(c.contribution),
              ],
            }))}
          />
        </Panel>
        <TrendTable
          title="Quality Trends"
          rows={trendsOfKind(trends, ["quality"], filters)}
        />
      </div>
    );
  }

  if (category === "coverage") {
    return (
      <div className="space-y-4" data-testid="dashboard-coverage">
        <TestingStatCard label="Coverage" value={health.coverageScore.toFixed(1)} />
        <ProgressBar label="Coverage" value={health.coverageScore} />
        <TrendTable
          title="Coverage Trends"
          rows={trendsOfKind(trends, ["coverage"], filters)}
        />
        <Panel title="Benchmarks">
          <TestingTable
            caption="Coverage benchmarks"
            columns={["Metric", "Current", "Baseline", "Direction"]}
            rows={benchmarks
              .filter((b) => b.metricKey.includes("coverage") || filters.search === "")
              .map((b) => ({
                id: b.id,
                cells: [
                  b.metricKey,
                  String(b.comparison.current),
                  String(b.comparison.baseline ?? "—"),
                  <StatusBadge key="d" status={b.comparison.direction} />,
                ],
              }))}
          />
        </Panel>
      </div>
    );
  }

  if (category === "automation") {
    return (
      <div className="space-y-4" data-testid="dashboard-automation">
        <TestingStatCard
          label="Automation"
          value={health.automationScore.toFixed(1)}
        />
        <ProgressBar label="Automation" value={health.automationScore} />
        <TrendTable
          title="Automation Trends"
          rows={trendsOfKind(trends, ["automation"], filters)}
        />
      </div>
    );
  }

  if (category === "manual-testing") {
    return (
      <div className="space-y-4" data-testid="dashboard-manual">
        <TestingStatCard
          label="Manual Execution"
          value={String(score.inputs.manualExecution ?? "—")}
        />
        <TrendTable
          title="Manual Testing Trends"
          rows={trendsOfKind(trends, ["execution"], filters)}
        />
      </div>
    );
  }

  if (category === "risk") {
    return (
      <div className="space-y-4" data-testid="dashboard-risk">
        <TestingStatCard
          label="Overall Risk"
          value={`${risk.overallScore.toFixed(1)} (${risk.overallLevel})`}
          tone={riskTone(risk.overallLevel)}
        />
        <Panel title="Risk Factors">
          <TestingTable
            caption="Risk factors"
            columns={["Factor", "Score", "Level", "Reasons"]}
            rows={risk.factors.map((f) => ({
              id: f.key,
              cells: [
                f.key,
                String(f.score),
                <StatusBadge key="l" status={f.level} />,
                f.reasons.join("; ") || "—",
              ],
            }))}
          />
        </Panel>
        <TrendTable
          title="Defect / Risk Trends"
          rows={trendsOfKind(trends, ["defect", "risk"], filters)}
        />
      </div>
    );
  }

  // historical-trends
  return (
    <div className="space-y-4" data-testid="dashboard-historical">
      <Panel title="Historical Trends Heat Map">
        <HeatMapFromHistorical items={historical} />
      </Panel>
      <TrendTable title="All Trends" rows={filteredTrends} />
      <Panel title="Baselines">
        {baselines.length === 0 ? (
          <EmptyState title="No baselines" />
        ) : (
          <TestingTable
            caption="Baselines"
            columns={["Kind", "Metric", "Value", "Label"]}
            rows={baselines.map((b) => ({
              id: b.id,
              cells: [b.kind, b.metricKey, String(b.value), b.label ?? "—"],
            }))}
          />
        )}
      </Panel>
      <Panel title="Benchmark Directions">
        <TestingTable
          caption="Benchmarks"
          columns={["Metric", "Current", "Previous", "Direction"]}
          rows={benchmarks.map((b) => ({
            id: b.id,
            cells: [
              b.metricKey,
              String(b.comparison.current),
              String(b.comparison.previous ?? "—"),
              <span key="t" data-tone={directionTone(b.comparison.direction)}>
                <StatusBadge status={b.comparison.direction} />
              </span>,
            ],
          }))}
        />
      </Panel>
    </div>
  );
}
