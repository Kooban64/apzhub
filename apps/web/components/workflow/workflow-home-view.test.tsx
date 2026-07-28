import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkflowHomeView } from "./workflow-home-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/workflow/workflow-api", () => ({
  listWorkflowDefinitions: vi.fn(async () => ({
    items: [
      {
        id: "wf_home_1",
        key: "home_demo",
        name: "Home Demo Workflow",
        lifecycle: "published",
      },
    ],
  })),
}));

function renderHome() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <WorkflowHomeView permissions={["workflow.*"]} />
    </QueryClientProvider>,
  );
}

describe("WorkflowHomeView", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("renders home links and recent definitions", async () => {
    renderHome();
    expect(screen.getByTestId("workflow-page")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-home-links")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByTestId("workflow-definition-row-wf_home_1"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Home Demo Workflow")).toBeInTheDocument();
  });
});
