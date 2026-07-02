import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@apzhub/theme";

import { CommandPalette } from "./command-palette";
import type { CommandPaletteItem } from "./types";

const mockCommands: CommandPaletteItem[] = [
  {
    id: "platform.theme.toggle",
    label: "Toggle Theme",
    group: "appearance",
    icon: "T",
    description: "Switch between light and dark themes",
    shortcut: "Ctrl+Shift+T",
  },
  { id: "workbench.view.open", label: "Open View", group: "View", icon: "V" },
  { id: "workbench.panel.close", label: "Close Panel", group: "Panel" },
];

function ControlledPalette(
  props: Partial<ComponentProps<typeof CommandPalette>> & {
    readonly initialCommands?: readonly CommandPaletteItem[];
  },
) {
  const [open, setOpen] = useState(props.open ?? true);
  const [query, setQuery] = useState(props.query ?? "");

  return (
    <ThemeProvider>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={props.initialCommands ?? mockCommands}
        onSelect={props.onSelect ?? vi.fn()}
        query={query}
        onQueryChange={setQuery}
        isReady={props.isReady}
        executionFeedback={props.executionFeedback}
        emptyState={props.emptyState}
        loadingState={props.loadingState}
        emptyMessage={props.emptyMessage}
        loadingMessage={props.loadingMessage}
      />
    </ThemeProvider>
  );
}

describe("CommandPalette", () => {
  it("renders dialog with command list when open", () => {
    render(<ControlledPalette />);

    expect(screen.getByRole("dialog", { name: "Command Palette" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "Commands" })).toBeInTheDocument();
    expect(screen.getAllByTestId("command-palette-option")).toHaveLength(3);
  });

  it("does not render when closed", () => {
    render(<ControlledPalette open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders action icons from icon glyph or label initial", () => {
    render(<ControlledPalette />);

    const toggleOption = screen.getByRole("option", { name: /Toggle Theme/i });
    expect(within(toggleOption).getByText("T")).toBeInTheDocument();

    const panelOption = screen.getByRole("option", { name: /Close Panel/i });
    expect(within(panelOption).getByText("C")).toBeInTheDocument();
  });

  it("renders action descriptions", () => {
    render(<ControlledPalette />);

    expect(
      screen.getByText("Switch between light and dark themes"),
    ).toBeInTheDocument();
  });

  it("renders shortcut badges for presentation only", () => {
    render(<ControlledPalette />);

    expect(screen.getByLabelText("Shortcut Ctrl+Shift+T")).toHaveTextContent(
      "Ctrl+Shift+T",
    );
  });

  it("renders disabled actions without invoking onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ControlledPalette
        onSelect={onSelect}
        initialCommands={[
          { id: "enabled", label: "Enabled Action" },
          { id: "disabled", label: "Disabled Action", disabled: true },
        ]}
      />,
    );

    const disabledOption = screen.getByRole("option", { name: /Disabled Action/i });
    expect(disabledOption).toHaveAttribute("aria-disabled", "true");

    await user.click(disabledOption);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("skips disabled actions during keyboard selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ControlledPalette
        onSelect={onSelect}
        initialCommands={[
          { id: "enabled", label: "Enabled Action" },
          { id: "disabled", label: "Disabled Action", disabled: true },
        ]}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Filter commands" });
    await user.click(input);
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledWith("enabled");
  });

  it("renders group section headers", () => {
    render(<ControlledPalette />);

    expect(screen.getByText("appearance")).toBeInTheDocument();
    expect(screen.getByText("View")).toBeInTheDocument();
    expect(screen.getByText("Panel")).toBeInTheDocument();
  });

  it("renders pinned section when pinned commands are present", () => {
    render(
      <ControlledPalette
        initialCommands={[
          { id: "pinned", label: "Pinned Command", pinned: true, group: "View" },
          { id: "regular", label: "Regular Command", group: "View" },
        ]}
      />,
    );

    expect(screen.getByText("Pinned")).toBeInTheDocument();
    expect(screen.getByText("View")).toBeInTheDocument();
  });

  it("shows enhanced empty state", () => {
    render(
      <ControlledPalette
        initialCommands={[]}
        emptyState={{
          title: "No matching commands",
          description: "Try a different search term or check registry hydration.",
        }}
      />,
    );

    expect(screen.getByTestId("command-palette-empty")).toBeInTheDocument();
    expect(screen.getByText("No matching commands")).toBeInTheDocument();
    expect(
      screen.getByText("Try a different search term or check registry hydration."),
    ).toBeInTheDocument();
  });

  it("shows legacy empty message when emptyState is omitted", () => {
    render(
      <ControlledPalette initialCommands={[]} emptyMessage="No commands available" />,
    );
    expect(screen.getByText("No commands available")).toBeInTheDocument();
  });

  it("shows enhanced loading state", () => {
    render(
      <ControlledPalette
        isReady={false}
        loadingState={{
          message: "Hydrating command registry",
          description: "Platform and capability actions are loading.",
        }}
      />,
    );

    expect(screen.getByTestId("command-palette-loading")).toBeInTheDocument();
    expect(screen.getByText("Hydrating command registry")).toBeInTheDocument();
    expect(
      screen.getByText("Platform and capability actions are loading."),
    ).toBeInTheDocument();
  });

  it("shows legacy loading message when loadingState is omitted", () => {
    render(<ControlledPalette isReady={false} />);
    expect(screen.getByText("Loading commands…")).toBeInTheDocument();
  });

  it("navigates with arrow keys and selects on Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<ControlledPalette onSelect={onSelect} />);
    const input = screen.getByRole("combobox", { name: "Filter commands" });

    await user.click(input);
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledWith("workbench.view.open");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<ControlledPalette />);

    await user.click(screen.getByRole("combobox", { name: "Filter commands" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("invokes onSelect when clicking a command", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<ControlledPalette onSelect={onSelect} />);
    await user.click(screen.getByRole("option", { name: /Close Panel/i }));

    expect(onSelect).toHaveBeenCalledWith("workbench.panel.close");
  });

  it("displays execution feedback", () => {
    render(
      <ControlledPalette
        executionFeedback={{
          ok: true,
          code: "SUCCESS",
          actionId: "platform.theme.toggle",
        }}
      />,
    );

    expect(screen.getByTestId("command-palette-execution-feedback")).toHaveTextContent(
      "Executed: platform.theme.toggle",
    );
  });
});
