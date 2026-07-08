import type { ClientNotificationRoute } from "./client-notification-route";
import type { ClientNotificationRegistryDiagnostics } from "./client-notification-registry-diagnostics";

/**
 * Read-only notification route index for browser consumers.
 *
 * The server remains authoritative — clients must not register routes or execute mappers.
 */
export interface ReadOnlyNotificationRegistry {
  has(routeId: string): boolean;
  get(routeId: string): ClientNotificationRoute | undefined;
  list(): readonly ClientNotificationRoute[];
  getDiagnostics(): ClientNotificationRegistryDiagnostics;
}
