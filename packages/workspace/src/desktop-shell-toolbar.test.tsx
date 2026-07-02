import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
      id: "record.save",
      label: "Save Record",
      handler: "service:record:save",
      handlerKind: "service" as const,
      source: "manifest" as const,
    },
  ],
  toolbar: [
    {
      region: "workspace",
      items: [{ commandId: "record.save", label: "Save" }],
    },
  ],
} satisfies ActionRegistryDto;

describe("DesktopShell toolbar", () => {
  it("renders workspace toolbar and executes action on click", async () => {
    const user = userEvent.setup();
    const execute = vi.fn().mockResolvedValue({
      ok: true,
      code: "SUCCESS",
      actionId: "record.save",
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
          <DesktopShell enableToolbar activityBarItems={[]} sidebarItems={[]}>
            <p>Workspace content</p>
          </DesktopShell>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("toolbar", { name: "workspace toolbar" }),
    ).toBeInTheDocument();
    await user.click(screen.getByTitle("Save"));

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("record.save", {
        actor: "user",
        args: undefined,
      });
    });
  });
});
