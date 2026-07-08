import type { DeliveryChannel, NotificationKind } from "../types/notification-kind";
import type { NotificationRegistryDiagnostics } from "../types/diagnostics";
import { NOTIFICATION_LAYER_STATUS } from "../status";
import { buildNotificationMetadata } from "./build-notification-metadata";
import type { NotificationBatchRegistrationResult } from "./notification-batch-registration";
import {
  collectDuplicateRouteIssues,
  collectNotificationValidationIssues,
} from "./notification-batch-helpers";
import type {
  NotificationDescriptor,
  NotificationRegistry,
} from "./notification-descriptor";
import type {
  NotificationMetadata,
  NotificationRegistryMetadata,
} from "./notification-metadata";
import { freezeNotificationDescriptor } from "./freeze-notification-descriptor";
import {
  NotificationRegistryDuplicateError,
  NotificationRegistryNotFoundError,
} from "./registry-errors";
import { validateNotificationDescriptor } from "./validate-notification-descriptor";

/**
 * Default in-memory Notification Registry — metadata only.
 *
 * Registers notification route definitions, validates descriptors, exposes diagnostics.
 * Does not deliver notifications, subscribe to Event Bus, publish events, or persist.
 */
export class DefaultNotificationRegistry implements NotificationRegistry {
  private readonly routes = new Map<string, NotificationDescriptor>();
  private manifestCapabilities: readonly string[] = [];
  private frameworkVersion: string | undefined;

  register(descriptor: NotificationDescriptor): void {
    validateNotificationDescriptor(descriptor);

    if (this.routes.has(descriptor.routeId)) {
      throw new NotificationRegistryDuplicateError(descriptor.routeId);
    }

    this.routes.set(descriptor.routeId, freezeNotificationDescriptor(descriptor));
  }

  registerMany(descriptors: readonly NotificationDescriptor[]): void {
    for (const descriptor of descriptors) {
      validateNotificationDescriptor(descriptor);
    }

    const duplicateIssues = collectDuplicateRouteIssues(
      descriptors,
      new Set(this.routes.keys()),
    );
    if (duplicateIssues.length > 0) {
      throw new NotificationRegistryDuplicateError(duplicateIssues[0]!.routeId!);
    }

    for (const descriptor of descriptors) {
      this.routes.set(descriptor.routeId, freezeNotificationDescriptor(descriptor));
    }
  }

  registerManyAtomic(
    descriptors: readonly NotificationDescriptor[],
  ): NotificationBatchRegistrationResult {
    const validationIssues = collectNotificationValidationIssues(descriptors);
    if (validationIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...validationIssues]),
      };
    }

    const duplicateIssues = collectDuplicateRouteIssues(
      descriptors,
      new Set(this.routes.keys()),
    );
    if (duplicateIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...duplicateIssues]),
      };
    }

    for (const descriptor of descriptors) {
      this.routes.set(descriptor.routeId, freezeNotificationDescriptor(descriptor));
    }

    return {
      ok: true,
      registeredCount: descriptors.length,
      errors: [],
    };
  }

  replace(descriptor: NotificationDescriptor): void {
    validateNotificationDescriptor(descriptor);

    if (!this.routes.has(descriptor.routeId)) {
      throw new NotificationRegistryNotFoundError(descriptor.routeId);
    }

    this.routes.set(descriptor.routeId, freezeNotificationDescriptor(descriptor));
  }

  has(routeId: string): boolean {
    return this.routes.has(routeId);
  }

  get(routeId: string): NotificationDescriptor | undefined {
    const descriptor = this.routes.get(routeId);
    return descriptor ? freezeNotificationDescriptor(descriptor) : undefined;
  }

  getMetadata(routeId: string): NotificationMetadata | undefined {
    const descriptor = this.routes.get(routeId);
    return descriptor ? buildNotificationMetadata(descriptor) : undefined;
  }

  list(): readonly NotificationDescriptor[] {
    return Object.freeze(
      [...this.routes.values()].map((descriptor) =>
        freezeNotificationDescriptor(descriptor),
      ),
    );
  }

  listMetadata(): readonly NotificationMetadata[] {
    return Object.freeze(
      [...this.routes.values()].map((descriptor) =>
        buildNotificationMetadata(descriptor),
      ),
    );
  }

  getRegistryMetadata(): NotificationRegistryMetadata {
    return Object.freeze({
      manifestCapabilityCount: this.manifestCapabilities.length,
      frameworkVersion: this.frameworkVersion,
      routeMetadata: this.listMetadata(),
    });
  }

  recordManifestCapabilities(capabilityIds: readonly string[]): void {
    this.manifestCapabilities = Object.freeze([...capabilityIds].sort());
  }

  recordPlatformCatalogue(version: string): void {
    this.frameworkVersion = version;
  }

  recordFrameworkVersion(version: string): void {
    this.frameworkVersion = version;
  }

  clear(): void {
    this.routes.clear();
    this.manifestCapabilities = [];
    this.frameworkVersion = undefined;
  }

  getDiagnostics(): NotificationRegistryDiagnostics {
    const routeIds = Object.freeze([...this.routes.keys()].sort());
    const kindCounts: Partial<Record<NotificationKind, number>> = {};
    const channelCounts: Partial<Record<DeliveryChannel, number>> = {};
    const platformRouteIds: string[] = [];
    const capabilityRouteIds: string[] = [];

    for (const descriptor of this.routes.values()) {
      kindCounts[descriptor.notificationKind] =
        (kindCounts[descriptor.notificationKind] ?? 0) + 1;
      channelCounts[descriptor.channel] = (channelCounts[descriptor.channel] ?? 0) + 1;
      if (descriptor.source === "builtin") {
        platformRouteIds.push(descriptor.routeId);
      } else {
        capabilityRouteIds.push(descriptor.routeId);
      }
    }

    platformRouteIds.sort();
    capabilityRouteIds.sort();

    const status =
      this.routes.size === 0
        ? "empty"
        : ("ready" as NotificationRegistryDiagnostics["status"]);

    return Object.freeze({
      status,
      layerStatus: NOTIFICATION_LAYER_STATUS,
      registeredRouteCount: this.routes.size,
      routeIds,
      duplicateRouteIds: [],
      validationIssueCount: 0,
      kindCounts: Object.freeze({ ...kindCounts }),
      channelCounts: Object.freeze({ ...channelCounts }),
      manifestCapabilityCount: this.manifestCapabilities.length,
      manifestCapabilities:
        this.manifestCapabilities.length > 0 ? this.manifestCapabilities : undefined,
      platformRouteCount:
        platformRouteIds.length > 0 ? platformRouteIds.length : undefined,
      capabilityRouteCount:
        capabilityRouteIds.length > 0 ? capabilityRouteIds.length : undefined,
      platformRouteIds:
        platformRouteIds.length > 0 ? Object.freeze([...platformRouteIds]) : undefined,
      capabilityRouteIds:
        capabilityRouteIds.length > 0
          ? Object.freeze([...capabilityRouteIds])
          : undefined,
      frameworkVersion: this.frameworkVersion,
      issues: [],
      message:
        this.routes.size === 0
          ? "Notification registry empty — bootstrap pending"
          : "Notification registry ready — metadata only",
    });
  }
}

export function createDefaultNotificationRegistry(): NotificationRegistry {
  return new DefaultNotificationRegistry();
}

export const defaultNotificationRegistryFactory = createDefaultNotificationRegistry;
