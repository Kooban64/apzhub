import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  LawBreadcrumbs,
  LawDataTable,
  LawEmptyState,
  LawErrorState,
  LawLoadingSkeleton,
  LawPageHeader,
  LawSearchBar,
  LawStatisticsCard,
  LawTabs,
} from "./index";

describe("Law UX components", () => {
  it("renders page header with actions", () => {
    render(
      <LawPageHeader
        eyebrow="Module"
        title="Clients"
        subtitle="Manage clients"
        primaryAction={<button type="button">Create</button>}
      />,
    );

    expect(screen.getByTestId("law-page-header")).toHaveTextContent("Clients");
    expect(screen.getByTestId("law-page-header-actions")).toHaveTextContent("Create");
  });

  it("renders breadcrumbs with current page", () => {
    render(
      <LawBreadcrumbs
        items={[
          { label: "Law Platform", href: "/workspace/law/dashboard" },
          { label: "Clients", current: true },
        ]}
      />,
    );

    expect(screen.getByTestId("law-breadcrumbs")).toBeInTheDocument();
    expect(screen.getByText("Clients")).toHaveAttribute("aria-current", "page");
  });

  it("renders search bar as presentational container", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<LawSearchBar value="" onChange={onChange} placeholder="Search clients" />);

    await user.type(screen.getByPlaceholderText("Search clients"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders empty state variants", () => {
    render(<LawEmptyState variant="no-clients" />);
    expect(screen.getByTestId("law-empty-state-no-clients")).toHaveTextContent(
      "No clients yet",
    );
  });

  it("renders loading skeleton with busy state", () => {
    render(<LawLoadingSkeleton rows={2} />);
    expect(screen.getByTestId("law-loading-skeleton")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("renders error state with retry action", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(<LawErrorState message="Failed to load." onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders data table empty message", () => {
    render(
      <LawDataTable
        columns={[
          { id: "name", header: "Name" },
          { id: "status", header: "Status" },
        ]}
      />,
    );

    expect(screen.getByTestId("law-data-table")).toBeInTheDocument();
    expect(screen.getByText("No rows to display.")).toBeInTheDocument();
  });

  it("renders statistics card", () => {
    render(<LawStatisticsCard label="Matters" value="0" hint="Placeholder" />);
    expect(screen.getByTestId("law-statistics-card")).toHaveTextContent("Matters");
  });

  it("switches tabs", async () => {
    function TabsHarness() {
      const [activeId, setActiveId] = useState("overview");
      return (
        <LawTabs
          items={[
            { id: "overview", label: "Overview" },
            { id: "documents", label: "Documents" },
          ]}
          activeId={activeId}
          onChange={setActiveId}
        />
      );
    }

    const user = userEvent.setup();
    render(<TabsHarness />);

    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.click(screen.getByRole("tab", { name: "Documents" }));
    expect(screen.getByRole("tab", { name: "Documents" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
