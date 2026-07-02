import { filterActionDescriptors } from "../registry/filter-action-descriptors";
import { freezeActionDescriptor } from "../registry/freeze-action-descriptor";
import type { ActionRegistryListOptions } from "../registry/action-registry";
import type { ActionDescriptor } from "../types";
import {
  buildClientActionRegistryDiagnostics,
  type ClientActionRegistryDiagnostics,
  type ClientActionRegistryStatus,
} from "./client-action-registry-diagnostics";
import type { ReadOnlyActionRegistry } from "./read-only-action-registry";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

export interface ClientActionRegistrySnapshot {
  readonly actions: readonly ActionDescriptor[];
  readonly toolbarRegionCount?: number;
  readonly status?: ClientActionRegistryStatus;
  readonly hydratedAt?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

/**
 * In-memory read-only action index hydrated from a server DTO.
 * Descriptors are deep-frozen — callers cannot mutate registry contents.
 */
export class ClientActionRegistry implements ReadOnlyActionRegistry {
  private readonly actions = new Map<string, ActionDescriptor>();
  private readonly diagnosticsSnapshot: ClientActionRegistryDiagnostics;

  constructor(snapshot: ClientActionRegistrySnapshot = { actions: [] }) {
    for (const descriptor of snapshot.actions) {
      this.actions.set(descriptor.id, freezeActionDescriptor(descriptor));
    }

    this.diagnosticsSnapshot = buildClientActionRegistryDiagnostics(
      [...this.actions.values()],
      snapshot.toolbarRegionCount ?? 0,
      {
        status: snapshot.status,
        hydratedAt: snapshot.hydratedAt,
        synchronisation:
          snapshot.synchronisation ?? CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
      },
    );
  }

  has(id: string): boolean {
    return this.actions.has(id);
  }

  get(id: string): ActionDescriptor | undefined {
    const descriptor = this.actions.get(id);
    return descriptor ? freezeActionDescriptor(descriptor) : undefined;
  }

  list(options?: ActionRegistryListOptions): readonly ActionDescriptor[] {
    const snapshot = Object.freeze([...this.actions.values()]);
    return filterActionDescriptors(snapshot, options);
  }

  getDiagnostics(): ClientActionRegistryDiagnostics {
    return this.diagnosticsSnapshot;
  }
}

export function createEmptyClientActionRegistry(): ReadOnlyActionRegistry {
  return new ClientActionRegistry({
    actions: [],
    toolbarRegionCount: 0,
    status: "empty",
  });
}

export function createInvalidClientActionRegistry(
  toolbarRegionCount = 0,
): ReadOnlyActionRegistry {
  return new ClientActionRegistry({
    actions: [],
    toolbarRegionCount,
    status: "invalid",
  });
}
