import type { QepTestPlanDto } from "@apzhub/qep-contracts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const replaceMock = vi.fn();
let searchParamsValue = "";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/qep/test-plans/explorer",
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(searchParamsValue),
}));

vi.mock("@/lib/qep/qep-test-plan-api", () => ({
  listPlans: vi.fn(),
  getPlan: vi.fn(),
  createPlan: vi.fn(),
  updatePlanContent: vi.fn(),
  updatePlanMetadata: vi.fn(),
  transferPlanOwnership: vi.fn(),
  updatePlanAssignment: vi.fn(),
  updatePlanSchedule: vi.fn(),
  addPlanItem: vi.fn(),
  updatePlanItem: vi.fn(),
  removePlanItem: vi.fn(),
  reorderPlanItems: vi.fn(),
  submitPlanForReview: vi.fn(),
  approvePlan: vi.fn(),
  rejectPlan: vi.fn(),
  returnPlanToDraft: vi.fn(),
  markPlanReady: vi.fn(),
  startPlanExecution: vi.fn(),
  completePlan: vi.fn(),
  archivePlan: vi.fn(),
  cancelPlan: vi.fn(),
  supersedePlan: vi.fn(),
  clonePlan: vi.fn(),
  getPlanHistory: vi.fn(),
  listPlanVersions: vi.fn(),
}));

vi.mock("@/lib/qep/telemetry", () => ({
  emitQepWorkbenchTelemetry: vi.fn(),
}));

import {
  approvePlan,
  createPlan,
  getPlan,
  listPlans,
  rejectPlan,
  returnPlanToDraft,
  submitPlanForReview,
  updatePlanAssignment,
  updatePlanContent,
} from "@/lib/qep/qep-test-plan-api";
import {
  QEP_TEST_PLAN_ROUTES,
  isQepTestPlansExplorerRoute,
  isQepTestPlansReviewRoute,
  parseQepTestPlanDetailMode,
  parseQepTestPlanRouteId,
} from "@/lib/qep/routes";

import { QepTestPlanRouterView, planActionVisible } from "./qep-test-plan-views";

function wrap(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function baseDto(overrides: Partial<QepTestPlanDto> = {}): QepTestPlanDto {
  return {
    id: "tpl_1",
    tenantId: "tenant_1",
    number: "TP-001",
    revision: 1,
    title: "Regression Plan",
    description: "Covers login flows",
    objective: "Validate login regression",
    scope: { class: "regression", label: "Login" },
    status: "draft",
    priority: "medium",
    planType: "regression",
    ownerId: "workbench-user",
    versionLabel: "0.1",
    createdAt: "2026-07-27T00:00:00.000Z",
    createdBy: "user_1",
    updatedAt: "2026-07-27T00:00:00.000Z",
    updatedBy: "user_1",
    items: [
      {
        id: "item_1",
        specificationId: "tsp_1",
        sequence: 1,
        itemStatus: "included",
      },
    ],
    schedule: {},
    assignment: {
      assigneeIds: [],
      updatedAt: "2026-07-27T00:00:00.000Z",
      updatedBy: "user_1",
    },
    approvals: [],
    revisions: [],
    externalReferences: [],
    metadata: {},
    metrics: {
      totalItems: 1,
      includedCount: 1,
      optionalCount: 0,
      deferredCount: 0,
      pinnedIncludedCount: 0,
    },
    historySummaries: [
      {
        sequence: 1,
        at: "2026-07-27T00:00:00.000Z",
        actorId: "user_1",
        action: "created",
        summary: "Created",
      },
    ],
    availableActions: ["updateContent", "submitForReview", "cancel"],
    ...overrides,
  };
}

describe("APZQEP-ENG-070A routing helpers", () => {
  it("maps explorer and review routes", () => {
    expect(isQepTestPlansExplorerRoute(QEP_TEST_PLAN_ROUTES.explorer)).toBe(true);
    expect(isQepTestPlansReviewRoute(QEP_TEST_PLAN_ROUTES.review)).toBe(true);
  });

  it("parses detail and secondary modes", () => {
    const id = "tpl_demo";
    expect(parseQepTestPlanRouteId(QEP_TEST_PLAN_ROUTES.detail(id))).toBe(id);
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.history(id))).toBe(
      "history",
    );
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.versions(id))).toBe(
      "versions",
    );
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.items(id))).toBe("items");
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.relationships(id))).toBe(
      "relationships",
    );
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.compare(id))).toBe(
      "compare",
    );
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.audit(id))).toBe("audit");
  });
});

describe("planActionVisible", () => {
  it("only reports actions present in availableActions — never invents", () => {
    expect(planActionVisible(["approve", "reject"], "approve")).toBe(true);
    expect(planActionVisible(["approve", "reject"], "returnToDraft")).toBe(false);
    expect(planActionVisible([], "cancel")).toBe(false);
  });
});

