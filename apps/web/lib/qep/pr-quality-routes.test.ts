import { describe, expect, it } from "vitest";

import {
  isQepPrQualityRoute,
  parseQepPrQualityChangeId,
  QEP_PR_QUALITY_BASE_PATH,
  QEP_PR_QUALITY_ROUTES,
} from "./pr-quality-routes";

describe("pr-quality routes", () => {
  it("matches list and detail paths", () => {
    expect(isQepPrQualityRoute(QEP_PR_QUALITY_BASE_PATH)).toBe(true);
    expect(isQepPrQualityRoute(QEP_PR_QUALITY_ROUTES.byChange("chg-1"))).toBe(true);
    expect(isQepPrQualityRoute("/workspace/qep/scm")).toBe(false);
  });

  it("parses change ids", () => {
    expect(parseQepPrQualityChangeId(QEP_PR_QUALITY_ROUTES.byChange("a/b"))).toBe(
      "a/b",
    );
    expect(parseQepPrQualityChangeId(QEP_PR_QUALITY_BASE_PATH)).toBeNull();
  });
});
