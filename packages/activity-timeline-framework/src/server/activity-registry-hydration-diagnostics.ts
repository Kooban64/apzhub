import type { ActivityRegistry } from "../registry/activity-registry";
import { ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION } from "./filter/activity-registry-dto-schema-version";
import type { ActivityRegistryDto } from "./filter/map-activity-registry-dto";

/** Server hydration diagnostics — registered vs permission-filtered visibility. */
export interface ActivityRegistryHydrationDiagnostics {
  readonly registeredCount: number;
  readonly filteredCount: number;
  readonly builtinCount: number;
  readonly manifestCount: number;
  readonly filteredBuiltinCount: number;
  readonly filteredManifestCount: number;
  readonly frameworkVersion?: string;
  readonly schemaVersion: typeof ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION;
  readonly manifestCapabilityCount: number;
  readonly manifestCapabilities: readonly string[];
}

function countBySource(types: readonly { readonly source: "builtin" | "manifest" }[]): {
  builtin: number;
  manifest: number;
} {
  let builtin = 0;
  let manifest = 0;

  for (const type of types) {
    if (type.source === "builtin") {
      builtin += 1;
    } else {
      manifest += 1;
    }
  }

  return { builtin, manifest };
}

export function buildActivityRegistryHydrationDiagnostics(
  registry: ActivityRegistry,
  visibleDto?: ActivityRegistryDto,
): ActivityRegistryHydrationDiagnostics {
  const registryDiagnostics = registry.getDiagnostics();
  const manifestCapabilities = registryDiagnostics.manifestCapabilityIds ?? [];
  const filteredTypes = visibleDto?.types;
  const filteredCounts = countBySource(filteredTypes ?? []);

  return Object.freeze({
    registeredCount: registryDiagnostics.registeredActivityTypeCount,
    filteredCount:
      filteredTypes?.length ?? registryDiagnostics.registeredActivityTypeCount,
    builtinCount: registryDiagnostics.platformCount,
    manifestCount: registryDiagnostics.manifestCount,
    filteredBuiltinCount:
      filteredTypes !== undefined
        ? filteredCounts.builtin
        : registryDiagnostics.platformCount,
    filteredManifestCount:
      filteredTypes !== undefined
        ? filteredCounts.manifest
        : registryDiagnostics.manifestCount,
    frameworkVersion:
      registryDiagnostics.frameworkVersion ??
      registryDiagnostics.platformCatalogueVersion,
    schemaVersion: ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION,
    manifestCapabilityCount: manifestCapabilities.length,
    manifestCapabilities: Object.freeze([...manifestCapabilities]),
  });
}

export function createEmptyActivityRegistryHydrationDiagnostics(): ActivityRegistryHydrationDiagnostics {
  return Object.freeze({
    registeredCount: 0,
    filteredCount: 0,
    builtinCount: 0,
    manifestCount: 0,
    filteredBuiltinCount: 0,
    filteredManifestCount: 0,
    schemaVersion: ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION,
    manifestCapabilityCount: 0,
    manifestCapabilities: [],
  });
}
