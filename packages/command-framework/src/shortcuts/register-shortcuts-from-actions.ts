import type { ActionDescriptor } from "../types";
import {
  createDefaultShortcutRegistry,
  type DefaultShortcutRegistry,
} from "./default-shortcut-registry";
import type { ShortcutRegistration, ShortcutRegistry } from "./types";

export interface RegisterShortcutsFromActionsResult {
  readonly registeredCount: number;
  readonly skippedCount: number;
  readonly conflicts: ReturnType<ShortcutRegistry["getConflicts"]>;
  readonly diagnostics: ReturnType<ShortcutRegistry["getDiagnostics"]>;
}

function descriptorToShortcutRegistration(
  descriptor: ActionDescriptor,
): ShortcutRegistration | null {
  if (!descriptor.shortcut?.trim()) {
    return null;
  }

  return {
    commandId: descriptor.id,
    chord: descriptor.shortcut,
    source: descriptor.source,
  };
}

/** Register shortcut bindings declared on action descriptors (manifest + built-in). */
export function registerShortcutsFromActions(
  registry: ShortcutRegistry,
  actions: readonly ActionDescriptor[],
): RegisterShortcutsFromActionsResult {
  let registeredCount = 0;
  let skippedCount = 0;

  for (const action of actions) {
    const registration = descriptorToShortcutRegistration(action);
    if (!registration) {
      skippedCount += 1;
      continue;
    }

    registry.register(registration);
    registeredCount += 1;
  }

  return {
    registeredCount,
    skippedCount,
    conflicts: registry.getConflicts(),
    diagnostics: registry.getDiagnostics(),
  };
}

export interface BootstrapShortcutRegistryResult extends RegisterShortcutsFromActionsResult {
  readonly registry: DefaultShortcutRegistry;
}

/** Bootstrap a shortcut registry from hydrated action descriptors. */
export function bootstrapShortcutRegistry(
  actions: readonly ActionDescriptor[],
  registry: DefaultShortcutRegistry = createDefaultShortcutRegistry(),
): BootstrapShortcutRegistryResult {
  const result = registerShortcutsFromActions(registry, actions);

  return {
    registry,
    ...result,
  };
}
