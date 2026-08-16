"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { QEP_PR_QUALITY_ROUTES } from "@/lib/qep/pr-quality-routes";
import {
  parseQepQualityGraphChangeId,
  QEP_QUALITY_GRAPH_ROUTES,
} from "@/lib/qep/quality-graph-routes";
import { SOURCE_ROUTES } from "@/lib/source/routes";

import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "./qep-ui";

type ChangeRow = {
  changeEventId: string;
  kind: string;
  title?: string;
  summary: string;
  occurredAt: string;
};

type ImpactBundle = {
  impact: {
    changeEventId: string;
    riskLevel: string;
    summary: string;
    nodes: Array<{
      nodeId: string;
      name: string;
      assetType: string;
      reason: string;
      depth: number;
      platformRef?: string;
    }>;
    edges: Array<{
      edgeId: string;
      fromNodeId: string;
      toNodeId: string;
      kind: string;
      reason: string;
    }>;
    matchedSuiteIds: string[];
    inferredRequirementIds: string[];
    inferredDefectIds: string[];
  };
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body = (await response.json()) as {
    data?: T;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

/**
 * Stream 2 signature — object-centred Quality Graph (list/hierarchy for a11y).
 * Advisory impact projection only; never certifies.
 */
export function QepQualityGraphRouterView() {
  const pathname = usePathname() ?? "";
  const changeEventId = parseQepQualityGraphChangeId(pathname);
  if (changeEventId) {
    return <QualityGraphDetailView changeEventId={changeEventId} />;
  }
  return <QualityGraphHomeView />;
}

function QualityGraphHomeView() {
  const changesQuery = useQuery({
    queryKey: ["qep-quality-graph", "changes"],
    queryFn: () =>
      fetchJson<{ changes: ChangeRow[] }>("/api/v1/qep/scm/changes?limit=60"),
  });

  if (changesQuery.isLoading) {
    return <QepLoadingState label="Loading changes for Quality Graph…" />;
  }
  if (changesQuery.isError) {
    return <QepErrorState message={(changesQuery.error as Error).message} />;
  }

  const changes = changesQuery.data?.changes ?? [];

  return (
    <QepPageShell
      title="Quality Graph"
      description="Object-centred relationship explorer for a change — requirements, suites, defects, and path impact. List/hierarchy for accessibility; not decorative."
      breadcrumbs={["QEP", "Quality Graph"]}
      actions={
        <Link
          href={QEP_PR_QUALITY_ROUTES.home}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          PR Quality
        </Link>
      }
    >
      <QepPanel title="Select a change">
        {changes.length === 0 ? (
          <QepEmptyState title="No change events yet — sync Source to explore the graph." />
        ) : (
          <ul
            className="divide-y divide-[var(--color-border)]"
            data-testid="qep-quality-graph-list"
          >
            {changes.map((change) => (
              <li
                key={change.changeEventId}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <Link
                    href={QEP_QUALITY_GRAPH_ROUTES.byChange(change.changeEventId)}
                    className="font-medium hover:underline"
                  >
                    {change.title ?? change.summary}
                  </Link>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {change.kind} · {change.occurredAt}
                  </p>
                </div>
                <Link
                  href={QEP_QUALITY_GRAPH_ROUTES.byChange(change.changeEventId)}
                  className="text-xs underline"
                >
                  Open graph
                </Link>
              </li>
            ))}
          </ul>
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function QualityGraphDetailView({ changeEventId }: { readonly changeEventId: string }) {
  const impactQuery = useQuery({
    queryKey: ["qep-quality-graph", "impact", changeEventId],
    queryFn: () =>
      fetchJson<ImpactBundle>(
        `/api/v1/qep/scm/changes/${encodeURIComponent(changeEventId)}/impact`,
      ),
  });

  if (impactQuery.isLoading) {
    return <QepLoadingState label="Loading Quality Graph…" />;
  }
  if (impactQuery.isError || !impactQuery.data) {
    return (
      <QepErrorState
        message={
          impactQuery.error instanceof Error
            ? impactQuery.error.message
            : "Impact unavailable"
        }
      />
    );
  }

  const { impact } = impactQuery.data;
  const root = impact.nodes.find((n) => n.depth === 0);
  const children = impact.nodes.filter((n) => n.depth > 0);
  const edgesByFrom = new Map<string, typeof impact.edges>();
  for (const edge of impact.edges) {
    const list = edgesByFrom.get(edge.fromNodeId) ?? [];
    list.push(edge);
    edgesByFrom.set(edge.fromNodeId, list);
  }

  return (
    <QepPageShell
      title="Quality Graph"
      description={impact.summary}
      breadcrumbs={["QEP", "Quality Graph", changeEventId]}
      actions={
        <>
          <Link
            href={QEP_QUALITY_GRAPH_ROUTES.home}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            All changes
          </Link>
          <Link
            href={QEP_PR_QUALITY_ROUTES.byChange(changeEventId)}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            PR Quality
          </Link>
          <Link
            href={SOURCE_ROUTES.change(changeEventId)}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Source
          </Link>
        </>
      }
    >
      <div
        className="grid gap-4 lg:grid-cols-[1fr_280px]"
        data-testid="qep-quality-graph-detail"
      >
        <QepPanel title="Relationship hierarchy">
          <p className="mb-3 text-sm">
            <QepStatusBadge status={impact.riskLevel} /> Risk ·{" "}
            {impact.matchedSuiteIds.length} suites ·{" "}
            {impact.inferredRequirementIds.length} requirements ·{" "}
            {impact.inferredDefectIds.length} defects
          </p>
          {root ? (
            <div className="rounded border border-[var(--color-border)] p-3">
              <p className="font-medium">
                {root.name}{" "}
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  ({root.assetType})
                </span>
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {root.reason}
              </p>
              <ul className="mt-3 space-y-2 border-l-2 border-[var(--color-border)] pl-3">
                {children.map((node) => {
                  const edge = (edgesByFrom.get(root.nodeId) ?? []).find(
                    (e) => e.toNodeId === node.nodeId,
                  );
                  return (
                    <li key={node.nodeId} className="text-sm">
                      <span className="font-medium">{node.name}</span>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        {" "}
                        · {node.assetType}
                        {edge ? ` · ${edge.kind}` : ""}
                      </span>
                      <p className="text-xs text-[var(--color-muted-foreground)]">
                        {node.reason}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <QepEmptyState title="No graph nodes for this change." />
          )}
        </QepPanel>

        <div className="flex flex-col gap-4">
          <QepPanel title="Edges (table)">
            {impact.edges.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No edges yet.
              </p>
            ) : (
              <ul className="max-h-80 space-y-2 overflow-auto text-xs">
                {impact.edges.map((edge) => (
                  <li key={edge.edgeId} className="font-mono">
                    {edge.fromNodeId} → {edge.toNodeId}
                    <span className="block font-sans text-[var(--color-muted-foreground)]">
                      {edge.kind}: {edge.reason}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </QepPanel>
        </div>
      </div>
    </QepPageShell>
  );
}
