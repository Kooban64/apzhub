"use client";

import { searchActionDescriptors } from "@apzhub/command-framework";
import {
  CommandPalette,
  type CommandPaletteEmptyState,
  type CommandPaletteLoadingState,
} from "@apzhub/ui";
import { useCommandRegistry } from "@apzhub/command-framework/react";
import { useCallback, useMemo, useRef, useState } from "react";

import { buildCommandPaletteDiagnostics } from "./command-palette-diagnostics";
import { mapActionsToPaletteItems } from "./map-palette-items";
import {
  COMMAND_PALETTE_QUERY_DEBOUNCE_MS,
  useDebouncedValue,
} from "./use-debounced-value";
import {
  useCommandPaletteState,
  type UseCommandPaletteStateOptions,
} from "./use-command-palette-state";

export interface WorkbenchCommandPaletteProps extends UseCommandPaletteStateOptions {
  readonly onExecuted?: (commandId: string) => void;
  /** Optional palette action ids rendered in a pinned section (presentation only). */
  readonly pinnedActionIds?: readonly string[];
  readonly emptyState?: CommandPaletteEmptyState;
  readonly loadingState?: CommandPaletteLoadingState;
}

/**
 * Workbench Surface: Command Palette.
 *
 * Consumes the read-only registry from `useCommandRegistry()` — presentation and
 * invocation only; fuzzy search and debounced filtering (AF-012).
 */
export function WorkbenchCommandPalette({
  onExecuted,
  pinnedActionIds,
  emptyState,
  loadingState,
  ...paletteStateOptions
}: WorkbenchCommandPaletteProps) {
  const {
    isReady,
    list,
    execute,
    diagnostics: registryDiagnostics,
  } = useCommandRegistry();
  const paletteState = useCommandPaletteState(paletteStateOptions);
  const debouncedQuery = useDebouncedValue(
    paletteState.query,
    COMMAND_PALETTE_QUERY_DEBOUNCE_MS,
  );
  const [executionFeedback, setExecutionFeedback] = useState<{
    ok: boolean;
    code: string;
    actionId: string;
  } | null>(null);
  const executionCountRef = useRef(0);
  const [executionCount, setExecutionCount] = useState(0);
  const [lastExecutionAt, setLastExecutionAt] = useState<string | undefined>();
  const [lastExecutionOk, setLastExecutionOk] = useState<boolean | undefined>();
  const [lastSelectedId, setLastSelectedId] = useState<string | undefined>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allActions = useMemo(() => list(), [list]);

  const filteredActions = useMemo(
    () => searchActionDescriptors(allActions, debouncedQuery),
    [allActions, debouncedQuery],
  );

  const commands = useMemo(
    () => mapActionsToPaletteItems(filteredActions, { pinnedActionIds }),
    [filteredActions, pinnedActionIds],
  );

  const handleSelect = useCallback(
    async (commandId: string) => {
      setLastSelectedId(commandId);
      const result = await execute(commandId);
      executionCountRef.current += 1;
      setExecutionCount(executionCountRef.current);
      setLastExecutionAt(new Date().toISOString());
      setLastExecutionOk(result.ok);
      setExecutionFeedback({
        ok: result.ok,
        code: result.code,
        actionId: result.actionId,
      });
      onExecuted?.(commandId);
      paletteState.onOpenChange(false);
    },
    [execute, onExecuted, paletteState],
  );

  const diagnostics = useMemo(
    () =>
      buildCommandPaletteDiagnostics({
        open: paletteState.open,
        query: debouncedQuery,
        selectedIndex,
        visibleCommandCount: commands.length,
        registryDiagnostics,
        executionCount,
        lastExecutionAt,
        lastExecutionOk,
        lastSelectedId,
      }),
    [
      paletteState.open,
      debouncedQuery,
      selectedIndex,
      commands.length,
      registryDiagnostics,
      executionCount,
      lastExecutionAt,
      lastExecutionOk,
      lastSelectedId,
    ],
  );

  return (
    <CommandPalette
      open={paletteState.open}
      onOpenChange={paletteState.onOpenChange}
      commands={commands}
      onSelect={handleSelect}
      query={paletteState.query}
      onQueryChange={paletteState.onQueryChange}
      isReady={isReady}
      executionFeedback={executionFeedback}
      diagnostics={diagnostics}
      onSelectedIndexChange={setSelectedIndex}
      emptyState={emptyState}
      loadingState={loadingState}
    />
  );
}
