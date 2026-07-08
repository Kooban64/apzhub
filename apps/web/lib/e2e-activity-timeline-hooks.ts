"use client";

import { useEffect } from "react";

import type { ActivityService } from "@apzhub/activity-timeline-framework/server";

import {
  isE2eTestHooksEnabled,
  type ApzhubE2eTestHooks,
} from "./e2e-event-notification-hooks";

const TIMELINE_SCOPE_PERSONAL = "timeline.personal" as const;

const E2E_DELEGATION_FIXTURE_ID = "e2e-fixture:platform.action.executed";

function buildActivityActionDelegationFixture() {
  return Object.freeze({
    activityId: E2E_DELEGATION_FIXTURE_ID,
    activityTypeId: "platform.action.executed",
    sourceEventId: "capability.action.executed",
    title: "E2E delegation fixture",
    description: "Deterministic activity item for action delegation verification",
    timelineScope: TIMELINE_SCOPE_PERSONAL,
    category: "capability" as const,
    timestamp: new Date().toISOString(),
    actor: Object.freeze({ id: "e2e-user" }),
    metadata: Object.freeze({
      templateRef: "activity.platform.action.executed",
      sourceEnvelopeId: "e2e-fixture-envelope",
      correlationId: "e2e-fixture-correlation",
      publisher: "e2e-test-hooks",
      timelineScopes: Object.freeze([TIMELINE_SCOPE_PERSONAL]),
      severity: "info" as const,
      payloadSummary: Object.freeze({
        actionRef: Object.freeze({
          actionId: "workbench.view.open",
          handlerContext: Object.freeze({ viewId: "platform-home" }),
        }),
      }),
    }),
    diagnostics: Object.freeze({
      renderedAt: new Date().toISOString(),
      matchedActivityTypeId: "platform.action.executed",
      eventPattern: "capability.action.executed",
      typeStatus: "active" as const,
      templateStatus: "ok" as const,
      message: "E2E activity delegation fixture",
    }),
  });
}

/** Dev/E2E-only window hooks for deterministic Activity Timeline verification (AT-014). */
export function useE2eActivityTimelineTestHooks(options: {
  readonly activityService: ActivityService;
}): void {
  useEffect(() => {
    if (!isE2eTestHooksEnabled()) {
      return;
    }

    const existing = window.__APZHUB_E2E__;

    const activityHooks: Pick<
      ApzhubE2eTestHooks,
      "getActivityCount" | "getActivityTitles" | "seedActivityActionDelegationFixture"
    > = {
      getActivityCount: () => options.activityService.listActivities().length,
      getActivityTitles: () =>
        options.activityService.listActivities().map((activity) => activity.title),
      seedActivityActionDelegationFixture: () => {
        options.activityService.addActivities([buildActivityActionDelegationFixture()]);
      },
    };

    window.__APZHUB_E2E__ = {
      ...existing,
      ...activityHooks,
    } satisfies ApzhubE2eTestHooks;

    return () => {
      if (!window.__APZHUB_E2E__) {
        return;
      }

      const {
        getActivityCount: _getActivityCount,
        getActivityTitles: _getActivityTitles,
        seedActivityActionDelegationFixture: _seedActivityActionDelegationFixture,
        ...rest
      } = window.__APZHUB_E2E__;
      window.__APZHUB_E2E__ =
        Object.keys(rest).length > 0 ? (rest as ApzhubE2eTestHooks) : undefined;
    };
  }, [options.activityService]);
}

export { E2E_DELEGATION_FIXTURE_ID };
