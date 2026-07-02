import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  CommandRegistryProvider,
  type ActionRegistryDto,
} from "@apzhub/command-framework/react";
import { ThemeProvider } from "@apzhub/theme";

import { DesktopShell } from "./desktop-shell";

const sampleDto = {
  actions: [
    {
      id: "record.edit",
      label: "Edit Record",
      handler: "service:record:edit",
      handlerKind: "service" as const,
      source: "manifest" as const,
      contextWhen: {
        surfaces: ["workspace"],
        selectionKinds: ["single"] as const,
      },
    },
  ],
  toolbar: [],
} satisfies ActionRegistryDto;

describe("DesktopShell context menu", () => {
  it("opens context menu on right click and executes action", async () => {
    const user = userEvent.setup();
    const execute = vi.fn().mockResolvedValue({
      ok: true,
      code: "SUCCESS",
      actionId: "record.edit",
      actor: "user",
      durationMs: 1,
    });

    render(
      <ThemeProvider>
        <CommandRegistryProvider
          dto={sampleDto}
          executor={{
            execute,
            executeSync: vi.fn(),
            getDiagnostics: () => ({ status: "ready" as const, executionCount: 0 }),
          }}
        >
          <DesktopShell
            enableContextMenu
            contextMenuInput={{ selectionMode: "single" }}
            activityBarItems={[]}
            sidebarItems={[]}
          >
            <p>Workspace content</p>
          </DesktopShell>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    fireEvent.contextMenu(screen.getByTestId("context-menu-target"));

    await waitFor(() => {
      expect(screen.getByRole("menu", { name: "Context Menu" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("menuitem", { name: /Edit Record/i }));

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("record.edit", {
        actor: "user",
        args: undefined,
      });
    });
  });
});
