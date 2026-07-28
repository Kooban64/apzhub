import type { QepTestSpecificationDto } from "@apzhub/qep-contracts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const replaceMock = vi.fn();
let searchParamsValue = "";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/qep/test-specifications/explorer",
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(searchParamsValue),
}));

vi.mock("@/lib/qep/qep-test-specification-api", () => ({
  listSpecifications: vi.fn(),
  getSpecification: vi.fn(),
  createSpecification: vi.fn(),
  updateDraft: vi.fn(),
  submitForReview: vi.fn(),
  approveSpecification: vi.fn(),
  rejectSpecification: vi.fn(),
  withdrawSpecification: vi.fn(),
  cancelSpecification: vi.fn(),
  retireSpecification: vi.fn(),
  supersedeSpecification: vi.fn(),
  getSpecificationHistory: vi.fn(),
  listSpecificationVersions: vi.fn(),
  listSpecificationRelationships: vi.fn(),
  addSpecificationRelationship: vi.fn(),
  removeSpecificationRelationship: vi.fn(),
}));

vi.mock("@/lib/qep/telemetry", () => ({
  emitQepWorkbenchTelemetry: vi.fn(),
}));

import {
  approveSpecification,
  createSpecification,
  getSpecification,
  listSpecifications,
  rejectSpecification,
  submitForReview,
  supersedeSpecification,
  updateDraft,
  withdrawSpecification,
} from "@/lib/qep/qep-test-specification-api";
import {
  QEP_TEST_SPECIFICATION_ROUTES,
  isQepTestSpecificationsExplorerRoute,
  isQepTestSpecificationsReviewRoute,
  parseQepTestSpecificationDetailMode,
  parseQepTestSpecificationRouteId,
} from "@/lib/qep/routes";

import { QepTestSpecificationRouterView } from "./qep-test-specification-views";

