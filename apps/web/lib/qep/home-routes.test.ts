import { describe, expect, it } from "vitest";

import { isQepHomeRoute, QEP_HOME_BASE_PATH } from "./home-routes";
import {
  isQepReleaseReadinessRoute,
  QEP_RELEASE_READINESS_BASE_PATH,
} from "./release-readiness-routes";

describe("SPR-APZQEP-201 home + release-readiness routes", () => {
  it("treats bare workspace and /home as Home", () => {
    expect(isQepHomeRoute("/workspace/qep")).toBe(true);
    expect(isQepHomeRoute("/workspace/qep/")).toBe(true);
    expect(isQepHomeRoute(QEP_HOME_BASE_PATH)).toBe(true);
    expect(isQepHomeRoute("/workspace/qep/quality-flows")).toBe(false);
  });

  it("matches release-readiness paths", () => {
    expect(isQepReleaseReadinessRoute(QEP_RELEASE_READINESS_BASE_PATH)).toBe(true);
    expect(isQepReleaseReadinessRoute(`${QEP_RELEASE_READINESS_BASE_PATH}/x`)).toBe(
      true,
    );
    expect(isQepReleaseReadinessRoute("/workspace/qep/home")).toBe(false);
  });
});
