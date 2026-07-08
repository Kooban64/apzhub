import type { NotificationDescriptorSource } from "../notification/notification-descriptor";
import type { ClientNotificationRoute } from "./client-notification-route";
import { NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION } from "../server/notification-registry-dto-schema-version";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

export type ClientNotificationRegistryStatus = "empty" | "hydrated" | "invalid";

/** Client-side registry reporting — mirrors server split without mutation APIs. */
export interface ClientNotificationRegistryDiagnostics {
  readonly status: ClientNotificationRegistryStatus;
  readonly schemaVersion: typeof NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION;
  readonly frameworkVersion?: string;
  readonly routeCount: number;
  readonly activeRouteCount: number;
  readonly routeIds: readonly string[];
  readonly platformRouteCount: number;
  readonly capabilityRouteCount: number;
  readonly platformRouteIds: readonly string[];
  readonly capabilityRouteIds: readonly string[];
  readonly hydratedAt?: string;
  readonly source: "server-dto";
  readonly synchronisation: ClientRegistrySynchronisationState;
}

export function buildClientNotificationRegistryDiagnostics(
  routes: readonly ClientNotificationRoute[],
  options: {
    readonly status?: ClientNotificationRegistryStatus;
    readonly schemaVersion?: typeof NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION;
    readonly frameworkVersion?: string;
    readonly hydratedAt?: string;
    readonly synchronisation?: ClientRegistrySynchronisationState;
  } = {},
): ClientNotificationRegistryDiagnostics {
  const routeIds: string[] = [];
  const platformRouteIds: string[] = [];
  const capabilityRouteIds: string[] = [];
  let activeRouteCount = 0;

  for (const route of routes) {
    routeIds.push(route.routeId);

    if (route.status === "active") {
      activeRouteCount += 1;
    }

    if (route.source === "builtin") {
      platformRouteIds.push(route.routeId);
    } else {
      capabilityRouteIds.push(route.routeId);
    }
  }

  routeIds.sort();
  platformRouteIds.sort();
  capabilityRouteIds.sort();

  const status = options.status ?? (routes.length > 0 ? "hydrated" : "empty");

  return Object.freeze({
    status,
    schemaVersion: options.schemaVersion ?? NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: options.frameworkVersion,
    routeCount: routes.length,
    activeRouteCount,
    routeIds: Object.freeze([...routeIds]),
    platformRouteCount: platformRouteIds.length,
    capabilityRouteCount: capabilityRouteIds.length,
    platformRouteIds: Object.freeze([...platformRouteIds]),
    capabilityRouteIds: Object.freeze([...capabilityRouteIds]),
    hydratedAt: options.hydratedAt,
    source: "server-dto",
    synchronisation: options.synchronisation ?? CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  });
}

export function createEmptyClientNotificationRegistryDiagnostics(): ClientNotificationRegistryDiagnostics {
  return buildClientNotificationRegistryDiagnostics([], { status: "empty" });
}

function countBySource(
  source: NotificationDescriptorSource,
): "platform" | "capability" {
  return source === "builtin" ? "platform" : "capability";
}

export { countBySource as classifyNotificationRouteSource };
