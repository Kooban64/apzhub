import type { ActionDescriptor } from "../types";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

export type ClientActionRegistryStatus = "empty" | "hydrated" | "invalid";

/** Client-side registry reporting — mirrors server split without mutation APIs. */
export interface ClientActionRegistryDiagnostics {
  readonly status: ClientActionRegistryStatus;
  readonly actionCount: number;
  readonly platformActionCount: number;
  readonly capabilityActionCount: number;
  readonly platformActionIds: readonly string[];
  readonly capabilityActionIds: readonly string[];
  readonly toolbarRegionCount: number;
  readonly hydratedAt?: string;
  readonly source: "server-dto";
  readonly synchronisation: ClientRegistrySynchronisationState;
}

export function buildClientActionRegistryDiagnostics(
  actions: readonly ActionDescriptor[],
  toolbarRegionCount: number,
  options: {
    readonly status?: ClientActionRegistryStatus;
    readonly hydratedAt?: string;
    readonly synchronisation?: ClientRegistrySynchronisationState;
  } = {},
): ClientActionRegistryDiagnostics {
  const platformActionIds: string[] = [];
  const capabilityActionIds: string[] = [];

  for (const descriptor of actions) {
    if (descriptor.source === "builtin") {
      platformActionIds.push(descriptor.id);
    } else {
      capabilityActionIds.push(descriptor.id);
    }
  }

  platformActionIds.sort();
  capabilityActionIds.sort();

  const status = options.status ?? (actions.length > 0 ? "hydrated" : "empty");

  return {
    status,
    actionCount: actions.length,
    platformActionCount: platformActionIds.length,
    capabilityActionCount: capabilityActionIds.length,
    platformActionIds: Object.freeze([...platformActionIds]),
    capabilityActionIds: Object.freeze([...capabilityActionIds]),
    toolbarRegionCount,
    hydratedAt: options.hydratedAt,
    source: "server-dto",
    synchronisation: options.synchronisation ?? CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  };
}

export function createEmptyClientActionRegistryDiagnostics(): ClientActionRegistryDiagnostics {
  return buildClientActionRegistryDiagnostics([], 0, { status: "empty" });
}
