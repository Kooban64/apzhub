import type { DependencyGraphSnapshot } from "./types";

/** Returns a cycle path starting from `start`, or `[start]` when no cycle is found from that node. */
export function findDependencyCyclePath(
  graph: DependencyGraphSnapshot,
  start: string,
): string[] {
  const adjacency = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const list = adjacency.get(edge.from) ?? [];
    list.push(edge.to);
    adjacency.set(edge.from, list);
  }

  const visited = new Set<string>();
  const path: string[] = [];

  const dfs = (node: string): string[] | null => {
    if (path.includes(node)) {
      const cycleStart = path.indexOf(node);
      return [...path.slice(cycleStart), node];
    }
    if (visited.has(node)) return null;

    visited.add(node);
    path.push(node);

    for (const next of [...(adjacency.get(node) ?? [])].sort()) {
      const cycle = dfs(next);
      if (cycle) return cycle;
    }

    path.pop();
    return null;
  };

  return dfs(start) ?? [start];
}

export function hasDependencyCycle(graph: DependencyGraphSnapshot): boolean {
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of graph.nodes) {
    adjacency.set(node, []);
    inDegree.set(node, 0);
  }

  for (const edge of graph.edges) {
    adjacency.get(edge.from)?.push(edge.to);
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
  }

  const queue = [...graph.nodes]
    .filter((node) => (inDegree.get(node) ?? 0) === 0)
    .sort();
  let processed = 0;

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) break;
    processed += 1;

    for (const neighbour of [...(adjacency.get(node) ?? [])].sort()) {
      const next = (inDegree.get(neighbour) ?? 0) - 1;
      inDegree.set(neighbour, next);
      if (next === 0) {
        queue.push(neighbour);
        queue.sort();
      }
    }
  }

  return processed !== graph.nodes.length;
}
