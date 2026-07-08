import type { ActivityDescriptor } from "../types/activity-descriptor";
import type { ActivityRegistrationIssue } from "../types/activity-metadata";
import type { ActivityRegistry } from "../registry/activity-registry";
import {
  ACTIVITY_TIMELINE_PLATFORM_VERSION,
  type ActivityTimelinePlatformVersion,
} from "./platform-version";
import {
  PLATFORM_ACTIVITY_CATALOGUE,
  type PlatformActivityCatalogueEntry,
} from "./platform-activity-catalogue";

export interface PlatformActivityRegistrationResult {
  readonly ok: boolean;
  readonly registeredCount: number;
  readonly platformVersion: string;
  readonly errors: readonly ActivityRegistrationIssue[];
}

export function catalogueEntryToActivityDescriptor(
  entry: PlatformActivityCatalogueEntry,
  platformVersion: string,
): ActivityDescriptor {
  return {
    activityTypeId: entry.activityTypeId,
    version: entry.version,
    sourceEventPattern: entry.sourceEventPattern,
    category: entry.category,
    timelineScopes: entry.timelineScopes,
    templateRef: entry.templateRef,
    label: entry.label,
    description: entry.description,
    sourceCapability: "platform-runtime",
    schemaVersion: platformVersion,
    status: entry.status ?? "active",
    source: "builtin",
  };
}

export function buildPlatformActivityDescriptors(
  platformVersion: string = ACTIVITY_TIMELINE_PLATFORM_VERSION,
): ActivityDescriptor[] {
  return PLATFORM_ACTIVITY_CATALOGUE.map((entry) =>
    catalogueEntryToActivityDescriptor(entry, platformVersion),
  );
}

/**
 * Atomically register the Platform Activity Type Catalogue.
 * Registration is atomic — any validation error registers nothing.
 */
export function registerPlatformActivityCatalogue(
  registry: ActivityRegistry,
  options: { platformVersion?: ActivityTimelinePlatformVersion | string } = {},
): PlatformActivityRegistrationResult {
  const platformVersion = options.platformVersion ?? ACTIVITY_TIMELINE_PLATFORM_VERSION;
  const descriptors = buildPlatformActivityDescriptors(platformVersion);
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
