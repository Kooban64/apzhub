import { NOTIFICATION_LAYER_STATUS } from "../status";
import type {
  NotificationMapperDiagnostics,
  NotificationRegistryDiagnostics,
  NotificationServiceDiagnostics,
} from "../types/diagnostics";
import type { NotificationBatchRegistrationResult } from "./notification-batch-registration";
import type {
  NotificationDescriptor,
  NotificationRegistry,
} from "./notification-descriptor";
import type {
  NotificationMetadata,
  NotificationRegistryMetadata,
} from "./notification-metadata";
import type { NotificationItem } from "./notification-item";
import type {
  NotificationMapper,
  NotificationMapperResult,
} from "./notification-mapper";
import type {
  ListNotificationsOptions,
  NotificationService,
  AddNotificationsResult,
} from "./notification-service";
import type { EventEnvelope } from "../event/event-envelope";

const PLACEHOLDER_REGISTRY_DIAGNOSTICS: NotificationRegistryDiagnostics = Object.freeze(
  {
    status: "scaffold",
    layerStatus: NOTIFICATION_LAYER_STATUS,
    registeredRouteCount: 0,
    routeIds: [],
    duplicateRouteIds: [],
    validationIssueCount: 0,
    kindCounts: Object.freeze({}),
    channelCounts: Object.freeze({}),
    manifestCapabilityCount: 0,
    issues: [],
    message: "Placeholder NotificationRegistry — use DefaultNotificationRegistry",
  },
);

const PLACEHOLDER_MAPPER_DIAGNOSTICS: NotificationMapperDiagnostics = Object.freeze({
  status: "scaffold",
  layerStatus: NOTIFICATION_LAYER_STATUS,
  mappedCount: 0,
  lastMappedCount: 0,
  lastMatchedRouteCount: 0,
  templateErrorCount: 0,
  message: "Placeholder NotificationMapper — use DefaultNotificationMapper",
});

const PLACEHOLDER_SERVICE_DIAGNOSTICS: NotificationServiceDiagnostics = Object.freeze({
  status: "scaffold",
  layerStatus: NOTIFICATION_LAYER_STATUS,
  activeNotificationCount: 0,
  unreadCount: 0,
  readCount: 0,
  health: "empty",
  message: "Placeholder NotificationService — use DefaultNotificationService",
});

const EMPTY_REGISTRY_METADATA: NotificationRegistryMetadata = Object.freeze({
  manifestCapabilityCount: 0,
  routeMetadata: [],
});

function notImplementedBatch(): NotificationBatchRegistrationResult {
  return {
    ok: false,
    registeredCount: 0,
    errors: [
      {
        code: "VALIDATION",
        message: "Placeholder NotificationRegistry — use DefaultNotificationRegistry",
      },
    ],
  };
}

/** No-op NotificationRegistry for tests overriding composition root before bootstrap wiring. */
export class PlaceholderNotificationRegistry implements NotificationRegistry {
  register(_descriptor: NotificationDescriptor): void {
    // Placeholder
  }

  registerMany(_descriptors: readonly NotificationDescriptor[]): void {
    // Placeholder
  }

  registerManyAtomic(
    _descriptors: readonly NotificationDescriptor[],
  ): NotificationBatchRegistrationResult {
    return notImplementedBatch();
  }

  replace(_descriptor: NotificationDescriptor): void {
    // Placeholder
  }

  has(_routeId: string): boolean {
    return false;
  }

  get(_routeId: string): NotificationDescriptor | undefined {
    return undefined;
  }

  getMetadata(_routeId: string): NotificationMetadata | undefined {
    return undefined;
  }

  list(): readonly NotificationDescriptor[] {
    return [];
  }

  listMetadata(): readonly NotificationMetadata[] {
    return [];
  }

  getRegistryMetadata(): NotificationRegistryMetadata {
    return EMPTY_REGISTRY_METADATA;
  }

  recordManifestCapabilities(_capabilityIds: readonly string[]): void {
    // Placeholder
  }

  recordPlatformCatalogue(_version: string): void {
    // Placeholder
  }

  recordFrameworkVersion(_version: string): void {
    // Placeholder
  }

  clear(): void {
    // Placeholder
  }

  getDiagnostics(): NotificationRegistryDiagnostics {
    return PLACEHOLDER_REGISTRY_DIAGNOSTICS;
  }
}

/** No-op mapper scaffold — consumes events only; never publishes. EN-009. */
export class PlaceholderNotificationMapper implements NotificationMapper {
  map(_envelope: EventEnvelope): NotificationMapperResult {
    return {
      ok: false,
      createdCount: 0,
      matchedRouteCount: 0,
      items: [],
      issues: [],
      errorCode: "NOT_IMPLEMENTED",
    };
  }

  getDiagnostics(): NotificationMapperDiagnostics {
    return PLACEHOLDER_MAPPER_DIAGNOSTICS;
  }
}

/** No-op NotificationService scaffold for tests overriding composition root. */
export class PlaceholderNotificationService implements NotificationService {
  addNotifications(_items: readonly NotificationItem[]): AddNotificationsResult {
    return { addedCount: 0, skippedCount: 0 };
  }

  listNotifications(_options?: ListNotificationsOptions): readonly NotificationItem[] {
    return [];
  }

  getNotification(_notificationId: string): NotificationItem | undefined {
    return undefined;
  }

  markRead(_notificationId: string): boolean {
    return false;
  }

  markAllRead(): number {
    return 0;
  }

  markAsRead(_notificationId: string): boolean {
    return false;
  }

  markAllAsRead(): number {
    return 0;
  }

  clearNotifications(): number {
    return 0;
  }

  getUnreadCount(): number {
    return 0;
  }

  subscribe(_listener: () => void): () => void {
    return () => {
      // Placeholder unsubscribe
    };
  }

  getStoreRevision(): number {
    return 0;
  }

  getDiagnostics(): NotificationServiceDiagnostics {
    return PLACEHOLDER_SERVICE_DIAGNOSTICS;
  }
}

export function createPlaceholderNotificationRegistry(): NotificationRegistry {
  return new PlaceholderNotificationRegistry();
}

export function createPlaceholderNotificationMapper(): NotificationMapper {
  return new PlaceholderNotificationMapper();
}

export function createPlaceholderNotificationService(): NotificationService {
  return new PlaceholderNotificationService();
}
