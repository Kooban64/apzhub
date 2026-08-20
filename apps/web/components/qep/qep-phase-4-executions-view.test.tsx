import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/qep/test-execution",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/qep/qep-application-context", () => ({
  useQepApplicationContext: () => ({ selectedId: "qapp-1" }),
}));

vi.mock("@/lib/qep/qep-phase4-executions-api", () => ({
  listPresentedExecutions: vi.fn(async () => [
    {
      id: "tex_1",
      tenantId: "t1",
      applicationId: "qapp-1",
      name: "TE-1",
      mode: "manual",
      type: "manual",
      engine: "test_execution",
      status: "completed",
      result: "fail",
      executedAt: "2026-08-19T12:00:00.000Z",
      executedBy: "user_1",
      unbound: false,
    },
  ]),
  startPlanExecution: vi.fn(),
  getExecutionInvestigation: vi.fn(),
  createRetest: vi.fn(),
  createRerun: vi.fn(),
  createExecutionDefect: vi.fn(),
}));

vi.mock("@/lib/qep/qep-test-management-api", () => ({
  listTestPlans: vi.fn(async () => []),
}));

vi.mock("@/lib/qep/qep-test-execution-api", () => ({
  associateExecutionEvidence: vi.fn(),
  performExecutionAction: vi.fn(),
  recordExecutionStepResult: vi.fn(),
}));

import { QepPhase4ExecutionsView } from "./qep-phase-4-executions-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("Phase 4 Executions list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders status and result as independent columns", async () => {
    render(wrap(<QepPhase4ExecutionsView pathname="/workspace/qep/test-execution" />));
    expect(await screen.findByTestId("qep-executions")).toBeTruthy();
    expect(screen.getByTestId("qep-execution-status").textContent).toMatch(
      /Completed/i,
    );
    expect(screen.getByTestId("qep-execution-result").textContent).toMatch(/Fail/i);
  });
});
