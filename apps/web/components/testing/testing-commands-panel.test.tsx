import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as commands from "@/lib/testing/commands";
import { TestingClientError } from "@/lib/testing/errors";
import { FIXTURE_IDS } from "@/lib/testing/mock-client";
import { resetTestingClient } from "@/lib/testing/testing-api";

import { TestingCommandsPanel } from "./testing-commands-panel";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("TestingCommandsPanel", () => {
  beforeEach(() => {
    resetTestingClient();
    vi.restoreAllMocks();
  });

  it("shows execution commands when execute permission is granted", () => {
    render(
      wrap(
        <TestingCommandsPanel
          variant="execution"
          context={{ executionId: FIXTURE_IDS.execution }}
          permissions={["testing.executions.execute", "evidence.register"]}
        />,
      ),
    );

    expect(screen.getByTestId("testing-commands-panel")).toBeTruthy();
    expect(screen.getByTestId("testing-command-pause")).toBeTruthy();
    expect(screen.getByTestId("testing-command-resume")).toBeTruthy();
    expect(screen.getByTestId("testing-command-submit-evidence")).toBeTruthy();
  });

  it("shows certification commands based on permissions", () => {
    render(
      wrap(
        <TestingCommandsPanel
          variant="certification"
          context={{ certificationId: FIXTURE_IDS.certification }}
          permissions={["certification.review", "certification.reject"]}
        />,
      ),
    );

    expect(screen.getByTestId("testing-command-review")).toBeTruthy();
    expect(screen.getByTestId("testing-command-reject")).toBeTruthy();
    expect(screen.queryByTestId("testing-command-approve")).toBeNull();
    expect(screen.queryByTestId("testing-command-archive")).toBeNull();
  });

  it("renders nothing when no commands are permitted", () => {
    const { container } = render(
      wrap(
        <TestingCommandsPanel
          variant="execution"
          context={{ executionId: FIXTURE_IDS.execution }}
          permissions={[]}
        />,
      ),
    );

    expect(container.textContent?.trim()).toBe("");
    expect(screen.queryByTestId("testing-commands-panel")).toBeNull();
  });

  it("runs execution commands and surfaces command errors", async () => {
    const user = userEvent.setup();
    vi.spyOn(commands, "executeTestingCommand").mockRejectedValue(
      new TestingClientError("Execution denied", "FORBIDDEN", 403),
    );

    render(
      wrap(
        <TestingCommandsPanel
          variant="execution"
          context={{ executionId: FIXTURE_IDS.execution }}
          permissions={["testing.executions.execute"]}
        />,
      ),
    );

    await user.click(screen.getByTestId("testing-command-pause"));
    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("Execution denied");
    });
  });

  it("invokes onSuccess after a successful certification command", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      wrap(
        <TestingCommandsPanel
          variant="certification"
          context={{ certificationId: FIXTURE_IDS.certification }}
          permissions={["certification.review"]}
          onSuccess={onSuccess}
        />,
      ),
    );

    await user.click(screen.getByTestId("testing-command-review"));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
