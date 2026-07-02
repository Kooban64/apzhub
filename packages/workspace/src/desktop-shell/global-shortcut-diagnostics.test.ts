import { describe, expect, it } from "vitest";

import { buildGlobalShortcutShellDiagnostics } from "./global-shortcut-diagnostics";

describe("buildGlobalShortcutShellDiagnostics", () => {
  it("reports shortcut surface metadata", () => {
    const diagnostics = buildGlobalShortcutShellDiagnostics({
      shortcutDiagnostics: {
        status: "ready",
        registrationCount: 2,
        uniqueChordCount: 2,
        conflictCount: 0,
        conflictChords: [],
      },
      executionCount: 1,
      lastExecutedActionId: "platform.theme.toggle",
      lastExecutionOk: true,
    });

    expect(diagnostics).toEqual({
      surface: "keyboard-shortcut",
      registryReady: true,
      registrationCount: 2,
      conflictCount: 0,
      executionCount: 1,
      lastExecutedActionId: "platform.theme.toggle",
      lastExecutionOk: true,
    });
  });
});
