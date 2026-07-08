import type { ActivityDescriptorSource } from "../types/activity-descriptor";
import type { ClientActivityType } from "./client-activity-type";
import { ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION } from "../server/filter/activity-registry-dto-schema-version";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

export type ClientActivityRegistryStatus = "empty" | "hydrated" | "invalid";

/** Client-side activity registry reporting — mirrors server split without mutation APIs. */
export interface ClientActivityRegistryDiagnostics {
  readonly status: ClientActivityRegistryStatus;
  readonly schemaVersion: typeof ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION;
  readonly frameworkVersion?: string;
  readonly typeCount: number;
  readonly activeTypeCount: number;
  readonly platformTypeCount: number;
  readonly capabilityTypeCount: number;
  readonly hydratedAt?: string;
  readonly source: "server-dto";
  readonly synchronisation: ClientRegistrySynchronisationState;
}

function classifyActivitySource(
  source: ActivityDescriptorSource,
): "platform" | "capability" {
  return source === "builtin" ? "platform" : "capability";
}

export function buildClientActivityRegistryDiagnostics(
  types: readonly ClientActivityType[],
  options: {
    readonly status?: ClientActivityRegistryStatus;
    readonly schemaVersion?: typeof ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION;
    readonly frameworkVersion?: string;
    readonly hydratedAt?: string;
    readonly synchronisation?: ClientRegistrySynchronisationState;
  } = {},
): ClientActivityRegistryDiagnostics {
  let activeTypeCount = 0;
  let platformTypeCount = 0;
  let capabilityTypeCount = 0;

  for (const type of types) {
    if (type.status === "active") {
      activeTypeCount += 1;
    }

    if (classifyActivitySource(type.source) === "platform") {
      platformTypeCount += 1;
    } else {
      capabilityTypeCount += 1;
    }
  }

  const status = options.status ?? (types.length > 0 ? "hydrated" : "empty");

  return Object.freeze({
    status,
    schemaVersion: options.schemaVersion ?? ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: options.frameworkVersion,
    typeCount: types.length,
    activeTypeCount,
    platformTypeCount,
    capabilityTypeCount,
    hydratedAt: options.hydratedAt,
    source: "server-dto",
    synchronisation: options.synchronisation ?? CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  });
}

export function createEmptyClientActivityRegistryDiagnostics(): ClientActivityRegistryDiagnostics {
  return buildClientActivityRegistryDiagnostics([], { status: "empty" });
}
