import type { TimelineRegistryDiagnostics } from "../types/timeline-diagnostics";
import type { TimelineDefinition } from "../types/timeline-definition";
import type {
  TimelineMetadata,
  TimelineRegistryMetadata,
} from "../types/timeline-metadata";
import { buildTimelineMetadata } from "./build-timeline-metadata";
import {
  collectDuplicateTimelineIssues,
  collectTimelineValidationIssues,
} from "./timeline-batch-helpers";
import type { TimelineBatchRegistrationResult } from "./timeline-batch-registration";
import { freezeTimelineDefinition } from "./freeze-timeline-definition";
import { registerPlatformTimelineCatalogue } from "../catalogue/register-platform-timelines";
import {
  TimelineRegistryDuplicateError,
  TimelineRegistryNotFoundError,
} from "./registry-errors";
import type { TimelineRegistry } from "./timeline-registry";
import { validateTimelineDefinition } from "./validate-timeline-definition";

/**
 * Default in-memory Timeline Registry — definition metadata only.
 *
 * Does not store activities, timeline history, or generate timelines.
 */
export class DefaultTimelineRegistry implements TimelineRegistry {
  private readonly timelines = new Map<string, TimelineDefinition>();
  private manifestCapabilities: readonly string[] = [];
  private frameworkVersion: string | undefined;
  private platformCatalogueVersion: string | undefined;

  register(definition: TimelineDefinition): void {
    validateTimelineDefinition(definition);

    if (this.timelines.has(definition.timelineId)) {
      throw new TimelineRegistryDuplicateError(definition.timelineId);
    }

    this.timelines.set(definition.timelineId, freezeTimelineDefinition(definition));
  }

  registerMany(definitions: readonly TimelineDefinition[]): void {
    for (const definition of definitions) {
      validateTimelineDefinition(definition);
    }

    const duplicateIssues = collectDuplicateTimelineIssues(
      definitions,
      new Set(this.timelines.keys()),
    );
    if (duplicateIssues.length > 0) {
      throw new TimelineRegistryDuplicateError(duplicateIssues[0]!.timelineId!);
    }

    for (const definition of definitions) {
      this.timelines.set(definition.timelineId, freezeTimelineDefinition(definition));
    }
  }

  registerManyAtomic(
    definitions: readonly TimelineDefinition[],
  ): TimelineBatchRegistrationResult {
    const validationIssues = collectTimelineValidationIssues(definitions);
    if (validationIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...validationIssues]),
      };
    }

    const duplicateIssues = collectDuplicateTimelineIssues(
      definitions,
      new Set(this.timelines.keys()),
    );
    if (duplicateIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...duplicateIssues]),
      };
    }

    for (const definition of definitions) {
      this.timelines.set(definition.timelineId, freezeTimelineDefinition(definition));
    }

    return {
      ok: true,
      registeredCount: definitions.length,
      errors: [],
    };
  }

  replace(definition: TimelineDefinition): void {
    validateTimelineDefinition(definition);

    if (!this.timelines.has(definition.timelineId)) {
      throw new TimelineRegistryNotFoundError(definition.timelineId);
    }

    this.timelines.set(definition.timelineId, freezeTimelineDefinition(definition));
  }

  has(timelineId: string): boolean {
    return this.timelines.has(timelineId);
  }

  get(timelineId: string): TimelineDefinition | undefined {
    const definition = this.timelines.get(timelineId);
    return definition ? freezeTimelineDefinition(definition) : undefined;
  }

  list(): readonly TimelineDefinition[] {
    return Object.freeze(
      [...this.timelines.values()]
        .map((definition) => freezeTimelineDefinition(definition))
        .sort((left, right) => left.order - right.order),
    );
  }

  clear(): void {
    this.timelines.clear();
    this.manifestCapabilities = [];
    this.frameworkVersion = undefined;
    this.platformCatalogueVersion = undefined;
  }

  getMetadata(timelineId: string): TimelineMetadata | undefined {
    const definition = this.timelines.get(timelineId);
    return definition ? buildTimelineMetadata(definition) : undefined;
  }

  listMetadata(): readonly TimelineMetadata[] {
    return Object.freeze(
      [...this.timelines.values()]
        .sort((left, right) => left.order - right.order)
        .map((definition) => buildTimelineMetadata(definition)),
    );
  }

  getRegistryMetadata(): TimelineRegistryMetadata {
    return Object.freeze({
      manifestCapabilityCount: this.manifestCapabilities.length,
      frameworkVersion: this.frameworkVersion,
      platformCatalogueVersion: this.platformCatalogueVersion,
      timelineMetadata: this.listMetadata(),
    });
  }

  recordManifestCapabilities(capabilityIds: readonly string[]): void {
    this.manifestCapabilities = Object.freeze([...capabilityIds].sort());
  }

  recordPlatformCatalogue(version: string): void {
    this.platformCatalogueVersion = version;
  }

  recordFrameworkVersion(version: string): void {
    this.frameworkVersion = version;
  }

  getDiagnostics(): TimelineRegistryDiagnostics {
    const timelineIds = Object.freeze([...this.timelines.keys()].sort());
    const scopeCounts: Record<string, number> = {};
    let activeCount = 0;
    let platformCount = 0;
    let manifestCount = 0;

    for (const definition of this.timelines.values()) {
      scopeCounts[definition.scope] = (scopeCounts[definition.scope] ?? 0) + 1;

      const status = definition.status ?? "active";
      if (status === "active") {
        activeCount += 1;
      }

      if ((definition.source ?? "manifest") === "builtin") {
        platformCount += 1;
      } else {
        manifestCount += 1;
      }
    }

    const status: TimelineRegistryDiagnostics["status"] =
      this.timelines.size === 0 ? "empty" : "ready";

    return Object.freeze({
      status,
      registeredTimelineCount: this.timelines.size,
      activeCount,
      platformCount,
      manifestCount,
      timelineIds,
      duplicateTimelineIds: [],
      validationIssueCount: 0,
      scopeCounts: Object.freeze({ ...scopeCounts }),
      manifestCapabilityCount: this.manifestCapabilities.length,
      manifestCapabilityIds:
        this.manifestCapabilities.length > 0 ? this.manifestCapabilities : undefined,
      platformCatalogueVersion: this.platformCatalogueVersion,
      frameworkVersion: this.frameworkVersion,
      issues: [],
      message:
        this.timelines.size === 0
          ? "Timeline registry empty — bootstrap pending"
          : "Timeline registry ready — definitions only",
    });
  }
}

export function createDefaultTimelineRegistry(): TimelineRegistry {
  return new DefaultTimelineRegistry();
}

/** Default registry pre-populated with platform timeline definitions. */
export function createDefaultTimelineRegistryWithPlatformCatalogue(): TimelineRegistry {
  const registry = new DefaultTimelineRegistry();
  const result = registerPlatformTimelineCatalogue(registry);
  if (!result.ok) {
    throw new Error("Platform timeline catalogue registration failed");
  }
  return registry;
}

export const defaultTimelineRegistryFactory = createDefaultTimelineRegistry;
