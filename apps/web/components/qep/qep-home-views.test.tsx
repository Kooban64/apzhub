import type { DefectNode } from "@apzhub/qep-defects";
import type { TestExecutionDto } from "@apzhub/qep-test-execution";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/auth", () => ({
  useSession: () => ({
    data: { user: { id: "user_1", name: "QEP Master", email: "qep@example.com" } },
  }),
}));

vi.mock("@/lib/qep/qep-defects-api", () => ({
  listDefects: vi.fn(),
}));

vi.mock("@/lib/qep/qep-test-execution-api", () => ({
  listAssignedExecutions: vi.fn(),
}));

vi.mock("@/lib/qep/qep-enterprise-requirements-api", () => ({
  getCoverageDashboard: vi.fn(),
}));

import { listDefects } from "@/lib/qep/qep-defects-api";
import { getCoverageDashboard } from "@/lib/qep/qep-enterprise-requirements-api";
import { listAssignedExecutions } from "@/lib/qep/qep-test-execution-api";

import { QepHomeRouterView } from "./qep-home-views";
import {
  QepApplicationProvider,
  useQepApplicationContext,
} from "@/lib/qep/qep-application-context";
import { useEffect } from "react";

function SeedApplications({
  apps,
}: {
  readonly apps: readonly {
    readonly id: string;
    readonly name: string;
    readonly projectRefs?: readonly string[];
  }[];
}) {
  const { setApplications } = useQepApplicationContext();
  useEffect(() => {
    setApplications(apps);
  }, [apps, setApplications]);
  return null;
}

function wrap(
  children: ReactNode,
  apps?: readonly {
    readonly id: string;
    readonly name: string;
    readonly projectRefs?: readonly string[];
  }[],
) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <QepApplicationProvider>
        {apps ? <SeedApplications apps={apps} /> : null}
        {children}
      </QepApplicationProvider>
    </QueryClientProvider>
  );
}

function defect(overrides: Partial<DefectNode> = {}): DefectNode {
  return {
    defectId: "DEF-901",
    tenantId: "tenant_a",
    title: "Login fails on submit",
    description: "Form posts and returns 500",
    status: "new",
    severity: "critical",
    priority: "p0",
    reporterId: "user_2",
    assigneeId: "user_1",
    evidenceRefs: [],
    relationships: [],
    tags: [],
    createdAt: "2026-08-18T10:00:00.000Z",
    createdBy: "user_2",
    updatedAt: "2026-08-18T12:00:00.000Z",
    updatedBy: "user_1",
    revision: 1,
    customMetadata: {},
    ...overrides,
  };
}

function execution(overrides: Partial<TestExecutionDto> = {}): TestExecutionDto {
  return {
    id: "exec_1",
    executionNumber: "TE-001",
    tenantId: "tenant_a",
    projectId: "proj_1",
    workspaceId: "ws_1",
    status: "assigned",
    mode: "manual",
    outcome: null,
    revision: 1,
    assignment: { ownerId: "user_1", executorId: "user_1" },
    manifest: null,
    steps: [],
    observations: [],
    evidenceReferences: [],
    review: null,
    createdAt: "2026-08-18T10:00:00.000Z",
    createdBy: "user_2",
    updatedAt: "2026-08-18T11:00:00.000Z",
    updatedBy: "user_1",
    availableActions: [],
    ...overrides,
  };
}

