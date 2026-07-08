import {
  DELIVERY_CHANNELS,
  NOTIFICATION_KINDS,
  type DeliveryChannel,
  type NotificationKind,
  type NotificationPriority,
} from "../types/notification-kind";

const NOTIFICATION_KIND_SET = new Set<NotificationKind>(NOTIFICATION_KINDS);
const DELIVERY_CHANNEL_SET = new Set<DeliveryChannel>(DELIVERY_CHANNELS);

const ROUTE_STATUSES = new Set(["active", "planned", "disabled"]);

const PRIORITIES = new Set<NotificationPriority>(["low", "normal", "high", "urgent"]);

const IN_APP_KINDS = new Set<NotificationKind>(["toast", "banner", "inbox", "in-app"]);

const KIND_CHANNEL_MAP: Readonly<Record<NotificationKind, DeliveryChannel>> = {
  toast: "in-app",
  banner: "in-app",
  inbox: "in-app",
  "in-app": "in-app",
  email: "email",
  sms: "sms",
  push: "push",
  webhook: "webhook",
};

export interface NotificationManifestEntry {
  readonly id: string;
  readonly eventPattern: string;
  readonly notificationKind: NotificationKind;
  readonly channel: DeliveryChannel;
  readonly templateRef: string;
  readonly version: string;
  readonly priority?: NotificationPriority;
  readonly permission?: string;
  readonly status?: "active" | "planned" | "disabled";
  readonly label?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly titleTemplate?: string;
  readonly bodyTemplate?: string;
}

export interface NotificationManifestValidationIssue {
  readonly message: string;
  readonly field?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidKindChannelPair(
  kind: NotificationKind,
  channel: DeliveryChannel,
): boolean {
  return KIND_CHANNEL_MAP[kind] === channel;
}

/** Validates inline capability manifest `notifications.routes[]` entries. */
export function parseNotificationManifestEntry(rawEntry: unknown): {
  entry?: NotificationManifestEntry;
  issue?: NotificationManifestValidationIssue;
} {
  if (!isRecord(rawEntry)) {
    return { issue: { message: "Notification manifest entry must be an object" } };
  }

  const id = rawEntry.id;
  const eventPattern = rawEntry.eventPattern;
  const notificationKind = rawEntry.notificationKind;
  const channel = rawEntry.channel;
  const templateRef = rawEntry.templateRef;
  const version = rawEntry.version;

  if (typeof id !== "string" || !id.trim()) {
    return { issue: { message: "Notification route id is required", field: "id" } };
  }

  if (typeof eventPattern !== "string" || !eventPattern.trim()) {
    return {
      issue: {
        message: "Notification eventPattern is required",
        field: "eventPattern",
      },
    };
  }

  if (
    typeof notificationKind !== "string" ||
    !NOTIFICATION_KIND_SET.has(notificationKind as NotificationKind)
  ) {
    return {
      issue: { message: "Invalid notification kind", field: "notificationKind" },
    };
  }

  if (
    typeof channel !== "string" ||
    !DELIVERY_CHANNEL_SET.has(channel as DeliveryChannel)
  ) {
    return { issue: { message: "Invalid delivery channel", field: "channel" } };
  }

  const kind = notificationKind as NotificationKind;
  const deliveryChannel = channel as DeliveryChannel;

  if (!isValidKindChannelPair(kind, deliveryChannel)) {
    const expected = KIND_CHANNEL_MAP[kind];
    return {
      issue: {
        message: `Notification kind "${kind}" requires channel "${expected}"`,
        field: "channel",
      },
    };
  }

  if (typeof templateRef !== "string" || !templateRef.trim()) {
    return {
      issue: { message: "Notification templateRef is required", field: "templateRef" },
    };
  }

  if (typeof version !== "string" || !version.trim()) {
    return { issue: { message: "Notification version is required", field: "version" } };
  }

  if (rawEntry.status !== undefined && !ROUTE_STATUSES.has(String(rawEntry.status))) {
    return { issue: { message: "Invalid notification route status", field: "status" } };
  }

  if (
    rawEntry.priority !== undefined &&
    !PRIORITIES.has(rawEntry.priority as NotificationPriority)
  ) {
    return { issue: { message: "Invalid notification priority", field: "priority" } };
  }

  if (rawEntry.tags !== undefined) {
    if (
      !Array.isArray(rawEntry.tags) ||
      rawEntry.tags.some((tag) => typeof tag !== "string" || !tag.trim())
    ) {
      return {
        issue: {
          message: "Notification tags must be non-empty strings",
          field: "tags",
        },
      };
    }
  }

  if (
    rawEntry.titleTemplate !== undefined &&
    (typeof rawEntry.titleTemplate !== "string" || !rawEntry.titleTemplate.trim())
  ) {
    return {
      issue: {
        message: "Notification titleTemplate must be a non-empty string",
        field: "titleTemplate",
      },
    };
  }

  if (
    rawEntry.bodyTemplate !== undefined &&
    (typeof rawEntry.bodyTemplate !== "string" || !rawEntry.bodyTemplate.trim())
  ) {
    return {
      issue: {
        message: "Notification bodyTemplate must be a non-empty string",
        field: "bodyTemplate",
      },
    };
  }

  return {
    entry: {
      id: id.trim(),
      eventPattern: eventPattern.trim(),
      notificationKind: kind,
      channel: deliveryChannel,
      templateRef: templateRef.trim(),
      version: version.trim(),
      priority: rawEntry.priority as NotificationPriority | undefined,
      permission:
        typeof rawEntry.permission === "string" ? rawEntry.permission : undefined,
      status: rawEntry.status as NotificationManifestEntry["status"],
      label: typeof rawEntry.label === "string" ? rawEntry.label : undefined,
      description:
        typeof rawEntry.description === "string" ? rawEntry.description : undefined,
      tags: Array.isArray(rawEntry.tags)
        ? Object.freeze([...rawEntry.tags])
        : undefined,
      titleTemplate:
        typeof rawEntry.titleTemplate === "string" ? rawEntry.titleTemplate : undefined,
      bodyTemplate:
        typeof rawEntry.bodyTemplate === "string" ? rawEntry.bodyTemplate : undefined,
    },
  };
}

export function expectedChannelForKind(kind: NotificationKind): DeliveryChannel {
  return KIND_CHANNEL_MAP[kind];
}

/** In-app presentation kinds — used for diagnostics and documentation. */
export const IN_APP_NOTIFICATION_KINDS = Object.freeze([...IN_APP_KINDS]);
