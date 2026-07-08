import { useCallback, useMemo, useState } from "react";

export interface KnowledgeOverlayState {
  readonly open: boolean;
}

export interface UseKnowledgeOverlayStateOptions {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}

export interface UseKnowledgeOverlayStateResult extends KnowledgeOverlayState {
  readonly onOpenChange: (open: boolean) => void;
  readonly openOverlay: () => void;
  readonly closeOverlay: () => void;
}

export function useKnowledgeOverlayState(
  options: UseKnowledgeOverlayStateOptions = {},
): UseKnowledgeOverlayStateResult {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    options.defaultOpen ?? false,
  );
  const isControlled = options.open !== undefined;
  const open = isControlled ? options.open : uncontrolledOpen;

  const onOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      options.onOpenChange?.(nextOpen);
    },
    [isControlled, options.onOpenChange],
  );

  return useMemo(
    () => ({
      open,
      onOpenChange,
      openOverlay: () => onOpenChange(true),
      closeOverlay: () => onOpenChange(false),
    }),
    [open, onOpenChange],
  );
}