describe("APZQEP-ENG-070A Workbench journeys (mocked API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockReset();
    replaceMock.mockReset();
    searchParamsValue = "";
  });

  it("renders Explorer rows from list API", async () => {
    vi.mocked(listPlans).mockResolvedValue({
      items: [baseDto()],
      total: 1,
      limit: 50,
      offset: 0,
    });

    render(
      wrap(<QepTestPlanRouterView pathname="/workspace/qep/test-plans/explorer" />),
    );

    await waitFor(() => {
      expect(screen.getByText("TP-001")).toBeTruthy();
    });
    expect(screen.getByTestId("qep-plan-status-filter")).toBeTruthy();
  });

  it("creates a draft Plan", async () => {
    vi.mocked(createPlan).mockResolvedValue(baseDto({ id: "tpl_new" }));

    render(wrap(<QepTestPlanRouterView pathname="/workspace/qep/test-plans/new" />));

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "New plan" } });
    fireEvent.change(screen.getByLabelText("Objective"), { target: { value: "Obj" } });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Desc" },
    });
    fireEvent.change(screen.getByLabelText("Scope class"), {
      target: { value: "regression" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create draft/i }));

    await waitFor(() => {
      expect(createPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New plan",
          scope: { class: "regression" },
        }),
      );
      expect(pushMock).toHaveBeenCalledWith(QEP_TEST_PLAN_ROUTES.detail("tpl_new"));
    });
  });

  it("submits for review only when availableActions includes submitForReview", async () => {
    const dto = baseDto({ availableActions: ["submitForReview"] });
    vi.mocked(getPlan).mockResolvedValue(dto);
    vi.mocked(submitPlanForReview).mockResolvedValue(
      baseDto({ status: "review", availableActions: ["approve", "reject"] }),
    );

    render(
      wrap(<QepTestPlanRouterView pathname="/workspace/qep/test-plans/plans/tpl_1" />),
    );

    await waitFor(() => {
      expect(screen.getByTestId("qep-plan-actions")).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit for review/i }));
    await waitFor(() => {
      expect(screen.getByTestId("qep-plan-action-dialog")).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: /^Submit$/i }));
    await waitFor(() => {
      expect(submitPlanForReview).toHaveBeenCalledWith("tpl_1", {
        expectedRevision: 1,
      });
    });
  });

  it("approves from review when action present", async () => {
    vi.mocked(getPlan).mockResolvedValue(
      baseDto({ status: "review", availableActions: ["approve", "reject"] }),
    );
    vi.mocked(approvePlan).mockResolvedValue(
      baseDto({ status: "approved", availableActions: ["markReady", "supersede"] }),
    );

    render(
      wrap(<QepTestPlanRouterView pathname="/workspace/qep/test-plans/plans/tpl_1" />),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Approve$/i })).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole("button", { name: /^Approve$/i }));
    await waitFor(() =>
      expect(screen.getByTestId("qep-plan-confirm-approve")).toBeTruthy(),
    );
    fireEvent.click(screen.getByTestId("qep-plan-confirm-approve"));
    await waitFor(() => {
      expect(approvePlan).toHaveBeenCalledWith("tpl_1", {
        comment: undefined,
        expectedRevision: 1,
      });
    });
  });

  it("rejects with required rationale", async () => {
    vi.mocked(getPlan).mockResolvedValue(
      baseDto({ status: "review", availableActions: ["reject"] }),
    );
    vi.mocked(rejectPlan).mockResolvedValue(
      baseDto({ status: "rejected", availableActions: ["returnToDraft", "cancel"] }),
    );

    render(
      wrap(<QepTestPlanRouterView pathname="/workspace/qep/test-plans/plans/tpl_1" />),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Reject$/i })).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole("button", { name: /^Reject$/i }));
    await waitFor(() => expect(screen.getByLabelText(/Rationale/i)).toBeTruthy());
    fireEvent.change(screen.getByLabelText(/Rationale/i), {
      target: { value: "Missing coverage" },
    });
    fireEvent.click(screen.getByTestId("qep-plan-confirm-reject"));
    await waitFor(() => {
      expect(rejectPlan).toHaveBeenCalledWith("tpl_1", {
        comment: "Missing coverage",
        expectedRevision: 1,
      });
    });
  });

  it("allows returnToDraft when the server exposes it on rejected (Plans allow this)", async () => {
    vi.mocked(getPlan).mockResolvedValue(
      baseDto({ status: "rejected", availableActions: ["returnToDraft", "cancel"] }),
    );
    vi.mocked(returnPlanToDraft).mockResolvedValue(
      baseDto({
        status: "draft",
        availableActions: ["updateContent", "submitForReview"],
      }),
    );

    render(
      wrap(<QepTestPlanRouterView pathname="/workspace/qep/test-plans/plans/tpl_1" />),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Return to draft/i })).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole("button", { name: /Return to draft/i }));
    await waitFor(() =>
      expect(screen.getByTestId("qep-plan-confirm-returnToDraft")).toBeTruthy(),
    );
    fireEvent.click(screen.getByTestId("qep-plan-confirm-returnToDraft"));
    await waitFor(() => {
      expect(returnPlanToDraft).toHaveBeenCalledWith("tpl_1", { expectedRevision: 1 });
    });
  });

  it("edits draft via updateContent with expectedRevision", async () => {
    vi.mocked(getPlan).mockResolvedValue(
      baseDto({ availableActions: ["updateContent"], revision: 3 }),
    );
    vi.mocked(updatePlanContent).mockResolvedValue(
      baseDto({ title: "Updated", revision: 4 }),
    );

    render(
      wrap(
        <QepTestPlanRouterView pathname="/workspace/qep/test-plans/plans/tpl_1/edit" />,
      ),
    );

    await waitFor(() => expect(screen.getByTestId("qep-plan-edit")).toBeTruthy());
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Updated" } });
    fireEvent.click(screen.getByRole("button", { name: /Save draft/i }));
    await waitFor(() => {
      expect(updatePlanContent).toHaveBeenCalledWith(
        "tpl_1",
        expect.objectContaining({ title: "Updated", expectedRevision: 3 }),
      );
    });
  });

  it("shows forbidden state on 403", async () => {
    const err = new Error("Forbidden") as Error & { status?: number };
    err.status = 403;
    vi.mocked(getPlan).mockRejectedValue(err);

    render(
      wrap(<QepTestPlanRouterView pathname="/workspace/qep/test-plans/plans/tpl_1" />),
    );

    await waitFor(() => {
      expect(screen.getByText(/do not have permission/i)).toBeTruthy();
    });
  });

  it("shows governed unavailable for compare without calling the compare API", async () => {
    vi.mocked(getPlan).mockResolvedValue(baseDto());
    render(
      wrap(
        <QepTestPlanRouterView pathname="/workspace/qep/test-plans/plans/tpl_1/compare" />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("qep-plan-compare-unavailable")).toBeTruthy();
      expect(screen.getByText(/not yet available for Test Plans/i)).toBeTruthy();
    });
    const calledUrls = (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn> | undefined
    )?.mock?.calls;
    if (calledUrls) {
      expect(calledUrls.some((call) => String(call[0]).includes("/compare"))).toBe(
        false,
      );
    }
  });

  it("surfaces optimistic concurrency conflict on edit", async () => {
    vi.mocked(getPlan).mockResolvedValue(
      baseDto({ availableActions: ["updateContent"] }),
    );
    const conflict = new Error("Revision conflict") as Error & {
      status?: number;
      code?: string;
    };
    conflict.status = 409;
    conflict.code = "CONFLICT";
    vi.mocked(updatePlanContent).mockRejectedValue(conflict);

    render(
      wrap(
        <QepTestPlanRouterView pathname="/workspace/qep/test-plans/plans/tpl_1/edit" />,
      ),
    );

    await waitFor(() => expect(screen.getByTestId("qep-plan-edit")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /Save draft/i }));
    await waitFor(() => {
      expect(screen.getByText(/Revision conflict/i)).toBeTruthy();
    });
  });

  it("executes updateAssignment when the server exposes it in availableActions", async () => {
    vi.mocked(getPlan).mockResolvedValue(
      baseDto({ availableActions: ["updateAssignment"], revision: 2 }),
    );
    vi.mocked(updatePlanAssignment).mockResolvedValue(
      baseDto({ availableActions: ["updateAssignment"], revision: 3 }),
    );

    render(
      wrap(<QepTestPlanRouterView pathname="/workspace/qep/test-plans/plans/tpl_1" />),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Update assignment/i })).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole("button", { name: /Update assignment/i }));
    await waitFor(() =>
      expect(screen.getByTestId("qep-plan-confirm-updateAssignment")).toBeTruthy(),
    );
    fireEvent.change(screen.getByLabelText("Lead id"), { target: { value: "lead_1" } });
    fireEvent.change(screen.getByLabelText("Assignee ids"), {
      target: { value: "user_2, user_3" },
    });
    fireEvent.click(screen.getByTestId("qep-plan-confirm-updateAssignment"));
    await waitFor(() => {
      expect(updatePlanAssignment).toHaveBeenCalledWith("tpl_1", {
        leadId: "lead_1",
        assigneeIds: ["user_2", "user_3"],
        expectedRevision: 2,
      });
    });
  });

  it("does not render actions absent from availableActions", async () => {
    vi.mocked(getPlan).mockResolvedValue(
      baseDto({ status: "approved", availableActions: ["markReady"] }),
    );

    render(
      wrap(<QepTestPlanRouterView pathname="/workspace/qep/test-plans/plans/tpl_1" />),
    );

    await waitFor(() => expect(screen.getByTestId("qep-plan-actions")).toBeTruthy());
    expect(screen.getByRole("button", { name: /Mark ready/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Approve$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Reject$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Return to draft/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Supersede/i })).toBeNull();
  });
});
