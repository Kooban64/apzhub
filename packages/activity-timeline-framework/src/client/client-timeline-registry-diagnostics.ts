import type { TimelineDefinitionSource } from "../types/timeline-definition";
import type { TimelineScopeId } from "../types/timeline-scope";
import type { ClientTimelineDefinition } from "./client-timeline-definition";
import { TIMELINE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/filter/timeline-registry-dto-schema-version";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

export type ClientTimelineRegistryStatus = "empty" | "hydrated" | "invalid";

/** Client-side timeline registry reporting — mirrors server split without mutation APIs. */
export interface ClientTimelineRegistryDiagnostics {
  readonly status: ClientTimelineRegistryStatus;
  readonly schemaVersion: typeof TIMELINE_REGISTRY_DTO_SCHEMA_VERSION;
  readonly frameworkVersion?: string;
  readonly timelineCount: number;
  readonly activeTimelineCount: number;
  readonly scopeCounts: Readonly<Partial<Record<TimelineScopeId, number>>>;
  readonly hydratedAt?: string;
  readonly source: "server-dto";
  readonly synchronisation: ClientRegistrySynchronisationState;
}

function countByScope(
  timelines: readonly ClientTimelineDefinition[],
): Readonly<Partial<Record<TimelineScopeId, number>>> {
  const counts: Partial<Record<TimelineScopeId, number>> = {};

  for (const timeline of timelines) {
    counts[timeline.scope] = (counts[timeline.scope] ?? 0) + 1;
  }

  return Object.freeze({ ...counts });
}

export function buildClientTimelineRegistryDiagnostics(
  timelines: readonly ClientTimelineDefinition[],
  options: {
    readonly status?: ClientTimelineRegistryStatus;
    readonly schemaVersion?: typeof TIMELINE_REGISTRY_DTO_SCHEMA_VERSION;
    readonly frameworkVersion?: string;
    readonly hydratedAt?: string;
    readonly synchronisation?: ClientRegistrySynchronisationState;
  } = {},
): ClientTimelineRegistryDiagnostics {
  let activeTimelineCount = 0;

  for (const timeline of timelines) {
    if (timeline.status === "active") {
      activeTimelineCount += 1;
    }
  }

  const status = options.status ?? (timelines.length > 0 ? "hydrated" : "empty");

  return Object.freeze({
    status,
    schemaVersion: options.schemaVersion ?? TIMELINE_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: options.frameworkVersion,
    timelineCount: timelines.length,
    activeTimelineCount,
    scopeCounts: countByScope(timelines),
    hydratedAt: options.hydratedAt,
    source: "server-dto",
    synchronisation: options.synchronisation ?? CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  });
}

export function createEmptyClientTimelineRegistryDiagnostics(): ClientTimelineRegistryDiagnostics {
  return buildClientTimelineRegistryDiagnostics([], { status: "empty" });
}

function classifyTimelineSource(
  source: TimelineDefinitionSource,
): "platform" | "capability" {
  return source === "builtin" ? "platform" : "capability";
}

export { classifyTimelineSource };
