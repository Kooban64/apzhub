/** React subpath status — application integration (EN-015). */
export const EVENT_NOTIFICATION_REACT_STATUS = "integration" as const;

export type EventNotificationReactStatus = typeof EVENT_NOTIFICATION_REACT_STATUS;

import type { PropsWithChildren, ReactNode } from "react";

/** Pass-through root — prefer NotificationRegistryProvider + NotificationServiceProvider (EN-015). */
export function EventNotificationProvider({ children }: PropsWithChildren): ReactNode {
  return children;
}

/** Placeholder — event client hydration not in EN-010 scope. */
export function useEventRegistry(): never {
  throw new Error(
    "useEventRegistry is not implemented — event client hydration deferred",
  );
}

export {
  NotificationRegistryProvider,
  useNotificationRegistryContext,
  type NotificationRegistryContextValue,
  type NotificationRegistryProviderProps,
} from "./notification-registry-context";

export {
  useNotificationRegistry,
  type UseNotificationRegistryResult,
} from "./use-notification-registry";

export {
  NotificationServiceProvider,
  useNotificationServiceContext,
  type NotificationServiceContextValue,
  type NotificationServiceProviderProps,
} from "./notification-service-context";

export {
  useNotificationService,
  type UseNotificationServiceResult,
} from "./use-notification-service";

export {
  useNotificationPresentation,
  type UseNotificationPresentationOptions,
  type UseNotificationPresentationResult,
} from "./use-notification-presentation";

export type {
  NotificationViewModel,
  NotificationPriorityGroup,
  NotificationPresentationDiagnostics,
  NotificationPresentationSeverity,
  NotificationReadPresentationState,
  MapNotificationItemToViewModelOptions,
  PresentNotificationsFromItemsResult,
} from "../presentation";

export {
  mapNotificationItemToViewModel,
  mapNotificationDtoToViewModel,
  mapNotificationItemsToViewModels,
  sortNotificationViewModelsByPriority,
  groupNotificationViewModelsByPriority,
  presentNotificationsFromItems,
  buildNotificationPresentationDiagnostics,
  formatNotificationRelativeTimestamp,
} from "../presentation";

export type {
  ClientNotificationRoute,
  ReadOnlyNotificationRegistry,
  ClientNotificationRegistryDiagnostics,
  CreateNotificationRegistryFromDtoOptions,
  CreateNotificationRegistryFromDtoResult,
} from "../client";

export {
  createNotificationRegistryFromDto,
  createEmptyNotificationRegistryDto,
  createEmptyClientNotificationRegistry,
  CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  sampleNotificationRegistryDto,
} from "../client";

export type {
  NotificationRegistryDto,
  NotificationRouteDescriptorDto,
} from "../server/map-notification-registry-dto";

export { NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION } from "../server/notification-registry-dto-schema-version";

export {
  mapNotificationRegistryDto,
  createEmptyNotificationRegistryDto as createEmptyServerNotificationRegistryDto,
} from "../server/map-notification-registry-dto";

export {
  validateNotificationRegistryDto,
  type NotificationRegistryDtoValidationResult,
} from "../server/validate-notification-registry-dto";

export { filterNotificationRegistryDto } from "../server/filter-notification-registry-dto";

export {
  buildNotificationRegistryHydrationDiagnostics,
  type NotificationRegistryHydrationDiagnostics,
} from "../server/notification-registry-hydration-diagnostics";
