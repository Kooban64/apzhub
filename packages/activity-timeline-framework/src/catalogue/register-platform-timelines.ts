import type { TimelineRegistrationIssue } from "../types/timeline-metadata";
import type { TimelineRegistry } from "../timeline/timeline-registry";
import { PLATFORM_TIMELINE_DEFINITIONS } from "../timeline/platform-timeline-catalogue";
import {
  ACTIVITY_TIMELINE_PLATFORM_VERSION,
  type ActivityTimelinePlatformVersion,
} from "./platform-version";

export interface PlatformTimelineRegistrationResult {
  readonly ok: boolean;
  readonly registeredCount: number;
  readonly platformVersion: string;
  readonly errors: readonly TimelineRegistrationIssue[];
}

/**
 * Atomically register the Platform Timeline Definition Catalogue.
 * Definitions only — no activity population or timeline generation.
 */
export function registerPlatformTimelineCatalogue(
  registry: TimelineRegistry,
  options: { platformVersion?: ActivityTimelinePlatformVersion | string } = {},
): PlatformTimelineRegistrationResult {
  const platformVersion = options.platformVersion ?? ACTIVITY_TIMELINE_PLATFORM_VERSION;
  const registration = registry.registerManyAtomic(PLATFORM_TIMELINE_DEFINITIONS);

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
