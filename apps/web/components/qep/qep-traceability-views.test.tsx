import type { QepTraceLinkDto, QepTraceLinkTaxonomyDto } from "@apzhub/qep-contracts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/qep/traceability/trace-links",
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(""),
}));

vi.mock("@/lib/qep/qep-traceability-api", () => ({
  listTraceLinks: vi.fn(),
  getTraceLink: vi.fn(),
  createTraceLink: vi.fn(),
  validateTraceLink: vi.fn(),
  approveTraceLink: vi.fn(),
  retireTraceLink: vi.fn(),
  supersedeTraceLink: vi.fn(),
  updateTraceLinkConfidence: vi.fn(),
  updateTraceLinkAuthority: vi.fn(),
  updateTraceLinkScope: vi.fn(),
  updateTraceLinkRationale: vi.fn(),
  updateTraceLinkMetadata: vi.fn(),
  getTraceLinkHistory: vi.fn(),
  listTraceLinkTaxonomy: vi.fn(),
  listTraceLinksByEndpoint: vi.fn(),
}));

vi.mock("@/lib/qep/qep-api", () => ({
  searchRequirements: vi.fn(),
}));

import {
  approveTraceLink,
  getTraceLink,
  listTraceLinkTaxonomy,
  listTraceLinks,
  validateTraceLink,
} from "@/lib/qep/qep-traceability-api";

import {
  QepTraceLinkDetailView,
  QepTraceLinksListView,
  QepTraceMatrixView,
  QepTraceTaxonomyBrowserView,
} from "./qep-traceability-views";

function wrap(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const BASE_TRACE_LINK = {
  id: "trace_1",
  tenantId: "tenant_1",
  type: "requirement_specified_by",
  lifecycleState: "draft",
  direction: "forward",
  source: { kind: "requirement", artefactId: "req_1", owningDomain: "requirements" },
  target: { kind: "document", artefactId: "doc_1", owningDomain: "documents" },
  strength: "recommended",
  confidence: "asserted",
  origin: "user",
  authority: { kind: "user", actorId: "workbench-user" },
  provenance: { actorId: "workbench-user", correlationId: "corr_1" },
  scope: { kind: "product" },
  context: { immutable: false },
  rationale: "Supports traceability",
  metadata: {},
  revision: 1,
  createdAt: "2026-07-26T10:00:00.000Z",
  createdBy: "user_1",
  updatedAt: "2026-07-26T10:00:00.000Z",
  updatedBy: "user_1",
  correlationId: "corr_1",
  historySummaries: [],
  availableActions: ["validate"],
} satisfies QepTraceLinkDto;

const VALIDATED_TRACE_LINK = {
  ...BASE_TRACE_LINK,
  lifecycleState: "validated",
  availableActions: ["approve"],
} satisfies QepTraceLinkDto;

const RETIRED_TRACE_LINK = {
  ...BASE_TRACE_LINK,
  lifecycleState: "retired",
  availableActions: [],
  retiredAt: "2026-07-26T11:00:00.000Z",
  retiredBy: "user_1",
} satisfies QepTraceLinkDto;

const TAXONOMY: readonly QepTraceLinkTaxonomyDto[] = [
  {
    type: "requirement_specified_by",
    displayName: "Specified by",
    description: "Requirement specified by document",
    family: "specification",
    allowedSourceKinds: ["requirement"],
    allowedTargetKinds: ["document"],
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "mandatory_for_coverage",
    cyclePolicy: "forbidden",
    rationalePolicy: "recommended",
    defaultStrength: "recommended",
    projectionOnly: false,
    allowsSelfLink: false,
  },
];

describe("QepTraceLinksListView", () => {
  beforeEach(() => {
    vi.mocked(listTraceLinks).mockReset();
    vi.mocked(listTraceLinkTaxonomy).mockReset();
    vi.mocked(listTraceLinkTaxonomy).mockResolvedValue(TAXONOMY);
  });

  it("renders trace links with filters and create link", async () => {
    vi.mocked(listTraceLinks).mockResolvedValue({
      items: [BASE_TRACE_LINK],
      total: 1,
      limit: 50,
      offset: 0,
    });

    render(wrap(<QepTraceLinksListView />));
    expect(screen.getByTestId("qep-page")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText("trace_1")).toBeTruthy();
    });
    expect(screen.getByText("requirement_specified_by")).toBeTruthy();
    expect(screen.getByTestId("qep-traceability-create")).toBeTruthy();
    expect(screen.getByTestId("qep-traceability-type-filter")).toBeTruthy();
  });

  it("renders empty state when there are no trace links", async () => {
    vi.mocked(listTraceLinks).mockResolvedValue({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
    });

    render(wrap(<QepTraceLinksListView />));
    await waitFor(() => {
      expect(screen.getByTestId("qep-empty")).toBeTruthy();
    });
  });
});

