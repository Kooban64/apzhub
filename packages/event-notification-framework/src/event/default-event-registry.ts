import type { EventCategory } from "../types/event-category";
import type { EventRegistryDiagnostics } from "../types/diagnostics";
import { EVENT_LAYER_STATUS } from "../status";
import { buildEventMetadata } from "./build-event-metadata";
import type { EventBatchRegistrationResult } from "./event-batch-registration";
import type { EventDescriptor, EventRegistry } from "./event-descriptor";
import type { EventMetadata, EventRegistryMetadata } from "./event-metadata";
import {
  collectDuplicateEventIssues,
  collectEventValidationIssues,
} from "./event-batch-helpers";
import { freezeEventDescriptor } from "./freeze-event-descriptor";
import {
  EventRegistryDuplicateError,
  EventRegistryNotFoundError,
} from "./registry-errors";
import { validateEventDescriptor } from "./validate-event-descriptor";

/**
 * Default in-memory Event Registry — metadata only.
 *
 * Registers event definitions, validates descriptors, exposes diagnostics.
 * Does not publish, subscribe, persist, or execute handlers.
 */
export class DefaultEventRegistry implements EventRegistry {
  private readonly events = new Map<string, EventDescriptor>();
  private manifestCapabilities: readonly string[] = [];
  private frameworkVersion: string | undefined;

  register(descriptor: EventDescriptor): void {
    validateEventDescriptor(descriptor);

    if (this.events.has(descriptor.eventId)) {
      throw new EventRegistryDuplicateError(descriptor.eventId);
    }

    this.events.set(descriptor.eventId, freezeEventDescriptor(descriptor));
  }

  registerMany(descriptors: readonly EventDescriptor[]): void {
    for (const descriptor of descriptors) {
      validateEventDescriptor(descriptor);
    }

    const duplicateIssues = collectDuplicateEventIssues(
      descriptors,
      new Set(this.events.keys()),
    );
    if (duplicateIssues.length > 0) {
      throw new EventRegistryDuplicateError(duplicateIssues[0]!.eventId!);
    }

    for (const descriptor of descriptors) {
      this.events.set(descriptor.eventId, freezeEventDescriptor(descriptor));
    }
  }

  registerManyAtomic(
    descriptors: readonly EventDescriptor[],
  ): EventBatchRegistrationResult {
    const validationIssues = collectEventValidationIssues(descriptors);
    if (validationIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...validationIssues]),
      };
    }

    const duplicateIssues = collectDuplicateEventIssues(
      descriptors,
      new Set(this.events.keys()),
    );
    if (duplicateIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...duplicateIssues]),
      };
    }

    for (const descriptor of descriptors) {
      this.events.set(descriptor.eventId, freezeEventDescriptor(descriptor));
    }

    return {
      ok: true,
      registeredCount: descriptors.length,
      errors: [],
    };
  }

  replace(descriptor: EventDescriptor): void {
    validateEventDescriptor(descriptor);

    if (!this.events.has(descriptor.eventId)) {
      throw new EventRegistryNotFoundError(descriptor.eventId);
    }

    this.events.set(descriptor.eventId, freezeEventDescriptor(descriptor));
  }

  has(eventId: string): boolean {
    return this.events.has(eventId);
  }

  get(eventId: string): EventDescriptor | undefined {
    const descriptor = this.events.get(eventId);
    return descriptor ? freezeEventDescriptor(descriptor) : undefined;
  }

  getMetadata(eventId: string): EventMetadata | undefined {
    const descriptor = this.events.get(eventId);
    return descriptor ? buildEventMetadata(descriptor) : undefined;
  }

  list(): readonly EventDescriptor[] {
    return Object.freeze(
      [...this.events.values()].map((descriptor) => freezeEventDescriptor(descriptor)),
    );
  }

  listMetadata(): readonly EventMetadata[] {
    return Object.freeze(
      [...this.events.values()].map((descriptor) => buildEventMetadata(descriptor)),
    );
  }

  getRegistryMetadata(): EventRegistryMetadata {
    return Object.freeze({
      manifestCapabilityCount: this.manifestCapabilities.length,
      frameworkVersion: this.frameworkVersion,
      eventMetadata: this.listMetadata(),
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
    this.events.clear();
    this.manifestCapabilities = [];
    this.frameworkVersion = undefined;
  }

  getDiagnostics(): EventRegistryDiagnostics {
    const eventIds = Object.freeze([...this.events.keys()].sort());
    const categoryCounts: Partial<Record<EventCategory, number>> = {};
    const platformEventIds: string[] = [];
    const capabilityEventIds: string[] = [];

    for (const descriptor of this.events.values()) {
      categoryCounts[descriptor.category] =
        (categoryCounts[descriptor.category] ?? 0) + 1;
      if (descriptor.source === "builtin") {
        platformEventIds.push(descriptor.eventId);
      } else {
        capabilityEventIds.push(descriptor.eventId);
      }
    }

    platformEventIds.sort();
    capabilityEventIds.sort();

    const status =
      this.events.size === 0
        ? "empty"
        : ("ready" as EventRegistryDiagnostics["status"]);

    return Object.freeze({
      status,
      layerStatus: EVENT_LAYER_STATUS,
      registeredEventCount: this.events.size,
      eventIds,
      duplicateEventIds: [],
      validationIssueCount: 0,
      categoryCounts: Object.freeze({ ...categoryCounts }),
      manifestCapabilityCount: this.manifestCapabilities.length,
      manifestCapabilities:
        this.manifestCapabilities.length > 0 ? this.manifestCapabilities : undefined,
      platformEventCount:
        platformEventIds.length > 0 ? platformEventIds.length : undefined,
      capabilityEventCount:
        capabilityEventIds.length > 0 ? capabilityEventIds.length : undefined,
      platformEventIds:
        platformEventIds.length > 0 ? Object.freeze([...platformEventIds]) : undefined,
      capabilityEventIds:
        capabilityEventIds.length > 0
          ? Object.freeze([...capabilityEventIds])
          : undefined,
      frameworkVersion: this.frameworkVersion,
      issues: [],
      message:
        this.events.size === 0
          ? "Event registry empty — bootstrap pending"
          : "Event registry ready — metadata only",
    });
  }
}

export function createDefaultEventRegistry(): EventRegistry {
  return new DefaultEventRegistry();
}

export const defaultEventRegistryFactory = createDefaultEventRegistry;
