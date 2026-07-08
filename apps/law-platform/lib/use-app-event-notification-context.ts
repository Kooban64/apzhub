"use client";

import { useMemo } from "react";

import type { EventNotificationContext } from "@apzhub/event-notification-framework";

import { createAppEventNotificationContext } from "./create-app-event-notification-context";

/** Client session EventNotificationContext — shared by audit hook and notification providers. */
export function useAppEventNotificationContext(): EventNotificationContext {
  return useMemo(() => createAppEventNotificationContext(), []);
}
