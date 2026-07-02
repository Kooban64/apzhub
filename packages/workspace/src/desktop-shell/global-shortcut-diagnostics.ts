import type { ShortcutRegistryDiagnostics } from "@apzhub/command-framework";

export const GLOBAL_SHORTCUT_SURFACE = "keyboard-shortcut" as const;

export interface GlobalShortcutShellDiagnostics {
  readonly surface: typeof GLOBAL_SHORTCUT_SURFACE;
  readonly registryReady: boolean;
  readonly registrationCount: number;
  readonly conflictCount: number;
  readonly executionCount: number;
  readonly lastExecutedActionId?: string;
  readonly lastExecutionOk?: boolean;
}

export function buildGlobalShortcutShellDiagnostics(input: {
  readonly shortcutDiagnostics: ShortcutRegistryDiagnostics;
  readonly executionCount: number;
  readonly lastExecutedActionId?: string;
  readonly lastExecutionOk?: boolean;
}): GlobalShortcutShellDiagnostics {
  return {
    surface: GLOBAL_SHORTCUT_SURFACE,
    registryReady: input.shortcutDiagnostics.status === "ready",
    registrationCount: input.shortcutDiagnostics.registrationCount,
    conflictCount: input.shortcutDiagnostics.conflictCount,
    executionCount: input.executionCount,
    lastExecutedActionId: input.lastExecutedActionId,
    lastExecutionOk: input.lastExecutionOk,
  };
}
