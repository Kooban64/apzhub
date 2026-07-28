import type { EventBus } from "@apzhub/event-notification-framework";
import {
  ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
  bootstrapActivityRegistry,
  bootstrapTimelineRegistry,
  createDefaultActivityService,
  createDefaultEventToActivityMapper,
  createLawActivityPersistenceStorageKey,
  createPersistedActivitySessionStore,
  type ActivityCapabilityRecord,
  type ActivityContext,
  type ActivityRegistryHydrationDiagnostics,
  type ActivityService,
  type ActivityMapper,
  type ActivitySessionStore,
  type TimelineRegistryHydrationDiagnostics,
} from "@apzhub/activity-timeline-framework/server";

import { createLawSessionDualWriteStorage } from "./persistence/law-session-dual-write-storage";
import { wireAppActivityTimeline } from "./wire-app-activity-timeline";
import { wireLegalDomainActivities } from "./wire-legal-domain-events";
import { registerLawActivityTypes } from "./register-law-activity-types";

export interface CreateAppActivityTimelineContextOptions {
  readonly eventBus?: EventBus;
  readonly capabilityRecords?: readonly ActivityCapabilityRecord[];
  /** When set, uses durable platform activity store (OBS-LAW-02). */
  readonly persistenceScope?: {
    readonly userId?: string;
    readonly tenantId?: string;
  };
  readonly activityStore?: ActivitySessionStore;
}

export interface AppActivityTimelineContext extends ActivityContext {
  readonly activityBootstrapOk: boolean;
  readonly timelineBootstrapOk: boolean;
  readonly subscriberId?: string;
  readonly activityHydrationDiagnostics: ActivityRegistryHydrationDiagnostics;
  readonly timelineHydrationDiagnostics: TimelineRegistryHydrationDiagnostics;
}

/**
 * Shared apps/web composition root for Activity & Timeline Framework.
 * Used by server hydration and client shell providers — one context per session surface.
 */
export function createAppActivityTimelineContext(
  options: CreateAppActivityTimelineContextOptions = {},
): AppActivityTimelineContext {
  const activityBootstrap = bootstrapActivityRegistry({
    capabilityRecords: options.capabilityRecords,
  });
  const timelineBootstrap = bootstrapTimelineRegistry({
    capabilityRecords: options.capabilityRecords,
  });

  if (activityBootstrap.ok) {
    registerLawActivityTypes(activityBootstrap.registry);
  }

  const mapper: ActivityMapper = createDefaultEventToActivityMapper({
    activityRegistry: activityBootstrap.registry,
  });
  const store =
    options.activityStore ??
    (options.persistenceScope
      ? (() => {
          const storageKey = createLawActivityPersistenceStorageKey(
            options.persistenceScope,
          );
          return createPersistedActivitySessionStore({
            storageKey,
            storage: createLawSessionDualWriteStorage({
              kind: "activity",
              storageKey,
              scope: options.persistenceScope!,
            }),
          });
        })()
      : undefined);
  const service: ActivityService = createDefaultActivityService(
    store ? { store } : undefined,
  );

  let subscriberId: string | undefined;

  if (options.eventBus) {
    subscriberId = wireAppActivityTimeline({
      eventBus: options.eventBus,
      mapper,
      service,
    });
    wireLegalDomainActivities({
      eventBus: options.eventBus,
      mapper,
      service,
    });
  }

  return Object.freeze({
    status: ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
    registry: activityBootstrap.registry,
    timelineRegistry: timelineBootstrap.registry,
    mapper,
    service,
    diagnostics: activityBootstrap.registry.getDiagnostics(),
    timelineDiagnostics: timelineBootstrap.registry.getDiagnostics(),
    activityBootstrapOk: activityBootstrap.ok,
    timelineBootstrapOk: timelineBootstrap.ok,
    subscriberId,
    activityHydrationDiagnostics: activityBootstrap.diagnostics,
    timelineHydrationDiagnostics: timelineBootstrap.diagnostics,
  });
}
