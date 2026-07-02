import type { ContextMenuDiagnostics } from "@apzhub/ui";
import type { ClientActionRegistryDiagnostics } from "@apzhub/command-framework/react";

export interface ContextMenuSurfaceDiagnostics extends ContextMenuDiagnostics {
  readonly surface: "context-menu";
}

export function buildContextMenuDiagnostics(input: {
  readonly open: boolean;
  readonly visibleActionCount: number;
  readonly menuSurface?: string;
  readonly selectionMode?: "none" | "single" | "multi";
  readonly contextTypeCount: number;
  readonly registryDiagnostics: ClientActionRegistryDiagnostics;
  readonly executionCount: number;
  readonly lastExecutedActionId?: string;
  readonly lastExecutionOk?: boolean;
}): ContextMenuSurfaceDiagnostics {
  return {
    surface: "context-menu",
    open: input.open,
    visibleActionCount: input.visibleActionCount,
    menuSurface: input.menuSurface,
    selectionMode: input.selectionMode,
    contextTypeCount: input.contextTypeCount,
    registryReady:
      input.registryDiagnostics.status === "hydrated" ||
      input.registryDiagnostics.status === "empty",
    registryActionCount: input.registryDiagnostics.actionCount,
    executionCount: input.executionCount,
    lastExecutedActionId: input.lastExecutedActionId,
    lastExecutionOk: input.lastExecutionOk,
  };
}
