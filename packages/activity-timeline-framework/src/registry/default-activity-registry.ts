import type { ActivityCategory } from "../types/activity-category";
import type { ActivityRegistryDiagnostics } from "../types/activity-diagnostics";
import type { ActivityDescriptor } from "../types/activity-descriptor";
import type {
  ActivityMetadata,
  ActivityRegistryMetadata,
} from "../types/activity-metadata";
import type { ActivityBatchRegistrationResult } from "./activity-batch-registration";
import {
  collectDuplicateActivityIssues,
  collectActivityValidationIssues,
} from "./activity-batch-helpers";
import type { ActivityRegistry } from "./activity-registry";
import { buildActivityMetadata } from "./build-activity-metadata";
import { freezeActivityDescriptor } from "./freeze-activity-descriptor";
import {
  ActivityRegistryDuplicateError,
  ActivityRegistryNotFoundError,
} from "./registry-errors";
import { validateActivityDescriptor } from "./validate-activity-descriptor";

/**
 * Default in-memory Activity Registry — metadata only.
 *
 * Registers activity type definitions, validates descriptors, exposes diagnostics.
 * Does not map events, subscribe to Event Bus, persist instances, or render UI.
 */
export class DefaultActivityRegistry implements ActivityRegistry {
  private readonly activityTypes = new Map<string, ActivityDescriptor>();
  private manifestCapabilities: readonly string[] = [];
  private frameworkVersion: string | undefined;
  private platformCatalogueVersion: string | undefined;

  register(descriptor: ActivityDescriptor): void {
    validateActivityDescriptor(descriptor);

    if (this.activityTypes.has(descriptor.activityTypeId)) {
      throw new ActivityRegistryDuplicateError(descriptor.activityTypeId);
    }

    this.activityTypes.set(
      descriptor.activityTypeId,
      freezeActivityDescriptor(descriptor),
    );
  }

  registerMany(descriptors: readonly ActivityDescriptor[]): void {
    for (const descriptor of descriptors) {
      validateActivityDescriptor(descriptor);
    }

    const duplicateIssues = collectDuplicateActivityIssues(
      descriptors,
      new Set(this.activityTypes.keys()),
    );
    if (duplicateIssues.length > 0) {
      throw new ActivityRegistryDuplicateError(duplicateIssues[0]!.activityTypeId!);
    }

    for (const descriptor of descriptors) {
      this.activityTypes.set(
        descriptor.activityTypeId,
        freezeActivityDescriptor(descriptor),
      );
    }
  }

  registerManyAtomic(
    descriptors: readonly ActivityDescriptor[],
  ): ActivityBatchRegistrationResult {
    const validationIssues = collectActivityValidationIssues(descriptors);
    if (validationIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...validationIssues]),
      };
    }

    const duplicateIssues = collectDuplicateActivityIssues(
      descriptors,
      new Set(this.activityTypes.keys()),
    );
    if (duplicateIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...duplicateIssues]),
      };
    }

    for (const descriptor of descriptors) {
      this.activityTypes.set(
        descriptor.activityTypeId,
        freezeActivityDescriptor(descriptor),
      );
    }

    return {
      ok: true,
      registeredCount: descriptors.length,
      errors: [],
    };
  }

  replace(descriptor: ActivityDescriptor): void {
    validateActivityDescriptor(descriptor);

    if (!this.activityTypes.has(descriptor.activityTypeId)) {
      throw new ActivityRegistryNotFoundError(descriptor.activityTypeId);
    }

    this.activityTypes.set(
      descriptor.activityTypeId,
      freezeActivityDescriptor(descriptor),
    );
  }

  has(activityTypeId: string): boolean {
    return this.activityTypes.has(activityTypeId);
  }

  get(activityTypeId: string): ActivityDescriptor | undefined {
    const descriptor = this.activityTypes.get(activityTypeId);
    return descriptor ? freezeActivityDescriptor(descriptor) : undefined;
  }

  list(): readonly ActivityDescriptor[] {
    return Object.freeze(
      [...this.activityTypes.values()].map((descriptor) =>
        freezeActivityDescriptor(descriptor),
      ),
    );
  }

  clear(): void {
    this.activityTypes.clear();
    this.manifestCapabilities = [];
    this.frameworkVersion = undefined;
    this.platformCatalogueVersion = undefined;
  }

  getMetadata(activityTypeId: string): ActivityMetadata | undefined {
    const descriptor = this.activityTypes.get(activityTypeId);
    return descriptor ? buildActivityMetadata(descriptor) : undefined;
  }

  listMetadata(): readonly ActivityMetadata[] {
    return Object.freeze(
      [...this.activityTypes.values()].map((descriptor) =>
        buildActivityMetadata(descriptor),
      ),
    );
  }

  getRegistryMetadata(): ActivityRegistryMetadata {
    return Object.freeze({
      manifestCapabilityCount: this.manifestCapabilities.length,
      frameworkVersion: this.frameworkVersion,
      platformCatalogueVersion: this.platformCatalogueVersion,
      activityMetadata: this.listMetadata(),
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

  getDiagnostics(): ActivityRegistryDiagnostics {
    const activityTypeIds = Object.freeze([...this.activityTypes.keys()].sort());
    const categoryCounts: Partial<Record<ActivityCategory, number>> = {};
    const scopeCounts: Record<string, number> = {};
    let activeCount = 0;
    let platformCount = 0;
    let manifestCount = 0;

    for (const descriptor of this.activityTypes.values()) {
      categoryCounts[descriptor.category] =
        (categoryCounts[descriptor.category] ?? 0) + 1;

      for (const scope of descriptor.timelineScopes) {
        scopeCounts[scope] = (scopeCounts[scope] ?? 0) + 1;
      }

      const status = descriptor.status ?? "active";
      if (status === "active") {
        activeCount += 1;
      }

      if ((descriptor.source ?? "manifest") === "builtin") {
        platformCount += 1;
      } else {
        manifestCount += 1;
      }
    }

    const status: ActivityRegistryDiagnostics["status"] =
      this.activityTypes.size === 0 ? "empty" : "ready";

    return Object.freeze({
      status,
      registeredActivityTypeCount: this.activityTypes.size,
      activeCount,
      platformCount,
      manifestCount,
      activityTypeIds,
      duplicateActivityTypeIds: [],
      validationIssueCount: 0,
      categoryCounts: Object.freeze({ ...categoryCounts }),
      scopeCounts: Object.freeze({ ...scopeCounts }),
      manifestCapabilityCount: this.manifestCapabilities.length,
      manifestCapabilityIds:
        this.manifestCapabilities.length > 0 ? this.manifestCapabilities : undefined,
      platformCatalogueVersion: this.platformCatalogueVersion,
      frameworkVersion: this.frameworkVersion,
      issues: [],
      message:
        this.activityTypes.size === 0
          ? "Activity registry empty — bootstrap pending"
          : "Activity registry ready — metadata only",
    });
  }
}

export function createDefaultActivityRegistry(): ActivityRegistry {
  return new DefaultActivityRegistry();
}

export const defaultActivityRegistryFactory = createDefaultActivityRegistry;
