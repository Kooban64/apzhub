import { describe, expect, it } from "vitest";

import {
  QEP_TEST_PLANS_NAVIGATION,
  QEP_TEST_PLAN_ROUTES,
  isQepTestPlansDashboardRoute,
  isQepTestPlansExplorerRoute,
  isQepTestPlansNewRoute,
  isQepTestPlansReviewRoute,
  isQepTestPlansRoute,
  isQepTestPlansSearchRoute,
  parseQepTestPlanDetailMode,
  parseQepTestPlanRouteId,
} from "./index";

describe("APZQEP-ENG-070A Test Plans presentation routes", () => {
  it("recognises Test Plans workspace routes", () => {
    expect(isQepTestPlansRoute("/workspace/qep/test-plans")).toBe(true);
    expect(isQepTestPlansDashboardRoute("/workspace/qep/test-plans")).toBe(true);
    expect(isQepTestPlansExplorerRoute("/workspace/qep/test-plans/explorer")).toBe(true);
    expect(isQepTestPlansReviewRoute("/workspace/qep/test-plans/review")).toBe(true);
    expect(isQepTestPlansSearchRoute("/workspace/qep/test-plans/search")).toBe(true);
    expect(isQepTestPlansNewRoute(QEP_TEST_PLAN_ROUTES.new)).toBe(true);
  });

  it("parses Plan ids under /plans/:id", () => {
    expect(
      parseQepTestPlanRouteId("/workspace/qep/test-plans/plans/tpl_abc"),
    ).toBe("tpl_abc");
    expect(parseQepTestPlanRouteId(QEP_TEST_PLAN_ROUTES.explorer)).toBeNull();
    expect(parseQepTestPlanRouteId("/workspace/qep/test-plans")).toBeNull();
  });

  it("parses detail mode for review/relationships/compare/audit and other secondary views", () => {
    const id = "tpl_abc";
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.detail(id))).toBe("detail");
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.history(id))).toBe("history");
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.versions(id))).toBe("versions");
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.items(id))).toBe("items");
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.relationships(id))).toBe(
      "relationships",
    );
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.compare(id))).toBe("compare");
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.audit(id))).toBe("audit");
    expect(parseQepTestPlanDetailMode(QEP_TEST_PLAN_ROUTES.edit(id))).toBe("edit");
  });

  it("builds compare route with optional from/to query params", () => {
    const id = "tpl_abc";
    expect(QEP_TEST_PLAN_ROUTES.compare(id)).toBe(
      "/workspace/qep/test-plans/plans/tpl_abc/compare",
    );
    expect(QEP_TEST_PLAN_ROUTES.compare(id, "0.1", "0.2")).toBe(
      "/workspace/qep/test-plans/plans/tpl_abc/compare?from=0.1&to=0.2",
    );
  });

  it("exposes navigation contributions", () => {
    expect(QEP_TEST_PLANS_NAVIGATION.sidebar.href).toBe("/workspace/qep/test-plans");
    expect(QEP_TEST_PLANS_NAVIGATION.additionalViews.length).toBeGreaterThanOrEqual(3);
  });
});
