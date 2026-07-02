"use client";

import { filterToolbarRegionItems } from "@apzhub/command-framework";
import {
  useCommandRegistry,
  useCommandRegistryContext,
} from "@apzhub/command-framework/react";
import { Toolbar } from "@apzhub/ui";
import { useCallback, useMemo, useRef, useState } from "react";

import { buildToolbarDiagnostics } from "./toolbar-diagnostics";
import { mapToolbarItems } from "./map-toolbar-items";
import { useToolbarProvider } from "./toolbar-provider";

export interface WorkbenchToolbarProps {
  readonly region?: string;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
  readonly onExecuted?: (actionId: string) => void;
}

/**
 * Workbench Surface: Toolbar.
 *
 * Consumes toolbar regions from the hydrated DTO and resolves actions via the
 * read-only registry — presentation and invocation only (AF-017).
 */
export function WorkbenchToolbar({
  region: regionProp,
  emptyTitle = "No toolbar actions",
  emptyDescription,
  onExecuted,
}: WorkbenchToolbarProps) {
  const { region: providerRegion } = useToolbarProvider();
  const region = regionProp ?? providerRegion;
  const { registry } = useCommandRegistryContext();
  const { toolbar, execute, isReady, diagnostics } = useCommandRegistry();
  const executionCountRef = useRef(0);
  const [executionCount, setExecutionCount] = useState(0);
  const [lastExecutedActionId, setLastExecutedActionId] = useState<
    string | undefined
  >();
  const [lastExecutionOk, setLastExecutionOk] = useState<boolean | undefined>();

  const regionItems = useMemo(
    () => filterToolbarRegionItems(toolbar, region),
    [region, toolbar],
  );

  const items = useMemo(
    () => mapToolbarItems(regionItems, registry),
    [regionItems, registry],
  );

  const handleSelect = useCallback(
    async (actionId: string) => {
      const result = await execute(actionId);
      executionCountRef.current += 1;
      setExecutionCount(executionCountRef.current);
      setLastExecutedActionId(actionId);
      setLastExecutionOk(result.ok);
      onExecuted?.(actionId);
    },
    [execute, onExecuted],
  );

  const toolbarDiagnostics = useMemo(
    () =>
      buildToolbarDiagnostics({
        region,
        visibleActionCount: items.length,
        registryDiagnostics: diagnostics,
        executionCount,
        lastExecutedActionId,
        lastExecutionOk,
      }),
    [
      diagnostics,
      executionCount,
      items.length,
      lastExecutedActionId,
      lastExecutionOk,
      region,
    ],
  );

  return (
    <>
      <span
        hidden
        data-testid="toolbar-diagnostics"
        data-surface={toolbarDiagnostics.surface}
        data-region={toolbarDiagnostics.region}
        data-visible-count={toolbarDiagnostics.visibleActionCount}
      />
      <Toolbar
        items={items}
        onSelect={handleSelect}
        ariaLabel={`${region} toolbar`}
        emptyState={{
          title: isReady ? emptyTitle : "Loading actions…",
          description: emptyDescription,
        }}
      />
    </>
  );
}
