import type { QepRelationshipDto, QepRequirementDto } from "@apzhub/qep-contracts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/qep/requirements/relationships",
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("source=req_1"),
}));

vi.mock("@/lib/qep/qep-api", () => ({
  listRelationships: vi.fn(),
  getRelationship: vi.fn(),
  createRelationship: vi.fn(),
  updateRelationshipProfile: vi.fn(),
  activateRelationship: vi.fn(),
  deprecateRelationship: vi.fn(),
  retireRelationship: vi.fn(),
  supersedeRelationship: vi.fn(),
  updateRelationshipRationale: vi.fn(),
  updateRelationshipStrength: vi.fn(),
  updateRelationshipClassification: vi.fn(),
  updateRelationshipCriticality: vi.fn(),
  updateRelationshipScope: vi.fn(),
  listRelationshipTaxonomy: vi.fn(),
  listRelationshipsByRequirement: vi.fn(),
  listRelationshipConflicts: vi.fn(),
  searchRequirements: vi.fn(),
  listContentVersions: vi.fn(),
}));

import {
  activateRelationship,
  createRelationship,
  getRelationship,
  listRelationshipTaxonomy,
  listRelationships,
  listRelationshipsByRequirement,
  searchRequirements,
  listContentVersions,
} from "@/lib/qep/qep-api";

import {
  QepRelationshipCreateView,
  QepRelationshipDetailView,
  QepRequirementRelationshipsPanel,
  QepRelationshipsListView,
} from "./qep-relationships-views";

function wrap(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const BASE_RELATIONSHIP = {
  id: "rrl_1",
  tenantId: "tenant_1",
  type: "depends_on",
  lifecycleState: "draft",
  source: { mode: "requirement", requirementId: "req_1" },
  target: { mode: "requirement", requirementId: "req_2" },
  strength: "mandatory",
  criticality: "high",
  classification: "structural",
  scope: { kind: "product" },
  rationale: "Supports traceability",
  revision: 1,
  createdAt: "2026-07-26T10:00:00.000Z",
  createdBy: "user_1",
  updatedAt: "2026-07-26T10:00:00.000Z",
  updatedBy: "user_1",
  correlationId: "corr_1",
  historySummaries: [],
  availableActions: ["activate"],
} satisfies QepRelationshipDto;

const RETIRED_RELATIONSHIP = {
  ...BASE_RELATIONSHIP,
  lifecycleState: "retired",
  availableActions: [],
  retiredAt: "2026-07-26T11:00:00.000Z",
  retiredBy: "user_1",
} satisfies QepRelationshipDto;

const TAXONOMY = [
  {
    type: "depends_on",
    displayName: "Depends on",
    description: "Source depends on target",
    symmetric: false,
    inverseLabel: "dependency_of",
    cyclePolicy: "warn",
    rationalePolicy: "recommended",
    defaultStrength: "recommended",
    certificationRelevant: false,
    baselineProjectionDefault: "include",
    strictTraceabilityDefault: false,
    highlightInTraceability: true,
  },
];

describe("QepRelationshipsListView", () => {
  beforeEach(() => {
    vi.mocked(listRelationships).mockReset();
    vi.mocked(listRelationshipTaxonomy).mockReset();
    vi.mocked(listRelationshipTaxonomy).mockResolvedValue(TAXONOMY);
  });

  it("renders relationships with filters and create link", async () => {
    vi.mocked(listRelationships).mockResolvedValue({
      items: [BASE_RELATIONSHIP],
      total: 1,
      limit: 50,
      offset: 0,
    });

    render(wrap(<QepRelationshipsListView />));
    expect(screen.getByTestId("qep-page")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText("depends_on")).toBeTruthy();
    });
    expect(screen.getByTestId("qep-relationships-create")).toBeTruthy();
    expect(screen.getByTestId("qep-relationships-type-filter")).toBeTruthy();
  });
});

