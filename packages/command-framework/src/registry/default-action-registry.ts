import type { ActionDescriptor } from "../types";
import type {
  ActionRegistry,
  ActionRegistryDiagnostics,
  ActionRegistryListOptions,
} from "./action-registry";
import { filterActionDescriptors } from "./filter-action-descriptors";
import { freezeActionDescriptor } from "./freeze-action-descriptor";
import type { ActionBatchRegistrationResult } from "./action-batch-registration";
import {
  collectDescriptorValidationIssues,
  collectDuplicateActionIssues,
} from "./action-batch-helpers";
import {
  ActionRegistryDuplicateError,
  ActionRegistryNotFoundError,
} from "./registry-errors";
import { validateActionDescriptor } from "./validate-action-descriptor";

/**
 * In-memory Action Registry — metadata only.
 *
 * ## Immutability
 *
 * Descriptors are deep-frozen at registration. Callers must not mutate objects
 * passed to {@link register}. To update metadata, use {@link replace} which
 * swaps the stored entry atomically.
 *
 * ## Thread safety
 *
 * JavaScript runtimes are single-threaded; this registry uses no shared mutable
 * state across async boundaries beyond the internal Map. Returned arrays are
 * snapshots. Safe for concurrent read-style access from one event loop; do not
 * share registry instances across workers without external synchronisation.
 */
export class DefaultActionRegistry implements ActionRegistry {
  private readonly actions = new Map<string, ActionDescriptor>();
  private manifestCapabilities: readonly string[] = [];
  private platformVersion: string | undefined;

  register(descriptor: ActionDescriptor): void {
    validateActionDescriptor(descriptor);

    if (this.actions.has(descriptor.id)) {
      throw new ActionRegistryDuplicateError(descriptor.id);
    }

    this.actions.set(descriptor.id, freezeActionDescriptor(descriptor));
  }

  registerMany(descriptors: readonly ActionDescriptor[]): void {
    for (const descriptor of descriptors) {
      validateActionDescriptor(descriptor);
    }

    const seen = new Set<string>();
    for (const descriptor of descriptors) {
      if (seen.has(descriptor.id) || this.actions.has(descriptor.id)) {
        throw new ActionRegistryDuplicateError(descriptor.id);
      }
      seen.add(descriptor.id);
    }

    for (const descriptor of descriptors) {
      this.actions.set(descriptor.id, freezeActionDescriptor(descriptor));
    }
  }

  registerManyAtomic(
    descriptors: readonly ActionDescriptor[],
  ): ActionBatchRegistrationResult {
    const validationIssues = collectDescriptorValidationIssues(descriptors);
    if (validationIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...validationIssues]),
      };
    }

    const duplicateIssues = collectDuplicateActionIssues(
      descriptors,
      new Set(this.actions.keys()),
    );
    if (duplicateIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...duplicateIssues]),
      };
    }

    for (const descriptor of descriptors) {
      this.actions.set(descriptor.id, freezeActionDescriptor(descriptor));
    }

    return {
      ok: true,
      registeredCount: descriptors.length,
      errors: [],
    };
  }

  /**
   * Replace an existing action descriptor without changing its id.
   * The incoming descriptor id must match a registered entry.
   */
  replace(descriptor: ActionDescriptor): void {
    validateActionDescriptor(descriptor);

    if (!this.actions.has(descriptor.id)) {
      throw new ActionRegistryNotFoundError(descriptor.id);
    }

    this.actions.set(descriptor.id, freezeActionDescriptor(descriptor));
  }

  has(id: string): boolean {
    return this.actions.has(id);
  }

  get(id: string): ActionDescriptor | undefined {
    const descriptor = this.actions.get(id);
    return descriptor ? freezeActionDescriptor(descriptor) : undefined;
  }

  list(options?: ActionRegistryListOptions): readonly ActionDescriptor[] {
    const snapshot = Object.freeze([...this.actions.values()]);
    return filterActionDescriptors(snapshot, options);
  }

  clear(): void {
    this.actions.clear();
    this.manifestCapabilities = [];
    this.platformVersion = undefined;
  }

  recordManifestSource(capabilityIds: readonly string[]): void {
    this.manifestCapabilities = Object.freeze([...capabilityIds].sort());
  }

  recordPlatformCatalogue(platformVersion: string): void {
    this.platformVersion = platformVersion;
  }

  getDiagnostics(): ActionRegistryDiagnostics {
    const platformActionIds: string[] = [];
    const capabilityActionIds: string[] = [];

    for (const descriptor of this.actions.values()) {
      if (descriptor.source === "builtin") {
        platformActionIds.push(descriptor.id);
      } else {
        capabilityActionIds.push(descriptor.id);
      }
    }

    platformActionIds.sort();
    capabilityActionIds.sort();

    return {
      status: "ready",
      registeredCount: this.actions.size,
      platformActionCount: platformActionIds.length,
      capabilityActionCount: capabilityActionIds.length,
      platformVersion: this.platformVersion,
      platformActionIds:
        platformActionIds.length > 0
          ? Object.freeze([...platformActionIds])
          : undefined,
      capabilityActionIds:
        capabilityActionIds.length > 0
          ? Object.freeze([...capabilityActionIds])
          : undefined,
      manifestCapabilityCount: this.manifestCapabilities.length,
      manifestCapabilities:
        this.manifestCapabilities.length > 0 ? this.manifestCapabilities : undefined,
      actionIds: Object.freeze([...this.actions.keys()].sort()),
    };
  }
}

export function createDefaultActionRegistry(): ActionRegistry {
  return new DefaultActionRegistry();
}

/** Factory for DI — returns a new registry instance. */
export const defaultActionRegistryFactory = {
  create(): ActionRegistry {
    return createDefaultActionRegistry();
  },
};
