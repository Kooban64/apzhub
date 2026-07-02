import { useCallback, useState } from "react";

export interface CommandPaletteState {
  readonly open: boolean;
  readonly query: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly onQueryChange: (query: string) => void;
  readonly openPalette: () => void;
  readonly closePalette: () => void;
  readonly resetQuery: () => void;
}

export interface UseCommandPaletteStateOptions {
  readonly initialOpen?: boolean;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}

/**
 * Local open/close and query state for the Command Palette surface.
 * Supports controlled and uncontrolled `open` — global shortcut wiring lands in AF-012.
 */
export function useCommandPaletteState(
  options: UseCommandPaletteStateOptions = {},
): CommandPaletteState {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    options.initialOpen ?? false,
  );
  const [query, setQuery] = useState("");

  const open = options.open ?? uncontrolledOpen;

  const onOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (options.open === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      options.onOpenChange?.(nextOpen);
      if (!nextOpen) {
        setQuery("");
      }
    },
    [options],
  );

  const openPalette = useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);

  const closePalette = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const resetQuery = useCallback(() => {
    setQuery("");
  }, []);

  return {
    open,
    query,
    onOpenChange,
    onQueryChange: setQuery,
    openPalette,
    closePalette,
    resetQuery,
  };
}
