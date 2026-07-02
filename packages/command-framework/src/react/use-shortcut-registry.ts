import { useCallback, useMemo } from "react";

import type { ShortcutRegistry } from "../shortcuts";
import { useCommandRegistryContext } from "./command-registry-context";

export interface UseShortcutRegistryResult {
  readonly shortcuts: ShortcutRegistry;
  readonly diagnostics: ReturnType<ShortcutRegistry["getDiagnostics"]>;
  readonly conflicts: ReturnType<ShortcutRegistry["getConflicts"]>;
  readonly resolve: ShortcutRegistry["resolve"];
  readonly lookup: ShortcutRegistry["lookup"];
}

/** Access hydrated shortcut bindings from React context. */
export function useShortcutRegistry(): UseShortcutRegistryResult {
  const { shortcuts, shortcutDiagnostics, shortcutConflicts } =
    useCommandRegistryContext();

  const resolve = useCallback(
    (event: Parameters<ShortcutRegistry["resolve"]>[0]) => shortcuts.resolve(event),
    [shortcuts],
  );

  const lookup = useCallback((chord: string) => shortcuts.lookup(chord), [shortcuts]);

  return useMemo(
    () => ({
      shortcuts,
      diagnostics: shortcutDiagnostics,
      conflicts: shortcutConflicts,
      resolve,
      lookup,
    }),
    [shortcuts, shortcutDiagnostics, shortcutConflicts, resolve, lookup],
  );
}
