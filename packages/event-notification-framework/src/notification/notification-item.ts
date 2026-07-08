import type { EventCategory } from "../types/event-category";
import type {
  DeliveryChannel,
  NotificationKind,
  NotificationPriority,
} from "../types/notification-kind";
import type { NotificationRouteStatus } from "./notification-descriptor";

export interface NotificationActionRef {
  readonly actionId: string;
  readonly handlerContext?: Readonly<Record<string, unknown>>;
}

/** Provenance and presentation metadata carried on mapped notification items. */
export interface NotificationItemMetadata {
  readonly templateRef: string;
  readonly sourceEnvelopeId: string;
  readonly category: EventCategory;
  readonly correlationId: string;
  readonly publisher: string;
  readonly read: boolean;
  readonly actorId?: string;
  readonly actionRef?: NotificationActionRef;
}

/** Per-item mapper diagnostics — immutable snapshot at creation time. */
export interface NotificationItemDiagnostics {
  readonly renderedAt: string;
  readonly routeStatus: NotificationRouteStatus;
  readonly eventPattern: string;
  readonly message: string;
}

/**
 * Canonical notification instance produced by the mapper.
 * Immutable — delivery and persistence are handled in later stories.
 */
export interface NotificationItem {
  readonly notificationId: string;
  readonly routeId: string;
  readonly eventId: string;
  readonly title: string;
  readonly body?: string;
  readonly kind: NotificationKind;
  readonly channel: DeliveryChannel;
  readonly priority: NotificationPriority;
  readonly timestamp: string;
  readonly metadata: NotificationItemMetadata;
  readonly diagnostics: NotificationItemDiagnostics;
}

export function freezeNotificationItem(item: NotificationItem): NotificationItem {
  return Object.freeze({
    ...item,
    metadata: Object.freeze({
      ...item.metadata,
      actionRef: item.metadata.actionRef
        ? Object.freeze({
            ...item.metadata.actionRef,
            handlerContext: item.metadata.actionRef.handlerContext
              ? Object.freeze({ ...item.metadata.actionRef.handlerContext })
              : undefined,
          })
        : undefined,
    }),
    diagnostics: Object.freeze({ ...item.diagnostics }),
  });
}
