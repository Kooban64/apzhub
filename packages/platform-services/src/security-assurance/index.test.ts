import { describe, expect, it } from "vitest";

import {
  buildEngagementRows,
  isSecurityReadinessClear,
  summariseSecurityAssurance,
} from "./index";

describe("@apzhub/platform-services security-assurance (SPR-FULL-002-A)", () => {
  it("never claims review when not entitled", () => {
    const summary = summariseSecurityAssurance({
      entitled: false,
      engagements: [],
    });
    expect(summary.status).toBe("not_entitled");
    expect(summary.reviewClear).toBe(false);
    expect(isSecurityReadinessClear(summary)).toBe(false);
  });

  it("marks healthy when complete with no criticals", () => {
    const rows = buildEngagementRows({
      engagements: [
        {
          engagementId: "eng-1",
          assessmentPosition: "complete",
          posture: { critical: 0, high: 0, openCount: 0 },
        },
      ],
      bindings: [
        {
          productKey: "pentest",
          projectId: "eng-1",
          status: "active",
          externalRef: "org/repo",
        },
      ],
    });
    const summary = summariseSecurityAssurance({
      entitled: true,
      engagements: rows,
      externalRef: "org/repo",
    });
    expect(summary.status).toBe("healthy");
    expect(summary.reviewClear).toBe(true);
  });
});
