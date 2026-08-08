import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkflowDefinitionDetailView } from "./workflow-definition-detail-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/workflow/workflow-api", () => ({
  getWorkflowDefinition: vi.fn(async () => ({
    id: "wf_1",
    key: "demo",
    name: "Demo",
    lifecycle: "active",
    currentVersionId: "wfv_1",
  })),
  getWorkflowReadiness: vi.fn(),
  createWorkflowRun: vi.fn(),
}));

import { getWorkflowReadiness } from "@/lib/workflow/workflow-api";

function wrap(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("WorkflowDefinitionDetailView — execute honesty (WF-P1-02)", () => {
  beforeEach(() => {
    push.mockReset();
    vi.mocked(getWorkflowReadiness).mockReset();
  });

  it("does not show Start run when provider execute is gated", async () => {
    vi.mocked(getWorkflowReadiness).mockResolvedValue({
      readiness: "ready_with_limitations",
      providerExecuteSupported: false,
      executionEnabled: false,
    });
    wrap(
      <WorkflowDefinitionDetailView
        definitionId="wf_1"
        permissions={["workflow.view"]}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-definition-detail")).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId("workflow-definition-start-run"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("workflow-definition-execute-gated")).toBeInTheDocument();
  });

  it("shows Start run when provider execute is supported", async () => {
    vi.mocked(getWorkflowReadiness).mockResolvedValue({
      readiness: "ready",
      providerExecuteSupported: true,
    });
    wrap(
      <WorkflowDefinitionDetailView
        definitionId="wf_1"
        permissions={["workflow.view", "workflow.runs.start"]}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-definition-start-run")).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId("workflow-definition-execute-gated"),
    ).not.toBeInTheDocument();
  });
});
