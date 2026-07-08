"use client";

import { searchActionDescriptors } from "@apzhub/command-framework";
import {
  CommandPalette,
  type CommandPaletteEmptyState,
  type CommandPaletteLoadingState,
} from "@apzhub/ui";
import { useCommandRegistry } from "@apzhub/command-framework/react";
import { useCallback, useMemo, useRef, useState } from "react";

import {
  delegateKnowledgeOverlaySelection,
  type WorkbenchKnowledgeSelectionHandlers,
} from "../knowledge-overlay/knowledge-overlay-selection";
import { buildCommandPaletteDiagnostics } from "./command-palette-diagnostics";
import type { CommandPaletteMode } from "./command-palette-mode";
import {
  countKnowledgePaletteItems,
  mapKnowledgeGroupsToPaletteItems,
} from "./map-knowledge-groups-to-palette-items";
import { mapActionsToPaletteItems } from "./map-palette-items";
import {
  COMMAND_PALETTE_QUERY_DEBOUNCE_MS,
  useDebouncedValue,
} from "./use-debounced-value";
import { useCommandPaletteKnowledgeQuery } from "./use-command-palette-knowledge-query";
import {
  useCommandPaletteState,
  type CommandPaletteState,
  type UseCommandPaletteStateOptions,
} from "./use-command-palette-state";

export interface WorkbenchCommandPaletteProps extends UseCommandPaletteStateOptions {
  readonly mode?: CommandPaletteMode;
  /** Required in knowledge mode — selection delegates to Action Framework / Workbench. */
  readonly knowledgeSelectionHandlers?: WorkbenchKnowledgeSelectionHandlers;
  readonly onExecuted?: (commandId: string) => void;
  readonly onKnowledgeDocumentSelected?: (documentId: string) => void;
  /** Optional palette action ids rendered in a pinned section (commands mode only). */
  readonly pinnedActionIds?: readonly string[];
  readonly emptyState?: CommandPaletteEmptyState;
  readonly loadingState?: CommandPaletteLoadingState;
  readonly knowledgeEmptyState?: CommandPaletteEmptyState;
  readonly knowledgeLoadingState?: CommandPaletteLoadingState;
  readonly title?: string;
}

type SharedPaletteViewProps = {
  readonly paletteState: CommandPaletteState;
  readonly debouncedQuery: string;
  readonly title?: string;
};

/**
 * Workbench Surface: Command Palette.
 *
 * Commands mode consumes `useCommandRegistry()` — fuzzy search over registry actions.
 * Knowledge mode consumes `useKnowledgeQuery()` — grouped documents without duplicating the registry list.
 */
export function WorkbenchCommandPalette({
  mode = "commands",
  ...props
}: WorkbenchCommandPaletteProps) {
  const paletteState = useCommandPaletteState(props);
  const debouncedQuery = useDebouncedValue(
    paletteState.query,
    COMMAND_PALETTE_QUERY_DEBOUNCE_MS,
  );

  if (mode === "knowledge") {
    return (
      <WorkbenchCommandPaletteKnowledgeView
        paletteState={paletteState}
        debouncedQuery={debouncedQuery}
        {...props}
      />
    );
  }

  return (
    <WorkbenchCommandPaletteCommandsView
      paletteState={paletteState}
      debouncedQuery={debouncedQuery}
      {...props}
    />
  );
}

