import type { EvidenceDto } from "@apzhub/qep-evidence";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
let pathnameValue = "/workspace/qep/evidence/explorer";

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameValue,
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(""),
}));

vi.mock("@/lib/qep/qep-evidence-api", () => ({
  EVIDENCE_ACTION_SLUGS: {
    validateEvidence: "validate",
    classifyEvidence: "classify",
    approveEvidence: "approve",
  },
  resolveEvidenceActionSlug: (action: string) =>
    ({
      validateEvidence: "validate",
      classifyEvidence: "classify",
      approveEvidence: "approve",
    })[action] ?? action,
  isEvidenceLifecycleAction: (action: string) =>
    [
      "validate",
      "validateEvidence",
      "classify",
      "classifyEvidence",
      "approve",
      "approveEvidence",
    ].includes(action),
  listEvidence: vi.fn(),
  getEvidence: vi.fn(),
  performEvidenceAction: vi.fn(),
  captureEvidence: vi.fn(),
  getEvidenceRelationships: vi.fn(),
  getEvidenceProvenance: vi.fn(),
  getEvidenceVersions: vi.fn(),
  getEvidenceAudit: vi.fn(),
  getEvidenceCollection: vi.fn(),
  getEvidenceSet: vi.fn(),
}));

import {
  getEvidence,
  listEvidence,
  performEvidenceAction,
} from "@/lib/qep/qep-evidence-api";
import {
  QEP_EVIDENCE_ROUTES,
  isQepEvidenceExplorerRoute,
  parseQepEvidenceDetailMode,
  parseQepEvidenceRouteId,
} from "@/lib/qep/routes";

import {
  QepEvidenceRouterView,
  getEvidenceActionBarDescriptors,
  toEvidenceActionDescriptor,
} from "./qep-evidence-views";

function wrap(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function baseDto(overrides: Partial<EvidenceDto> = {}): EvidenceDto {
  return {
    id: "ev_1",
    tenantId: "tenant_1",
    projectId: "proj_1",
    workspaceId: "ws_1",
    status: "captured",
    sourceKind: "manual_upload",
    classification: "screenshot",
    mediaType: "image/png",
    byteSize: 1024,
    contentHash: "abc123",
    hashAlgorithm: "sha256",
    verificationState: "unverified",
    sealed: false,
    legalHold: false,
    retentionClass: "standard",
    title: "Login screenshot",
    description: "Captured during test run",
    tags: ["login"],
    version: 1,
    revision: 1,
    ownerId: "workbench-user",
    createdAt: "2026-07-29T00:00:00.000Z",
    updatedAt: "2026-07-29T00:00:00.000Z",
    availableActions: ["validateEvidence", "getProvenance", "getAudit"],
    ...overrides,
  };
}

describe("APZQEP-ENG-110F action bar filtering", () => {
  it("includes only lifecycle actions from availableActions", () => {
    const descriptors = getEvidenceActionBarDescriptors([
      "validateEvidence",
      "getProvenance",
      "getAudit",
      "classifyEvidence",
    ]);
    expect(descriptors.map((d) => d.action)).toEqual([
      "validateEvidence",
      "classifyEvidence",
    ]);
  });

  it("maps action slugs and labels without inventing actions", () => {
    const descriptor = toEvidenceActionDescriptor("validateEvidence");
    expect(descriptor.slug).toBe("validate");
    expect(descriptor.label).toBe("Validate");
  });

  it("never adds actions not present in availableActions", () => {
    const descriptors = getEvidenceActionBarDescriptors(["approveEvidence"]);
    expect(descriptors).toHaveLength(1);
    expect(descriptors[0]?.action).toBe("approveEvidence");
    expect(descriptors.some((d) => d.action === "disposeEvidence")).toBe(false);
  });
});

describe("APZQEP-ENG-110F routing helpers", () => {
  it("maps explorer route", () => {
    expect(isQepEvidenceExplorerRoute(QEP_EVIDENCE_ROUTES.explorer)).toBe(true);
  });

  it("parses detail and sub-modes", () => {
    const id = "ev_demo";
    expect(parseQepEvidenceRouteId(QEP_EVIDENCE_ROUTES.detail(id))).toBe(id);
    expect(parseQepEvidenceDetailMode(QEP_EVIDENCE_ROUTES.provenance(id))).toBe(
      "provenance",
    );
  });
});

describe("APZQEP-ENG-110F Workbench journeys (mocked API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockReset();
    pathnameValue = "/workspace/qep/evidence/explorer";
  });

  it("renders Explorer rows from list API", async () => {
    vi.mocked(listEvidence).mockResolvedValue({
      items: [baseDto()],
      total: 1,
      limit: 25,
      offset: 0,
    });

    render(wrap(<QepEvidenceRouterView pathname="/workspace/qep/evidence/explorer" />));

    await waitFor(() => {
      expect(screen.getByText("Login screenshot")).toBeTruthy();
    });
    expect(screen.getByTestId("qep-evidence-status-filter")).toBeTruthy();
  });

  it("renders the action bar solely from availableActions", async () => {
    vi.mocked(getEvidence).mockResolvedValue(
      baseDto({
        availableActions: ["validateEvidence"],
      }),
    );

    render(
      wrap(<QepEvidenceRouterView pathname="/workspace/qep/evidence/items/ev_1" />),
    );

    await waitFor(() => {
      expect(screen.getByTestId("qep-evidence-actions")).toBeTruthy();
    });
    expect(screen.getByRole("button", { name: /^Validate$/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Dispose$/i })).toBeNull();
  });

  it("shows no-actions state when lifecycle availableActions is empty", async () => {
    vi.mocked(getEvidence).mockResolvedValue(
      baseDto({ availableActions: ["getProvenance", "getAudit"] }),
    );

    render(
      wrap(<QepEvidenceRouterView pathname="/workspace/qep/evidence/items/ev_1" />),
    );

    await waitFor(() => {
      expect(screen.getByTestId("qep-evidence-actions-empty")).toBeTruthy();
    });
  });

  it("executes a simple action via performEvidenceAction", async () => {
    vi.mocked(getEvidence).mockResolvedValue(
      baseDto({ availableActions: ["validateEvidence"] }),
    );
    vi.mocked(performEvidenceAction).mockResolvedValue(
      baseDto({ status: "validated", availableActions: [] }),
    );

    render(
      wrap(<QepEvidenceRouterView pathname="/workspace/qep/evidence/items/ev_1" />),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Validate$/i })).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole("button", { name: /^Validate$/i }));

    await waitFor(() => {
      expect(performEvidenceAction).toHaveBeenCalledWith(
        "ev_1",
        "validate",
        expect.objectContaining({ expectedRevision: 1 }),
      );
    });
  });
});
