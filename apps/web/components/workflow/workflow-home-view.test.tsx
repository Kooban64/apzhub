import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkflowHomeView } from "./workflow-home-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("WorkflowHomeView", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("renders business journey companion chrome", () => {
    render(<WorkflowHomeView permissions={["workflow.view"]} />);
    expect(screen.getByTestId("workflow-page")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-breadcrumbs")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-home-links")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-home-journeys")).toBeInTheDocument();
    expect(screen.getAllByText("APZ Workflow").length).toBeGreaterThan(0);
    expect(screen.getByTestId("workflow-home-link-templates")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-home-link-monitoring")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Runs" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Schedules" })).not.toBeInTheDocument();
  });

  it("shows operator note only for workflow.admin", () => {
    const { rerender } = render(<WorkflowHomeView permissions={["workflow.view"]} />);
    expect(screen.queryByTestId("workflow-home-operator-note")).not.toBeInTheDocument();
    rerender(<WorkflowHomeView permissions={["workflow.admin"]} />);
    expect(screen.getByTestId("workflow-home-operator-note")).toBeInTheDocument();
  });
});
