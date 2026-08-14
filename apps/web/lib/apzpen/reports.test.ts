import { describe, expect, it } from "vitest";

import { buildReportPack } from "./reports";
import type { Engagement, Finding, SecurityPosture } from "./types";

const engagement: Engagement = {
  engagementId: "eng_1",
  tenantId: "t1",
  customerName: "Acme",
  applicationName: "Portal",
  title: "Q3 Assessment",
  status: "in_progress",
  environment: "staging",
  methodology: ["OWASP WSTG"],
  scope: [
    {
      targetId: "t1",
      kind: "web_application",
      label: "Portal",
      identifier: "https://staging.acme.test",
      environment: "staging",
    },
  ],
  roe: {
    roeId: "roe1",
    status: "approved",
    allowedTechniques: ["DAST"],
    restrictedTechniques: ["DoS"],
    approvedAt: "2026-08-13T00:00:00.000Z",
    approvedBy: "tester",
  },
  assessmentPosition: "in_progress",
  createdAt: "2026-08-13T00:00:00.000Z",
  updatedAt: "2026-08-13T00:00:00.000Z",
  createdBy: "tester",
  scheduleMode: "once",
};

const findings: Finding[] = [
  {
    findingId: "f1",
    engagementId: "eng_1",
    tenantId: "t1",
    title: "BOLA on transfers",
    description: "IDOR",
    severity: "critical",
    status: "open",
    evidence: [],
    createdAt: "2026-08-13T00:00:00.000Z",
    updatedAt: "2026-08-13T00:00:00.000Z",
    createdBy: "tester",
    providerTool: "manual",
  },
];

const posture: SecurityPosture = {
  engagementId: "eng_1",
  status: "in_progress",
  assessmentPosition: "blocked",
  critical: 1,
  high: 0,
  medium: 0,
  low: 0,
  info: 0,
  openCount: 1,
  remediatingCount: 0,
  retestCount: 0,
  closedCount: 0,
  roeApproved: true,
  scopeCount: 1,
};

describe("APZPEN report packs", () => {
  it("builds executive markdown with open risks", () => {
    const pack = buildReportPack({
      kind: "executive",
      engagement,
      findings,
      posture,
    });
    expect(pack.title).toContain("Executive");
    expect(pack.markdown).toContain("BOLA");
    expect(pack.json.assessmentPosition).toBe("blocked");
  });

  it("builds compliance gate table", () => {
    const pack = buildReportPack({
      kind: "compliance",
      engagement,
      findings,
      posture,
    });
    expect(pack.markdown).toContain("Open critical");
    expect(pack.markdown).toContain("FAIL");
  });
});
