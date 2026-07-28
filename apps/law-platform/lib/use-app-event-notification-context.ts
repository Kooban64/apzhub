"use client";

import { useMemo } from "react";

import type { EventNotificationContext } from "@apzhub/event-notification-framework";

import { createAppEventNotificationContext } from "./create-app-event-notification-context";

export interface UseAppEventNotificationContextOptions {
  readonly userId?: string;
  readonly tenantId?: string;
}

/** Client session EventNotificationContext — durable store when user/tenant scoped (OBS-LAW-02). */
export function useAppEventNotificationContext(
  options: UseAppEventNotificationContextOptions = {},
): EventNotificationContext {
  const { userId, tenantId } = options;
  return useMemo(
    () =>
      createAppEventNotificationContext({
        persistenceScope: userId || tenantId ? { userId, tenantId } : undefined,
      }),
    [userId, tenantId],
  );
}
