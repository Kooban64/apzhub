import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommandRegistryProvider } from "@apzhub/command-framework/react";
import { ThemeProvider } from "@apzhub/theme";

import { DesktopShell } from "./desktop-shell";

const sampleDto = {
  actions: [
    {
      id: "platform.theme.toggle",
      label: "Toggle Theme",
      handler: "service:theme-service:toggle",
      handlerKind: "service" as const,
      source: "manifest" as const,
      palette: true,
    },
  ],
  toolbar: [],
};

describe("DesktopShell command palette shortcut", () => {
  it("opens the palette on Ctrl+Shift+P", async () => {
    vi.stubGlobal("navigator", { userAgent: "Windows NT 10.0" });

    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={sampleDto}>
          <DesktopShell enableCommandPalette activityBarItems={[]} sidebarItems={[]}>
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
        screen.getByRole("dialog", { name: "Command Palette" }),
      ).toBeInTheDocument();
    });
  });
});
