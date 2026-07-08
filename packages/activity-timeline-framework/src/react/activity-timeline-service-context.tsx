"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  createActivityTimelineService,
  createActivityTimelineServiceFromHydration,
  type ActivityTimelineService,
} from "../client/service";
import { useOptionalActivityTimelineContext } from "./activity-timeline-context";

const ActivityTimelineServiceContext = createContext<ActivityTimelineService | null>(
  null,
);

export interface ActivityTimelineServiceProviderProps {
  /** Public service boundary — preferred injection for tests and server wiring. */
  readonly service?: ActivityTimelineService;
  readonly children: ReactNode;
}

/**
 * Provides the public Activity Timeline Service to descendant experiences.
 *
 * When nested under {@link ActivityTimelineProvider}, auto-wires from hydration context.
 * Metadata hydration remains the responsibility of ActivityTimelineProvider only.
 */
export function ActivityTimelineServiceProvider({
  service,
  children,
}: ActivityTimelineServiceProviderProps) {
  const hydrationContext = useOptionalActivityTimelineContext();

  const resolvedService = useMemo(() => {
    if (service) {
      return service;
    }

    if (hydrationContext) {
      return createActivityTimelineServiceFromHydration({ context: hydrationContext });
    }

    return createActivityTimelineService();
  }, [service, hydrationContext]);

  return (
    <ActivityTimelineServiceContext.Provider value={resolvedService}>
      {children}
    </ActivityTimelineServiceContext.Provider>
  );
}

export function useActivityTimelineServiceContext(): ActivityTimelineService {
  const context = useContext(ActivityTimelineServiceContext);

  if (!context) {
    throw new Error(
      "useActivityService must be used within ActivityTimelineServiceProvider",
    );
  }

  return context;
}