describe("Quality Command Centre", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listDefects).mockImplementation(async (params) => {
      if (params?.severity === "critical") {
        return { items: [defect()] };
      }
      if (params?.status === "ready_for_retest") {
        return { items: [defect({ defectId: "DEF-902", status: "ready_for_retest" })] };
      }
      if (params?.assigneeId === "user_1") {
        return { items: [defect({ defectId: "DEF-910", status: "assigned" })] };
      }
      return {
        items: [defect(), defect({ defectId: "DEF-902", status: "ready_for_retest" })],
      };
    });
    vi.mocked(listAssignedExecutions).mockResolvedValue({ items: [execution()] });
    vi.mocked(getCoverageDashboard).mockResolvedValue({
      items: [],
      summary: { total: 10, uncovered: 3, highRiskGaps: 1, averageCoverage: 0.7 },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).includes("/api/v1/qep/audit")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              data: {
                items: [
                  {
                    auditId: "aud_1",
                    action: "defect.updated",
                    createdAt: "2026-08-18T12:00:00.000Z",
                    detail: "DEF-901",
                  },
                ],
              },
            }),
          };
        }
        return { ok: false, status: 404, json: async () => ({}) };
      }),
    );
  });

  it("renders attention from real defects and assigned work, never a release score", async () => {
    render(wrap(<QepHomeRouterView />));

    expect(await screen.findByTestId("qep-command-centre")).toBeTruthy();
    expect(screen.getByText("Quality Command Centre")).toBeTruthy();
    expect(screen.getAllByText(/Login fails on submit/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3 required check/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("TE-001").length).toBeGreaterThan(0);
    expect(screen.getAllByText("defect.updated · DEF-901").length).toBeGreaterThan(0);

    expect(screen.queryByText(/READY/)).toBeNull();
    expect(screen.queryByText(/AT RISK/)).toBeNull();
    expect(screen.queryByText(/NOT READY/)).toBeNull();
    expect(screen.queryByText(/qep-home-verdict/)).toBeNull();
    expect(screen.queryByText(/averageCoverage/)).toBeNull();
  });

  it("omits coverage when the dashboard cannot be read", async () => {
    vi.mocked(getCoverageDashboard).mockRejectedValue(new Error("forbidden"));
    render(wrap(<QepHomeRouterView />));
    expect(
      (await screen.findAllByTestId("qep-cc-coverage-unavailable")).length,
    ).toBeGreaterThan(0);
  });

  it("omits infrastructure audit noise from recent activity", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).includes("/api/v1/qep/audit")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              data: {
                items: [
                  {
                    auditId: "aud_noise",
                    action: "bridge.security_assurance.read",
                    createdAt: "2026-08-18T12:00:00.000Z",
                    detail: "unavailable:none",
                  },
                ],
              },
            }),
          };
        }
        return { ok: false, status: 404, json: async () => ({}) };
      }),
    );
    render(wrap(<QepHomeRouterView />));
    expect((await screen.findAllByTestId("qep-cc-activity")).length).toBeGreaterThan(0);
    expect(screen.queryByText(/unavailable:none/)).toBeNull();
    expect(screen.queryByText(/bridge.security_assurance/)).toBeNull();
  });

  it("does not attribute unbound assigned work to the selected Application", async () => {
    vi.mocked(listDefects).mockImplementation(async (params) => {
      if (params?.severity === "critical") {
        return { items: [defect({ projectId: "default" })] };
      }
      if (params?.status === "ready_for_retest") {
        return { items: [] };
      }
      if (params?.assigneeId === "user_1") {
        return {
          items: [
            defect({ defectId: "DEF-910", status: "assigned", projectId: "default" }),
          ],
        };
      }
      return { items: [defect({ projectId: "default" })] };
    });
    vi.mocked(listAssignedExecutions).mockResolvedValue({ items: [] });
    render(
      wrap(<QepHomeRouterView />, [
        { id: "qapp-1", name: "Payments", projectRefs: ["qapp-1", "PAY"] },
      ]),
    );
    expect(await screen.findByTestId("qep-command-centre")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId("qep-cc-application").textContent).toContain(
        "Payments",
      );
    });
    expect(screen.getAllByText("Unbound").length).toBeGreaterThan(0);
    expect(screen.getByTestId("qep-cc-my-work").textContent).toContain("DEF-910");
  });

  it("shows professional empty language instead of zero metric cards", async () => {
    vi.mocked(listDefects).mockResolvedValue({ items: [] });
    vi.mocked(listAssignedExecutions).mockResolvedValue({ items: [] });
    vi.mocked(getCoverageDashboard).mockResolvedValue({
      items: [],
      summary: { total: 0, uncovered: 0, highRiskGaps: 0, averageCoverage: 0 },
    });
    render(wrap(<QepHomeRouterView />));
    expect(
      (await screen.findAllByTestId("qep-cc-attention-empty")).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("No quality items currently require your attention.").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("No quality work is currently assigned to you.").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Critical\s+0/)).toBeNull();
    expect(screen.queryByText(/Retests\s+0/)).toBeNull();
    expect(screen.getAllByText("None detected").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0);
  });
});
