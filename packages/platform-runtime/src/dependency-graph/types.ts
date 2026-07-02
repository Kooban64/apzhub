import type { Capability } from "../capability/types";
import type { DependencyGraphError } from "./errors";

export interface DependencyGraphEdge {
  readonly from: string;
  readonly to: string;
  readonly axis: "platform" | "services" | "integrations" | "modules";
}

export interface DependencyGraphSnapshot {
  readonly nodes: readonly string[];
  readonly edges: readonly DependencyGraphEdge[];
}

export interface DependencyResolutionSuccess {
  readonly success: true;
  readonly capabilities: readonly Capability[];
  readonly order: readonly string[];
  readonly graph: DependencyGraphSnapshot;
}

export interface DependencyResolutionFailure {
  readonly success: false;
  readonly errors: readonly DependencyGraphError[];
  readonly partialGraph?: DependencyGraphSnapshot;
}

export type DependencyResolutionResult =
  DependencyResolutionSuccess | DependencyResolutionFailure;

export interface DependencyGraphConfig {
  /** Additional ids treated as satisfied platform seeds beyond the default set. */
  readonly additionalPlatformSeeds?: readonly string[];
}
