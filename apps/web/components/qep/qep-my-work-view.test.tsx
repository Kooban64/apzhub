import type { DefectNode } from "@apzhub/qep-defects";
import type { TestExecutionDto } from "@apzhub/qep-test-execution";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

import { listDefects } from "@/lib/qep/qep-defects-api";
import { listAssignedExecutions } from "@/lib/qep/qep-test-execution-api";
import {
  WorkbenchInspectorProvider,
  useWorkbenchInspector,
} from "@/lib/workbench/workbench-inspector";

import { QepMyWorkView } from "./qep-my-work-view";

function InspectorProbe() {
  const inspector = useWorkbenchInspector();
  return <>{inspector.selection?.content}</>;
}

function wrap(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <WorkbenchInspectorProvider>
        {children}
        <InspectorProbe />
      </WorkbenchInspectorProvider>
    </QueryClientProvider>
  );
}

function defect(overrides: Partial<DefectNode> = {}): DefectNode {
  return {
    defectId: "DEF-901",
    tenantId: "tenant_a",
    projectId: "proj_pay",
    title: "Checkout tax rounding",
    description: "Tax off by one cent",
    status: "ready_for_retest",
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
    projectId: "proj_pay",
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
    createdAt: "2026-08-18T09:00:00.000Z",
    createdBy: "user_2",
    updatedAt: "2026-08-18T11:00:00.000Z",
    updatedBy: "user_1",
    availableActions: [],
    ...overrides,
  };
}

describe("QepMyWorkView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAssignedExecutions).mockResolvedValue({ items: [execution()] });
    vi.mocked(listDefects).mockImplementation(async (params) => {
      expect(params?.assigneeId).toBe("user_1");
      return { items: [defect()] };
    });
  });

  it("lists assigned executions and defects, not created-by ownership", async () => {
    render(wrap(<QepMyWorkView />));
    expect(await screen.findByTestId("qep-my-work")).toBeTruthy();
    expect(screen.getAllByText("TE-001").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Checkout tax rounding").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DEF-901").length).toBeGreaterThan(0);
    expect(listAssignedExecutions).toHaveBeenCalled();
    expect(listDefects).toHaveBeenCalledWith(
      expect.objectContaining({ assigneeId: "user_1" }),
    );
  });

  it("opens a compact inspector on row select", async () => {
    render(wrap(<QepMyWorkView />));
    const row = await screen.findByTestId("qep-my-work-row-defect:DEF-901");
    fireEvent.click(row);
    await waitFor(() => {
      expect(screen.getByTestId("qep-my-work-inspector")).toBeTruthy();
    });
    expect(screen.getAllByText("Open Defect").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tax off by one cent").length).toBeGreaterThan(0);
  });
});
