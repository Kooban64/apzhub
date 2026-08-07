"use client";

/**
 * W005 S-02 Portfolio Scorecard — executive default landing.
 */

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isProjectsApiError } from "@/lib/projects/errors";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import { getPortfolioProjection } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import {
  portfolioAdminPath,
  portfolioTimelinePath,
  portfolioWorkspacePath,
  projectDetailPath,
} from "@/lib/projects/routes";

import { EmptyState, ErrorState, LoadingState, PageShell } from "./projects-ui";

type EnterpriseItem = {
  readonly health?: string;
  readonly confidenceScore?: number;
  readonly confidenceBand?: string;
  readonly healthPercents?: {
    readonly healthy: number;
    readonly attention: number;
    readonly critical: number;
  };
  readonly healthTrend?: string;
  readonly confidenceContributors?: readonly {
    readonly label: string;
    readonly impact: number;
  }[];
  readonly healthDistribution?: {
    readonly healthy: number;
    readonly watch: number;
    readonly critical: number;
  };
  readonly exceptionsOpen?: number;
  readonly exceptionsCritical?: number;
  readonly waitingAged?: number;
  readonly dependenciesBroken?: number;
  readonly forecastOffTrack?: number;
  readonly forecastAtRisk?: number;
  readonly projectedConfidenceDelta?: number;
  readonly childCount?: number;
  readonly objectives?: {
    readonly total: number;
    readonly onTrack: number;
    readonly atRisk: number;
    readonly offTrack: number;
    readonly achieved: number;
    readonly items: readonly {
      readonly id: string;
      readonly name: string;
      readonly status: string;
      readonly progress: number;
    }[];
  };
  readonly deliveryTrend?: {
    readonly slippedMilestonesDelta: number;
    readonly agedWaitsDelta: number;
    readonly confidenceDelta: number;
    readonly direction: string;
  };
  readonly operationalSummary?: {
    readonly pressureStatement: string;
    readonly decisionCount: number;
  };
  readonly forecastOutlook?: {
    readonly offTrack: number;
    readonly atRisk: number;
    readonly projectedConfidenceDelta: number;
  };
  readonly children?: readonly {
    readonly id: string;
    readonly name: string;
    readonly health?: string;
    readonly level?: string;
  }[];
};

