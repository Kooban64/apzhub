import type { QepVerificationDto } from "@apzhub/qep-contracts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/qep/verification",
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(""),
}));

vi.mock("@/lib/qep/qep-verification-api", () => ({
  listVerifications: vi.fn(),
  getVerification: vi.fn(),
  createVerification: vi.fn(),
  requestVerification: vi.fn(),
  assignVerification: vi.fn(),
  startVerification: vi.fn(),
  completeVerification: vi.fn(),
  rejectVerification: vi.fn(),
  expireVerification: vi.fn(),
  withdrawVerification: vi.fn(),
  cancelVerification: vi.fn(),
  retireVerification: vi.fn(),
  supersedeVerification: vi.fn(),
  updateVerificationMetadata: vi.fn(),
  updateVerificationRationale: vi.fn(),
  updateVerificationPriority: vi.fn(),
  getVerificationHistory: vi.fn(),
}));

vi.mock("@/lib/search/search-api", () => ({
  executeSearchQuery: vi.fn(),
}));

import {
  getVerification,
  getVerificationHistory,
  listVerifications,
  requestVerification,
} from "@/lib/qep/qep-verification-api";
import { executeSearchQuery } from "@/lib/search/search-api";

import {
  QepVerificationDashboardView,
  QepVerificationDetailView,
  QepVerificationExplorerView,
  QepVerificationHistoryView,
  QepVerificationSearchView,
} from "./qep-verification-views";

function wrap(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const BASE: QepVerificationDto = {
  id: "ver_1",
  tenantId: "tenant_1",
  status: "draft",
  subject: {
    kind: "requirement",
    artefactId: "req_1",
    owningDomain: "requirements",
  },
  authority: { kind: "user", actorId: "workbench-user" },
  context: { immutable: false },
  scope: { kind: "product" },
  priority: "medium",
  origin: "user",
  rationale: "Needs verification",
  metadata: {},
  revision: 1,
  createdAt: "2026-07-26T10:00:00.000Z",
  createdBy: "user_1",
  updatedAt: "2026-07-26T10:00:00.000Z",
  updatedBy: "user_1",
  correlationId: "corr_1",
  historySummaries: [
    {
      at: "2026-07-26T10:00:00.000Z",
      by: "user_1",
      kind: "created",
      summary: "Created",
    },
  ],
  availableActions: ["request", "updateRationale", "updatePriority", "updateMetadata"],
};

describe("QepVerificationExplorerView", () => {
  beforeEach(() => {
    vi.mocked(listVerifications).mockReset();
  });

  it("renders explorer rows with filters and create link", async () => {
    vi.mocked(listVerifications).mockResolvedValue({
      items: [BASE],
      total: 1,
      limit: 50,
      offset: 0,
    });

    render(wrap(<QepVerificationExplorerView />));
    expect(screen.getByTestId("qep-page")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText("ver_1")).toBeTruthy();
    });
    expect(screen.getByTestId("qep-verification-create")).toBeTruthy();
    expect(screen.getByTestId("qep-verification-status-filter")).toBeTruthy();
  });

  it("renders empty state", async () => {
    vi.mocked(listVerifications).mockResolvedValue({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
    });
    render(wrap(<QepVerificationExplorerView />));
    await waitFor(() => {
      expect(screen.getByTestId("qep-empty")).toBeTruthy();
    });
  });

  it("renders my queue presentation", async () => {
    vi.mocked(listVerifications).mockResolvedValue({
      items: [
        {
          ...BASE,
          status: "assigned",
          assignedTo: "workbench-user",
          availableActions: ["start"],
        },
      ],
      total: 1,
      limit: 50,
      offset: 0,
    });
    render(
      wrap(
        <QepVerificationExplorerView title="My Verification Queue" queue="my_work" />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByTestId("qep-verification-queue-tabs")).toBeTruthy();
    });
  });
});

