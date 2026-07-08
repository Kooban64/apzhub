import type { TimelineRegistry } from "../timeline/timeline-registry";
import { TIMELINE_REGISTRY_DTO_SCHEMA_VERSION } from "./filter/timeline-registry-dto-schema-version";
import type { TimelineRegistryDto } from "./filter/map-timeline-registry-dto";

/** Server hydration diagnostics — registered vs permission-filtered visibility. */
export interface TimelineRegistryHydrationDiagnostics {
  readonly registeredCount: number;
  readonly filteredCount: number;
  readonly builtinCount: number;
  readonly manifestCount: number;
  readonly filteredBuiltinCount: number;
  readonly filteredManifestCount: number;
  readonly frameworkVersion?: string;
  readonly schemaVersion: typeof TIMELINE_REGISTRY_DTO_SCHEMA_VERSION;
  readonly manifestCapabilityCount: number;
  readonly manifestCapabilities: readonly string[];
}

function countBySource(
  timelines: readonly { readonly source: "builtin" | "manifest" }[],
): { builtin: number; manifest: number } {
  let builtin = 0;
  let manifest = 0;

  for (const timeline of timelines) {
    if (timeline.source === "builtin") {
      builtin += 1;
    } else {
      manifest += 1;
    }
  }

  return { builtin, manifest };
}

export function buildTimelineRegistryHydrationDiagnostics(
  registry: TimelineRegistry,
  visibleDto?: TimelineRegistryDto,
): TimelineRegistryHydrationDiagnostics {
  const registryDiagnostics = registry.getDiagnostics();
  const manifestCapabilities = registryDiagnostics.manifestCapabilityIds ?? [];
  const filteredTimelines = visibleDto?.timelines;
  const filteredCounts = countBySource(filteredTimelines ?? []);

  return Object.freeze({
    registeredCount: registryDiagnostics.registeredTimelineCount,
    filteredCount:
      filteredTimelines?.length ?? registryDiagnostics.registeredTimelineCount,
    builtinCount: registryDiagnostics.platformCount,
    manifestCount: registryDiagnostics.manifestCount,
    filteredBuiltinCount:
      filteredTimelines !== undefined
        ? filteredCounts.builtin
        : registryDiagnostics.platformCount,
    filteredManifestCount:
      filteredTimelines !== undefined
        ? filteredCounts.manifest
        : registryDiagnostics.manifestCount,
    frameworkVersion:
      registryDiagnostics.frameworkVersion ??
      registryDiagnostics.platformCatalogueVersion,
    schemaVersion: TIMELINE_REGISTRY_DTO_SCHEMA_VERSION,
    manifestCapabilityCount: manifestCapabilities.length,
    manifestCapabilities: Object.freeze([...manifestCapabilities]),
  });
}

export function createEmptyTimelineRegistryHydrationDiagnostics(): TimelineRegistryHydrationDiagnostics {
  return Object.freeze({
    registeredCount: 0,
    filteredCount: 0,
    builtinCount: 0,
    manifestCount: 0,
    filteredBuiltinCount: 0,
    filteredManifestCount: 0,
    schemaVersion: TIMELINE_REGISTRY_DTO_SCHEMA_VERSION,
    manifestCapabilityCount: 0,
    manifestCapabilities: [],
  });
}