function WorkbenchCommandPaletteCommandsView({
  paletteState,
  debouncedQuery,
  onExecuted,
  pinnedActionIds,
  emptyState,
  loadingState,
  title,
}: WorkbenchCommandPaletteProps & SharedPaletteViewProps) {
  const {
    isReady,
    list,
    execute,
    diagnostics: registryDiagnostics,
  } = useCommandRegistry();
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

  const filteredActions = useMemo(
    () => searchActionDescriptors(list(), debouncedQuery),
    [list, debouncedQuery],
  );
  const commands = useMemo(
    () => mapActionsToPaletteItems(filteredActions, { pinnedActionIds }),
    [filteredActions, pinnedActionIds],
  );

  const handleSelect = useCallback(
    async (itemId: string) => {
      setLastSelectedId(itemId);
      const result = await execute(itemId);
      executionCountRef.current += 1;
      setExecutionCount(executionCountRef.current);
      setLastExecutionAt(new Date().toISOString());
      setLastExecutionOk(result.ok);
      setExecutionFeedback({
        ok: result.ok,
        code: result.code,
        actionId: result.actionId,
      });
      onExecuted?.(itemId);
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
        mode: "commands",
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
      title={title ?? "Command Palette"}
    />
  );
}

function WorkbenchCommandPaletteKnowledgeView({
  paletteState,
  debouncedQuery,
  knowledgeSelectionHandlers,
  onKnowledgeDocumentSelected,
  knowledgeEmptyState,
  knowledgeLoadingState,
  title,
}: WorkbenchCommandPaletteProps & SharedPaletteViewProps) {
  const { diagnostics: registryDiagnostics } = useCommandRegistry();
  const knowledgeQuery = useCommandPaletteKnowledgeQuery({
    enabled: paletteState.open,
    query: debouncedQuery,
  });
  const [lastSelectedDocumentId, setLastSelectedDocumentId] = useState<
    string | undefined
  >();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = useMemo(
    () => mapKnowledgeGroupsToPaletteItems(knowledgeQuery.groups),
    [knowledgeQuery.groups],
  );

  const resolvedEmptyState = useMemo((): CommandPaletteEmptyState | undefined => {
    if (knowledgeQuery.status === "error") {
      return {
        title: "Knowledge query failed",
        description: knowledgeQuery.errorMessage,
      };
    }

    return (
      knowledgeEmptyState ?? {
        title: "No knowledge results",
        description: "Try a different search term.",
      }
    );
  }, [knowledgeQuery.status, knowledgeQuery.errorMessage, knowledgeEmptyState]);

  const resolvedLoadingState = knowledgeLoadingState ?? {
    message: "Searching knowledge…",
    description: "Querying registered knowledge sources.",
  };

  const handleSelect = useCallback(
    async (itemId: string) => {
      if (!knowledgeSelectionHandlers) {
        return;
      }

      const document = knowledgeQuery.documentById.get(itemId);
      if (!document) {
        return;
      }

      setLastSelectedDocumentId(itemId);
      await delegateKnowledgeOverlaySelection(document, knowledgeSelectionHandlers);
      onKnowledgeDocumentSelected?.(itemId);
      paletteState.onOpenChange(false);
    },
    [
      knowledgeSelectionHandlers,
      knowledgeQuery.documentById,
      onKnowledgeDocumentSelected,
      paletteState,
    ],
  );

  const diagnostics = useMemo(
    () =>
      buildCommandPaletteDiagnostics({
        open: paletteState.open,
        query: debouncedQuery,
        selectedIndex,
        visibleCommandCount: commands.length,
        registryDiagnostics,
        executionCount: 0,
        mode: "knowledge",
        knowledgeQueryStatus: knowledgeQuery.status,
        knowledgeDocumentCount: countKnowledgePaletteItems(knowledgeQuery.groups),
        knowledgeGroupCount: knowledgeQuery.groups.length,
        lastSelectedDocumentId,
        knowledgeQueryDiagnostics: knowledgeQuery.queryDiagnostics,
      }),
    [
      paletteState.open,
      debouncedQuery,
      selectedIndex,
      commands.length,
      registryDiagnostics,
      knowledgeQuery.status,
      knowledgeQuery.groups,
      lastSelectedDocumentId,
      knowledgeQuery.queryDiagnostics,
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
      isReady={knowledgeQuery.isRegistryReady && knowledgeQuery.status !== "loading"}
      executionFeedback={null}
      diagnostics={diagnostics}
      onSelectedIndexChange={setSelectedIndex}
      emptyState={resolvedEmptyState}
      loadingState={resolvedLoadingState}
      title={title ?? "Knowledge"}
    />
  );
}
