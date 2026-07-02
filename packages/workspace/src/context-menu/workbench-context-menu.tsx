"use client";

import type {
  ActionContextSnapshot,
  ActionSelectionSnapshot,
} from "@apzhub/command-framework";
import { useCommandRegistry } from "@apzhub/command-framework/react";
import { ContextMenu } from "@apzhub/ui";
import { useCallback, useMemo, useRef, useState } from "react";

import { buildContextMenuDiagnostics } from "./context-menu-diagnostics";
import { useContextMenuProvider } from "./context-menu-provider";
import { mapActionsToContextMenuItems } from "./map-context-menu-items";

export interface WorkbenchContextMenuProps {
  readonly menuSurface?: string;
  readonly selection?: ActionSelectionSnapshot;
  readonly context?: ActionContextSnapshot;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
  readonly onExecuted?: (actionId: string) => void;
}

/**
 * Workbench Surface: Context Menu.
 *
 * Consumes the read-only registry from `useCommandRegistry()` — presentation and
 * invocation only; context filtering (AF-016).
 */
export function WorkbenchContextMenu({
  menuSurface = "workspace",
  selection,
  context,
  emptyTitle = "No actions available",
  emptyDescription,
  onExecuted,
}: WorkbenchContextMenuProps) {
  const { state, close } = useContextMenuProvider();
  const { list, execute, isReady, diagnostics } = useCommandRegistry();
  const executionCountRef = useRef(0);
  const [executionCount, setExecutionCount] = useState(0);
  const [lastExecutedActionId, setLastExecutedActionId] = useState<
    string | undefined
  >();
  const [lastExecutionOk, setLastExecutionOk] = useState<boolean | undefined>();

  const filteredActions = useMemo(
    () => list({ surface: menuSurface, selection, context }),
    [context, list, menuSurface, selection],
  );

  const items = useMemo(
    () => mapActionsToContextMenuItems(filteredActions),
    [filteredActions],
  );

  const handleSelect = useCallback(
    async (actionId: string) => {
      const result = await execute(actionId);
      executionCountRef.current += 1;
      setExecutionCount(executionCountRef.current);
      setLastExecutedActionId(actionId);
      setLastExecutionOk(result.ok);
      onExecuted?.(actionId);
      close();
    },
    [close, execute, onExecuted],
  );

  const menuDiagnostics = useMemo(
    () =>
      buildContextMenuDiagnostics({
        open: state.open,
        visibleActionCount: items.length,
        menuSurface,
        selectionMode: selection?.mode,
        contextTypeCount: context?.contextTypes?.length ?? 0,
        registryDiagnostics: diagnostics,
        executionCount,
        lastExecutedActionId,
        lastExecutionOk,
      }),
    [
      context?.contextTypes?.length,
      diagnostics,
      executionCount,
      items.length,
      lastExecutedActionId,
      lastExecutionOk,
      menuSurface,
      selection?.mode,
      state.open,
    ],
  );

  if (!state.open || !state.anchor) {
    return null;
  }

  return (
    <>
      <span
        hidden
        data-testid="context-menu-diagnostics"
        data-open={menuDiagnostics.open ? "true" : "false"}
        data-visible-count={menuDiagnostics.visibleActionCount}
        data-surface={menuDiagnostics.surface}
      />
      <ContextMenu
        open={state.open}
        x={state.anchor.x}
        y={state.anchor.y}
        items={items}
        onSelect={handleSelect}
        onClose={close}
        emptyState={{
          title: isReady ? emptyTitle : "Loading actions…",
          description: emptyDescription,
        }}
        title="Context Menu"
      />
    </>
  );
}
