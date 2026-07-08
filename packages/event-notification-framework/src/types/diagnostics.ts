import type { EventLayerStatus, NotificationLayerStatus } from "../status";

export type EventNotificationDiagnosticsStatus =
  "scaffold" | "empty" | "ready" | "degraded";

export interface EventRegistryDiagnostics {
  readonly status: EventNotificationDiagnosticsStatus;
  readonly layerStatus: EventLayerStatus;
  readonly registeredEventCount: number;
  readonly eventIds: readonly string[];
  readonly duplicateEventIds: readonly string[];
  readonly validationIssueCount: number;
  readonly categoryCounts: Readonly<
    Partial<Record<import("./event-category").EventCategory, number>>
  >;
  readonly manifestCapabilityCount: number;
  readonly manifestCapabilities?: readonly string[];
  readonly platformEventCount?: number;
  readonly capabilityEventCount?: number;
  readonly platformEventIds?: readonly string[];
  readonly capabilityEventIds?: readonly string[];
  readonly frameworkVersion?: string;
  readonly issues: readonly import("../event/event-metadata").EventRegistrationIssue[];
  readonly message?: string;
}

export interface EventBusDiagnostics {
  readonly status: EventNotificationDiagnosticsStatus;
  readonly layerStatus: EventLayerStatus;
  /** Active subscription count (alias of subscriptionCount). */
  readonly subscriberCount: number;
  readonly subscriptionCount: number;
  readonly publishCount: number;
  readonly failedPublishCount: number;
  readonly subscriberFailureCount: number;
  readonly lastPublishStatus: "none" | "success" | "failed" | "not_implemented";
  readonly lastPublishEnvelopeId?: string;
  readonly message: string;
}

export interface NotificationRegistryDiagnostics {
  readonly status: EventNotificationDiagnosticsStatus;
  readonly layerStatus: NotificationLayerStatus;
  readonly registeredRouteCount: number;
  readonly routeIds: readonly string[];
  readonly duplicateRouteIds: readonly string[];
  readonly validationIssueCount: number;
  readonly kindCounts: Readonly<
    Partial<Record<import("./notification-kind").NotificationKind, number>>
  >;
  readonly channelCounts: Readonly<
    Partial<Record<import("./notification-kind").DeliveryChannel, number>>
  >;
  readonly manifestCapabilityCount: number;
  readonly manifestCapabilities?: readonly string[];
  readonly platformRouteCount?: number;
  readonly capabilityRouteCount?: number;
  readonly platformRouteIds?: readonly string[];
  readonly capabilityRouteIds?: readonly string[];
  readonly frameworkVersion?: string;
  readonly issues: readonly import("../notification/notification-metadata").NotificationRegistrationIssue[];
  readonly message: string;
}

export interface NotificationMapperDiagnostics {
  readonly status: EventNotificationDiagnosticsStatus;
  readonly layerStatus: NotificationLayerStatus;
  readonly mappedCount: number;
  readonly lastMappedCount: number;
  readonly lastMatchedRouteCount: number;
  readonly lastEventId?: string;
  readonly templateErrorCount: number;
  readonly message: string;
}

export interface NotificationServiceDiagnostics {
  readonly status: EventNotificationDiagnosticsStatus;
  readonly layerStatus: NotificationLayerStatus;
  readonly activeNotificationCount: number;
  readonly unreadCount: number;
  readonly readCount: number;
  readonly lastNotificationTimestamp?: string;
  readonly health: "empty" | "healthy" | "degraded";
  readonly message: string;
}

export interface EventNotificationFrameworkDiagnostics {
  readonly frameworkStatus: EventNotificationDiagnosticsStatus;
  readonly eventRegistry: EventRegistryDiagnostics;
  readonly eventBus: EventBusDiagnostics;
  readonly notificationRegistry: NotificationRegistryDiagnostics;
  readonly notificationMapper: NotificationMapperDiagnostics;
  readonly notificationService: NotificationServiceDiagnostics;
}
