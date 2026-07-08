"use client";

import { useCallback, useState } from "react";

export interface ContextPanelState {
  readonly open: boolean;
  readonly activeTab: "activity";
}

export interface UseContextPanelStateOptions {
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly activeTab?: ContextPanelState["activeTab"];
}

export function useContextPanelState(options: UseContextPanelStateOptions = {}) {
  const [internalOpen, setInternalOpen] = useState(options.open ?? true);
  const open = options.open ?? internalOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (options.onOpenChange) {
        options.onOpenChange(nextOpen);
      } else {
        setInternalOpen(nextOpen);
      }
    },
    [options.onOpenChange],
  );

  const togglePanel = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  return {
    open,
    setOpen,
    togglePanel,
    activeTab: options.activeTab ?? ("activity" as const),
  };
}

export type UseContextPanelStateResult = ReturnType<typeof useContextPanelState>;
