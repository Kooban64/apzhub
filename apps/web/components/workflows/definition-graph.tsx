"use client";

import { useMemo } from "react";

import type {
  WorkflowDefinitionConnectionViewModel,
  WorkflowDefinitionGraphViewModel,
  WorkflowDefinitionNodeViewModel,
} from "@/lib/workflows/workflow-types";

function orderNodes(
  nodes: readonly WorkflowDefinitionNodeViewModel[],
  connections: readonly WorkflowDefinitionConnectionViewModel[],
): WorkflowDefinitionNodeViewModel[] {
  if (nodes.length === 0) return [];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const targets = new Set(connections.map((c) => c.targetNodeId));
  const roots = nodes.filter((n) => !targets.has(n.id));
  const ordered: WorkflowDefinitionNodeViewModel[] = [];
  const visited = new Set<string>();
  const queue = roots.length > 0 ? [...roots] : [nodes[0]];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);
    ordered.push(current);
    for (const edge of connections) {
      if (edge.sourceNodeId === current.id) {
        const next = byId.get(edge.targetNodeId);
        if (next && !visited.has(next.id)) queue.push(next);
      }
    }
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) ordered.push(node);
  }
  return ordered;
}

export function DefinitionGraph({
  graph,
  title = "Definition Graph",
}: {
  readonly graph: WorkflowDefinitionGraphViewModel | null | undefined;
  readonly title?: string;
}) {
  const ordered = useMemo(
    () =>
      graph
        ? orderNodes(graph.nodes, graph.connections)
        : ([] as WorkflowDefinitionNodeViewModel[]),
    [graph],
  );

  if (!graph || graph.nodes.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-6 text-center"
        data-testid="definition-graph-empty"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No graph nodes to display.
        </p>
      </div>
    );
  }

  const width = 320;
  const rowHeight = 72;
  const height = Math.max(120, ordered.length * rowHeight + 24);

  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)] p-3"
      data-testid="definition-graph"
      aria-label={title}
    >
      <h2 className="mb-2 text-base font-semibold text-[var(--color-foreground)]">
        {title}
      </h2>
      <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
        Read-only vertical flow — editing is not available.
      </p>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Workflow definition graph"
        data-testid="definition-graph-svg"
      >
        {ordered.map((node, index) => {
          const y = 16 + index * rowHeight;
          const next = ordered[index + 1];
          return (
            <g key={node.id} data-testid={`graph-node-${node.id}`}>
              {next ? (
                <line
                  x1={width / 2}
                  y1={y + 40}
                  x2={width / 2}
                  y2={y + rowHeight}
                  stroke="var(--color-border)"
                  strokeWidth={2}
                />
              ) : null}
              <rect
                x={40}
                y={y}
                width={width - 80}
                height={44}
                rx={6}
                fill="var(--color-muted)"
                fillOpacity={0.25}
                stroke="var(--color-border)"
              />
              <text
                x={width / 2}
                y={y + 20}
                textAnchor="middle"
                fill="var(--color-foreground)"
                fontSize={12}
                fontWeight={600}
              >
                {node.label ?? node.id}
              </text>
              <text
                x={width / 2}
                y={y + 36}
                textAnchor="middle"
                fill="var(--color-muted-foreground)"
                fontSize={10}
              >
                {[node.nodeKind, node.kind].filter(Boolean).join(" · ")}
              </text>
            </g>
          );
        })}
      </svg>
      <ol className="mt-3 flex flex-col gap-1 text-sm md:hidden">
        {ordered.map((node) => (
          <li key={`list-${node.id}`} className="text-[var(--color-foreground)]">
            {node.label ?? node.id}
          </li>
        ))}
      </ol>
    </div>
  );
}
