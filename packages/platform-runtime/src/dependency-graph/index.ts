export { buildDependencyGraph } from "./build";
export { findDependencyCyclePath, hasDependencyCycle } from "./cycle-detection";
export {
  dependencyGraphError,
  type DependencyGraphError,
  type DependencyGraphErrorCode,
} from "./errors";
export {
  isPlatformSeedCapability,
  PLATFORM_SEED_CAPABILITIES,
  type PlatformSeedCapabilityId,
} from "./platform-seeds";
export { getTopologicalOrder, resolveCapabilityDependencies } from "./resolve";
export type {
  DependencyGraphConfig,
  DependencyGraphEdge,
  DependencyGraphSnapshot,
  DependencyResolutionFailure,
  DependencyResolutionResult,
  DependencyResolutionSuccess,
} from "./types";

export const DEPENDENCY_GRAPH_STATUS = "active" as const;
