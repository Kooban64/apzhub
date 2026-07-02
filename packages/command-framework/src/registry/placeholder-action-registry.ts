import type { ActionDescriptor } from "../types";
import type {
  ActionRegistry,
  ActionRegistryDiagnostics,
  ActionRegistryListOptions,
} from "./action-registry";

const SCAFFOLD_DIAGNOSTICS: ActionRegistryDiagnostics = {
  status: "scaffold",
  registeredCount: 0,
  message: "Placeholder registry — AF-003 implements storage and list filters",
};

/**
 * Scaffold registry — API surface only; no persistence or query logic.
 * AF-003 replaces with DefaultActionRegistry.
 */
export class PlaceholderActionRegistry implements ActionRegistry {
  register(_descriptor: ActionDescriptor): void {
    // AF-003
  }

  registerMany(_descriptors: readonly ActionDescriptor[]): void {
    // AF-003
  }

  registerManyAtomic(
    _descriptors: readonly ActionDescriptor[],
  ): import("./action-batch-registration").ActionBatchRegistrationResult {
    return {
      ok: false,
      registeredCount: 0,
      errors: [
        {
          code: "VALIDATION",
          message: "Placeholder registry — use DefaultActionRegistry (AF-003)",
        },
      ],
    };
  }

  replace(_descriptor: ActionDescriptor): void {
    // Placeholder — use DefaultActionRegistry (AF-003)
  }

  has(_id: string): boolean {
    return false;
  }

  get(_id: string): ActionDescriptor | undefined {
    return undefined;
  }

  list(_options?: ActionRegistryListOptions): readonly ActionDescriptor[] {
    return [];
  }

  clear(): void {
    // AF-003
  }

  recordManifestSource(_capabilityIds: readonly string[]): void {
    // Placeholder
  }

  recordPlatformCatalogue(_platformVersion: string): void {
    // Placeholder
  }

  getDiagnostics(): ActionRegistryDiagnostics {
    return SCAFFOLD_DIAGNOSTICS;
  }
}

export function createPlaceholderActionRegistry(): ActionRegistry {
  return new PlaceholderActionRegistry();
}
