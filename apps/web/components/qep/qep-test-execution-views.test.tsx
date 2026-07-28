import type { TestExecutionDto } from "@apzhub/qep-test-execution";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const replaceMock = vi.fn();
let searchParamsValue = "";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/qep/test-execution/explorer",
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(searchParamsValue),
}));

vi.mock("@/lib/qep/qep-test-execution-api", () => {
  const EXECUTION_ACTION_SLUGS: Readonly<Record<string, string>> = {
    prepareExecution: "prepare",
    assignExecutor: "assign",
    startExecution: "start",
    pauseExecution: "pause",
    blockExecution: "block",
    resumeExecution: "resume",
    completeExecution: "complete",
    submitForReview: "submitForReview",
    acceptExecution: "accept",
    rejectExecution: "reject",
    cancelExecution: "cancel",
    supersedeExecution: "supersede",
  };
  return {
    EXECUTION_ACTION_SLUGS,
    resolveExecutionActionSlug: (action: string) =>
      EXECUTION_ACTION_SLUGS[action] ?? action,
    listExecutions: vi.fn(),
    listAssignedExecutions: vi.fn(),
    listReviewQueueExecutions: vi.fn(),
    getExecution: vi.fn(),
    getExecutionHistory: vi.fn(),
    getExecutionAvailableActions: vi.fn(),
    getExecutionSteps: vi.fn(),
    getExecutionManifest: vi.fn(),
    createExecution: vi.fn(),
    performExecutionAction: vi.fn(),
    recordExecutionStepResult: vi.fn(),
    associateExecutionEvidence: vi.fn(),
    recordExecutionObservation: vi.fn(),
    getPlanExecutionProgress: vi.fn(),
    listExecutionEvidenceReferences: vi.fn(),
  };
});

import {
  createExecution,
  getExecution,
  listAssignedExecutions,
  listExecutions,
  listReviewQueueExecutions,
  performExecutionAction,
} from "@/lib/qep/qep-test-execution-api";
import {
  QEP_TEST_EXECUTION_ROUTES,
  isQepTestExecutionExplorerRoute,
  isQepTestExecutionReviewRoute,
  parseQepTestExecutionDetailMode,
  parseQepTestExecutionRouteId,
} from "@/lib/qep/routes";

import { QepTestExecutionRouterView } from "./qep-test-execution-views";

