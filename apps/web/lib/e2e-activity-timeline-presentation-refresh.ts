"use client";

import { useEffect } from "react";

import {
  isE2eTestHooksEnabled,
  type ApzhubE2eTestHooks,
} from "./e2e-event-notification-hooks";

/** E2E-only callback to re-read Activity Service into Timeline Experiences after store mutations. */
export function useE2eActivityTimelinePresentationRefresh(options: {
  readonly onRefresh: () => void;
}): void {
  useEffect(() => {
    if (!isE2eTestHooksEnabled()) {
      return;
    }

    window.__APZHUB_E2E__ = {
      ...window.__APZHUB_E2E__,
      refreshActivityTimelinePresentation: () => {
        options.onRefresh();
      },
    };

    return () => {
      if (!window.__APZHUB_E2E__) {
        return;
      }

      const {
        refreshActivityTimelinePresentation: _refreshActivityTimelinePresentation,
        ...rest
      } = window.__APZHUB_E2E__;
      window.__APZHUB_E2E__ =
        Object.keys(rest).length > 0 ? (rest as ApzhubE2eTestHooks) : undefined;
    };
  }, [options.onRefresh]);
}