function wrap(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function baseDto(
  overrides: Partial<QepTestSpecificationDto> = {},
): QepTestSpecificationDto {
  return {
    id: "tsp_1",
    tenantId: "tenant_1",
    number: "TS-001",
    title: "Login validation",
    description: "Validate login",
    objective: "Ensure login works",
    scope: "Auth",
    status: "draft",
    version: { major: 1, minor: 0, label: "1.0" },
    type: "functional",
    priority: "medium",
    complexity: "medium",
    classification: "internal",
    owner: "workbench-user",
    author: "workbench-user",
    preconditions: [],
    postconditions: [],
    acceptanceCriteria: ["User can log in"],
    risks: [],
    dependencies: [],
    tags: [],
    isAuthoritative: false,
    metadata: {},
    relationships: [],
    revision: 1,
    createdAt: "2026-07-27T00:00:00.000Z",
    createdBy: "user_1",
    updatedAt: "2026-07-27T00:00:00.000Z",
    updatedBy: "user_1",
    correlationId: "corr_1",
    versionLineage: ["tsp_1"],
    historySummaries: [
      {
        at: "2026-07-27T00:00:00.000Z",
        by: "user_1",
        kind: "created",
        summary: "Created",
      },
    ],
    availableActions: ["updateDraft", "submitForReview", "cancel", "withdraw"],
    ...overrides,
  };
}

describe("APZQEP-ENG-050C routing helpers", () => {
  it("maps explorer and review routes", () => {
    expect(isQepTestSpecificationsExplorerRoute(QEP_TEST_SPECIFICATION_ROUTES.explorer)).toBe(
      true,
    );
    expect(isQepTestSpecificationsReviewRoute(QEP_TEST_SPECIFICATION_ROUTES.review)).toBe(true);
  });

  it("parses detail and secondary modes", () => {
    const id = "tsp_demo";
    expect(parseQepTestSpecificationRouteId(QEP_TEST_SPECIFICATION_ROUTES.detail(id))).toBe(id);
    expect(parseQepTestSpecificationDetailMode(QEP_TEST_SPECIFICATION_ROUTES.history(id))).toBe(
      "history",
    );
    expect(parseQepTestSpecificationDetailMode(QEP_TEST_SPECIFICATION_ROUTES.versions(id))).toBe(
      "versions",
    );
    expect(
      parseQepTestSpecificationDetailMode(QEP_TEST_SPECIFICATION_ROUTES.relationships(id)),
    ).toBe("relationships");
  });
});

describe("APZQEP-ENG-050C Workbench journeys (mocked API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockReset();
    replaceMock.mockReset();
    searchParamsValue = "";
  });

  it("renders Explorer rows from list API", async () => {
    vi.mocked(listSpecifications).mockResolvedValue({
      items: [baseDto()],
      total: 1,
      limit: 50,
      offset: 0,
    });

    render(
      wrap(
        <QepTestSpecificationRouterView pathname="/workspace/qep/test-specifications/explorer" />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("TS-001")).toBeTruthy();
    });
    expect(screen.getByTestId("qep-spec-status-filter")).toBeTruthy();
  });

  it("creates a draft Specification", async () => {
    vi.mocked(createSpecification).mockResolvedValue(baseDto({ id: "tsp_new" }));

    render(
      wrap(<QepTestSpecificationRouterView pathname="/workspace/qep/test-specifications/new" />),
    );

    fireEvent.change(screen.getByLabelText("Number"), { target: { value: "TS-002" } });
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "MFA" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Desc" } });
    fireEvent.change(screen.getByLabelText("Objective"), { target: { value: "Obj" } });
    fireEvent.change(screen.getByLabelText("Scope"), { target: { value: "Scope" } });
    fireEvent.click(screen.getByRole("button", { name: /Create draft/i }));

    await waitFor(() => {
      expect(createSpecification).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith(
        QEP_TEST_SPECIFICATION_ROUTES.detail("tsp_new"),
      );
    });
  });

  it("submits for review only when availableActions includes submitForReview", async () => {
    const dto = baseDto({
      availableActions: ["submitForReview"],
    });
    vi.mocked(getSpecification).mockResolvedValue(dto);
    vi.mocked(submitForReview).mockResolvedValue(
      baseDto({ status: "under_review", availableActions: ["approve", "reject"] }),
    );

    render(
      wrap(
        <QepTestSpecificationRouterView pathname="/workspace/qep/test-specifications/specifications/tsp_1" />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("qep-spec-actions")).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit for review/i }));
    await waitFor(() => {
      expect(screen.getByTestId("qep-spec-action-dialog")).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: /^Submit$/i }));
    await waitFor(() => {
      expect(submitForReview).toHaveBeenCalledWith("tsp_1", expect.any(Object));
    });
  });

  it("approves from under_review when action present", async () => {
    vi.mocked(getSpecification).mockResolvedValue(
      baseDto({
        status: "under_review",
        availableActions: ["approve", "reject"],
      }),
    );
    vi.mocked(approveSpecification).mockResolvedValue(
      baseDto({ status: "approved", availableActions: ["supersede", "retire"] }),
    );

    render(
      wrap(
        <QepTestSpecificationRouterView pathname="/workspace/qep/test-specifications/specifications/tsp_1" />,
      ),
    );

    await waitFor(() => expect(screen.getByRole("button", { name: /^Approve$/i })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /^Approve$/i }));
    await waitFor(() => expect(screen.getByTestId("qep-spec-confirm-approve")).toBeTruthy());
    fireEvent.click(screen.getByTestId("qep-spec-confirm-approve"));
    await waitFor(() => {
      expect(approveSpecification).toHaveBeenCalled();
    });
  });

  it("rejects with required rationale", async () => {
    vi.mocked(getSpecification).mockResolvedValue(
      baseDto({
        status: "under_review",
        availableActions: ["reject"],
      }),
    );
    vi.mocked(rejectSpecification).mockResolvedValue(
      baseDto({ status: "rejected", availableActions: ["withdraw", "cancel"] }),
    );

    render(
      wrap(
        <QepTestSpecificationRouterView pathname="/workspace/qep/test-specifications/specifications/tsp_1" />,
      ),
    );

    await waitFor(() => expect(screen.getByRole("button", { name: /^Reject$/i })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /^Reject$/i }));
    await waitFor(() => expect(screen.getByLabelText(/Rationale/i)).toBeTruthy());
    fireEvent.change(screen.getByLabelText(/Rationale/i), {
      target: { value: "Incomplete criteria" },
    });
    fireEvent.click(screen.getByTestId("qep-spec-confirm-reject"));
    await waitFor(() => {
      expect(rejectSpecification).toHaveBeenCalledWith("tsp_1", {
        reviewComment: "Incomplete criteria",
      });
    });
  });

  it("does not invent returnToDraft for rejected (ADR-0074)", async () => {
    vi.mocked(getSpecification).mockResolvedValue(
      baseDto({
        status: "rejected",
        availableActions: ["withdraw", "cancel"],
      }),
    );

    render(
      wrap(
        <QepTestSpecificationRouterView pathname="/workspace/qep/test-specifications/specifications/tsp_1" />,
      ),
    );

    await waitFor(() => expect(screen.getByTestId("qep-spec-actions")).toBeTruthy());
    expect(screen.queryByRole("button", { name: /return to draft/i })).toBeNull();
    expect(screen.getByRole("button", { name: /Withdraw/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeTruthy();
  });

  it("withdraws when confirmed", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    vi.mocked(getSpecification).mockResolvedValue(
      baseDto({
        status: "rejected",
        availableActions: ["withdraw"],
      }),
    );
    vi.mocked(withdrawSpecification).mockResolvedValue(
      baseDto({ status: "withdrawn", availableActions: [] }),
    );

    render(
      wrap(
        <QepTestSpecificationRouterView pathname="/workspace/qep/test-specifications/specifications/tsp_1" />,
      ),
    );

    await waitFor(() => expect(screen.getByRole("button", { name: /Withdraw/i })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /Withdraw/i }));
    await waitFor(() => {
      expect(withdrawSpecification).toHaveBeenCalledWith("tsp_1");
    });
  });

  it("supersedes approved and navigates to successor", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    vi.mocked(getSpecification).mockResolvedValue(
      baseDto({
        status: "approved",
        isAuthoritative: true,
        availableActions: ["supersede", "retire"],
      }),
    );
    vi.mocked(supersedeSpecification).mockResolvedValue({
      predecessor: baseDto({
        status: "superseded",
        successorSpecificationId: "tsp_2",
        availableActions: [],
      }),
      successor: baseDto({ id: "tsp_2", status: "draft", availableActions: ["updateDraft"] }),
    });

    render(
      wrap(
        <QepTestSpecificationRouterView pathname="/workspace/qep/test-specifications/specifications/tsp_1" />,
      ),
    );

    await waitFor(() => expect(screen.getByRole("button", { name: /Supersede/i })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /Supersede/i }));
    await waitFor(() => {
      expect(supersedeSpecification).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith(QEP_TEST_SPECIFICATION_ROUTES.detail("tsp_2"));
    });
  });

  it("edits draft via updateDraft", async () => {
    vi.mocked(getSpecification).mockResolvedValue(
      baseDto({ availableActions: ["updateDraft"] }),
    );
    vi.mocked(updateDraft).mockResolvedValue(baseDto({ title: "Updated" }));

    render(
      wrap(
        <QepTestSpecificationRouterView pathname="/workspace/qep/test-specifications/specifications/tsp_1/edit" />,
      ),
    );

    await waitFor(() => expect(screen.getByTestId("qep-spec-edit")).toBeTruthy());
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Updated" } });
    fireEvent.click(screen.getByRole("button", { name: /Save draft/i }));
    await waitFor(() => {
      expect(updateDraft).toHaveBeenCalled();
    });
  });

  it("shows forbidden state on 403", async () => {
    const err = new Error("Forbidden") as Error & { status?: number };
    err.status = 403;
    vi.mocked(getSpecification).mockRejectedValue(err);

    render(
      wrap(
        <QepTestSpecificationRouterView pathname="/workspace/qep/test-specifications/specifications/tsp_1" />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText(/do not have permission/i)).toBeTruthy();
    });
  });

  it("compares two versions side by side", async () => {
    searchParamsValue = "with=tsp_2";
    vi.mocked(getSpecification).mockImplementation(async (id: string) => {
      if (id === "tsp_1") {
        return baseDto({
          id: "tsp_1",
          title: "A",
          version: { major: 1, minor: 0, label: "1.0" },
        });
      }
      return baseDto({
        id: "tsp_2",
        title: "B",
        number: "TS-001",
        version: { major: 1, minor: 1, label: "1.1" },
      });
    });

    render(
      wrap(
        <QepTestSpecificationRouterView pathname="/workspace/qep/test-specifications/specifications/tsp_1/compare" />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("qep-spec-compare")).toBeTruthy();
      expect(screen.getByText("A")).toBeTruthy();
      expect(screen.getByText("B")).toBeTruthy();
    });
  });

  it("surfaces optimistic concurrency conflict on edit", async () => {
    vi.mocked(getSpecification).mockResolvedValue(
      baseDto({ availableActions: ["updateDraft"] }),
    );
    const conflict = new Error("Revision conflict") as Error & { status?: number; code?: string };
    conflict.status = 409;
    conflict.code = "CONFLICT";
    vi.mocked(updateDraft).mockRejectedValue(conflict);

    render(
      wrap(
        <QepTestSpecificationRouterView pathname="/workspace/qep/test-specifications/specifications/tsp_1/edit" />,
      ),
    );

    await waitFor(() => expect(screen.getByTestId("qep-spec-edit")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /Save draft/i }));
    await waitFor(() => {
      expect(screen.getByText(/Revision conflict/i)).toBeTruthy();
    });
  });
});
