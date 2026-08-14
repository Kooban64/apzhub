import { describe, expect, it } from "vitest";

import {
  buildCertificationBoard,
  filterEvidenceGaps,
  filterMyWorkQueue,
  filterRemediationQueue,
  filterRetestQueue,
  summariseWorkQueues,
} from "./workflow-views";
import type { Engagement, Finding } from "./types";

function finding(
  partial: Partial<Finding> & Pick<Finding, "findingId" | "status" | "severity">,
): Finding {
  return {
    engagementId: "e1",
    tenantId: "t1",
    title: partial.title ?? partial.findingId,
    description: "d",
    evidence: partial.evidence ?? [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    createdBy: "op",
    ...partial,
  };
}

describe("APZPEN workflow views", () => {
  it("queues remediation and retest by status", () => {
    const findings = [
      finding({ findingId: "1", status: "open", severity: "critical" }),
      finding({ findingId: "2", status: "remediating", severity: "high" }),
      finding({
        findingId: "3",
        status: "retest_requested",
        severity: "medium",
      }),
      finding({ findingId: "4", status: "closed", severity: "low" }),
    ];
    expect(filterRemediationQueue(findings).map((f) => f.findingId)).toEqual([
      "1",
      "2",
    ]);
    expect(filterRetestQueue(findings).map((f) => f.findingId)).toEqual(["3"]);
  });

  it("flags evidence gaps and summarises work queues", () => {
    const findings = [
      finding({
        findingId: "1",
        status: "open",
        severity: "critical",
        evidence: [],
      }),
      finding({
        findingId: "2",
        status: "remediating",
        severity: "high",
        evidence: [
          {
            evidenceId: "ev1",
            kind: "note",
            label: "fix",
            ref: "https://x",
            createdAt: "2026-01-01T00:00:00.000Z",
            createdBy: "op",
          },
        ],
      }),
    ];
    expect(filterEvidenceGaps(findings)).toHaveLength(1);
    const engagements = [
      {
        engagementId: "e1",
        tenantId: "t1",
        customerName: "A",
        applicationName: "App",
        title: "T",
        status: "certified",
        environment: "staging",
        methodology: [],
        scope: [],
        roe: {
          roeId: "r",
          status: "approved",
          allowedTechniques: [],
          restrictedTechniques: [],
        },
        assessmentPosition: "complete",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        createdBy: "op",
        scheduleMode: "once",
      } satisfies Engagement,
    ];
    const summary = summariseWorkQueues({ findings, engagements });
    expect(summary.remediationCount).toBe(2);
    expect(summary.evidenceGapCount).toBe(1);
    expect(summary.certifiedCount).toBe(1);
    expect(summary.criticalOpen).toBe(1);
    expect(buildCertificationBoard(engagements)[0]?.assessmentPosition).toBe(
      "complete",
    );
  });

  it("filters My Work by assignee case-insensitively", () => {
    const findings = [
      finding({
        findingId: "1",
        status: "open",
        severity: "critical",
        assignedTo: "Dev@Acme.TEST",
      }),
      finding({
        findingId: "2",
        status: "remediating",
        severity: "high",
        assignedTo: "other@acme.test",
      }),
      finding({
        findingId: "3",
        status: "closed",
        severity: "medium",
        assignedTo: "dev@acme.test",
      }),
    ];
    expect(
      filterMyWorkQueue(findings, "dev@acme.test").map((f) => f.findingId),
    ).toEqual(["1"]);
  });
});
