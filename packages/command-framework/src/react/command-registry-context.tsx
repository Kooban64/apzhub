import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { ActionExecutor } from "../executor";
import { createPlaceholderActionExecutor } from "../executor";
import {
  createCommandRegistryFromDto,
  type ClientActionRegistryDiagnostics,
  type ReadOnlyActionRegistry,
} from "../client";
import type { ActionRegistrationIssue } from "../registry/action-batch-registration";
import type { ActionRegistryDto } from "../server/map-action-registry-dto";
import type {
  ShortcutConflict,
  ShortcutRegistry,
  ShortcutRegistryDiagnostics,
} from "../shortcuts";

export interface CommandRegistryContextValue {
  readonly registry: ReadOnlyActionRegistry;
  readonly toolbar: ActionRegistryDto["toolbar"];
  readonly shortcuts: ShortcutRegistry;
  readonly executor: ActionExecutor;
  readonly isReady: boolean;
  readonly diagnostics: ClientActionRegistryDiagnostics;
  readonly shortcutDiagnostics: ShortcutRegistryDiagnostics;
  readonly shortcutConflicts: readonly ShortcutConflict[];
  readonly importErrors: readonly ActionRegistrationIssue[];
}

const CommandRegistryContext = createContext<CommandRegistryContextValue | null>(null);

export interface CommandRegistryProviderProps {
  /** Permission-filtered server DTO — authoritative registry snapshot. */
  readonly dto: ActionRegistryDto;
  /** Action executor — defaults to placeholder until app wiring (AF-020). */
  readonly executor?: ActionExecutor;
  readonly children: ReactNode;
}

/**
 * Hydrates a read-only client registry from the server DTO and provides executor DI.
 *
 * Current model: one-way hydration (server → client). See `client/synchronisation.ts`
 * for future synchronisation extension points.
 */
export function CommandRegistryProvider({
  dto,
  executor = createPlaceholderActionExecutor(),
  children,
}: CommandRegistryProviderProps) {
  const value = useMemo<CommandRegistryContextValue>(() => {
    const hydration = createCommandRegistryFromDto(dto);

    return {
      registry: hydration.registry,
      toolbar: hydration.dto.toolbar,
      shortcuts: hydration.shortcuts.registry,
      executor,
      isReady: hydration.ok,
      diagnostics: hydration.diagnostics,
      shortcutDiagnostics: hydration.shortcuts.diagnostics,
      shortcutConflicts: hydration.shortcuts.conflicts,
      importErrors: hydration.errors,
    };
  }, [dto, executor]);

  return (
    <CommandRegistryContext.Provider value={value}>
      {children}
    </CommandRegistryContext.Provider>
  );
}

export function useCommandRegistryContext(): CommandRegistryContextValue {
  const context = useContext(CommandRegistryContext);

  if (!context) {
    throw new Error("useCommandRegistry must be used within CommandRegistryProvider");
  }

  return context;
}
