import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Sidebar } from "./sidebar";

describe("Sidebar", () => {
  it("renders navigation items", () => {
    render(
      <Sidebar
        items={[
          { id: "home", label: "Home", active: true },
          { id: "settings", label: "Settings" },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });

  it("calls onSelect when an item is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<Sidebar items={[{ id: "home", label: "Home" }]} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: "Home" }));
    expect(onSelect).toHaveBeenCalledWith("home");
  });
});
