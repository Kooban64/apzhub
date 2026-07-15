import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pathnameState = vi.hoisted(() => ({ value: "/workspace/testing" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.value,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("./testing-dashboard-view", () => ({
  TestingDashboardView: () => <div data-testid="route-dashboard" />,
}));
vi.mock("./testing-catalog-views", () => ({
  TestingRequirementsView: () => <div data-testid="route-requirements" />,
  TestingPlansView: ({ planId }: { planId?: string }) => (
    <div data-testid={planId ? "route-plan-detail" : "route-plans"}>{planId ?? "list"}</div>
  ),
  TestingSuitesView: () => <div data-testid="route-suites" />,
  TestingCasesView: () => <div data-testid="route-cases" />,
  TestingAutomationView: () => <div data-testid="route-automation" />,
  TestingEvidenceView: () => <div data-testid="route-evidence" />,
  TestingCoverageView: () => <div data-testid="route-coverage" />,
  TestingDefectsView: () => <div data-testid="route-defects" />,
  TestingQualityView: () => <div data-testid="route-quality" />,
  TestingReportsView: () => <div data-testid="route-reports" />,
  TestingAdministrationView: () => <div data-testid="route-administration" />,
}));
vi.mock("./testing-execution-view", () => ({
  TestingExecutionView: ({ executionId }: { executionId?: string }) => (
    <div data-testid={executionId ? "route-execution-detail" : "route-executions"}>
      {executionId ?? "list"}
    </div>
  ),
}));
vi.mock("./testing-certification-view", () => ({
  TestingCertificationView: ({ certificationId }: { certificationId?: string }) => (
    <div
      data-testid={certificationId ? "route-certification-detail" : "route-certification"}
    >
      {certificationId ?? "list"}
    </div>
  ),
}));
vi.mock("./testing-release-readiness-view", () => ({
  TestingReleaseReadinessView: () => <div data-testid="route-release-readiness" />,
}));
vi.mock("./testing-pipelines-view", () => ({
  TestingPipelinesView: () => <div data-testid="route-pipelines" />,
}));
vi.mock("./testing-engineering-intelligence-view", () => ({
  TestingEngineeringIntelligenceView: () => (
    <div data-testid="route-engineering-intelligence" />
  ),
}));
vi.mock("./testing-executive-dashboards-view", () => ({
  TestingExecutiveDashboardsView: ({
    category,
  }: {
    category?: string;
  }) => (
    <div data-testid="route-executive-dashboards">{category ?? "executive"}</div>
  ),
}));

import { TestingWorkspaceRouter } from "./testing-workspace-router";

const ROUTE_CASES = [
  { path: "/workspace/testing", testId: "route-dashboard" },
  { path: "/workspace/testing/requirements", testId: "route-requirements" },
  { path: "/workspace/testing/plans", testId: "route-plans" },
  {
    path: "/workspace/testing/plans/plan_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1",
    testId: "route-plan-detail",
    text: "plan_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1",
  },
  { path: "/workspace/testing/suites", testId: "route-suites" },
  { path: "/workspace/testing/cases", testId: "route-cases" },
  { path: "/workspace/testing/executions", testId: "route-executions" },
  {
    path: "/workspace/testing/executions/exec_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa4",
    testId: "route-execution-detail",
    text: "exec_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa4",
  },
  { path: "/workspace/testing/automation", testId: "route-automation" },
  { path: "/workspace/testing/evidence", testId: "route-evidence" },
  { path: "/workspace/testing/coverage", testId: "route-coverage" },
  { path: "/workspace/testing/defects", testId: "route-defects" },
  { path: "/workspace/testing/quality", testId: "route-quality" },
  { path: "/workspace/testing/certification", testId: "route-certification" },
  {
    path: "/workspace/testing/certification/cert_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa7",
    testId: "route-certification-detail",
    text: "cert_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa7",
  },
  { path: "/workspace/testing/release-readiness", testId: "route-release-readiness" },
  { path: "/workspace/testing/pipelines", testId: "route-pipelines" },
  {
    path: "/workspace/testing/engineering-intelligence",
    testId: "route-engineering-intelligence",
  },
  {
    path: "/workspace/testing/executive-dashboards",
    testId: "route-executive-dashboards",
    text: "executive",
  },
  {
    path: "/workspace/testing/executive-dashboards/qa",
    testId: "route-executive-dashboards",
    text: "qa",
  },
  { path: "/workspace/testing/reports", testId: "route-reports" },
  { path: "/workspace/testing/administration", testId: "route-administration" },
] as const;

function renderRouter(pathname: string) {
  pathnameState.value = pathname;
  return render(<TestingWorkspaceRouter />);
}

describe("TestingWorkspaceRouter", () => {
  beforeEach(() => {
    pathnameState.value = "/workspace/testing";
  });

  it.each(ROUTE_CASES)("routes $path to $testId", (routeCase) => {
    renderRouter(routeCase.path);
    const node = screen.getByTestId(routeCase.testId);
    expect(node).toBeTruthy();
    if ("text" in routeCase && routeCase.text) {
      expect(node.textContent).toBe(routeCase.text);
    }
  });

  it("falls back to dashboard for unrecognized testing subpaths", () => {
    renderRouter("/workspace/testing/nope");
    expect(screen.getByTestId("route-dashboard")).toBeTruthy();
  });

  it("renders unknown route empty state for non-testing paths", () => {
    renderRouter("/workspace/other");
    expect(screen.getByText("Unknown Testing route")).toBeTruthy();
    expect(screen.getByTestId("testing-page")).toBeTruthy();
  });
});