describe("QepRelationshipCreateView", () => {
  beforeEach(() => {
    vi.mocked(createRelationship).mockReset();
    vi.mocked(listRelationshipTaxonomy).mockReset();
    vi.mocked(listRelationshipTaxonomy).mockResolvedValue(TAXONOMY);
    vi.mocked(listContentVersions).mockResolvedValue({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
    });
    pushMock.mockReset();
  });

  it("submits the create form and navigates to detail", async () => {
    const user = userEvent.setup();
    vi.mocked(searchRequirements).mockResolvedValue({
      items: [
        {
          id: "req_2",
          key: "REQ-2",
          title: "Target requirement",
          projectId: "default",
          type: "functional",
          status: "draft",
          priority: "medium",
          createdAt: "2026-07-26T10:00:00.000Z",
          updatedAt: "2026-07-26T10:00:00.000Z",
          revision: 1,
        } as QepRequirementDto,
      ],
      total: 1,
      limit: 50,
      offset: 0,
    });
    vi.mocked(createRelationship).mockResolvedValue(BASE_RELATIONSHIP);
    render(wrap(<QepRelationshipCreateView />));

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Depends on" })).toBeTruthy();
    });
    await user.selectOptions(
      screen.getByTestId("qep-relationships-type"),
      "depends_on",
    );

    await user.type(screen.getByTestId("qep-relationships-target-search"), "REQ-2");

    await waitFor(() => {
      expect(screen.getByTestId("qep-relationships-target-pick-req_2")).toBeTruthy();
    });
    await user.click(screen.getByTestId("qep-relationships-target-pick-req_2"));

    const submitButton = screen.getByTestId("qep-relationships-create-submit");
    await waitFor(() => {
      expect((submitButton as HTMLButtonElement).disabled).toBe(false);
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(createRelationship).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/workspace/qep/requirements/relationships/rrl_1",
      );
    });
  });
});

describe("QepRelationshipDetailView availableActions", () => {
  beforeEach(() => {
    vi.mocked(getRelationship).mockReset();
  });

  it("shows activate only when that is the sole available action", async () => {
    vi.mocked(getRelationship).mockResolvedValue(BASE_RELATIONSHIP);
    render(wrap(<QepRelationshipDetailView relationshipId="rrl_1" />));

    await waitFor(() => {
      expect(screen.getByTestId("qep-relationships-activate-open")).toBeTruthy();
    });
    expect(screen.queryByTestId("qep-relationships-deprecate-open")).toBeNull();
  });

  it("shows no edit buttons for retired immutable relationships", async () => {
    vi.mocked(getRelationship).mockResolvedValue(RETIRED_RELATIONSHIP);
    render(wrap(<QepRelationshipDetailView relationshipId="rrl_1" />));

    await waitFor(() => {
      expect(screen.getByTestId("qep-relationships-immutable-banner")).toBeTruthy();
    });
    expect(screen.queryByTestId("qep-relationships-edit-rationale")).toBeNull();
    expect(screen.queryByTestId("qep-relationships-activate-open")).toBeNull();
  });

  it("renders read-only when availableActions is empty", async () => {
    vi.mocked(getRelationship).mockResolvedValue({
      ...BASE_RELATIONSHIP,
      lifecycleState: "active",
      availableActions: [],
    });
    render(wrap(<QepRelationshipDetailView relationshipId="rrl_1" />));

    await waitFor(() => {
      expect(screen.getByText(/Read-only — no actions available/i)).toBeTruthy();
    });
    expect(screen.queryByTestId("qep-relationships-activate-open")).toBeNull();
    expect(screen.queryByTestId("qep-relationships-deprecate-open")).toBeNull();
  });
});

describe("QepRequirementRelationshipsPanel", () => {
  beforeEach(() => {
    vi.mocked(listRelationshipsByRequirement).mockReset();
  });

  it("shows inbound and outbound counts", async () => {
    vi.mocked(listRelationshipsByRequirement).mockResolvedValue([
      BASE_RELATIONSHIP,
      {
        ...BASE_RELATIONSHIP,
        id: "rrl_2",
        type: "conflicts_with",
        source: { mode: "requirement", requirementId: "req_3" },
        target: { mode: "requirement", requirementId: "req_1" },
      },
    ]);
    render(wrap(<QepRequirementRelationshipsPanel requirementId="req_1" />));

    await waitFor(() => {
      expect(screen.getByTestId("qep-requirement-relationships-panel")).toBeTruthy();
    });
    const panel = screen.getByTestId("qep-requirement-relationships-panel");
    expect(panel.textContent).toMatch(/1.*outbound/i);
    expect(panel.textContent).toMatch(/1.*inbound/i);
    expect(panel.textContent).toMatch(/1 conflict/i);
  });
});

describe("QepRelationshipDetailView lifecycle", () => {
  beforeEach(() => {
    vi.mocked(getRelationship).mockReset();
    vi.mocked(activateRelationship).mockReset();
  });

  it("calls activate when confirmed", async () => {
    vi.mocked(getRelationship).mockResolvedValue(BASE_RELATIONSHIP);
    vi.mocked(activateRelationship).mockResolvedValue({
      ...BASE_RELATIONSHIP,
      lifecycleState: "active",
      availableActions: ["deprecate"],
    });

    render(wrap(<QepRelationshipDetailView relationshipId="rrl_1" />));

    await waitFor(() => {
      expect(screen.getByTestId("qep-relationships-activate-open")).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId("qep-relationships-activate-open"));
    fireEvent.click(screen.getByTestId("qep-relationships-activate-confirm"));

    await waitFor(() => {
      expect(activateRelationship).toHaveBeenCalledWith("rrl_1");
    });
  });
});
