"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  createActivityTimelineContextFromDto,
  type ActivityTimelineClientContext,
  type ActivityTimelineHydrationBundle,
} from "../client";

const ActivityTimelineContext = createContext<ActivityTimelineClientContext | null>(
  null,
);

export type ActivityTimelineContextValue = ActivityTimelineClientContext;

export interface ActivityTimelineProviderProps {
  /** Permission-filtered server bundle — metadata registries only. */
  readonly bundle: ActivityTimelineHydrationBundle;
  readonly children: ReactNode;
}

/**
 * Hydrates read-only Activity and Timeline client registries from the server bundle.
 *
 * One-way hydration (server → client). No client-side registration, mapper execution,
 * or ActivityDocument hydration.
 */
export function ActivityTimelineProvider({
  bundle,
  children,
}: ActivityTimelineProviderProps) {
  const value = useMemo<ActivityTimelineClientContext>(
    () => createActivityTimelineContextFromDto(bundle),
    [bundle],
  );

  return (
    <ActivityTimelineContext.Provider value={value}>
      {children}
    </ActivityTimelineContext.Provider>
  );
}

export function useActivityTimelineContext(): ActivityTimelineClientContext {
  const context = useContext(ActivityTimelineContext);

  if (!context) {
    throw new Error(
      "useActivityTimelineContext must be used within ActivityTimelineProvider",
    );
  }

  return context;
}

/** Optional accessor when service provider may render outside metadata hydration. */
export function useOptionalActivityTimelineContext(): ActivityTimelineClientContext | null {
  return useContext(ActivityTimelineContext);
}
