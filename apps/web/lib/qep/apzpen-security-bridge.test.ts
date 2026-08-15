import { describe, expect, it } from "vitest";

import {
  buildEngagementRows,
  isSecurityReadinessClear,
  summariseSecurityAssurance,
} from "./apzpen-security-bridge";
import type { SecurityPosture } from "@/lib/apzpen/types";

function posture(
  overrides: Partial<SecurityPosture> &
    Pick<SecurityPosture, "engagementId" | "assessmentPosition">,
): SecurityPosture {
  return {
    status: "in_progress",
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    openCount: 0,
    remediatingCount: 0,
    retestCount: 0,
    closedCount: 0,
    roeApproved: true,
    scopeCount: 1,
    ...overrides,
  };
}

describe("apzpen-security-bridge", () => {
  it("never claims review when not entitled", () => {
    const summary = summariseSecurityAssurance({
      entitled: false,
      engagements: [],
    });
    expect(summary.linked).toBe(false);
    expect(summary.reviewClear).toBe(false);
    expect(summary.status).toBe("not_entitled");
    expect(summary.href).toBe("");
    expect(isSecurityReadinessClear(summary)).toBe(false);
    expect(summary.detail).toMatch(/not entitled/i);
  });

  it("is honest when entitled but unbound", () => {
    const summary = summariseSecurityAssurance({
      entitled: true,
      engagements: [],
      externalRef: "acme/app",
    });
    expect(summary.linked).toBe(false);
    expect(summary.status).toBe("unavailable");
    expect(summary.reviewClear).toBe(false);
    expect(summary.detail).toMatch(/No APZPEN engagement/i);
  });

  it("flags blocked posture and critical findings as not clear", () => {
    const rows = buildEngagementRows({
      engagements: [
        {
          engagementId: "eng_1",
          title: "App",
          assessmentPosition: "blocked",
          posture: posture({
            engagementId: "eng_1",
            assessmentPosition: "blocked",
            critical: 2,
            high: 1,
            openCount: 3,
          }),
        },
      ],
      bindings: [
        {
          bindingId: "b1",
          tenantId: "t1",
          projectId: "eng_1",
          productKey: "pentest",
          providerId: "github",
          externalRef: "acme/app",
          displayName: "acme/app",
          mode: "granted_read",
          status: "active",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    const summary = summariseSecurityAssurance({
      entitled: true,
      engagements: rows,
      externalRef: "acme/app",
    });
    expect(summary.linked).toBe(true);
    expect(summary.reviewClear).toBe(false);
    expect(summary.status).toBe("degraded");
    expect(summary.critical).toBe(2);
    expect(summary.href).toBe("/apzpen/engagements/eng_1");
  });

  it("marks complete with zero critical as review-clear (not certify)", () => {
    const rows = buildEngagementRows({
      engagements: [
        {
          engagementId: "eng_ok",
          assessmentPosition: "complete",
          posture: posture({
            engagementId: "eng_ok",
            assessmentPosition: "complete",
          }),
        },
      ],
      bindings: [],
    });
    const summary = summariseSecurityAssurance({
      entitled: true,
      engagements: rows,
    });
    expect(summary.reviewClear).toBe(true);
    expect(summary.status).toBe("healthy");
    expect(summary.detail).toMatch(/complete/i);
  });
});
