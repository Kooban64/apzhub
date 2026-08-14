import { describe, expect, it } from "vitest";

import {
  ApzpenDomainError,
  assertRoeApproved,
  canStartTesting,
  computeSecurityPosture,
  deriveAssessmentPosition,
  normalizeSeverity,
  transitionEngagementStatus,
  transitionFindingStatus,
} from "./domain";
import type { Engagement, Finding, RulesOfEngagement } from "./types";

function roe(status: RulesOfEngagement["status"]): RulesOfEngagement {
  return {
    roeId: "roe-1",
    status,
    allowedTechniques: ["api_testing"],
    restrictedTechniques: ["denial_of_service"],
    approvedAt: status === "approved" ? "2026-08-13T10:00:00.000Z" : undefined,
    approvedBy: status === "approved" ? "tester@apzor.com" : undefined,
  };
}

function engagement(overrides: Partial<Engagement> = {}): Engagement {
  return {
    engagementId: "eng-1",
    tenantId: "tenant-1",
    customerName: "Acme Bank",
    applicationName: "Customer Portal",
    title: "2026-Q3 Penetration Test",
    status: "approved",
    environment: "staging",
    methodology: ["OWASP WSTG"],
    scope: [
      {
        targetId: "t1",
        kind: "web_application",
        label: "Portal",
        identifier: "https://staging.example.com",
        environment: "staging",
      },
    ],
    roe: roe("approved"),
    assessmentPosition: "not_started",
    createdAt: "2026-08-13T09:00:00.000Z",
    updatedAt: "2026-08-13T09:00:00.000Z",
    createdBy: "admin@apzor.com",
    scheduleMode: "once",
    ...overrides,
  };
}

function finding(overrides: Partial<Finding> = {}): Finding {
  return {
    findingId: "f-1",
    engagementId: "eng-1",
    tenantId: "tenant-1",
    title: "Auth bypass",
    description: "Vertical privilege escalation",
    severity: "critical",
    status: "open",
    evidence: [],
    createdAt: "2026-08-13T11:00:00.000Z",
    updatedAt: "2026-08-13T11:00:00.000Z",
    createdBy: "tester@apzor.com",
    ...overrides,
  };
}

describe("APZPEN domain", () => {
  it("blocks testing without approved RoE", () => {
    expect(() => assertRoeApproved(roe("draft"))).toThrow(ApzpenDomainError);
    expect(canStartTesting(engagement({ roe: roe("draft") }))).toBe(false);
    expect(() =>
      transitionEngagementStatus("approved", "in_progress", roe("draft"), 1),
    ).toThrow(/Rules of Engagement/);
  });

  it("blocks testing with empty scope", () => {
    expect(() =>
      transitionEngagementStatus("approved", "in_progress", roe("approved"), 0),
    ).toThrow(/scope/);
    expect(canStartTesting(engagement({ scope: [], roe: roe("approved") }))).toBe(
      false,
    );
  });

  it("allows start when RoE approved and scope present", () => {
    expect(canStartTesting(engagement())).toBe(true);
    expect(
      transitionEngagementStatus("approved", "in_progress", roe("approved"), 1),
    ).toBe("in_progress");
  });

  it("enforces finding lifecycle", () => {
    expect(transitionFindingStatus("open", "remediating")).toBe("remediating");
    expect(transitionFindingStatus("remediating", "retest_requested")).toBe(
      "retest_requested",
    );
    expect(transitionFindingStatus("retest_requested", "retest_passed")).toBe(
      "retest_passed",
    );
    expect(() => transitionFindingStatus("closed", "open")).toThrow(ApzpenDomainError);
  });

  it("computes posture and assessment position from findings", () => {
    const eng = engagement({ status: "in_progress" });
    const findings = [
      finding({ severity: "critical", status: "open" }),
      finding({
        findingId: "f-2",
        severity: "high",
        status: "remediating",
      }),
      finding({
        findingId: "f-3",
        severity: "medium",
        status: "closed",
      }),
    ];
    const posture = computeSecurityPosture(eng, findings);
    expect(posture.critical).toBe(1);
    expect(posture.high).toBe(1);
    expect(posture.openCount).toBe(1);
    expect(posture.remediatingCount).toBe(1);
    expect(posture.roeApproved).toBe(true);
    expect(deriveAssessmentPosition(eng, findings)).toBe("blocked");
  });

  it("normalises provider severities", () => {
    expect(normalizeSeverity("CRITICAL")).toBe("critical");
    expect(normalizeSeverity("warning")).toBe("medium");
    expect(normalizeSeverity("unknown")).toBe("info");
  });
});
