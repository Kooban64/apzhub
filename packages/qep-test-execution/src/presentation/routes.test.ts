import { describe, expect, it } from "vitest";

import {
  QEP_TEST_EXECUTION_NAVIGATION,
  QEP_TEST_EXECUTION_ROUTES,
  isQepTestExecutionAssignedRoute,
  isQepTestExecutionExplorerRoute,
  isQepTestExecutionHomeRoute,
  isQepTestExecutionNewRoute,
  isQepTestExecutionReviewRoute,
  isQepTestExecutionRoute,
  parseQepTestExecutionDetailMode,
  parseQepTestExecutionRouteId,
} from "./index";

describe("APZQEP-ENG-100E Test Execution presentation routes", () => {
  it("recognises Test Execution workspace routes", () => {
    expect(isQepTestExecutionRoute("/workspace/qep/test-execution")).toBe(true);
    expect(isQepTestExecutionHomeRoute("/workspace/qep/test-execution")).toBe(true);
    expect(
      isQepTestExecutionExplorerRoute("/workspace/qep/test-execution/explorer"),
    ).toBe(true);
    expect(
      isQepTestExecutionAssignedRoute("/workspace/qep/test-execution/assigned"),
    ).toBe(true);
    expect(isQepTestExecutionReviewRoute("/workspace/qep/test-execution/review")).toBe(
      true,
    );
    expect(isQepTestExecutionNewRoute(QEP_TEST_EXECUTION_ROUTES.new)).toBe(true);
  });

  it("does not treat sibling QEP workspaces as Test Execution routes", () => {
    expect(isQepTestExecutionRoute("/workspace/qep/test-plans")).toBe(false);
    expect(isQepTestExecutionRoute("/workspace/qep")).toBe(false);
  });

  it("parses Execution ids under /executions/:id", () => {
    expect(
      parseQepTestExecutionRouteId("/workspace/qep/test-execution/executions/exec_abc"),
    ).toBe("exec_abc");
    expect(parseQepTestExecutionRouteId(QEP_TEST_EXECUTION_ROUTES.explorer)).toBeNull();
    expect(parseQepTestExecutionRouteId("/workspace/qep/test-execution")).toBeNull();
    expect(
      parseQepTestExecutionRouteId("/workspace/qep/test-execution/executions/review"),
    ).toBeNull();
  });

  it("parses detail mode for detail and history", () => {
    const id = "exec_abc";
    expect(parseQepTestExecutionDetailMode(QEP_TEST_EXECUTION_ROUTES.detail(id))).toBe(
      "detail",
    );
    expect(parseQepTestExecutionDetailMode(QEP_TEST_EXECUTION_ROUTES.history(id))).toBe(
      "history",
    );
  });

  it("builds stable routes", () => {
    expect(QEP_TEST_EXECUTION_ROUTES.home).toBe("/workspace/qep/test-execution");
    expect(QEP_TEST_EXECUTION_ROUTES.detail("exec_1")).toBe(
      "/workspace/qep/test-execution/executions/exec_1",
    );
    expect(QEP_TEST_EXECUTION_ROUTES.history("exec_1")).toBe(
      "/workspace/qep/test-execution/executions/exec_1/history",
    );
  });

  it("exposes navigation contributions", () => {
    expect(QEP_TEST_EXECUTION_NAVIGATION.sidebar.href).toBe(
      "/workspace/qep/test-execution",
    );
    expect(QEP_TEST_EXECUTION_NAVIGATION.additionalViews.length).toBeGreaterThanOrEqual(
      3,
    );
  });
});
