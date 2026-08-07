"use client";

/**
 * W005 S-03 Portfolio Workspace — Overview · Hierarchy · Queue · Changes · Context.
 * Same operational grammar as S-01, scoped to the enterprise portfolio.
 */

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import {
  getPortfolioProjection,
  getWorkspaceChanges,
  getWorkspaceOverview,
  getWorkspaceQueue,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import {
  portfolioInitiativePath,
  portfolioProgrammePath,
  portfolioScorecardPath,
  projectDetailPath,
  projectsDashboardPath,
} from "@/lib/projects/routes";

import { EnterpriseContextPanel } from "./enterprise-context-panel";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  ProjectsWorkspaceFrame,
} from "./projects-ui";

type HierarchyNode = {
  readonly level: string;
  readonly id: string;
  readonly name: string;
  readonly health?: string;
  readonly confidenceScore?: number;
  readonly confidenceBand?: string;
  readonly childCount?: number;
  readonly children?: readonly HierarchyNode[];
  readonly programmes?: readonly HierarchyNode[];
  readonly healthDistribution?: {
    readonly healthy: number;
    readonly watch: number;
    readonly critical: number;
  };
  readonly exceptionsOpen?: number;
  readonly waitingAged?: number;
  readonly forecastOffTrack?: number;
};

function healthClass(label: string | undefined): string {
  if (label === "Critical") return "text-[var(--color-destructive)]";
  if (label === "Watch")
    return "text-[var(--color-warning,var(--color-muted-foreground))]";
  return "text-[var(--color-foreground)]";
}

