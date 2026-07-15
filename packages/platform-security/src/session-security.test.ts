import { describe, expect, it } from "vitest";

import { getSessionSecurityPosture } from "./platform-api-guard";

describe("getSessionSecurityPosture", () => {
  it("derives posture from auth session policy", () => {
    const posture = getSessionSecurityPosture();
    expect(posture.sessionValidation).toBe("active");
    expect(posture.cookieHttpOnly).toBe(true);
    expect(posture.sessionDiagnostics.cookiePosture.httpOnly).toBe(true);
    expect(posture.absoluteTimeoutHours).toBeGreaterThan(0);
  });
});
