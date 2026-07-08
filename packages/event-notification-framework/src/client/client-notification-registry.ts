import {
  buildClientNotificationRegistryDiagnostics,
  type ClientNotificationRegistryDiagnostics,
  type ClientNotificationRegistryStatus,
} from "./client-notification-registry-diagnostics";
import type { ClientNotificationRoute } from "./client-notification-route";
import { freezeClientNotificationRoute } from "./client-notification-route";
import type { ReadOnlyNotificationRegistry } from "./read-only-notification-registry";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";
import { NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION } from "../server/notification-registry-dto-schema-version";

export interface ClientNotificationRegistrySnapshot {
  readonly routes: readonly ClientNotificationRoute[];
  readonly schemaVersion?: typeof NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION;
  readonly frameworkVersion?: string;
  readonly status?: ClientNotificationRegistryStatus;
  readonly hydratedAt?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

/**
 * In-memory read-only notification route index hydrated from a server DTO.
 * Routes are deep-frozen — callers cannot mutate registry contents.
 */
export class ClientNotificationRegistry implements ReadOnlyNotificationRegistry {
  private readonly routes = new Map<string, ClientNotificationRoute>();
  private readonly diagnosticsSnapshot: ClientNotificationRegistryDiagnostics;

  constructor(snapshot: ClientNotificationRegistrySnapshot = { routes: [] }) {
    for (const route of snapshot.routes) {
      this.routes.set(route.routeId, freezeClientNotificationRoute(route));
    }

    this.diagnosticsSnapshot = buildClientNotificationRegistryDiagnostics(
      [...this.routes.values()],
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

  has(routeId: string): boolean {
    return this.routes.has(routeId);
  }

  get(routeId: string): ClientNotificationRoute | undefined {
    const route = this.routes.get(routeId);
    return route ? freezeClientNotificationRoute(route) : undefined;
  }

  list(): readonly ClientNotificationRoute[] {
    return Object.freeze(
      [...this.routes.values()]
        .map((route) => freezeClientNotificationRoute(route))
        .sort((left, right) => left.routeId.localeCompare(right.routeId)),
    );
  }

  getDiagnostics(): ClientNotificationRegistryDiagnostics {
    return this.diagnosticsSnapshot;
  }
}

export function createEmptyClientNotificationRegistry(): ReadOnlyNotificationRegistry {
  return new ClientNotificationRegistry({
    routes: [],
    status: "empty",
  });
}

export function createInvalidClientNotificationRegistry(): ReadOnlyNotificationRegistry {
  return new ClientNotificationRegistry({
    routes: [],
    status: "invalid",
  });
}