describe("QepTraceLinkDetailView availableActions", () => {
  beforeEach(() => {
    vi.mocked(getTraceLink).mockReset();
    vi.mocked(validateTraceLink).mockReset();
    vi.mocked(approveTraceLink).mockReset();
  });

  it("shows validate only when that is the sole available action", async () => {
    vi.mocked(getTraceLink).mockResolvedValue(BASE_TRACE_LINK);
    render(wrap(<QepTraceLinkDetailView traceLinkId="trace_1" />));

    await waitFor(() => {
      expect(screen.getByTestId("qep-traceability-validate-open")).toBeTruthy();
    });
    expect(screen.queryByTestId("qep-traceability-approve-open")).toBeNull();
    expect(screen.queryByTestId("qep-traceability-retire-open")).toBeNull();
  });

  it("shows approve when validated and hides validate", async () => {
    vi.mocked(getTraceLink).mockResolvedValue(VALIDATED_TRACE_LINK);
    render(wrap(<QepTraceLinkDetailView traceLinkId="trace_1" />));

    await waitFor(() => {
      expect(screen.getByTestId("qep-traceability-approve-open")).toBeTruthy();
    });
    expect(screen.queryByTestId("qep-traceability-validate-open")).toBeNull();
  });

  it("shows no edit buttons for retired immutable trace links", async () => {
    vi.mocked(getTraceLink).mockResolvedValue(RETIRED_TRACE_LINK);
    render(wrap(<QepTraceLinkDetailView traceLinkId="trace_1" />));

    await waitFor(() => {
      expect(screen.getByTestId("qep-traceability-immutable-banner")).toBeTruthy();
    });
    expect(screen.queryByTestId("qep-traceability-edit-rationale")).toBeNull();
    expect(screen.queryByTestId("qep-traceability-validate-open")).toBeNull();
    expect(screen.getByText(/Read-only — no actions available/i)).toBeTruthy();
  });

  it("calls validate when confirmed", async () => {
    vi.mocked(getTraceLink).mockResolvedValue(BASE_TRACE_LINK);
    vi.mocked(validateTraceLink).mockResolvedValue({
      ...BASE_TRACE_LINK,
      lifecycleState: "validated",
      availableActions: ["approve"],
    });

    render(wrap(<QepTraceLinkDetailView traceLinkId="trace_1" />));

    await waitFor(() => {
      expect(screen.getByTestId("qep-traceability-validate-open")).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId("qep-traceability-validate-open"));
    fireEvent.click(screen.getByTestId("qep-traceability-validate-confirm"));

    await waitFor(() => {
      expect(validateTraceLink).toHaveBeenCalledWith("trace_1");
    });
  });
});

describe("QepTraceMatrixView", () => {
  beforeEach(() => {
    vi.mocked(listTraceLinks).mockReset();
  });

  it("renders empty state when no trace links are returned for the selected kinds", async () => {
    vi.mocked(listTraceLinks).mockResolvedValue({
      items: [],
      total: 0,
      limit: 100,
      offset: 0,
    });

    render(wrap(<QepTraceMatrixView />));

    await waitFor(() => {
      expect(screen.getByTestId("qep-empty")).toBeTruthy();
    });
    expect(screen.queryByTestId("qep-traceability-matrix-table")).toBeNull();
  });
});

describe("QepTraceTaxonomyBrowserView", () => {
  beforeEach(() => {
    vi.mocked(listTraceLinkTaxonomy).mockReset();
  });

  it("renders the trace type taxonomy table", async () => {
    vi.mocked(listTraceLinkTaxonomy).mockResolvedValue(TAXONOMY);

    render(wrap(<QepTraceTaxonomyBrowserView />));

    await waitFor(() => {
      expect(screen.getByText("Specified by")).toBeTruthy();
    });
    expect(screen.getByTestId("qep-table")).toBeTruthy();
  });
});
