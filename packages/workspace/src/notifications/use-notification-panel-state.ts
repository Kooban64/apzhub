import { useCallback, useState } from "react";

export interface NotificationPanelState {
  readonly open: boolean;
  readonly openPanel: () => void;
  readonly closePanel: () => void;
  readonly togglePanel: () => void;
  readonly onOpenChange: (open: boolean) => void;
}

export interface UseNotificationPanelStateOptions {
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}

export function useNotificationPanelState(
  options: UseNotificationPanelStateOptions = {},
): NotificationPanelState {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = options.open ?? uncontrolledOpen;

  const onOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (options.open === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      options.onOpenChange?.(nextOpen);
    },
    [options.onOpenChange, options.open],
  );

  const openPanel = useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);

  const closePanel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const togglePanel = useCallback(() => {
    onOpenChange(!open);
  }, [onOpenChange, open]);

  return {
    open,
    openPanel,
    closePanel,
    togglePanel,
    onOpenChange,
  };
}