function ScoreRow({
  label,
  value,
  detail,
  onDrill,
}: {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly onDrill?: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full flex-col gap-1 border border-[var(--color-border)] px-4 py-3 text-left hover:bg-[var(--color-muted)]/30 disabled:cursor-default disabled:hover:bg-transparent"
      onClick={onDrill}
      disabled={!onDrill}
      data-testid={`portfolio-scorecard-row-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <span className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </span>
      <span className="text-base font-semibold text-[var(--color-foreground)]">
        {value}
      </span>
      <span className="text-sm text-[var(--color-muted-foreground)]">{detail}</span>
    </button>
  );
}

function trendArrow(direction: string | undefined): string {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  return "→";
}

export function PortfolioScorecardView({
  permissions: _permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const projection = useQuery({
    queryKey: [...projectsQueryKeys.all, "portfolio-scorecard"],
    queryFn: ({ signal }) => getPortfolioProjection("enterprise", { signal }),
  });

  const item = (projection.data as { item?: EnterpriseItem } | undefined)?.item;
  const pct = item?.healthPercents;
  const criticalProjects =
    item?.children?.filter((child) => child.health === "Critical") ?? [];
  const topDrag = (item?.confidenceContributors ?? [])
    .slice(0, 3)
    .map((c) => c.label)
    .join(" · ");

  return (
    <PageShell
      title="Portfolio Scorecard"
      description="Executive portfolio posture — Health, Confidence, and delivery pressure together."
      breadcrumbs={["APZ Projects", "Portfolio", "Scorecard"]}
      actions={
        <>
          <Button
            type="button"
            size="sm"
            onClick={() => router.push(portfolioWorkspacePath())}
            data-testid="portfolio-scorecard-workspace"
          >
            Portfolio Workspace
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(portfolioTimelinePath())}
            data-testid="portfolio-scorecard-timeline"
          >
            Timeline
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(portfolioAdminPath())}
            data-testid="portfolio-scorecard-admin"
          >
            Hierarchy admin
          </Button>
        </>
      }
    >
      {projection.isLoading ? <LoadingState label="Loading scorecard…" /> : null}
      {projection.isError ? (
        <ErrorState
          message={
            isProjectsApiError(projection.error)
              ? projection.error.message
              : "Unable to load portfolio scorecard."
          }
          onRetry={() => void projection.refetch()}
        />
      ) : null}
      {!projection.isLoading && !item ? (
        <EmptyState
          title="No active portfolio"
          description="Activate projects and administer hierarchy to populate the scorecard."
        />
      ) : null}
      {item ? (
        <div className="space-y-4" data-testid="portfolio-scorecard">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {item.operationalSummary?.pressureStatement ??
              "Health and Confidence are shown together."}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <ScoreRow
              label="Portfolio Health"
              value={String(item.health ?? "—")}
              detail={`Healthy ${pct?.healthy ?? 0}% · Attention ${pct?.attention ?? 0}% · Critical ${pct?.critical ?? 0}% · Trend ${trendArrow(item.healthTrend)} · Critical projects ${criticalProjects.length}${
                criticalProjects.length
                  ? ` — ${criticalProjects
                      .slice(0, 3)
                      .map((p) => p.name)
                      .join(", ")}`
                  : ""
              }`}
              onDrill={() => router.push(portfolioWorkspacePath())}
            />
            <ScoreRow
              label="Portfolio Confidence"
              value={`${item.confidenceScore ?? "—"} (${item.confidenceBand ?? "—"})`}
              detail={`Weighted operational model · ${topDrag || "No major drag factors"} · Δ ${item.projectedConfidenceDelta ?? 0}`}
              onDrill={() => router.push(portfolioWorkspacePath())}
            />
            <ScoreRow
              label="Strategic Objectives"
              value={`${item.objectives?.total ?? 0} objectives`}
              detail={`On track ${item.objectives?.onTrack ?? 0} · At risk ${item.objectives?.atRisk ?? 0} · Off track ${item.objectives?.offTrack ?? 0} · Achieved ${item.objectives?.achieved ?? 0}`}
              onDrill={() => router.push(portfolioAdminPath())}
            />
            <ScoreRow
              label="Delivery Trend"
              value={`${trendArrow(item.deliveryTrend?.direction)} ${item.deliveryTrend?.direction ?? "flat"}`}
              detail={`Slip ${item.deliveryTrend?.slippedMilestonesDelta ?? 0} · Aged waits ${item.deliveryTrend?.agedWaitsDelta ?? 0} · Confidence Δ ${item.deliveryTrend?.confidenceDelta ?? 0}`}
              onDrill={() => router.push(portfolioTimelinePath())}
            />
            <ScoreRow
              label="Exceptions"
              value={String(item.exceptionsOpen ?? 0)}
              detail={`Critical ${item.exceptionsCritical ?? 0} · Aged waits ${item.waitingAged ?? 0} · Broken deps ${item.dependenciesBroken ?? 0}`}
              onDrill={() => router.push(portfolioWorkspacePath())}
            />
            <ScoreRow
              label="Forecast"
              value={
                (item.forecastOutlook?.offTrack ?? item.forecastOffTrack ?? 0) > 0
                  ? "Off track pressure"
                  : (item.forecastOutlook?.atRisk ?? item.forecastAtRisk ?? 0) > 0
                    ? "At risk"
                    : "On track"
              }
              detail={`Off-track ${item.forecastOutlook?.offTrack ?? 0} · At risk ${item.forecastOutlook?.atRisk ?? 0} · Projected confidence Δ ${item.forecastOutlook?.projectedConfidenceDelta ?? 0}`}
              onDrill={() => router.push(portfolioWorkspacePath())}
            />
            <ScoreRow
              label="Operational Summary"
              value={`${item.childCount ?? 0} active projects`}
              detail={`Decisions under pressure ${item.operationalSummary?.decisionCount ?? 0} · Open scorecard drill for queue and hierarchy`}
              onDrill={() => router.push(portfolioWorkspacePath())}
            />
            <ScoreRow
              label="Critical projects"
              value={String(criticalProjects.length)}
              detail={
                criticalProjects.length
                  ? criticalProjects
                      .slice(0, 3)
                      .map((p) => p.name)
                      .join(" · ")
                  : "None critical"
              }
              onDrill={
                criticalProjects[0]
                  ? () => router.push(projectDetailPath(criticalProjects[0]!.id))
                  : () => router.push(portfolioWorkspacePath())
              }
            />
          </div>
          {(item.objectives?.items?.length ?? 0) > 0 ? (
            <section className="space-y-2" data-testid="portfolio-scorecard-objectives">
              <h2 className="text-sm font-semibold">Objective progress</h2>
              <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
                {item.objectives!.items.map((obj) => (
                  <li
                    key={obj.id}
                    className="flex justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <span>
                      {obj.name}{" "}
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        {obj.status}
                      </span>
                    </span>
                    <span>{obj.progress}%</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </PageShell>
  );
}