function HierarchyBranch({
  node,
  depth = 0,
  onOpenProject,
  onOpenProgramme,
  onOpenInitiative,
}: {
  readonly node: HierarchyNode;
  readonly depth?: number;
  readonly onOpenProject: (id: string) => void;
  readonly onOpenProgramme: (id: string) => void;
  readonly onOpenInitiative: (id: string) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const children =
    node.programmes ?? (node.children as readonly HierarchyNode[] | undefined) ?? [];
  const hasChildren = children.length > 0;
  const isProject = node.level === "project";

  return (
    <li className="border-b border-[var(--color-border)] last:border-0">
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm"
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            data-testid={`portfolio-hierarchy-toggle-${node.id}`}
          >
            {open ? "▾" : "▸"}
          </Button>
        ) : (
          <span className="inline-block w-8" aria-hidden />
        )}
        <button
          type="button"
          className="min-w-0 flex-1 text-left hover:bg-[var(--color-muted)]/20"
          onClick={() => {
            if (isProject) onOpenProject(node.id);
            else if (node.level === "programme") onOpenProgramme(node.id);
            else if (node.level === "initiative") onOpenInitiative(node.id);
          }}
          data-testid={`portfolio-hierarchy-${node.level}-${node.id}`}
        >
          <span className="font-medium text-[var(--color-foreground)]">
            {node.level === "initiative"
              ? "Strategic Initiative"
              : node.level === "programme"
                ? "Programme"
                : node.level === "project"
                  ? "Project"
                  : "Portfolio"}{" "}
            · {node.name}
          </span>
          <span className={`ml-2 text-xs ${healthClass(node.health)}`}>
            Health {node.health ?? "—"}
          </span>
          <span className="ml-2 text-xs text-[var(--color-muted-foreground)]">
            Conf {node.confidenceScore ?? "—"}
            {node.confidenceBand ? ` (${node.confidenceBand})` : ""}
          </span>
          {node.childCount !== undefined ? (
            <span className="ml-2 text-xs text-[var(--color-muted-foreground)]">
              {node.childCount} projects
            </span>
          ) : null}
        </button>
      </div>
      {open && hasChildren ? (
        <ul>
          {children.map((child) => (
            <HierarchyBranch
              key={`${child.level}-${child.id}`}
              node={child}
              depth={depth + 1}
              onOpenProject={onOpenProject}
              onOpenProgramme={onOpenProgramme}
              onOpenInitiative={onOpenInitiative}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function PortfolioWorkspaceView({
  permissions: _permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const [contextFocus, setContextFocus] = useState<{
    type: "portfolio" | "programme" | "initiative" | "project";
    id: string;
    name?: string;
  }>({ type: "portfolio", id: "enterprise", name: "Enterprise Portfolio" });

  const overview = useQuery({
    queryKey: projectsQueryKeys.workspaceOverview(),
    queryFn: ({ signal }) => getWorkspaceOverview({ signal }),
  });
  const queue = useQuery({
    queryKey: projectsQueryKeys.workspaceQueue(),
    queryFn: ({ signal }) => getWorkspaceQueue({ signal }),
  });
  const changes = useQuery({
    queryKey: projectsQueryKeys.workspaceChanges(),
    queryFn: ({ signal }) => getWorkspaceChanges({ signal }),
  });
  const projection = useQuery({
    queryKey: [...projectsQueryKeys.all, "portfolio-projection", "enterprise"],
    queryFn: ({ signal }) => getPortfolioProjection("enterprise", { signal }),
  });

  const enterprise = useMemo(() => {
    const data = projection.data as
      { item?: HierarchyNode; level?: string } | undefined;
    return data?.item ?? null;
  }, [projection.data]);

  return (
    <PageShell
      title="Portfolio Workspace"
      description="Portfolio operational state, hierarchy, and attention."
      breadcrumbs={["APZ Projects", "Portfolio", "Workspace"]}
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(portfolioScorecardPath())}
            data-testid="portfolio-workspace-scorecard"
          >
            Scorecard
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(projectsDashboardPath())}
            data-testid="portfolio-workspace-ops"
          >
            Operational Workspace
          </Button>
        </>
      }
    >
      <ProjectsWorkspaceFrame
        context={
          contextFocus.type === "project" ? (
            <EnterpriseContextPanel
              focusType="project"
              focusId={contextFocus.id}
              focusName={contextFocus.name}
            />
          ) : (
            <section aria-label="Enterprise Context" className="space-y-2">
              <h2 className="text-sm font-semibold">Enterprise Context</h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Portfolio focus: {contextFocus.name ?? contextFocus.id}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Workflow · Support · Governance · Documents · Knowledge
              </p>
            </section>
          )
        }
      >
        <section
          aria-label="Portfolio Overview"
          className="space-y-3 border-b border-[var(--color-border)] pb-4"
          data-testid="portfolio-overview-band"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Portfolio Overview</h2>
            {overview.data ? (
              <p className="text-xs text-[var(--color-muted-foreground)]">
                As of {formatProjectsDate(overview.data.asOf)}
              </p>
            ) : null}
          </div>
          {overview.isLoading ? <LoadingState label="Loading overview…" /> : null}
          {overview.isError ? (
            <ErrorState
              message={
                isProjectsApiError(overview.error)
                  ? overview.error.message
                  : "Unable to load portfolio overview."
              }
              onRetry={() => void overview.refetch()}
            />
          ) : null}
          {overview.data ? (
            <>
              <p className="text-sm">{overview.data.pressureStatement}</p>
              <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <dt className="text-xs text-[var(--color-muted-foreground)]">
                    Health
                  </dt>
                  <dd>
                    Critical {overview.data.health.critical} · Watch{" "}
                    {overview.data.health.watch} · Healthy{" "}
                    {overview.data.health.healthy}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-muted-foreground)]">
                    Confidence
                  </dt>
                  <dd>
                    Portfolio {overview.data.confidence.mean} · Low{" "}
                    {overview.data.confidence.lowCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-muted-foreground)]">
                    Attention
                  </dt>
                  <dd>
                    Decision {overview.data.attention.decision} · Attention{" "}
                    {overview.data.attention.attention} · Waiting{" "}
                    {overview.data.attention.waiting}
                  </dd>
                </div>
                {enterprise ? (
                  <div>
                    <dt className="text-xs text-[var(--color-muted-foreground)]">
                      Hierarchy pressure
                    </dt>
                    <dd>
                      Exceptions {enterprise.exceptionsOpen ?? 0} · Aged waits{" "}
                      {enterprise.waitingAged ?? 0} · Off-track forecast{" "}
                      {enterprise.forecastOffTrack ?? 0}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </>
          ) : null}
        </section>

        <section
          aria-label="Portfolio Queue"
          className="space-y-3"
          data-testid="portfolio-queue"
        >
          <h2 className="text-base font-semibold">Portfolio Queue</h2>
          {queue.isLoading ? <LoadingState label="Loading queue…" /> : null}
          {queue.data ? (
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="border border-[var(--color-border)] px-3 py-2">
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Requires Decision
                </dt>
                <dd className="text-lg font-semibold">{queue.data.decision.length}</dd>
              </div>
              <div className="border border-[var(--color-border)] px-3 py-2">
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Requires Attention
                </dt>
                <dd className="text-lg font-semibold">{queue.data.attention.length}</dd>
              </div>
              <div className="border border-[var(--color-border)] px-3 py-2">
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Waiting On Others
                </dt>
                <dd className="text-lg font-semibold">
                  {queue.data.waitingOnOthers.length}
                </dd>
              </div>
            </dl>
          ) : null}
          {queue.data?.decision.slice(0, 8).map((item) => (
            <button
              key={item.id}
              type="button"
              className="block w-full border border-[var(--color-border)] px-3 py-2 text-left text-sm hover:bg-[var(--color-muted)]/30"
              onClick={() => router.push(item.targetPath)}
              data-testid={`portfolio-queue-row-${item.id}`}
            >
              <span className="text-xs uppercase text-[var(--color-muted-foreground)]">
                {item.kind}
              </span>{" "}
              <span className="font-medium">{item.statement}</span>
              <span className="block text-xs text-[var(--color-muted-foreground)]">
                {item.projectName}
              </span>
            </button>
          ))}
        </section>

        <section
          aria-label="Portfolio Hierarchy"
          className="space-y-3"
          data-testid="portfolio-hierarchy"
        >
          <h2 className="text-base font-semibold">Portfolio Hierarchy</h2>
          {projection.isLoading ? <LoadingState label="Loading hierarchy…" /> : null}
          {projection.isError ? (
            <ErrorState
              message={
                isProjectsApiError(projection.error)
                  ? projection.error.message
                  : "Unable to load portfolio hierarchy."
              }
              onRetry={() => void projection.refetch()}
            />
          ) : null}
          {enterprise ? (
            <ul className="border border-[var(--color-border)]">
              <HierarchyBranch
                node={enterprise}
                onOpenProject={(id) => {
                  setContextFocus({ type: "project", id });
                  router.push(projectDetailPath(id));
                }}
                onOpenProgramme={(id) => {
                  setContextFocus({
                    type: "programme",
                    id,
                    name: id,
                  });
                  router.push(portfolioProgrammePath(id));
                }}
                onOpenInitiative={(id) => {
                  setContextFocus({
                    type: "initiative",
                    id,
                    name: id,
                  });
                  router.push(portfolioInitiativePath(id));
                }}
              />
            </ul>
          ) : !projection.isLoading ? (
            <EmptyState
              title="No portfolio hierarchy"
              description="Active projects will appear under programmes and initiatives as membership is set."
            />
          ) : null}
        </section>

        <section
          aria-label="Portfolio Changes"
          className="space-y-3"
          data-testid="portfolio-changes"
        >
          <h2 className="text-base font-semibold">Operational Changes</h2>
          {changes.isLoading ? <LoadingState label="Loading changes…" /> : null}
          {changes.data && changes.data.items.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No meaningful portfolio changes in the current window.
            </p>
          ) : null}
          {changes.data?.items.slice(0, 12).map((item) => (
            <button
              key={item.id}
              type="button"
              className="block w-full border border-[var(--color-border)] px-3 py-2 text-left text-sm hover:bg-[var(--color-muted)]/30"
              onClick={() => {
                if (item.targetPath) router.push(item.targetPath);
              }}
              data-testid={`portfolio-change-${item.id}`}
            >
              <p className="font-medium">{item.headline}</p>
              <p className="text-[var(--color-muted-foreground)]">{item.whyCare}</p>
            </button>
          ))}
        </section>
      </ProjectsWorkspaceFrame>
    </PageShell>
  );
}
