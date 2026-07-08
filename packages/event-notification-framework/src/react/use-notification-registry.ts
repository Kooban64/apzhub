import { useCallback, useMemo } from "react";

import type { ClientNotificationRegistryDiagnostics } from "../client";
import type { ClientNotificationRoute } from "../client/client-notification-route";
import type { NotificationRegistrationIssue } from "../notification/notification-metadata";
import type { NotificationRegistryDto } from "../server/map-notification-registry-dto";
import { useNotificationRegistryContext } from "./notification-registry-context";

export interface UseNotificationRegistryResult {
  readonly isReady: boolean;
  readonly routes: readonly ClientNotificationRoute[];
  readonly schemaVersion: NotificationRegistryDto["schemaVersion"];
  readonly frameworkVersion?: string;
  readonly has: (routeId: string) => boolean;
  readonly get: (routeId: string) => ClientNotificationRoute | undefined;
  readonly list: () => readonly ClientNotificationRoute[];
  readonly diagnostics: ClientNotificationRegistryDiagnostics;
  readonly importErrors: readonly NotificationRegistrationIssue[];
}

/** Access the hydrated read-only notification registry from React context. */
export function useNotificationRegistry(): UseNotificationRegistryResult {
  const { registry, dto, isReady, diagnostics, importErrors } =
    useNotificationRegistryContext();

  const routes = useMemo(() => registry.list(), [registry]);

  const has = useCallback((routeId: string) => registry.has(routeId), [registry]);

  const get = useCallback((routeId: string) => registry.get(routeId), [registry]);

  const list = useCallback(() => registry.list(), [registry]);

  return {
    isReady,
    routes,
    schemaVersion: dto.schemaVersion,
    frameworkVersion: dto.frameworkVersion,
    has,
    get,
    list,
    diagnostics,
    importErrors,
  };
}
