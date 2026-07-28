import { describe, expect, it } from "vitest";

import {
  QEP_TEST_SPECIFICATIONS_NAVIGATION,
  QEP_TEST_SPECIFICATION_ROUTES,
  isQepTestSpecificationsDashboardRoute,
  isQepTestSpecificationsExplorerRoute,
  isQepTestSpecificationsNewRoute,
  isQepTestSpecificationsReviewRoute,
  isQepTestSpecificationsRoute,
  isQepTestSpecificationsSearchRoute,
  parseQepTestSpecificationDetailMode,
  parseQepTestSpecificationRouteId,
} from "./index";

describe("APZQEP-ENG-050C Test Specifications presentation routes", () => {
  it("recognises Test Specifications workspace routes", () => {
    expect(isQepTestSpecificationsRoute("/workspace/qep/test-specifications")).toBe(true);
    expect(isQepTestSpecificationsDashboardRoute("/workspace/qep/test-specifications")).toBe(
      true,
    );
    expect(
      isQepTestSpecificationsExplorerRoute("/workspace/qep/test-specifications/explorer"),
    ).toBe(true);
    expect(isQepTestSpecificationsReviewRoute("/workspace/qep/test-specifications/review")).toBe(
      true,
    );
    expect(isQepTestSpecificationsSearchRoute("/workspace/qep/test-specifications/search")).toBe(
      true,
    );
    expect(isQepTestSpecificationsNewRoute(QEP_TEST_SPECIFICATION_ROUTES.new)).toBe(true);
  });

  it("parses Specification ids under /specifications/:id", () => {
    expect(
      parseQepTestSpecificationRouteId(
        "/workspace/qep/test-specifications/specifications/tsp_abc",
      ),
    ).toBe("tsp_abc");
    expect(
      parseQepTestSpecificationDetailMode(
        "/workspace/qep/test-specifications/specifications/tsp_abc/history",
      ),
    ).toBe("history");
    expect(
      parseQepTestSpecificationDetailMode(
        "/workspace/qep/test-specifications/specifications/tsp_abc/compare",
      ),
    ).toBe("compare");
    expect(parseQepTestSpecificationRouteId(QEP_TEST_SPECIFICATION_ROUTES.explorer)).toBeNull();
    expect(parseQepTestSpecificationRouteId("/workspace/qep/test-specifications")).toBeNull();
  });

  it("exposes navigation contributions", () => {
    expect(QEP_TEST_SPECIFICATIONS_NAVIGATION.sidebar.href).toBe(
      "/workspace/qep/test-specifications",
    );
    expect(QEP_TEST_SPECIFICATIONS_NAVIGATION.additionalViews.length).toBeGreaterThanOrEqual(4);
  });
});
