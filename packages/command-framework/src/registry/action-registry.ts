import type { ActionDescriptor } from "../types";
import type { ActionContextSnapshot, ActionSelectionSnapshot } from "./context-filter";
import type { ActionBatchRegistrationResult } from "./action-batch-registration";

/**
 * Registry list sort order (contract):
 * 1. order (ascending, default 100)
 * 2. group (ascending, default "")
 * 3. label (ascending)
 * 4. id (ascending)
 *
 * ## Stable action identity
 *
 * - Action ids are immutable after registration.
 * - Released action ids shall not be reused.
 * - Replacement occurs through explicit migration (not in-place mutation).
 * - Deprecated ids may remain as aliases in future releases where appropriate.
 *
 * Updates to registered metadata use {@link ActionRegistry.replace} only.
 */

/** Options for ActionRegistry.list() — palette/surface filters only; permission filtering is server-side (AF-005). */
export interface ActionRegistryListOptions {
  readonly query?: string;
  readonly palette?: boolean;
  readonly surface?: string;
  readonly selection?: ActionSelectionSnapshot;
  readonly context?: ActionContextSnapshot;
}

export interface ActionRegistryDiagnostics {
  readonly status: "scaffold" | "ready";
  readonly registeredCount: number;
  readonly platformActionCount?: number;
  readonly capabilityActionCount?: number;
  readonly platformVersion?: string;
  readonly platformActionIds?: readonly string[];
  readonly capabilityActionIds?: readonly string[];
  readonly manifestCapabilityCount?: number;
  readonly message?: string;
  readonly actionIds?: readonly string[];
  readonly manifestCapabilities?: readonly string[];
}

/** In-memory action index — metadata only; no execution. */
export interface ActionRegistry {
  register(descriptor: ActionDescriptor): void;
  registerMany(descriptors: readonly ActionDescriptor[]): void;
  /**
   * Atomically register a batch. When any descriptor is invalid or duplicates an existing id,
   * nothing is registered and structured errors are returned.
   */
  registerManyAtomic(
    descriptors: readonly ActionDescriptor[],
  ): ActionBatchRegistrationResult;
  /**
   * Replace an existing descriptor by id.
   * Descriptors are immutable after registration; do not mutate in place.
   */
  replace(descriptor: ActionDescriptor): void;
  has(id: string): boolean;
  get(id: string): ActionDescriptor | undefined;
  list(options?: ActionRegistryListOptions): readonly ActionDescriptor[];
  clear(): void;
  /** Records manifest capability ids that contributed actions (AF-005 diagnostics). */
  recordManifestSource(capabilityIds: readonly string[]): void;
  /** Records platform catalogue bootstrap metadata (AF-009 diagnostics). */
  recordPlatformCatalogue(platformVersion: string): void;
  getDiagnostics(): ActionRegistryDiagnostics;
}

export interface ActionRegistryFactory {
  create(): ActionRegistry;
}
