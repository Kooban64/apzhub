import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  CommandRegistryProvider,
  type ActionRegistryDto,
} from "@apzhub/command-framework/react";
import { ThemeProvider } from "@apzhub/theme";

import {
  ContextMenuProvider,
  useContextMenuProvider,
  WorkbenchContextMenu,
} from "./index";

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
        contextTypes: ["record.item"],
      },
    },
    {
      id: "record.delete",
      label: "Delete Record",
      handler: "service:record:delete",
      handlerKind: "service" as const,
      source: "manifest" as const,
      disabled: true,
      contextWhen: {
        surfaces: ["workspace"],
        selectionKinds: ["single"] as const,
      },
    },
    {
      id: "sidebar.action",
      label: "Sidebar Action",
      handler: "service:sidebar:run",
      handlerKind: "service" as const,
      source: "manifest" as const,
      contextWhen: { surfaces: ["sidebar"] },
    },
  ],
  toolbar: [],
} satisfies ActionRegistryDto;

function Opener() {
  const { openFromMouseEvent } = useContextMenuProvider();

  return (
    <button type="button" onContextMenu={openFromMouseEvent}>
      Open Menu
    </button>
  );
}

describe("WorkbenchContextMenu", () => {
  it("filters actions by context predicates and renders menu items", async () => {
    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={sampleDto}>
          <ContextMenuProvider>
            <Opener />
            <WorkbenchContextMenu
              selection={{ mode: "single" }}
              context={{ contextTypes: ["record.item"] }}
            />
          </ContextMenuProvider>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Open Menu" }));

    await waitFor(() => {
      expect(screen.getByRole("menu", { name: "Context Menu" })).toBeInTheDocument();
    });
    expect(screen.getByRole("menuitem", { name: /Edit Record/i })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /Delete Record/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Sidebar Action")).not.toBeInTheDocument();
  });

  it("shows empty state when no actions match the context", async () => {
    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={sampleDto}>
          <ContextMenuProvider>
            <Opener />
            <WorkbenchContextMenu
              selection={{ mode: "none" }}
              context={{ contextTypes: ["record.item"] }}
            />
          </ContextMenuProvider>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Open Menu" }));

    await waitFor(() => {
      expect(screen.getByTestId("context-menu-empty")).toBeInTheDocument();
    });
  });

  it("executes selected actions through useCommandRegistry and closes menu", async () => {
    const user = userEvent.setup();
    const execute = vi.fn().mockResolvedValue({
      ok: true,
      code: "SUCCESS",
      actionId: "record.edit",
      actor: "user",
      durationMs: 1,
    });
    const onExecuted = vi.fn();
    const executor = {
      execute,
      executeSync: vi.fn(),
      getDiagnostics: () => ({ status: "ready" as const, executionCount: 0 }),
    };

    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={sampleDto} executor={executor}>
          <ContextMenuProvider>
            <Opener />
            <WorkbenchContextMenu
              selection={{ mode: "single" }}
              context={{ contextTypes: ["record.item"] }}
              onExecuted={onExecuted}
            />
          </ContextMenuProvider>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Open Menu" }));
    await user.click(await screen.findByRole("menuitem", { name: /Edit Record/i }));

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("record.edit", {
        actor: "user",
        args: undefined,
      });
    });
    expect(onExecuted).toHaveBeenCalledWith("record.edit");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("does not execute disabled menu items", async () => {
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
          <ContextMenuProvider>
            <Opener />
            <WorkbenchContextMenu selection={{ mode: "single" }} />
          </ContextMenuProvider>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Open Menu" }));
    await user.click(await screen.findByRole("menuitem", { name: /Delete Record/i }));

    expect(execute).not.toHaveBeenCalled();
  });

  it("reports diagnostics while open", async () => {
    render(
      <ThemeProvider>
        <CommandRegistryProvider dto={sampleDto}>
          <ContextMenuProvider>
            <Opener />
            <WorkbenchContextMenu
              selection={{ mode: "single" }}
              context={{ contextTypes: ["record.item"] }}
            />
          </ContextMenuProvider>
        </CommandRegistryProvider>
      </ThemeProvider>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Open Menu" }));

    await waitFor(() => {
      expect(screen.getByTestId("context-menu-diagnostics")).toHaveAttribute(
        "data-open",
        "true",
      );
    });
    expect(screen.getByTestId("context-menu-diagnostics")).toHaveAttribute(
      "data-surface",
      "context-menu",
    );
  });
});

describe("CONTEXT_MENU_SURFACE", () => {
  it("documents context menu as implemented workbench surface", async () => {
    const { CONTEXT_MENU_SURFACE } = await import("./workbench-surfaces");
    expect(CONTEXT_MENU_SURFACE.status).toBe("implemented");
    expect(CONTEXT_MENU_SURFACE.consumes).toBe("read-only-action-registry");
  });
});
