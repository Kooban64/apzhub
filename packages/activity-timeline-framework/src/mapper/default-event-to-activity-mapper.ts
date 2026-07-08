import type { EventEnvelope } from "@apzhub/event-notification-framework";

import type { ActivityRegistry } from "../registry/activity-registry";
import { ACTIVITY_TIMELINE_FRAMEWORK_STATUS } from "../status";
import type {
  ActivityMapperDiagnostics,
  ActivityMapperResult,
  ActivityMappingIssue,
} from "../types/activity-mapper-diagnostics";
import type { ActivityMapperRegistry } from "./activity-mapper-registry";
import type { ActivityMapper } from "./activity-mapper";
import { createDefaultActivityMapperRegistry } from "./default-activity-mapper-registry";
import { renderActivityTypeDocument } from "./create-activity-document";
import { resolveActivityTypes } from "./resolve-activity-types";
import { isActivityTemplateRenderError } from "./render-activity-template";
import { syncActivityMapperRegistryFromDescriptors } from "./sync-activity-mapper-registry";

export interface DefaultEventToActivityMapperOptions {
  readonly activityRegistry: ActivityRegistry;
  readonly templateRegistry: ActivityMapperRegistry;
}

/**
 * Default Event-to-Activity mapper.
 *
 * Consumes platform events, resolves matching activity types, renders templates, and returns
 * immutable ActivityDocument instances. Does not store, publish, subscribe, or call UI.
 */
export class DefaultEventToActivityMapper implements ActivityMapper {
  readonly idempotencyStrategy = "none" as const;

  private mappedCount = 0;
  private templateErrorCount = 0;
  private lastMappedCount = 0;
  private lastMatchedTypeCount = 0;
  private lastSourceEventId: string | undefined;

  constructor(private readonly options: DefaultEventToActivityMapperOptions) {
    syncActivityMapperRegistryFromDescriptors(
      options.activityRegistry,
      options.templateRegistry,
    );
  }

  refreshTemplatesFromRegistry(): void {
    syncActivityMapperRegistryFromDescriptors(
      this.options.activityRegistry,
      this.options.templateRegistry,
      { clearExisting: true },
    );
  }

  map(envelope: EventEnvelope): ActivityMapperResult {
    const descriptors = resolveActivityTypes(
      this.options.activityRegistry,
      envelope.eventId,
    );
    this.lastMatchedTypeCount = descriptors.length;
    this.lastSourceEventId = envelope.eventId;

    if (descriptors.length === 0) {
      this.lastMappedCount = 0;
      return Object.freeze({
        ok: true,
        createdCount: 0,
        matchedTypeCount: 0,
        documents: [],
        issues: Object.freeze([
          {
            code: "NO_MATCH" as const,
            message: `No activity types matched event "${envelope.eventId}"`,
          },
        ]),
      });
    }

    const renderedAt = new Date().toISOString();
    const documents = [];
    const issues: ActivityMappingIssue[] = [];

    for (const descriptor of descriptors) {
      const template = this.options.templateRegistry.get(descriptor.activityTypeId);

      try {
        documents.push(
          renderActivityTypeDocument(envelope, descriptor, template, renderedAt),
        );
      } catch (error) {
        if (isActivityTemplateRenderError(error)) {
          this.templateErrorCount += 1;
          issues.push({
            code: "TEMPLATE_ERROR",
            activityTypeId: descriptor.activityTypeId,
            message: error.message,
          });
          continue;
        }

        throw error;
      }
    }

    this.mappedCount += documents.length;
    this.lastMappedCount = documents.length;

    return Object.freeze({
      ok: true,
      createdCount: documents.length,
      matchedTypeCount: descriptors.length,
      documents: Object.freeze([...documents]),
      issues: Object.freeze([...issues]),
    });
  }

  getDiagnostics(): ActivityMapperDiagnostics {
    const registryReady =
      this.options.activityRegistry.getDiagnostics().status === "ready";

    return Object.freeze({
      status: registryReady ? "ready" : "empty",
      mappedCount: this.mappedCount,
      lastMappedCount: this.lastMappedCount,
      lastMatchedTypeCount: this.lastMatchedTypeCount,
      lastSourceEventId: this.lastSourceEventId,
      templateErrorCount: this.templateErrorCount,
      message: registryReady
        ? `DefaultEventToActivityMapper ready — ${ACTIVITY_TIMELINE_FRAMEWORK_STATUS} layer returns documents only`
        : "DefaultEventToActivityMapper idle — activity registry not bootstrapped",
    });
  }
}

export interface CreateDefaultEventToActivityMapperOptions {
  readonly activityRegistry: ActivityRegistry;
  readonly templateRegistry?: ActivityMapperRegistry;
}

export function createDefaultEventToActivityMapper(
  options: CreateDefaultEventToActivityMapperOptions,
): DefaultEventToActivityMapper {
  const templateRegistry =
    options.templateRegistry ?? createDefaultActivityMapperRegistry();

  return new DefaultEventToActivityMapper({
    activityRegistry: options.activityRegistry,
    templateRegistry,
  });
}