describe("QepVerificationDetailView availableActions", () => {
  beforeEach(() => {
    vi.mocked(getVerification).mockReset();
    vi.mocked(getVerificationHistory).mockReset();
    vi.mocked(requestVerification).mockReset();
    vi.mocked(getVerificationHistory).mockResolvedValue(BASE.historySummaries);
  });

  it("renders only server availableActions", async () => {
    vi.mocked(getVerification).mockResolvedValue(BASE);
    render(wrap(<QepVerificationDetailView verificationId="ver_1" />));
    await waitFor(() => {
      expect(screen.getByTestId("qep-verification-request-open")).toBeTruthy();
    });
    expect(screen.queryByTestId("qep-verification-complete-open")).toBeNull();
    expect(screen.getByTestId("qep-verification-timeline")).toBeTruthy();
  });

  it("confirms request via decision dialog", async () => {
    vi.mocked(getVerification).mockResolvedValue(BASE);
    vi.mocked(requestVerification).mockResolvedValue({
      ...BASE,
      status: "requested",
      availableActions: ["assign", "start"],
    });
    render(wrap(<QepVerificationDetailView verificationId="ver_1" />));
    await waitFor(() => {
      expect(screen.getByTestId("qep-verification-request-open")).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId("qep-verification-request-open"));
    expect(screen.getByTestId("qep-verification-decision-dialog")).toBeTruthy();
    fireEvent.click(screen.getByTestId("qep-verification-decision-confirm"));
    await waitFor(() => {
      expect(requestVerification).toHaveBeenCalledWith("ver_1");
    });
  });

  it("shows read-only when availableActions empty", async () => {
    vi.mocked(getVerification).mockResolvedValue({
      ...BASE,
      status: "retired",
      availableActions: [],
      retiredAt: "2026-07-26T12:00:00.000Z",
    });
    render(wrap(<QepVerificationDetailView verificationId="ver_1" />));
    await waitFor(() => {
      expect(screen.getByText(/Read-only/i)).toBeTruthy();
    });
  });
});

describe("QepVerificationDashboardView", () => {
  beforeEach(() => {
    vi.mocked(listVerifications).mockReset();
    vi.mocked(listVerifications).mockResolvedValue({
      items: [BASE],
      total: 1,
      limit: 20,
      offset: 0,
    });
  });

  it("renders dashboard widgets", async () => {
    render(wrap(<QepVerificationDashboardView />));
    await waitFor(() => {
      expect(screen.getByTestId("qep-verification-dashboard")).toBeTruthy();
    });
    expect(screen.getByTestId("qep-verification-widget-my")).toBeTruthy();
    expect(screen.getByTestId("qep-verification-widget-pending")).toBeTruthy();
  });
});

describe("QepVerificationSearchView", () => {
  beforeEach(() => {
    vi.mocked(executeSearchQuery).mockReset();
    vi.mocked(listVerifications).mockReset();
  });

  it("searches via platform search then renders hits", async () => {
    vi.mocked(executeSearchQuery).mockResolvedValue({
      hits: [
        {
          id: "hit_1",
          title: "requirement verification",
          entityType: "verification_record",
          entityId: "ver_1",
          productId: "qep",
          highlightSnippets: [],
          navigationTarget: "/workspace/qep/verification/ver_1",
        },
      ],
      total: 1,
    } as never);

    render(wrap(<QepVerificationSearchView />));
    fireEvent.change(screen.getByTestId("qep-verification-search-input"), {
      target: { value: "requirement" },
    });
    fireEvent.click(screen.getByTestId("qep-verification-search-submit"));
    await waitFor(() => {
      expect(screen.getByTestId("qep-verification-search-results")).toBeTruthy();
    });
  });
});

describe("QepVerificationHistoryView", () => {
  it("prompts when no id selected", () => {
    render(wrap(<QepVerificationHistoryView />));
    expect(screen.getByTestId("qep-empty")).toBeTruthy();
  });

  it("renders history entries", async () => {
    vi.mocked(getVerificationHistory).mockResolvedValue(BASE.historySummaries);
    render(wrap(<QepVerificationHistoryView verificationId="ver_1" />));
    await waitFor(() => {
      expect(screen.getByTestId("qep-verification-history")).toBeTruthy();
    });
  });
});
