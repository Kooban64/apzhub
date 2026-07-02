import type {
  CapabilityHealthState,
  CapabilityLifecycleState,
  NormalisedDependencies,
} from "../capability/types";
import type { CapabilityKind } from "../manifest-engine/capability-kinds";
import type { CapabilityManifest } from "../manifest-engine";
import type { CapabilityMetadata } from "../manifest-engine/schemas/envelope";
import type { RegistryError } from "./errors";

/** Runtime status tracked by the Capability Registry (not lifecycle). */
export type RuntimeStatus = "registered" | "deregistered" | "pending-reload";

/**
 * Full runtime record stored in the Capability Registry.
 * Extends the Capability abstraction with registration metadata.
 */
export interface RegisteredCapabilityRecord {
  readonly id: string;
  readonly name: string;
  readonly kind: CapabilityKind;
  readonly version: string;
  readonly lifecycleState: CapabilityLifecycleState;
  readonly healthState: CapabilityHealthState;
  readonly dependencies: NormalisedDependencies;
  readonly metadata: CapabilityMetadata;
  readonly manifest: CapabilityManifest;
  readonly registrationTimestamp: string;
  readonly platformVersionCompatibility: string | undefined;
  readonly runtimeStatus: RuntimeStatus;
}

export interface RegistrationOptions {
  /** Current platform version used for compatibility checks. */
  readonly platformVersion: string;
}

export interface RegistrationSuccess {
  readonly success: true;
  readonly record: RegisteredCapabilityRecord;
}

export interface RegistrationFailure {
  readonly success: false;
  readonly errors: readonly RegistryError[];
}

export type RegistrationResult = RegistrationSuccess | RegistrationFailure;

export interface RegistrySnapshot {
  readonly platformVersion: string;
  readonly capabilityCount: number;
  readonly capabilitiesByKind: Readonly<Record<string, number>>;
  readonly lifecycleSummary: Readonly<
    Partial<Record<CapabilityLifecycleState, number>>
  >;
  readonly healthSummary: Readonly<Partial<Record<CapabilityHealthState, number>>>;
  readonly registryTimestamp: string;
  readonly capabilities: readonly RegisteredCapabilityRecord[];
}

/**
 * Extension points for future hot-reload, plugins, and distributed registry.
 * Not implemented in Phase 4 — documented for Phase 5+ integration.
 */
export interface CapabilityRegistryExtensionPoints {
  /** Hook before register — return false to veto (future plugin governance). */
  readonly beforeRegister?: (record: RegisteredCapabilityRecord) => boolean;
  /** Hook after unregister — cleanup external resources (future hot-reload). */
  readonly afterUnregister?: (id: string) => void;
  /** External index adapter for multi-node replication (future). */
  readonly replicationAdapter?: unknown;
}
