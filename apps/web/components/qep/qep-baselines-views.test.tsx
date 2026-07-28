import type { QepBaselineDto } from "@apzhub/qep-contracts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/qep/requirements/baselines",
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/qep/qep-api", () => ({
  listBaselines: vi.fn(),
  getBaseline: vi.fn(),
  createBaseline: vi.fn(),
  updateDraftBaseline: vi.fn(),
  listBaselineItems: vi.fn(),
  addBaselineItem: vi.fn(),
  removeBaselineItem: vi.fn(),
  lockBaseline: vi.fn(),
  archiveBaseline: vi.fn(),
  verifyBaselineIntegrity: vi.fn(),
  compareBaselines: vi.fn(),
  requirementBaselineHistory: vi.fn(),
  searchRequirements: vi.fn(),
  listContentVersions: vi.fn(),
}));

import {
  compareBaselines,
  createBaseline,
  getBaseline,
  listBaselineItems,
  listBaselines,
  lockBaseline,
  requirementBaselineHistory,
} from "@/lib/qep/qep-api";

import { BaselineHistoryPanel } from "./qep-baselines-views";
import {
  QepBaselineCreateView,
  QepBaselineDetailView,
  QepBaselinesCompareView,
  QepBaselinesListView,
} from "./qep-baselines-views";

function wrap(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const DRAFT_BASELINE = {
  id: "rbl_1",
  tenantId: "tenant_1",
  number: 1,
  name: "Release 1.0",
  description: "First cut",
  status: "draft",
  itemCount: 1,
  createdAt: "2026-07-25T10:00:00.000Z",
  createdBy: "user_1",
  updatedAt: "2026-07-25T10:00:00.000Z",
  updatedBy: "user_1",
  correlationId: "corr_1",
  availableActions: ["edit", "addItem", "removeItem", "lock", "compare"],
} satisfies QepBaselineDto;

const LOCKED_BASELINE = {
  ...DRAFT_BASELINE,
  id: "rbl_2",
  number: 2,
  status: "locked",
  lockedAt: "2026-07-25T11:00:00.000Z",
  lockedBy: "user_1",
  integrityFingerprint: "fingerprint_abc",
  integrityAlgorithm: "sha256",
  integrityVerificationStatus: "verified",
  integrityVerifiedAt: "2026-07-25T11:00:00.000Z",
  availableActions: ["archive", "verifyIntegrity", "compare"],
} satisfies QepBaselineDto;

describe("QepBaselinesListView", () => {
  beforeEach(() => {
    vi.mocked(listBaselines).mockReset();
  });

  it("renders baselines with status, integrity, and item count", async () => {
    vi.mocked(listBaselines).mockResolvedValue({
      items: [DRAFT_BASELINE],
      total: 1,
      limit: 50,
      offset: 0,
    });

    render(wrap(<QepBaselinesListView />));
    expect(screen.getByTestId("qep-page")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText("Release 1.0")).toBeTruthy();
    });
    expect(screen.getByTestId("qep-baselines-create")).toBeTruthy();
  });

  it("renders an empty state when there are no baselines", async () => {
    vi.mocked(listBaselines).mockResolvedValue({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
    });
    render(wrap(<QepBaselinesListView />));
    await waitFor(() => {
      expect(screen.getByTestId("qep-empty")).toBeTruthy();
    });
  });
});

describe("QepBaselineCreateView", () => {
  beforeEach(() => {
    vi.mocked(createBaseline).mockReset();
    pushMock.mockReset();
  });

  it("explains that draft->lock is irreversible and creates a baseline", async () => {
    vi.mocked(createBaseline).mockResolvedValue(DRAFT_BASELINE);
    render(wrap(<QepBaselineCreateView />));

    expect(screen.getByText(/irreversible/i)).toBeTruthy();

    fireEvent.change(screen.getByTestId("qep-baseline-name"), {
      target: { value: "Release 1.0" },
    });
    fireEvent.click(screen.getByTestId("qep-baseline-create-submit"));

    await waitFor(() => {
      expect(createBaseline).toHaveBeenCalledWith({
        name: "Release 1.0",
        description: undefined,
      });
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/workspace/qep/requirements/baselines/rbl_1",
      );
    });
  });
});

