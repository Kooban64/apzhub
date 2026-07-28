import { describe, expect, it } from "vitest";

import {
  QEP_VERIFICATION_NAVIGATION,
  QEP_VERIFICATION_ROUTES,
  isQepVerificationDashboardRoute,
  isQepVerificationHistoryRoute,
  isQepVerificationNewRoute,
  isQepVerificationQueueRoute,
  isQepVerificationRoute,
  isQepVerificationSearchRoute,
  isQepVerificationTeamRoute,
  parseQepVerificationRouteId,
} from "./index";

describe("APZQEP-ENG-040C Verification presentation routes", () => {
  it("recognises Verification workspace routes", () => {
    expect(isQepVerificationRoute("/workspace/qep/verification")).toBe(true);
    expect(isQepVerificationQueueRoute("/workspace/qep/verification/queue")).toBe(true);
    expect(isQepVerificationTeamRoute("/workspace/qep/verification/team")).toBe(true);
    expect(isQepVerificationSearchRoute("/workspace/qep/verification/search")).toBe(
      true,
    );
    expect(isQepVerificationHistoryRoute("/workspace/qep/verification/history")).toBe(
      true,
    );
    expect(
      isQepVerificationDashboardRoute("/workspace/qep/verification/dashboard"),
    ).toBe(true);
    expect(isQepVerificationNewRoute(QEP_VERIFICATION_ROUTES.new)).toBe(true);
  });

  it("parses Verification ids and reserves named segments", () => {
    expect(parseQepVerificationRouteId("/workspace/qep/verification/ver_abc")).toBe(
      "ver_abc",
    );
    expect(parseQepVerificationRouteId(QEP_VERIFICATION_ROUTES.queue)).toBeNull();
    expect(parseQepVerificationRouteId(QEP_VERIFICATION_ROUTES.dashboard)).toBeNull();
    expect(parseQepVerificationRouteId(QEP_VERIFICATION_ROUTES.new)).toBeNull();
    expect(parseQepVerificationRouteId("/workspace/qep/verification")).toBeNull();
  });

  it("exposes navigation contributions", () => {
    expect(QEP_VERIFICATION_NAVIGATION.sidebar.href).toBe(
      "/workspace/qep/verification",
    );
    expect(QEP_VERIFICATION_NAVIGATION.additionalViews.length).toBeGreaterThanOrEqual(
      4,
    );
  });
});
