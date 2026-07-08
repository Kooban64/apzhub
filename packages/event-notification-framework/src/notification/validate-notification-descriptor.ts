import {
  DELIVERY_CHANNELS,
  NOTIFICATION_KINDS,
  type DeliveryChannel,
  type NotificationKind,
  type NotificationPriority,
} from "../types/notification-kind";
import type {
  NotificationDescriptor,
  NotificationRouteStatus,
  NotificationStability,
  NotificationVisibility,
} from "./notification-descriptor";
import { NotificationRegistryValidationError } from "./registry-errors";

const ROUTE_ID_PATTERN = /^[a-z][a-z0-9.-]*$/;

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const ROUTE_STATUSES = new Set<NotificationRouteStatus>([
  "active",
  "planned",
  "disabled",
]);

const VISIBILITIES = new Set<NotificationVisibility>([
  "public",
  "internal",
  "restricted",
]);

const STABILITIES = new Set<NotificationStability>([
  "stable",
  "experimental",
  "deprecated",
]);

const PRIORITIES = new Set<NotificationPriority>(["low", "normal", "high", "urgent"]);

const NOTIFICATION_KIND_SET = new Set<NotificationKind>(NOTIFICATION_KINDS);

const DELIVERY_CHANNEL_SET = new Set<DeliveryChannel>(DELIVERY_CHANNELS);

const DESCRIPTOR_SOURCES = new Set(["builtin", "manifest"] as const);

/** Validates notification route descriptor shape before registration. */
export function validateNotificationDescriptor(
  descriptor: NotificationDescriptor,
): void {
  if (!descriptor.routeId?.trim()) {
    throw new NotificationRegistryValidationError(
      "Notification route id is required",
      "routeId",
    );
  }

  if (!ROUTE_ID_PATTERN.test(descriptor.routeId)) {
    throw new NotificationRegistryValidationError(
      `Notification route id "${descriptor.routeId}" must use lowercase dot notation`,
      "routeId",
    );
  }

  if (!descriptor.eventPattern?.trim()) {
    throw new NotificationRegistryValidationError(
      "Notification event pattern is required",
      "eventPattern",
    );
  }

  if (!NOTIFICATION_KIND_SET.has(descriptor.notificationKind)) {
    throw new NotificationRegistryValidationError(
      `Invalid notification kind "${String(descriptor.notificationKind)}"`,
      "notificationKind",
    );
  }

  if (!DELIVERY_CHANNEL_SET.has(descriptor.channel)) {
    throw new NotificationRegistryValidationError(
      `Invalid delivery channel "${String(descriptor.channel)}"`,
      "channel",
    );
  }

  if (!descriptor.templateRef?.trim()) {
    throw new NotificationRegistryValidationError(
      "Notification templateRef is required",
      "templateRef",
    );
  }

  if (!descriptor.version?.trim()) {
    throw new NotificationRegistryValidationError(
      "Notification version is required",
      "version",
    );
  }

  if (!SEMVER_PATTERN.test(descriptor.version)) {
    throw new NotificationRegistryValidationError(
      `Notification version "${descriptor.version}" must be semver`,
      "version",
    );
  }

  if (descriptor.schemaVersion !== undefined && !descriptor.schemaVersion.trim()) {
    throw new NotificationRegistryValidationError(
      "Notification schemaVersion must be non-empty when provided",
      "schemaVersion",
    );
  }

  if (
    descriptor.schemaVersion !== undefined &&
    !SEMVER_PATTERN.test(descriptor.schemaVersion)
  ) {
    throw new NotificationRegistryValidationError(
      `Notification schemaVersion "${descriptor.schemaVersion}" must be semver`,
      "schemaVersion",
    );
  }

  if (descriptor.visibility !== undefined && !VISIBILITIES.has(descriptor.visibility)) {
    throw new NotificationRegistryValidationError(
      `Invalid notification visibility "${String(descriptor.visibility)}"`,
      "visibility",
    );
  }

  if (descriptor.stability !== undefined && !STABILITIES.has(descriptor.stability)) {
    throw new NotificationRegistryValidationError(
      `Invalid notification stability "${String(descriptor.stability)}"`,
      "stability",
    );
  }

  if (descriptor.status !== undefined && !ROUTE_STATUSES.has(descriptor.status)) {
    throw new NotificationRegistryValidationError(
      `Invalid notification route status "${String(descriptor.status)}"`,
      "status",
    );
  }

  if (descriptor.priority !== undefined && !PRIORITIES.has(descriptor.priority)) {
    throw new NotificationRegistryValidationError(
      `Invalid notification priority "${String(descriptor.priority)}"`,
      "priority",
    );
  }

  if (descriptor.source !== undefined && !DESCRIPTOR_SOURCES.has(descriptor.source)) {
    throw new NotificationRegistryValidationError(
      `Invalid notification source "${String(descriptor.source)}"`,
      "source",
    );
  }

  if (descriptor.tags !== undefined) {
    if (!Array.isArray(descriptor.tags) || descriptor.tags.some((tag) => !tag.trim())) {
      throw new NotificationRegistryValidationError(
        "Notification tags must be a non-empty string array when provided",
        "tags",
      );
    }
  }
}
