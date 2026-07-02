import type { CapabilityKind } from "../manifest-engine/capability-kinds";
import type { CapabilityManifest } from "../manifest-engine";
import type { CapabilityMetadata } from "../manifest-engine/schemas/envelope";

/** Ordered capability lifecycle states per SPR-002. */
export type CapabilityLifecycleState =
  | "discovered"
  | "validated"
  | "dependencies-resolved"
  | "registered"
  | "initialised"
  | "healthy"
  | "active"
  | "failed"
  | "disabled"
  | "degraded";

/** All capability lifecycle states in progression order (excludes failure states). */
export const CAPABILITY_LIFECYCLE_PROGRESSION: readonly CapabilityLifecycleState[] = [
  "discovered",
  "validated",
  "dependencies-resolved",
  "registered",
  "initialised",
  "healthy",
  "active",
] as const;

/** Terminal or operational failure lifecycle states. */
export const CAPABILITY_LIFECYCLE_FAILURE_STATES: readonly CapabilityLifecycleState[] =
  ["failed", "disabled", "degraded"] as const;

export type CapabilityHealthState = "unknown" | "healthy" | "unhealthy" | "degraded";

export interface NormalisedDependencies {
  readonly platform: readonly string[];
  readonly services: readonly string[];
  readonly integrations: readonly string[];
  readonly modules: readonly string[];
  /** Deduplicated union of all dependency ids across axes. */
  readonly all: readonly string[];
}

/** Primary runtime abstraction — seven required facets. */
export interface Capability {
  readonly id: string;
  readonly kind: CapabilityKind;
  readonly manifest: CapabilityManifest;
  readonly metadata: CapabilityMetadata;
  readonly dependencies: NormalisedDependencies;
  readonly lifecycleState: CapabilityLifecycleState;
  readonly healthState: CapabilityHealthState;
  readonly version: string;
}

export interface BuildCapabilityOptions {
  lifecycleState?: CapabilityLifecycleState;
  healthState?: CapabilityHealthState;
}
