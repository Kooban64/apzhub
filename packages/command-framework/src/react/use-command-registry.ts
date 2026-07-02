import { useCallback, useMemo } from "react";

import type { ActionRegistryListOptions } from "../registry/action-registry";
import type { ActionDescriptor, ActionResult } from "../types";
import type {
  ShortcutConflict,
  ShortcutRegistry,
  ShortcutRegistryDiagnostics,
} from "../shortcuts";
import type { ClientActionRegistryDiagnostics } from "../client";
import type { ActionRegistryDto } from "../server/map-action-registry-dto";
import { useCommandRegistryContext } from "./command-registry-context";

export interface UseCommandRegistryResult {
  readonly isReady: boolean;
  readonly commands: readonly ActionDescriptor[];
  readonly toolbar: ActionRegistryDto["toolbar"];
  readonly get: (commandId: string) => ActionDescriptor | undefined;
  readonly list: (options?: ActionRegistryListOptions) => readonly ActionDescriptor[];
  readonly execute: (
    commandId: string,
    args?: Record<string, unknown>,
  ) => Promise<ActionResult>;
  readonly diagnostics: ClientActionRegistryDiagnostics;
  readonly shortcuts: ShortcutRegistry;
  readonly shortcutDiagnostics: ShortcutRegistryDiagnostics;
  readonly shortcutConflicts: readonly ShortcutConflict[];
}

/**
 * Access the hydrated read-only command registry and executor from React context.
 *
 * `execute` delegates to the injected {@link ActionExecutor} with actor `user`.
 */
export function useCommandRegistry(): UseCommandRegistryResult {
  const {
    registry,
    toolbar,
    executor,
    isReady,
    diagnostics,
    shortcuts,
    shortcutDiagnostics,
    shortcutConflicts,
  } = useCommandRegistryContext();

  const commands = useMemo(() => registry.list(), [registry]);

  const get = useCallback((commandId: string) => registry.get(commandId), [registry]);

  const list = useCallback(
    (options?: ActionRegistryListOptions) => registry.list(options),
    [registry],
  );

  const execute = useCallback(
    (commandId: string, args?: Record<string, unknown>) =>
      executor.execute(commandId, { actor: "user", args }),
    [executor],
  );

  return {
    isReady,
    commands,
    toolbar,
    get,
    list,
    execute,
    diagnostics,
    shortcuts,
    shortcutDiagnostics,
    shortcutConflicts,
  };
}

/** @deprecated Use {@link useCommandRegistry} */
export const useActionRegistry = useCommandRegistry;
