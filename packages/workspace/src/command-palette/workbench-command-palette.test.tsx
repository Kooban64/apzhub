import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ReactNode } from "react";
import { describe, expect, it, vi, afterEach } from "vitest";

import {
  CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  CommandRegistryProvider,
} from "@apzhub/command-framework/react";
import { ThemeProvider } from "@apzhub/theme";

import { WorkbenchCommandPalette } from "./workbench-command-palette";
import { buildCommandPaletteDiagnostics } from "./command-palette-diagnostics";
import { COMMAND_PALETTE_SURFACE } from "./workbench-surfaces";

const sampleDto = {
  actions: [
    {
      id: "platform.theme.toggle",
      label: "Toggle Theme",
      handler: "service:theme-service:toggle",
      handlerKind: "service" as const,
      source: "manifest" as const,
      palette: true,
      group: "appearance",
    },
    {
      id: "workbench.view.open",
      label: "Open View",
      handler: "workbench-bridge:workbench.view.open",
      handlerKind: "workbench-bridge" as const,
      source: "builtin" as const,
      palette: true,
      group: "View",
    },
  ],
  toolbar: [],
};

function TestProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CommandRegistryProvider dto={sampleDto}>{children}</CommandRegistryProvider>
    </ThemeProvider>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("WorkbenchCommandPalette", () => {
  it("renders palette commands from useCommandRegistry", async () => {
    render(
      <TestProviders>
        <WorkbenchCommandPalette open />
      </TestProviders>,
    );

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Toggle Theme/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("option", { name: /Open View/i })).toBeInTheDocument();
  });

  it("filters commands via debounced fuzzy query", async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <WorkbenchCommandPalette open />
      </TestProviders>,
    );

    const input = await screen.findByRole("combobox", { name: "Filter commands" });
    await user.type(input, "theme");

    await waitFor(
      () => {
        expect(
          screen.getByRole("option", { name: /Toggle Theme/i }),
        ).toBeInTheDocument();
        expect(
          screen.queryByRole("option", { name: /Open View/i }),
        ).not.toBeInTheDocument();
      },
      { timeout: 300 },
    );
  });

  it("executes selected action and closes palette", async () => {
    const user = userEvent.setup();
    const execute = vi.fn().mockResolvedValue({
      ok: true,
      code: "SUCCESS",
      actionId: "platform.theme.toggle",
      actor: "user",
      durationMs: 1,
    });
    const executor = {
      execute,
      executeSync: vi.fn(),
      getDiagnostics: () => ({ status: "ready" as const, executionCount: 0 }),
    };
    const onExecuted = vi.fn();

    function StatefulPalette() {
      const [open, setOpen] = useState(true);
      return (
        <WorkbenchCommandPalette
          open={open}
          onOpenChange={setOpen}
          onExecuted={onExecuted}
        />
      );
    }

    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={sampleDto} executor={executor}>
          <StatefulPalette />
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    await user.click(await screen.findByRole("option", { name: /Toggle Theme/i }));

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("platform.theme.toggle", {
        actor: "user",
        args: undefined,
      });
    });
    expect(onExecuted).toHaveBeenCalledWith("platform.theme.toggle");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("shows empty state for empty registry", async () => {
    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={{ actions: [], toolbar: [] }}>
          <WorkbenchCommandPalette
            open
            emptyState={{
              title: "No commands available",
              description: "Registry returned zero palette actions.",
            }}
          />
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    expect(await screen.findByText("No commands available")).toBeInTheDocument();
    expect(
      screen.getByText("Registry returned zero palette actions."),
    ).toBeInTheDocument();
  });

  it("marks pinnedActionIds in presentation rows", async () => {
    render(
      <TestProviders>
        <WorkbenchCommandPalette open pinnedActionIds={["platform.theme.toggle"]} />
      </TestProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText("Pinned")).toBeInTheDocument();
    });
  });
});

describe("buildCommandPaletteDiagnostics", () => {
  it("reports surface and registry metadata", () => {
    const diagnostics = buildCommandPaletteDiagnostics({
      open: true,
      query: "theme",
      selectedIndex: 0,
      visibleCommandCount: 1,
      registryDiagnostics: {
        status: "hydrated",
        actionCount: 2,
        platformActionCount: 1,
        capabilityActionCount: 1,
        platformActionIds: ["workbench.view.open"],
        capabilityActionIds: ["platform.theme.toggle"],
        toolbarRegionCount: 0,
        source: "server-dto",
        synchronisation: CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
      },
      executionCount: 1,
      lastExecutionOk: true,
      lastSelectedId: "platform.theme.toggle",
    });

    expect(diagnostics.surface).toBe("command-palette");
    expect(diagnostics.registryReady).toBe(true);
    expect(diagnostics.registryActionCount).toBe(2);
    expect(diagnostics.executionCount).toBe(1);
  });
});

describe("COMMAND_PALETTE_SURFACE", () => {
  it("documents command palette as implemented workbench surface", () => {
    expect(COMMAND_PALETTE_SURFACE.status).toBe("implemented");
    expect(COMMAND_PALETTE_SURFACE.consumes).toBe("read-only-action-registry");
  });
});