function wrap(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function baseDto(overrides: Partial<TestExecutionDto> = {}): TestExecutionDto {
  return {
    id: "exec_1",
    executionNumber: "TE-001",
    tenantId: "tenant_1",
    projectId: "proj_1",
    workspaceId: "ws_1",
    status: "assigned",
    mode: "manual",
    outcome: null,
    revision: 1,
    planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
    assignment: { ownerId: "workbench-user", executorId: "workbench-user" },
    manifest: null,
    steps: [
      {
        order: 1,
        instruction: "Open the login page",
        expectedResult: "Login page renders",
        evidenceIds: [],
        attemptCount: 0,
      },
    ],
    observations: [],
    evidenceReferences: [],
    review: null,
    createdAt: "2026-07-29T00:00:00.000Z",
    createdBy: "user_1",
    updatedAt: "2026-07-29T00:00:00.000Z",
    updatedBy: "user_1",
    availableActions: [
      {
        action: "startExecution",
        label: "Start",
        requiresConfirmation: false,
        reasonRequired: false,
      },
    ],
    ...overrides,
  };
}

describe("APZQEP-ENG-100E routing helpers", () => {
  it("maps explorer and review routes", () => {
    expect(isQepTestExecutionExplorerRoute(QEP_TEST_EXECUTION_ROUTES.explorer)).toBe(
      true,
    );
    expect(isQepTestExecutionReviewRoute(QEP_TEST_EXECUTION_ROUTES.review)).toBe(true);
  });

  it("parses detail and history modes", () => {
    const id = "exec_demo";
    expect(parseQepTestExecutionRouteId(QEP_TEST_EXECUTION_ROUTES.detail(id))).toBe(id);
    expect(parseQepTestExecutionDetailMode(QEP_TEST_EXECUTION_ROUTES.history(id))).toBe(
      "history",
    );
  });
});

describe("APZQEP-ENG-100E Workbench journeys (mocked API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockReset();
    replaceMock.mockReset();
    searchParamsValue = "";
  });

  it("renders Explorer rows from list API", async () => {
    vi.mocked(listExecutions).mockResolvedValue({
      items: [baseDto()],
      total: 1,
      limit: 25,
      offset: 0,
    });

    render(
      wrap(
        <QepTestExecutionRouterView pathname="/workspace/qep/test-execution/explorer" />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("TE-001")).toBeTruthy();
    });
    expect(screen.getByTestId("qep-execution-status-filter")).toBeTruthy();
  });

  it("renders Assigned queue from listAssigned API", async () => {
    vi.mocked(listAssignedExecutions).mockResolvedValue({
      items: [baseDto({ id: "exec_2", executionNumber: "TE-002" })],
      total: 1,
      limit: 25,
      offset: 0,
    });

    render(
      wrap(
        <QepTestExecutionRouterView pathname="/workspace/qep/test-execution/assigned" />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("TE-002")).toBeTruthy();
    });
  });

  it("renders Review queue from listReviewQueue API", async () => {
    vi.mocked(listReviewQueueExecutions).mockResolvedValue({
      items: [
        baseDto({
          id: "exec_3",
          executionNumber: "TE-003",
          status: "submitted_for_review",
        }),
      ],
      total: 1,
      limit: 25,
      offset: 0,
    });

    render(
      wrap(
        <QepTestExecutionRouterView pathname="/workspace/qep/test-execution/review" />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("TE-003")).toBeTruthy();
    });
  });

  it("renders Home dashboard counts", async () => {
    vi.mocked(listExecutions).mockResolvedValue({ items: [], total: 0 });
    vi.mocked(listAssignedExecutions).mockResolvedValue({ items: [], total: 0 });
    vi.mocked(listReviewQueueExecutions).mockResolvedValue({ items: [], total: 0 });

    render(
      wrap(<QepTestExecutionRouterView pathname="/workspace/qep/test-execution" />),
    );

    await waitFor(() => {
      expect(screen.getByTestId("qep-execution-dashboard")).toBeTruthy();
    });
  });

  it("creates a draft Execution and navigates to detail", async () => {
    vi.mocked(createExecution).mockResolvedValue(baseDto({ id: "exec_new" }));

    render(
      wrap(<QepTestExecutionRouterView pathname="/workspace/qep/test-execution/new" />),
    );

    fireEvent.change(screen.getByLabelText("Project ID"), {
      target: { value: "proj_1" },
    });
    fireEvent.change(screen.getByLabelText("Workspace ID"), {
      target: { value: "ws_1" },
    });
    fireEvent.change(screen.getByLabelText("Plan ID"), { target: { value: "plan_1" } });
    fireEvent.change(screen.getByLabelText("Plan version label"), {
      target: { value: "1.0.0" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create draft/i }));

    await waitFor(() => {
      expect(createExecution).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "proj_1",
          workspaceId: "ws_1",
          sourceRefs: {
            planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
          },
        }),
      );
      expect(pushMock).toHaveBeenCalledWith(
        QEP_TEST_EXECUTION_ROUTES.detail("exec_new"),
      );
    });
  });

  it("renders the action bar solely from availableActions and never invents buttons", async () => {
    vi.mocked(getExecution).mockResolvedValue(
      baseDto({
        availableActions: [
          {
            action: "startExecution",
            label: "Start",
            requiresConfirmation: false,
            reasonRequired: false,
          },
        ],
      }),
    );

    render(
      wrap(
        <QepTestExecutionRouterView pathname="/workspace/qep/test-execution/executions/exec_1" />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("qep-execution-actions")).toBeTruthy();
    });
    expect(screen.getByRole("button", { name: /^Start$/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Complete$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Cancel$/i })).toBeNull();
  });

  it("shows no-actions state when availableActions is empty — never status-derived", async () => {
    vi.mocked(getExecution).mockResolvedValue(baseDto({ availableActions: [] }));

    render(
      wrap(
        <QepTestExecutionRouterView pathname="/workspace/qep/test-execution/executions/exec_1" />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("qep-execution-actions-empty")).toBeTruthy();
    });
  });

  it("executes a simple action (no dialog) directly via performAction", async () => {
    vi.mocked(getExecution).mockResolvedValue(
      baseDto({
        availableActions: [
          {
            action: "startExecution",
            label: "Start",
            requiresConfirmation: false,
            reasonRequired: false,
          },
        ],
      }),
    );
    vi.mocked(performExecutionAction).mockResolvedValue(
      baseDto({ status: "in_progress", availableActions: [] }),
    );

    render(
      wrap(
        <QepTestExecutionRouterView pathname="/workspace/qep/test-execution/executions/exec_1" />,
      ),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Start$/i })).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole("button", { name: /^Start$/i }));

    await waitFor(() => {
      expect(performExecutionAction).toHaveBeenCalledWith(
        "exec_1",
        "start",
        expect.objectContaining({ expectedRevision: 1 }),
      );
    });
  });

  it("requires a reason before confirming a reasonRequired action (block)", async () => {
    vi.mocked(getExecution).mockResolvedValue(
      baseDto({
        status: "in_progress",
        availableActions: [
          {
            action: "blockExecution",
            label: "Block",
            requiresConfirmation: true,
            reasonRequired: true,
          },
        ],
      }),
    );
    vi.mocked(performExecutionAction).mockResolvedValue(
      baseDto({ status: "blocked", availableActions: [] }),
    );

    render(
      wrap(
        <QepTestExecutionRouterView pathname="/workspace/qep/test-execution/executions/exec_1" />,
      ),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Block$/i })).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole("button", { name: /^Block$/i }));

    await waitFor(() =>
      expect(screen.getByTestId("qep-execution-action-dialog")).toBeTruthy(),
    );
    const confirmButton = screen.getByTestId("qep-execution-confirm-blockExecution");
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Reason"), {
      target: { value: "Environment unavailable" },
    });
    expect(confirmButton).not.toBeDisabled();
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(performExecutionAction).toHaveBeenCalledWith(
        "exec_1",
        "block",
        expect.objectContaining({
          expectedRevision: 1,
          reason: "Environment unavailable",
        }),
      );
    });
  });

  it("shows forbidden state on 403", async () => {
    const err = new Error("Forbidden") as Error & { status?: number };
    err.status = 403;
    vi.mocked(getExecution).mockRejectedValue(err);

    render(
      wrap(
        <QepTestExecutionRouterView pathname="/workspace/qep/test-execution/executions/exec_1" />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText(/do not have permission/i)).toBeTruthy();
    });
  });
});
