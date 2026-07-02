import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@apzhub/theme";

import { ContextMenu } from "./context-menu";
import type { ContextMenuItem } from "./types";

const items: ContextMenuItem[] = [
  {
    id: "record.edit",
    label: "Edit Record",
    description: "Open the selected record",
    icon: "E",
    shortcut: "Ctrl+E",
  },
  { id: "record.delete", label: "Delete Record", disabled: true },
];

describe("ContextMenu", () => {
  it("renders menu items when open", () => {
    render(
      <ThemeProvider>
        <ContextMenu
          open
          x={12}
          y={24}
          items={items}
          onSelect={vi.fn()}
          onClose={vi.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.getByRole("menu", { name: "Context Menu" })).toBeInTheDocument();
    expect(screen.getAllByTestId("context-menu-item")).toHaveLength(2);
    expect(screen.getByText("Edit Record")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <ThemeProvider>
        <ContextMenu
          open={false}
          x={0}
          y={0}
          items={items}
          onSelect={vi.fn()}
          onClose={vi.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("shows empty state when there are no items", () => {
    render(
      <ThemeProvider>
        <ContextMenu
          open
          x={0}
          y={0}
          items={[]}
          onSelect={vi.fn()}
          onClose={vi.fn()}
          emptyState={{ title: "No actions for this context" }}
        />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("context-menu-empty")).toHaveTextContent(
      "No actions for this context",
    );
  });

  it("invokes onSelect for enabled items", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ThemeProvider>
        <ContextMenu
          open
          x={0}
          y={0}
          items={items}
          onSelect={onSelect}
          onClose={vi.fn()}
        />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("menuitem", { name: /Edit Record/i }));
    expect(onSelect).toHaveBeenCalledWith("record.edit");
  });

  it("does not invoke onSelect for disabled items", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ThemeProvider>
        <ContextMenu
          open
          x={0}
          y={0}
          items={items}
          onSelect={onSelect}
          onClose={vi.fn()}
        />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("menuitem", { name: /Delete Record/i }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ThemeProvider>
        <ContextMenu
          open
          x={0}
          y={0}
          items={items}
          onSelect={vi.fn()}
          onClose={onClose}
        />
      </ThemeProvider>,
    );

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
