import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockPipelineClient } from "@/lib/testing/mock-pipeline-client";
import { PipelineClientError } from "@/lib/testing/pipeline-errors";
import { resetPipelineClient, setPipelineClient } from "@/lib/testing/pipeline-api";
import * as testingApi from "@/lib/testing/testing-api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/workspace/testing/pipelines",
  useSearchParams: () => new URLSearchParams(),
}));

import {
  TestingPipelineRepositoryView,
  TestingPipelineRunDetailView,
  TestingPipelineRunsView,
  TestingPipelineWorkflowsView,
  TestingPipelinesHomeView,
  TestingPipelinesView,
} from "./testing-pipelines-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("TestingPipelinesView", () => {
  beforeEach(() => {
    resetPipelineClient();
    setPipelineClient(createMockPipelineClient());
    vi.restoreAllMocks();
    setPipelineClient(createMockPipelineClient());
  });

  it("renders registered pipelines and repository form", async () => {
    render(wrap(<TestingPipelinesHomeView permissions={["pipeline.*"]} />));

    await waitFor(() => {
      expect(screen.getByText("Portal CI")).toBeTruthy();
    });

    expect(screen.getByRole("heading", { level: 1, name: "Pipelines" })).toBeTruthy();
    expect(screen.getByLabelText("Repository owner")).toBeTruthy();
    expect(screen.getByTestId("pipeline-open-repo")).toBeTruthy();
  });

  it("shows forbidden empty state without pipeline.read", async () => {
    render(wrap(<TestingPipelinesHomeView permissions={[]} />));

    await waitFor(() => {
      expect(screen.getByText("Pipelines unavailable")).toBeTruthy();
    });
  });

  it("shows error state when pipeline list fails", async () => {
    vi.spyOn(testingApi, "listSorPipelines").mockRejectedValue(
      new PipelineClientError("Pipelines unavailable", "ERROR", 500),
    );
    vi.spyOn(testingApi, "listPipelineProviders").mockResolvedValue({
      items: [],
      total: 0,
    });

    render(wrap(<TestingPipelinesHomeView permissions={["pipeline.read"]} />));

    await waitFor(() => {
      expect(screen.getByText("Pipelines unavailable")).toBeTruthy();
    });
  });

  it("lists workflow runs with status badges", async () => {
    render(
      wrap(
        <TestingPipelineRunsView
          owner="acme"
          repo="portal"
          permissions={["pipeline.read"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Search runs")).toBeTruthy();
      expect(screen.getAllByText("CI").length).toBeGreaterThan(0);
    });

    expect(screen.getByRole("heading", { level: 1, name: "Workflow runs" })).toBeTruthy();
  });

  it("renders run detail panels including empty link states", async () => {
    const user = userEvent.setup();
    render(
      wrap(
        <TestingPipelineRunDetailView
          owner="acme"
          repo="portal"
          runId="99"
          permissions={["pipeline.read", "pipeline.import"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("pipeline-run-header")).toBeTruthy();
    });

    expect(screen.getByRole("heading", { name: "Jobs" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Artifacts" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Pipeline summary" })).toBeTruthy();
    expect(screen.getByText("No evidence links")).toBeTruthy();
    expect(screen.getByText("No coverage links")).toBeTruthy();
    expect(screen.getByText("No certification link")).toBeTruthy();
    expect(screen.getByText("No release link")).toBeTruthy();

    const refresh = screen.getByTestId("pipeline-refresh-import");
    expect(refresh).toBeTruthy();
    await user.click(refresh);
  });

  it("shows run detail error state with retry", async () => {
    const user = userEvent.setup();
    setPipelineClient(
      createMockPipelineClient({
        getLiveRun: async () => {
          throw new PipelineClientError("Run missing", "not_found", 404);
        },
      }),
    );

    render(
      wrap(
        <TestingPipelineRunDetailView
          owner="acme"
          repo="portal"
          runId="missing"
          permissions={["pipeline.read"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText(/Run missing|not found|unavailable/i)).toBeTruthy();
    });

    const retry = screen.queryByRole("button", { name: /retry/i });
    if (retry) {
      await user.click(retry);
    }
  });

  it("renders repository and workflows modes", async () => {
    render(
      wrap(
        <TestingPipelineRepositoryView
          owner="acme"
          repo="portal"
          permissions={["pipeline.read"]}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByTestId("pipeline-repository-details")).toBeTruthy();
    });

    render(
      wrap(
        <TestingPipelineWorkflowsView
          owner="acme"
          repo="portal"
          permissions={["pipeline.read"]}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Workflows" })).toBeTruthy();
    });

    render(
      wrap(
        <TestingPipelinesView
          permissions={["pipeline.read"]}
          mode="run-detail"
          owner="acme"
          repo="portal"
          runId="99"
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getAllByTestId("pipeline-run-header").length).toBeGreaterThan(0);
    });
  });

  it("covers populated links and mode router branches", async () => {
    setPipelineClient(
      createMockPipelineClient({
        listLiveArtifacts: async () => ({ items: [], total: 0 }),
        getLiveSummary: async () => {
          throw new PipelineClientError("no summary", "not_found", 404);
        },
        getLinks: async () => ({
          evidenceIds: ["ev_1"],
          coverageMetricIds: ["cov_1"],
          certificationRecordId: "cert_1",
          releaseId: "rel_1",
          executionIds: [],
        }),
      }),
    );

    render(
      wrap(
        <TestingPipelineRunDetailView
          owner="acme"
          repo="portal"
          runId="99"
          permissions={["pipeline.read"]}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByText("ev_1")).toBeTruthy();
      expect(screen.getByText("cov_1")).toBeTruthy();
      expect(screen.getByText("cert_1")).toBeTruthy();
      expect(screen.getByText("rel_1")).toBeTruthy();
      expect(screen.getByText("No artifacts")).toBeTruthy();
      expect(screen.getByText("No summary")).toBeTruthy();
    });

    render(
      wrap(
        <TestingPipelinesView
          mode="repository"
          owner="acme"
          repo="portal"
          permissions={["pipeline.read"]}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getAllByTestId("pipeline-repository-details").length).toBeGreaterThan(0);
    });

    render(
      wrap(
        <TestingPipelinesView
          mode="workflows"
          owner="acme"
          repo="portal"
          permissions={["pipeline.read"]}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getAllByRole("heading", { name: "Workflows" }).length).toBeGreaterThan(0);
    });

    render(
      wrap(
        <TestingPipelinesView
          mode="runs"
          owner="acme"
          repo="portal"
          permissions={["pipeline.read"]}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getAllByRole("heading", { name: "Workflow runs" }).length).toBeGreaterThan(0);
    });

    render(wrap(<TestingPipelinesView permissions={["pipeline.read"]} />));
    await waitFor(() => {
      expect(screen.getAllByText("Portal CI").length).toBeGreaterThan(0);
    });
  });

  it("covers repository/workflows errors and empty runs filter", async () => {
    const user = userEvent.setup();

    vi.spyOn(testingApi, "getPipelineRepository").mockRejectedValue(
      new PipelineClientError("Repo missing", "not_found", 404),
    );
    render(
      wrap(
        <TestingPipelineRepositoryView
          owner="acme"
          repo="missing"
          permissions={["pipeline.read"]}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByText("Repo missing")).toBeTruthy();
    });

    vi.spyOn(testingApi, "listPipelineWorkflows").mockResolvedValue({ items: [], total: 0 });
    render(
      wrap(
        <TestingPipelineWorkflowsView
          owner="acme"
          repo="portal"
          permissions={["pipeline.read"]}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByText("No workflows")).toBeTruthy();
    });

    render(
      wrap(
        <TestingPipelineRunsView
          owner="acme"
          repo="portal"
          permissions={["pipeline.read"]}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByLabelText("Search runs")).toBeTruthy();
    });
    await user.type(screen.getByLabelText("Search runs"), "does-not-match-anything");
    await waitFor(() => {
      expect(screen.getByText("No workflow runs")).toBeTruthy();
    });

    render(wrap(<TestingPipelinesView permissions={[]} mode="workflows" owner="a" repo="b" />));
    await waitFor(() => {
      expect(screen.getAllByText("Pipelines unavailable").length).toBeGreaterThan(0);
    });
  });
});
