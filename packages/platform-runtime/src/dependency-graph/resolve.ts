import type { Capability } from "../capability/types";
import { withCapabilityLifecycleState } from "../capability/factory";
import { buildDependencyGraph } from "./build";
import { findDependencyCyclePath, hasDependencyCycle } from "./cycle-detection";
import { dependencyGraphError } from "./errors";
import type {
  DependencyGraphConfig,
  DependencyGraphSnapshot,
  DependencyResolutionResult,
} from "./types";

function validateInput(
  capabilities: readonly Capability[],
): ReturnType<typeof dependencyGraphError>[] {
  const errors: ReturnType<typeof dependencyGraphError>[] = [];

  if (capabilities.length === 0) {
    errors.push(
      dependencyGraphError(
        "EMPTY_GRAPH",
        "Cannot resolve dependencies for an empty capability set",
      ),
    );
    return errors;
  }

  const seen = new Set<string>();

  for (const capability of capabilities) {
    if (!capability.id) {
      errors.push(
        dependencyGraphError("INVALID_INPUT", "Capability id must not be empty", {
          capabilityId: capability.id,
          field: "id",
        }),
      );
    }

    if (seen.has(capability.id)) {
      errors.push(
        dependencyGraphError(
          "INVALID_INPUT",
          `Duplicate capability id "${capability.id}" in input set`,
          { capabilityId: capability.id, field: "id" },
        ),
      );
    } else {
      seen.add(capability.id);
    }

    if (capability.lifecycleState !== "validated") {
      errors.push(
        dependencyGraphError(
          "INVALID_INPUT",
          `Capability "${capability.id}" must be in "validated" lifecycle state (got "${capability.lifecycleState}")`,
          { capabilityId: capability.id, field: "lifecycleState" },
        ),
      );
    }
  }

  return errors;
}

function detectCycles(
  graph: DependencyGraphSnapshot,
): ReturnType<typeof dependencyGraphError>[] {
  if (!hasDependencyCycle(graph)) {
    return [];
  }

  const order = getTopologicalOrder(graph);
  const remaining = graph.nodes.filter((node) => !order.includes(node)).sort();
  const cycle = findDependencyCyclePath(graph, remaining[0] ?? graph.nodes[0] ?? "");

  return [
    dependencyGraphError(
      "CYCLE_DETECTED",
      `Circular dependency detected involving: ${cycle.join(" → ")}`,
      { cycle },
    ),
  ];
}

export function getTopologicalOrder(graph: DependencyGraphSnapshot): string[] {
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
  const order: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) break;
    order.push(node);

    for (const neighbour of [...(adjacency.get(node) ?? [])].sort()) {
      const next = (inDegree.get(neighbour) ?? 0) - 1;
      inDegree.set(neighbour, next);
      if (next === 0) {
        queue.push(neighbour);
        queue.sort();
      }
    }
  }

  return order;
}

export function resolveCapabilityDependencies(
  capabilities: readonly Capability[],
  config: DependencyGraphConfig = {},
): DependencyResolutionResult {
  const inputErrors = validateInput(capabilities);
  if (inputErrors.length > 0) {
    return { success: false, errors: inputErrors };
  }

  const buildResult = buildDependencyGraph(
    capabilities,
    config.additionalPlatformSeeds ?? [],
  );

  if (!buildResult.success) {
    return {
      success: false,
      errors: buildResult.errors,
      partialGraph: buildResult.partialGraph,
    };
  }

  const cycleErrors = detectCycles(buildResult.graph);
  if (cycleErrors.length > 0) {
    return {
      success: false,
      errors: cycleErrors,
      partialGraph: buildResult.graph,
    };
  }

  const order = getTopologicalOrder(buildResult.graph);
  const resolved = capabilities.map((capability) =>
    withCapabilityLifecycleState(capability, "dependencies-resolved"),
  );

  return {
    success: true,
    capabilities: resolved,
    order,
    graph: buildResult.graph,
  };
}
