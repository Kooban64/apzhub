"use client";

/**
 * W005 S-04 Portfolio Timeline — roadmap-first; cross-deps + critical path visible.
 */

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import { getPortfolioProjection } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { portfolioWorkspacePath, projectDetailPath } from "@/lib/projects/routes";

import { EmptyState, ErrorState, LoadingState, PageShell } from "./projects-ui";

type Mode = "roadmap" | "gantt";

type ProjectNode = {
  readonly id: string;
  readonly name: string;
  readonly health?: string;
  readonly confidenceScore?: number;
  readonly majorMilestones?: readonly {
    readonly id: string;
    readonly name: string;
    readonly targetDate?: string;
    readonly status?: string;
  }[];
  readonly dependencyEdges?: readonly {
    readonly id: string;
    readonly status: string;
    readonly critical?: boolean;
    readonly kind?: string;
  }[];
};

type ProgrammeNode = {
  readonly id: string;
  readonly name: string;
  readonly health?: string;
  readonly children?: readonly ProjectNode[];
  readonly criticalPathProjectIds?: readonly string[];
};

type InitiativeNode = {
  readonly id: string;
  readonly name: string;
  readonly programmes?: readonly ProgrammeNode[];
};

export function PortfolioTimelineView({
  permissions: _permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("roadmap");
  const projection = useQuery({
    queryKey: [...projectsQueryKeys.all, "portfolio-timeline"],
    queryFn: ({ signal }) => getPortfolioProjection("enterprise", { signal }),
  });

  const enterprise = (projection.data as { item?: Record<string, unknown> } | undefined)
    ?.item;
  const initiatives =
    (enterprise?.initiatives as readonly InitiativeNode[] | undefined) ?? [];
  const criticalPath = new Set(
    (
      (enterprise?.criticalPathProjectIds as readonly string[] | undefined) ?? []
    ).concat(
      initiatives.flatMap(
        (i) => i.programmes?.flatMap((p) => p.criticalPathProjectIds ?? []) ?? [],
      ),
    ),
  );

  const depCount = useMemo(() => {
    let n = 0;
    for (const ini of initiatives) {
      for (const prog of ini.programmes ?? []) {
        for (const proj of prog.children ?? []) {
          n += proj.dependencyEdges?.length ?? 0;
        }
      }
    }
    return n;
  }, [initiatives]);

  const today = new Date().toISOString();

  return (
    <PageShell
      title="Portfolio Timeline"
      description="Roadmap-first cross-project delivery windows — dependencies and critical path visible."
      breadcrumbs={["APZ Projects", "Portfolio", "Timeline"]}
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant={mode === "roadmap" ? "default" : "outline"}
            onClick={() => setMode("roadmap")}
            data-testid="portfolio-timeline-mode-roadmap"
          >
            Roadmap
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "gantt" ? "default" : "outline"}
            onClick={() => setMode("gantt")}
            data-testid="portfolio-timeline-mode-gantt"
          >
            Gantt (optional)
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(portfolioWorkspacePath())}
          >
            Portfolio Workspace
          </Button>
        </>
      }
    >
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-[var(--color-muted-foreground)]">
        <span>Today · {formatProjectsDate(today)}</span>
        <span>Cross-project dependencies · {depCount}</span>
        <span>Critical path projects · {criticalPath.size}</span>
        <span>
          Default: roadmap{mode === "gantt" ? " · Gantt view (compact bars)" : ""}
        </span>
      </div>
      {projection.isLoading ? <LoadingState label="Loading timeline…" /> : null}
      {projection.isError ? (
        <ErrorState
          message={
            isProjectsApiError(projection.error)
              ? projection.error.message
              : "Unable to load portfolio timeline."
          }
          onRetry={() => void projection.refetch()}
        />
      ) : null}
      {!projection.isLoading && initiatives.length === 0 ? (
        <EmptyState
          title="No timeline lanes"
          description="Create initiatives and programmes, then assign projects to populate swimlanes."
        />
      ) : null}
      {initiatives.length > 0 ? (
        <ul className="space-y-4" data-testid="portfolio-timeline">
          {initiatives.map((ini) => (
            <li
              key={ini.id}
              className="border border-[var(--color-border)]"
              data-testid={`portfolio-timeline-initiative-${ini.id}`}
            >
              <div className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/20 px-3 py-2 text-sm font-semibold">
                Strategic Initiative · {ini.name}
              </div>
              <ul>
                {(ini.programmes ?? []).map((prog) => (
                  <li
                    key={prog.id}
                    className="border-b border-[var(--color-border)] last:border-0"
                  >
                    <div className="px-3 py-2 text-sm font-medium">
                      Programme · {prog.name}{" "}
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        Health {prog.health ?? "—"}
                      </span>
                    </div>
                    <ul className="divide-y divide-[var(--color-border)]">
                      {(prog.children ?? []).map((proj) => {
                        const onPath = criticalPath.has(proj.id);
                        const broken = (proj.dependencyEdges ?? []).filter(
                          (d) => d.critical || d.status === "broken",
                        );
                        return (
                          <li key={proj.id}>
                            <button
                              type="button"
                              className="flex w-full flex-col gap-1 px-4 py-3 text-left text-sm hover:bg-[var(--color-muted)]/30"
                              onClick={() => router.push(projectDetailPath(proj.id))}
                              data-testid={`portfolio-timeline-project-${proj.id}`}
                            >
                              <span className="flex flex-wrap items-center gap-2 font-medium">
                                {proj.name}
                                {onPath ? (
                                  <span className="text-xs font-semibold text-[var(--color-destructive)]">
                                    Critical path
                                  </span>
                                ) : null}
                                <span className="text-xs text-[var(--color-muted-foreground)]">
                                  Health {proj.health ?? "—"} · Conf{" "}
                                  {proj.confidenceScore ?? "—"}
                                </span>
                              </span>
                              {(proj.majorMilestones ?? []).length > 0 ? (
                                <span className="text-xs text-[var(--color-muted-foreground)]">
                                  Milestones:{" "}
                                  {(proj.majorMilestones ?? [])
                                    .map(
                                      (m) =>
                                        `${m.name}${
                                          m.targetDate
                                            ? ` (${formatProjectsDate(m.targetDate)})`
                                            : ""
                                        }`,
                                    )
                                    .join(" · ")}
                                </span>
                              ) : (
                                <span className="text-xs text-[var(--color-muted-foreground)]">
                                  No open major milestones
                                </span>
                              )}
                              {broken.length > 0 ? (
                                <span className="text-xs text-[var(--color-destructive)]">
                                  Cross-project deps broken/critical: {broken.length}
                                </span>
                              ) : (proj.dependencyEdges?.length ?? 0) > 0 ? (
                                <span className="text-xs text-[var(--color-muted-foreground)]">
                                  Dependencies: {proj.dependencyEdges!.length}
                                </span>
                              ) : null}
                              {mode === "gantt" &&
                              (proj.majorMilestones?.[0]?.targetDate ||
                                proj.majorMilestones?.length) ? (
                                <span
                                  aria-hidden
                                  className="mt-1 block h-2 w-full max-w-md overflow-hidden bg-[var(--color-muted)]"
                                >
                                  <span
                                    className={`block h-full ${
                                      onPath
                                        ? "bg-[var(--color-destructive)]"
                                        : "bg-[var(--color-foreground)]"
                                    }`}
                                    style={{
                                      width: onPath ? "85%" : "55%",
                                    }}
                                  />
                                </span>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : null}
    </PageShell>
  );
}
