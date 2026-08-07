"use client";

/**
 * W005 Programme / Initiative Workspace shells — five-intent grammar placeholder
 * until membership SoR deepens; uses portfolio projection for posture.
 */

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import { getPortfolioProjection } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import {
  portfolioScorecardPath,
  portfolioTimelinePath,
  portfolioWorkspacePath,
  projectDetailPath,
} from "@/lib/projects/routes";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  ProjectsWorkspaceFrame,
} from "./projects-ui";

type NodeKind = "programme" | "initiative";

const INTENTS = ["overview", "delivery", "planning", "control", "history"] as const;

type Intent = (typeof INTENTS)[number];

export function PortfolioNodeWorkspaceView({
  kind,
  nodeId,
  permissions: _permissions,
}: {
  readonly kind: NodeKind;
  readonly nodeId: string;
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const [intent, setIntent] = useState<Intent>("overview");
  const level = kind === "programme" ? "programme" : "initiative";

  const projection = useQuery({
    queryKey: [...projectsQueryKeys.all, "portfolio-node", level, nodeId],
    queryFn: ({ signal }) => getPortfolioProjection(level, { signal }),
  });

  const node = useMemo(() => {
    const items =
      ((projection.data as { items?: readonly Record<string, unknown>[] })?.items as
        readonly Record<string, unknown>[] | undefined) ?? [];
    return items.find((item) => String(item.id) === nodeId) ?? null;
  }, [projection.data, nodeId]);

  const title = String(node?.name ?? nodeId);
  const children =
    (node?.children as readonly Record<string, unknown>[] | undefined) ??
    (node?.programmes as readonly Record<string, unknown>[] | undefined) ??
    [];

  return (
    <PageShell
      title={title}
      description={`${kind === "programme" ? "Programme" : "Strategic Initiative"} workspace`}
      breadcrumbs={[
        "APZ Projects",
        "Portfolio",
        kind === "programme" ? "Programme" : "Initiative",
        title,
      ]}
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(portfolioWorkspacePath())}
          >
            Portfolio Workspace
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(portfolioScorecardPath())}
          >
            Scorecard
          </Button>
        </>
      }
    >
      <ProjectsWorkspaceFrame
        context={
          <section aria-label="Enterprise Context" className="space-y-2">
            <h2 className="text-sm font-semibold">Enterprise Context</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {kind === "programme" ? "Programme" : "Initiative"} · {title}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Open a member project to compose Context from owning products.
            </p>
          </section>
        }
      >
        <nav
          aria-label={`${kind} intents`}
          className="flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2"
          data-testid={`portfolio-${kind}-intents`}
        >
          {INTENTS.map((id) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={intent === id ? "default" : "outline"}
              onClick={() => setIntent(id)}
              data-testid={`portfolio-${kind}-intent-${id}`}
            >
              {id[0]!.toUpperCase() + id.slice(1)}
            </Button>
          ))}
        </nav>

        {projection.isLoading ? <LoadingState label="Loading…" /> : null}
        {projection.isError ? (
          <ErrorState
            message={
              isProjectsApiError(projection.error)
                ? projection.error.message
                : `Unable to load ${kind}.`
            }
            onRetry={() => void projection.refetch()}
          />
        ) : null}
        {!projection.isLoading && !node ? (
          <EmptyState
            title={`${kind === "programme" ? "Programme" : "Initiative"} not found`}
            description="Membership may be unassigned, or the identifier is not present in the current roll-up."
          />
        ) : null}

        {node && intent === "overview" ? (
          <section className="space-y-3" data-testid={`portfolio-${kind}-overview`}>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">Health</dt>
                <dd>{String(node.health ?? "—")}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Confidence
                </dt>
                <dd>
                  {String(node.confidenceScore ?? "—")} (
                  {String(node.confidenceBand ?? "—")})
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Exceptions
                </dt>
                <dd>{String(node.exceptionsOpen ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Aged waits
                </dt>
                <dd>{String(node.waitingAged ?? 0)}</dd>
              </div>
            </dl>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Pulse: Health and Confidence shown together for this {kind}. Member
              delivery detail opens in Project Cockpit.
            </p>
          </section>
        ) : null}

        {node && intent === "delivery" ? (
          <section className="space-y-3" data-testid={`portfolio-${kind}-delivery`}>
            <h2 className="text-sm font-semibold">Delivery</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Same operational grammar as Project Workspace — member Health, Confidence,
              exceptions, and aged waits. Open a member for full cockpit fidelity.
            </p>
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Open exceptions
                </dt>
                <dd>{String(node.exceptionsOpen ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Aged waits
                </dt>
                <dd>{String(node.waitingAged ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Confidence
                </dt>
                <dd>
                  {String(node.confidenceScore ?? "—")} (
                  {String(node.confidenceBand ?? "—")})
                </dd>
              </div>
            </dl>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(portfolioScorecardPath())}
            >
              Open Portfolio Scorecard
            </Button>
          </section>
        ) : null}

        {node && intent === "planning" ? (
          <section className="space-y-3" data-testid={`portfolio-${kind}-planning`}>
            <h2 className="text-sm font-semibold">Planning</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Roadmap-first timeline with cross-project dependencies and critical path —
              same Portfolio Timeline model used at enterprise level.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(portfolioTimelinePath())}
            >
              Open Portfolio Timeline
            </Button>
          </section>
        ) : null}

        {node && intent === "control" ? (
          <section className="space-y-3" data-testid={`portfolio-${kind}-control`}>
            <h2 className="text-sm font-semibold">Control</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Escalated pressure on this {kind}. Resolve via member Project Cockpit
              Control surfaces — no parallel interaction model.
            </p>
            <p className="text-sm">
              Exceptions requiring attention:{" "}
              <strong>{String(node.exceptionsOpen ?? 0)}</strong>
            </p>
          </section>
        ) : null}

        {node && intent === "history" ? (
          <section className="space-y-3" data-testid={`portfolio-${kind}-history`}>
            <h2 className="text-sm font-semibold">History</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Node status and membership changes are administered under Portfolio Admin.
              Project-level history remains on each member cockpit.
            </p>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">Status</dt>
                <dd>{String(node.status ?? "—")}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Last updated
                </dt>
                <dd>{String(node.updatedAt ?? "—")}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {node ? (
          <section className="space-y-2" data-testid={`portfolio-${kind}-members`}>
            <h2 className="text-sm font-semibold">Members</h2>
            {children.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No members in this roll-up.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
                {children.map((child) => (
                  <li key={String(child.id)}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-muted)]/30"
                      onClick={() => {
                        if (String(child.level) === "project") {
                          router.push(projectDetailPath(String(child.id)));
                        }
                      }}
                    >
                      <span className="font-medium">{String(child.name)}</span>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        {String(child.health ?? "—")} · Conf{" "}
                        {String(child.confidenceScore ?? "—")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </ProjectsWorkspaceFrame>
    </PageShell>
  );
}
