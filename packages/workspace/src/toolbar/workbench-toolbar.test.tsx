import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  CommandRegistryProvider,
  type ActionRegistryDto,
} from "@apzhub/command-framework/react";
import { ThemeProvider } from "@apzhub/theme";

import { ToolbarProvider, WorkbenchToolbar } from "./index";

const sampleDto = {
  actions: [
    {
      id: "record.save",
      label: "Save Record",
      handler: "service:record:save",
      handlerKind: "service" as const,
      source: "manifest" as const,
      icon: "S",
    },
    {
      id: "record.export",
      label: "Export Record",
      handler: "service:record:export",
      handlerKind: "service" as const,
      source: "manifest" as const,
      disabled: true,
    },
    {
      id: "header.only",
      label: "Header Only",
      handler: "service:header:run",
      handlerKind: "service" as const,
      source: "manifest" as const,
    },
  ],
  toolbar: [
    {
      region: "workspace",
      items: [
        { commandId: "record.export", order: 20 },
        { commandId: "record.save", label: "Save", order: 10 },
      ],
    },
    {
      region: "header",
      items: [{ commandId: "header.only" }],
    },
  ],
} satisfies ActionRegistryDto;

describe("WorkbenchToolbar", () => {
  it("renders toolbar items for the configured region in order", () => {
    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={sampleDto}>
          <ToolbarProvider region="workspace">
            <WorkbenchToolbar />
          </ToolbarProvider>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    const buttons = screen.getAllByTestId("toolbar-item");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveAttribute("data-action-id", "record.save");
    expect(buttons[1]).toHaveAttribute("data-action-id", "record.export");
  });

  it("filters toolbar items by region", () => {
    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={sampleDto}>
          <ToolbarProvider region="header">
            <WorkbenchToolbar />
          </ToolbarProvider>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    expect(screen.getAllByTestId("toolbar-item")).toHaveLength(1);
    expect(screen.getByTitle("Header Only")).toBeInTheDocument();
  });

  it("shows empty state when region has no configured items", () => {
    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={sampleDto}>
          <ToolbarProvider region="sidebar">
            <WorkbenchToolbar emptyTitle="No sidebar toolbar" />
          </ToolbarProvider>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("toolbar-empty")).toHaveTextContent("No sidebar toolbar");
  });

  it("executes selected actions through useCommandRegistry", async () => {
    const user = userEvent.setup();
    const execute = vi.fn().mockResolvedValue({
      ok: true,
      code: "SUCCESS",
      actionId: "record.save",
      actor: "user",
      durationMs: 1,
    });
    const onExecuted = vi.fn();

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
          <ToolbarProvider region="workspace">
            <WorkbenchToolbar onExecuted={onExecuted} />
          </ToolbarProvider>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    await user.click(screen.getByTitle("Save"));

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("record.save", {
        actor: "user",
        args: undefined,
      });
    });
    expect(onExecuted).toHaveBeenCalledWith("record.save");
  });

  it("does not execute disabled toolbar items", async () => {
    const user = userEvent.setup();
    const execute = vi.fn();

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
          <ToolbarProvider region="workspace">
            <WorkbenchToolbar />
          </ToolbarProvider>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    await user.click(screen.getByTitle("Export Record"));
    expect(execute).not.toHaveBeenCalled();
  });

  it("reports diagnostics", () => {
    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={sampleDto}>
          <ToolbarProvider region="workspace">
            <WorkbenchToolbar />
          </ToolbarProvider>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("toolbar-diagnostics")).toHaveAttribute(
      "data-surface",
      "toolbar",
    );
    expect(screen.getByTestId("toolbar-diagnostics")).toHaveAttribute(
      "data-region",
      "workspace",
    );
    expect(screen.getByTestId("toolbar-diagnostics")).toHaveAttribute(
      "data-visible-count",
      "2",
    );
  });
});

describe("TOOLBAR_SURFACE", () => {
  it("documents toolbar as implemented workbench surface", async () => {
    const { TOOLBAR_SURFACE } = await import("./workbench-surfaces");
    expect(TOOLBAR_SURFACE.status).toBe("implemented");
    expect(TOOLBAR_SURFACE.consumes).toBe("read-only-action-registry");
  });
});
