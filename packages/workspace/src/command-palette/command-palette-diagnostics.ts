import type { CommandPaletteDiagnostics } from "@apzhub/ui";
import type { ClientActionRegistryDiagnostics } from "@apzhub/command-framework/react";

export interface CommandPaletteSurfaceDiagnostics extends CommandPaletteDiagnostics {
  readonly surface: "command-palette";
}

export function buildCommandPaletteDiagnostics(input: {
  readonly open: boolean;
  readonly query: string;
  readonly selectedIndex: number;
  readonly visibleCommandCount: number;
  readonly registryDiagnostics: ClientActionRegistryDiagnostics;
  readonly executionCount: number;
  readonly lastExecutionAt?: string;
  readonly lastExecutionOk?: boolean;
  readonly lastSelectedId?: string;
}): CommandPaletteSurfaceDiagnostics {
  return {
    surface: "command-palette",
    open: input.open,
    query: input.query,
    selectedIndex: input.selectedIndex,
    visibleCommandCount: input.visibleCommandCount,
    registryReady:
      input.registryDiagnostics.status === "hydrated" ||
      input.registryDiagnostics.status === "empty",
    registryActionCount: input.registryDiagnostics.actionCount,
    executionCount: input.executionCount,
    lastExecutionAt: input.lastExecutionAt,
    lastExecutionOk: input.lastExecutionOk,
    lastSelectedId: input.lastSelectedId,
  };
}
