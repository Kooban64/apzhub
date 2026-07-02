import type { Capability } from "../capability/types";
import { dependencyGraphError } from "./errors";
import { isPlatformSeedCapability } from "./platform-seeds";
import type { DependencyGraphEdge, DependencyGraphSnapshot } from "./types";

export interface BuildGraphResult {
  readonly success: true;
  readonly graph: DependencyGraphSnapshot;
  readonly capabilityIds: readonly string[];
}

export interface BuildGraphFailure {
  readonly success: false;
  readonly errors: ReturnType<typeof dependencyGraphError>[];
  readonly partialGraph?: DependencyGraphSnapshot;
}

export type BuildGraphOutcome = BuildGraphResult | BuildGraphFailure;

function axisForDependency(
  capability: Capability,
  dependencyId: string,
): DependencyGraphEdge["axis"] | undefined {
  if (capability.dependencies.platform.includes(dependencyId)) return "platform";
  if (capability.dependencies.services.includes(dependencyId)) return "services";
  if (capability.dependencies.integrations.includes(dependencyId))
    return "integrations";
  if (capability.dependencies.modules.includes(dependencyId)) return "modules";
  return undefined;
}

export function buildDependencyGraph(
  capabilities: readonly Capability[],
  additionalPlatformSeeds: readonly string[] = [],
): BuildGraphOutcome {
  const capabilityIds = capabilities.map((c) => c.id);
  const idSet = new Set(capabilityIds);
  const seedSet = new Set(additionalPlatformSeeds);

  const isResolvable = (dependencyId: string): boolean =>
    idSet.has(dependencyId) ||
    isPlatformSeedCapability(dependencyId) ||
    seedSet.has(dependencyId);

  const edges: DependencyGraphEdge[] = [];
  const errors: ReturnType<typeof dependencyGraphError>[] = [];

  for (const capability of capabilities) {
    for (const dependencyId of capability.dependencies.all) {
      if (!isResolvable(dependencyId)) {
        errors.push(
          dependencyGraphError(
            "MISSING_DEPENDENCY",
            `Capability "${capability.id}" declares missing dependency "${dependencyId}"`,
            { capabilityId: capability.id, dependencyId },
          ),
        );
        continue;
      }

      if (!idSet.has(dependencyId)) {
        continue;
      }

      const axis = axisForDependency(capability, dependencyId);
      edges.push({
        from: dependencyId,
        to: capability.id,
        axis: axis ?? "platform",
      });
    }
  }

  const graph: DependencyGraphSnapshot = {
    nodes: [...capabilityIds].sort(),
    edges,
  };

  if (errors.length > 0) {
    return { success: false, errors, partialGraph: graph };
  }

  return { success: true, graph, capabilityIds };
}
