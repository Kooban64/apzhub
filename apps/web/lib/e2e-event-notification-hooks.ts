"use client";

import { useEffect } from "react";

import type { ActionExecutor, ActionResult } from "@apzhub/command-framework";
import type { EventNotificationContext } from "@apzhub/event-notification-framework";

export interface ApzhubE2eTestHooks {
  executeWorkbenchAction?(
    actionId: string,
    args?: Record<string, unknown>,
  ): Promise<ActionResult>;
  getUnreadCount?(): number;
  getActivityCount?(): number;
  getActivityTitles?(): readonly string[];
  seedActivityActionDelegationFixture?(): void;
  refreshActivityTimelinePresentation?(): void;
}

declare global {
  interface Window {
    __APZHUB_E2E__?: ApzhubE2eTestHooks;
  }
}

export function isE2eTestHooksEnabled(): boolean {
  return process.env.NEXT_PUBLIC_E2E_TEST_HOOKS === "true";
}

/** Dev/E2E-only window hooks for deterministic action → notification verification (EN-016). */
export function useE2eEventNotificationTestHooks(options: {
  readonly context: EventNotificationContext;
  readonly executeAction: ActionExecutor["execute"];
  readonly userId?: string;
}): void {
  useEffect(() => {
    if (!isE2eTestHooksEnabled()) {
      return;
    }

    window.__APZHUB_E2E__ = {
      ...window.__APZHUB_E2E__,
      executeWorkbenchAction: (actionId, args) =>
        options.executeAction(actionId, {
          actor: "user",
          userId: options.userId,
          args,
        }),
      getUnreadCount: () => options.context.notificationService.getUnreadCount(),
    };

    return () => {
      if (!window.__APZHUB_E2E__) {
        return;
      }

      const {
        executeWorkbenchAction: _executeWorkbenchAction,
        getUnreadCount: _getUnreadCount,
        ...rest
      } = window.__APZHUB_E2E__;
      window.__APZHUB_E2E__ =
        Object.keys(rest).length > 0 ? (rest as ApzhubE2eTestHooks) : undefined;
    };
  }, [options.context, options.executeAction, options.userId]);
}
