export type { ClientNotificationRoute } from "./client-notification-route";
export { freezeClientNotificationRoute } from "./client-notification-route";

export type { ReadOnlyNotificationRegistry } from "./read-only-notification-registry";

export type {
  ClientNotificationRegistryDiagnostics,
  ClientNotificationRegistryStatus,
} from "./client-notification-registry-diagnostics";
export {
  buildClientNotificationRegistryDiagnostics,
  createEmptyClientNotificationRegistryDiagnostics,
} from "./client-notification-registry-diagnostics";

export {
  ClientNotificationRegistry,
  createEmptyClientNotificationRegistry,
  createInvalidClientNotificationRegistry,
} from "./client-notification-registry";

export {
  mapNotificationRouteDescriptorDtoToRoute,
  mapNotificationRegistryDtoToRoutes,
} from "./map-dto-to-notification-routes";

export {
  createNotificationRegistryFromDto,
  createEmptyNotificationRegistryDto,
  type CreateNotificationRegistryFromDtoOptions,
  type CreateNotificationRegistryFromDtoResult,
} from "./create-notification-registry-from-dto";

export {
  validateNotificationRegistryDto,
  type NotificationRegistryDtoValidationResult,
} from "./validate-notification-registry-dto";

export type {
  ClientRegistrySynchronisationState,
  ClientRegistrySyncMode,
} from "./synchronisation";
export { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

export { sampleNotificationRegistryDto } from "./test-fixtures";
