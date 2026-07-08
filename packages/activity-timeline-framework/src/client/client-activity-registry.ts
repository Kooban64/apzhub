import {
  buildClientActivityRegistryDiagnostics,
  type ClientActivityRegistryDiagnostics,
  type ClientActivityRegistryStatus,
} from "./client-activity-registry-diagnostics";
import {
  freezeClientActivityType,
  type ClientActivityType,
} from "./client-activity-type";
import type { ReadOnlyActivityRegistry } from "./read-only-activity-registry";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

export interface ClientActivityRegistrySnapshot {
  readonly types: readonly ClientActivityType[];
  readonly schemaVersion?: ClientActivityRegistryDiagnostics["schemaVersion"];
  readonly frameworkVersion?: string;
  readonly status?: ClientActivityRegistryStatus;
  readonly hydratedAt?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

/**
 * In-memory read-only activity type index hydrated from a server DTO.
 * Types are deep-frozen — callers cannot mutate registry contents.
 */
export class ClientActivityRegistry implements ReadOnlyActivityRegistry {
  private readonly types = new Map<string, ClientActivityType>();
  private readonly diagnosticsSnapshot: ClientActivityRegistryDiagnostics;

  constructor(snapshot: ClientActivityRegistrySnapshot = { types: [] }) {
    for (const type of snapshot.types) {
      this.types.set(type.activityTypeId, freezeClientActivityType(type));
    }

    this.diagnosticsSnapshot = buildClientActivityRegistryDiagnostics(
      [...this.types.values()],
      {
        status: snapshot.status,
        schemaVersion: snapshot.schemaVersion,
        frameworkVersion: snapshot.frameworkVersion,
        hydratedAt: snapshot.hydratedAt,
        synchronisation:
          snapshot.synchronisation ?? CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
      },
    );
  }

  has(activityTypeId: string): boolean {
    return this.types.has(activityTypeId);
  }

  get(activityTypeId: string): ClientActivityType | undefined {
    const type = this.types.get(activityTypeId);
    return type ? freezeClientActivityType(type) : undefined;
  }

  list(): readonly ClientActivityType[] {
    return Object.freeze(
      [...this.types.values()]
        .map((type) => freezeClientActivityType(type))
        .sort((left, right) => left.activityTypeId.localeCompare(right.activityTypeId)),
    );
  }

  getDiagnostics(): ClientActivityRegistryDiagnostics {
    return this.diagnosticsSnapshot;
  }
}

export function createEmptyClientActivityRegistry(): ReadOnlyActivityRegistry {
  return new ClientActivityRegistry({
    types: [],
    status: "empty",
  });
}

export function createInvalidClientActivityRegistry(): ReadOnlyActivityRegistry {
  return new ClientActivityRegistry({
    types: [],
    status: "invalid",
  });
}
