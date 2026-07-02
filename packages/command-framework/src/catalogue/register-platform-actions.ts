import type { ActionDescriptor } from "../types";
import type { ActionRegistrationIssue } from "../registry/action-batch-registration";
import type { ActionRegistry } from "../registry/action-registry";
import {
  PLATFORM_ACTION_CATALOGUE,
  type PlatformActionCatalogueEntry,
} from "./platform-action-catalogue";
import {
  ACTION_FRAMEWORK_PLATFORM_VERSION,
  type ActionFrameworkPlatformVersion,
} from "./platform-version";

export interface PlatformActionRegistrationResult {
  readonly ok: boolean;
  readonly registeredCount: number;
  readonly platformVersion: string;
  readonly errors: readonly ActionRegistrationIssue[];
}

export function buildPlatformActionDescriptors(
  platformVersion: string = ACTION_FRAMEWORK_PLATFORM_VERSION,
): ActionDescriptor[] {
  return PLATFORM_ACTION_CATALOGUE.map((entry) =>
    catalogueEntryToDescriptor(entry, platformVersion),
  );
}

export function catalogueEntryToDescriptor(
  entry: PlatformActionCatalogueEntry,
  platformVersion: string,
): ActionDescriptor {
  return {
    id: entry.id,
    label: entry.label,
    handler: `workbench-bridge:${entry.id}`,
    handlerKind: "workbench-bridge",
    source: "builtin",
    group: entry.group,
    order: entry.order,
    palette: entry.palette,
    version: platformVersion,
  };
}

/**
 * Atomically register the Platform Action Catalogue.
 * Registration is atomic — any validation error registers nothing.
 */
export function registerPlatformActionCatalogue(
  registry: ActionRegistry,
  options: { platformVersion?: ActionFrameworkPlatformVersion | string } = {},
): PlatformActionRegistrationResult {
  const platformVersion = options.platformVersion ?? ACTION_FRAMEWORK_PLATFORM_VERSION;
  const descriptors = buildPlatformActionDescriptors(platformVersion);
  const registration = registry.registerManyAtomic(descriptors);

  if (registration.ok) {
    registry.recordPlatformCatalogue(platformVersion);
  }

  return {
    ok: registration.ok,
    registeredCount: registration.registeredCount,
    platformVersion,
    errors: registration.errors,
  };
}

/** @deprecated Use {@link registerPlatformActionCatalogue} */
export const registerBuiltInWorkbenchCommands = registerPlatformActionCatalogue;
