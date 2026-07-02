import type { ToolbarDiagnostics } from "@apzhub/ui";
import type { ClientActionRegistryDiagnostics } from "@apzhub/command-framework/react";

export interface ToolbarSurfaceDiagnostics extends ToolbarDiagnostics {
  readonly surface: "toolbar";
}

export function buildToolbarDiagnostics(input: {
  readonly region: string;
  readonly visibleActionCount: number;
  readonly registryDiagnostics: ClientActionRegistryDiagnostics;
  readonly executionCount: number;
  readonly lastExecutedActionId?: string;
  readonly lastExecutionOk?: boolean;
}): ToolbarSurfaceDiagnostics {
  return {
    surface: "toolbar",
    region: input.region,
    visibleActionCount: input.visibleActionCount,
    registryReady:
      input.registryDiagnostics.status === "hydrated" ||
      input.registryDiagnostics.status === "empty",
    registryActionCount: input.registryDiagnostics.actionCount,
    executionCount: input.executionCount,
    lastExecutedActionId: input.lastExecutedActionId,
    lastExecutionOk: input.lastExecutionOk,
  };
}
