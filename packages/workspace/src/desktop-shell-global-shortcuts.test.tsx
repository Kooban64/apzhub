import "@testing-library/jest-dom/vitest";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommandRegistryProvider } from "@apzhub/command-framework/react";
import { ThemeProvider } from "@apzhub/theme";

import { DesktopShell } from "./desktop-shell";

const sampleDto = {
  actions: [
    {
      id: "workbench.navigation.reveal",
      label: "Reveal Navigation",
      handler: "workbench-bridge:workbench.navigation.reveal",
      handlerKind: "workbench-bridge" as const,
      source: "builtin" as const,
      shortcut: "Ctrl+Shift+N",
      palette: true,
    },
  ],
  toolbar: [],
};

describe("DesktopShell global shortcuts", () => {
  it("executes registered shortcuts through the Action Framework executor", async () => {
    vi.stubGlobal("navigator", { userAgent: "Windows NT 10.0" });
    const execute = vi.fn().mockResolvedValue({
      ok: true,
      code: "SUCCESS",
      actionId: "workbench.navigation.reveal",
      actor: "user",
      durationMs: 1,
    });
    const onShortcutExecuted = vi.fn();
    const executor = {
      execute,
      executeSync: vi.fn(),
      getDiagnostics: () => ({ status: "ready" as const, executionCount: 0 }),
    };

    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={sampleDto} executor={executor}>
          <DesktopShell
            enableGlobalShortcuts
            onShortcutExecuted={onShortcutExecuted}
            activityBarItems={[]}
            sidebarItems={[]}
          >
            <p>Workspace</p>
          </DesktopShell>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    const event = new KeyboardEvent("keydown", {
      key: "N",
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefault = vi.spyOn(event, "preventDefault");

    window.dispatchEvent(event);

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("workbench.navigation.reveal", {
        actor: "user",
        args: undefined,
      });
    });
    expect(onShortcutExecuted).toHaveBeenCalledWith("workbench.navigation.reveal");
    expect(preventDefault).toHaveBeenCalled();
  });

  it("still opens the palette on Ctrl+Shift+P when both surfaces are enabled", async () => {
    vi.stubGlobal("navigator", { userAgent: "Windows NT 10.0" });

    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={sampleDto}>
          <DesktopShell
            enableCommandPalette
            enableGlobalShortcuts
            activityBarItems={[]}
            sidebarItems={[]}
          >
            <p>Workspace</p>
          </DesktopShell>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "P",
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );

    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="command-palette"]'),
      ).toBeInTheDocument();
    });
  });
});