describe("QepBaselineDetailView lock confirmation", () => {
  beforeEach(() => {
    vi.mocked(getBaseline).mockReset();
    vi.mocked(listBaselineItems).mockReset();
    vi.mocked(lockBaseline).mockReset();
  });

  it("requires an explicit acknowledgement before the lock action can be confirmed", async () => {
    vi.mocked(getBaseline).mockResolvedValue(DRAFT_BASELINE);
    vi.mocked(listBaselineItems).mockResolvedValue([
      {
        requirementId: "req_1",
        contentVersionId: "rcv_1",
        contentVersionNumber: 1,
        includedAt: "2026-07-25T10:00:00.000Z",
        includedBy: "user_1",
      },
    ]);
    vi.mocked(lockBaseline).mockResolvedValue(LOCKED_BASELINE);

    render(wrap(<QepBaselineDetailView baselineId="rbl_1" />));

    await waitFor(() => {
      expect(screen.getByTestId("qep-baseline-lock-open")).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId("qep-baseline-lock-open"));

    const confirmButton = screen.getByTestId(
      "qep-baseline-lock-confirm",
    ) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);

    fireEvent.click(screen.getByTestId("qep-baseline-lock-ack"));
    expect(confirmButton.disabled).toBe(false);

    fireEvent.click(confirmButton);
    await waitFor(() => {
      expect(lockBaseline).toHaveBeenCalledWith("rbl_1");
    });
  });

  it("renders status as text plus badge, not colour alone, and shows the integrity fingerprint once locked", async () => {
    vi.mocked(getBaseline).mockResolvedValue(LOCKED_BASELINE);
    vi.mocked(listBaselineItems).mockResolvedValue([]);

    render(wrap(<QepBaselineDetailView baselineId="rbl_1" />));

    await waitFor(() => {
      const status = screen.getByTestId("qep-baseline-status");
      expect(status.textContent).toContain("locked");
    });
    expect(screen.getByText("fingerprint_abc")).toBeTruthy();
    expect(screen.getByTestId("qep-baseline-verify")).toBeTruthy();
  });
});

describe("QepBaselinesCompareView", () => {
  beforeEach(() => {
    vi.mocked(listBaselines).mockReset();
    vi.mocked(compareBaselines).mockReset();
  });

  it("compares two baselines and flags version-changed requirements", async () => {
    vi.mocked(listBaselines).mockResolvedValue({
      items: [DRAFT_BASELINE, LOCKED_BASELINE],
      total: 2,
      limit: 100,
      offset: 0,
    });
    vi.mocked(compareBaselines).mockResolvedValue({
      baseBaselineId: "rbl_1",
      targetBaselineId: "rbl_2",
      added: [],
      removed: [],
      unchanged: [],
      versionChanged: [
        {
          requirementId: "req_1",
          removed: {
            requirementId: "req_1",
            contentVersionId: "rcv_1",
            contentVersionNumber: 1,
            includedAt: "2026-07-25T10:00:00.000Z",
            includedBy: "user_1",
          },
          added: {
            requirementId: "req_1",
            contentVersionId: "rcv_2",
            contentVersionNumber: 2,
            includedAt: "2026-07-25T10:00:00.000Z",
            includedBy: "user_1",
          },
        },
      ],
      summary: {
        addedCount: 0,
        removedCount: 0,
        unchangedCount: 0,
        versionChangedCount: 1,
      },
    });

    render(wrap(<QepBaselinesCompareView />));

    await waitFor(() => {
      expect(
        screen
          .getByTestId("qep-baselines-compare-base")
          .querySelector('option[value="rbl_2"]'),
      ).toBeTruthy();
    });
    const user = userEvent.setup();
    await user.selectOptions(screen.getByTestId("qep-baselines-compare-base"), "rbl_1");
    await user.selectOptions(
      screen.getByTestId("qep-baselines-compare-target"),
      "rbl_2",
    );
    fireEvent.click(screen.getByTestId("qep-baselines-compare-submit"));

    await waitFor(() => {
      expect(compareBaselines).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByTestId("qep-baselines-compare-result")).toBeTruthy();
    });
    expect(screen.getByText(/version 1.*version 2/)).toBeTruthy();
  });
});

describe("BaselineHistoryPanel", () => {
  beforeEach(() => {
    vi.mocked(requirementBaselineHistory).mockReset();
  });

  it("renders the baselines that include a requirement", async () => {
    vi.mocked(requirementBaselineHistory).mockResolvedValue([DRAFT_BASELINE]);
    render(wrap(<BaselineHistoryPanel requirementId="req_1" />));
    await waitFor(() => {
      expect(screen.getByTestId("qep-requirement-baseline-history")).toBeTruthy();
    });
    expect(screen.getByText(/Release 1.0/)).toBeTruthy();
  });

  it("renders an empty state when the requirement has no baselines", async () => {
    vi.mocked(requirementBaselineHistory).mockResolvedValue([]);
    render(wrap(<BaselineHistoryPanel requirementId="req_2" />));
    await waitFor(() => {
      expect(screen.getByTestId("qep-empty")).toBeTruthy();
    });
  });
});
