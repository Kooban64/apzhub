import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  EmptyState,
  ErrorState,
  StatusBadge,
  TestingStatCard,
  TestingTable,
} from "./testing-ui";

describe("testing-ui states", () => {
  it("renders ErrorState with retry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Testing is temporarily unavailable." onRetry={onRetry} />);

    expect(screen.getByTestId("testing-error")).toBeTruthy();
    expect(screen.getByTestId("testing-error").textContent).toMatch(/Unable to load Testing/i);
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("renders EmptyState", () => {
    render(<EmptyState title="Nothing here" description="Try another filter." />);
    expect(screen.getByTestId("testing-empty")).toBeTruthy();
    expect(screen.getByText("Nothing here")).toBeTruthy();
  });

  it("renders StatusBadge with formatted label", () => {
    render(<StatusBadge status="pending_approval" />);
    expect(screen.getByTestId("testing-status-badge").textContent).toBe("Pending Approval");
  });

  it("renders TestingStatCard with tone", () => {
    render(<TestingStatCard label="Active plans" value="3 active" tone="warning" />);
    const card = screen.getByTestId("testing-stat-card");
    expect(card.getAttribute("data-tone")).toBe("warning");
    expect(card.textContent).toContain("3 active");
  });

  it("handles TestingTable row click and keyboard activation", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    render(
      <TestingTable
        columns={["Name"]}
        rows={[{ id: "row-1", cells: ["Alpha"] }]}
        onRowClick={onRowClick}
      />,
    );

    await user.click(screen.getByText("Alpha"));
    expect(onRowClick).toHaveBeenCalledWith("row-1");

    onRowClick.mockClear();
    const row = screen.getByTestId("testing-row-row-1");
    row.focus();
    await user.keyboard("{Enter}");
    expect(onRowClick).toHaveBeenCalledWith("row-1");
  });
});
