import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FIXTURE_IDS } from "@/lib/testing/mock-client";
import { TestingClientError } from "@/lib/testing/errors";
import * as testingApi from "@/lib/testing/testing-api";
import { resetTestingClient } from "@/lib/testing/testing-api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/workspace/testing/executions",
  useSearchParams: () => new URLSearchParams(),
}));

import { TestingExecutionView } from "./testing-execution-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("TestingExecutionView", () => {
  beforeEach(() => {
    resetTestingClient();
    vi.restoreAllMocks();
  });

  it("renders execution list from the mock client", async () => {
    render(wrap(<TestingExecutionView permissions={["testing.executions.execute"]} />));

    await waitFor(() => {
      expect(screen.getByText(/TC-AUTH-001/)).toBeTruthy();
    });
    expect(screen.getByTestId("testing-command-start")).toBeTruthy();
  });

  it("starts execution from list commands panel", async () => {
    const user = userEvent.setup();
    render(
      wrap(
        <TestingExecutionView
          permissions={["testing.executions.execute", "evidence.register"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("testing-command-start")).toBeTruthy();
    });

    await user.click(screen.getByTestId("testing-command-start"));
    await waitFor(() => {
      expect(screen.getAllByText(/in progress/i).length).toBeGreaterThan(0);
    });
  });

  it("shows pause and resume on detail when permitted", async () => {
    const user = userEvent.setup();
    render(
      wrap(
        <TestingExecutionView
          executionId={FIXTURE_IDS.execution}
          permissions={["testing.executions.execute"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("testing-command-pause")).toBeTruthy();
    });
    expect(screen.getByTestId("testing-command-resume")).toBeTruthy();

    await user.click(screen.getByTestId("testing-command-pause"));
    await waitFor(() => {
      expect(screen.getAllByText(/paused/i).length).toBeGreaterThan(0);
    });

    await user.click(screen.getByTestId("testing-command-resume"));
    await waitFor(() => {
      expect(screen.getAllByText(/in progress/i).length).toBeGreaterThan(0);
    });
  });

  it("submits evidence from detail when permitted", async () => {
    const user = userEvent.setup();
    render(
      wrap(
        <TestingExecutionView
          executionId={FIXTURE_IDS.execution}
          permissions={["testing.executions.execute", "evidence.register"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("testing-command-submit-evidence")).toBeTruthy();
    });

    await user.click(screen.getByTestId("testing-command-submit-evidence"));
    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  it("hides execution commands when permissions are empty", async () => {
    render(
      wrap(
        <TestingExecutionView executionId={FIXTURE_IDS.execution} permissions={[]} />,
      ),
    );

    await waitFor(() => {
      expect(screen.getAllByText(/TC-AUTH-001/).length).toBeGreaterThan(0);
    });
    expect(screen.queryByTestId("testing-commands-panel")).toBeNull();
    expect(screen.queryByTestId("testing-command-pause")).toBeNull();
    expect(screen.queryByTestId("testing-command-resume")).toBeNull();
  });

  it("shows detail and list error states", async () => {
    vi.spyOn(testingApi, "getExecution").mockRejectedValueOnce(
      new TestingClientError("Execution not found", "NOT_FOUND", 404),
    );

    const { rerender } = render(
      wrap(
        <TestingExecutionView
          executionId="missing-exec"
          permissions={["testing.executions.execute"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("Execution not found")).toBeTruthy();
    });

    vi.spyOn(testingApi, "listExecutions").mockRejectedValueOnce(
      new TestingClientError("Execution list failed", "ERROR", 500),
    );
    rerender(
      wrap(<TestingExecutionView permissions={["testing.executions.execute"]} />),
    );

    await waitFor(() => {
      expect(screen.getByText("Execution list failed")).toBeTruthy();
    });
  });
});
