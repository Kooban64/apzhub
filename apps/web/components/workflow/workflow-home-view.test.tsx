import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkflowHomeView } from "./workflow-home-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/workflow/workflow-api", () => ({
  listWorkflowApprovals: vi.fn(async () => ({
    items: [
      { id: "apr-1", title: "Budget sign-off", status: "pending" },
      { id: "apr-2", title: "Hire approval", status: "pending" },
    ],
    page: { cursor: null, nextCursor: null, limit: 5, hasMore: false },
  })),
}));

function renderHome(permissions: string[]) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <WorkflowHomeView permissions={permissions} />
    </QueryClientProvider>,
  );
}

describe("WorkflowHomeView", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("renders business journey companion chrome", async () => {
    renderHome(["workflow.view"]);
    expect(screen.getByTestId("workflow-page")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-breadcrumbs")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-home-links")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-home-journeys")).toBeInTheDocument();
    expect(screen.getAllByText("APZ Workflow").length).toBeGreaterThan(0);
    expect(screen.getByTestId("workflow-home-link-templates")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-home-link-monitoring")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-home-my-approvals")).toBeInTheDocument();
    expect(await screen.findByText("Budget sign-off")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Runs" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Schedules" })).not.toBeInTheDocument();
  });

  it("shows operator note only for workflow.admin", () => {
    const { rerender } = renderHome(["workflow.view"]);
    expect(screen.queryByTestId("workflow-home-operator-note")).not.toBeInTheDocument();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    rerender(
      <QueryClientProvider client={client}>
        <WorkflowHomeView permissions={["workflow.admin"]} />
      </QueryClientProvider>,
    );
    expect(screen.getByTestId("workflow-home-operator-note")).toBeInTheDocument();
  });
});
