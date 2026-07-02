import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@apzhub/theme";

import { Toolbar } from "./toolbar";

describe("Toolbar", () => {
  it("renders toolbar buttons for each item", () => {
    render(
      <ThemeProvider>
        <Toolbar
          items={[
            { id: "a.save", label: "Save", icon: "S" },
            { id: "b.export", label: "Export", icon: "E" },
          ]}
          onSelect={vi.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.getByRole("toolbar", { name: "Toolbar" })).toBeInTheDocument();
    expect(screen.getAllByTestId("toolbar-item")).toHaveLength(2);
    expect(screen.getByTitle("Save")).toBeInTheDocument();
  });

  it("shows empty state when no items are provided", () => {
    render(
      <ThemeProvider>
        <Toolbar
          items={[]}
          onSelect={vi.fn()}
          emptyState={{ title: "No actions configured" }}
        />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("toolbar-empty")).toHaveTextContent(
      "No actions configured",
    );
  });

  it("invokes onSelect for enabled items", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ThemeProvider>
        <Toolbar items={[{ id: "a.save", label: "Save" }]} onSelect={onSelect} />
      </ThemeProvider>,
    );

    await user.click(screen.getByTitle("Save"));
    expect(onSelect).toHaveBeenCalledWith("a.save");
  });

  it("does not invoke onSelect for disabled items", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ThemeProvider>
        <Toolbar
          items={[{ id: "a.save", label: "Save", disabled: true }]}
          onSelect={onSelect}
        />
      </ThemeProvider>,
    );

    await user.click(screen.getByTitle("Save"));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByTitle("Save")).toHaveAttribute("aria-disabled", "true");
  });
});
