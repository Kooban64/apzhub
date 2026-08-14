import { createHmac } from "node:crypto";
import { describe, expect, it, beforeEach } from "vitest";

import {
  computePrSecurityPosition,
  detectSensitivePaths,
  seedDemoPrEvent,
  verifyGithubWebhookSignature,
} from "./github-pr-security";
import { findGrantByToken, issueCustomerGrant } from "./customer-grants";
import { assistSecurityIntelligence } from "./intelligence";
import {
  renderEmbeddedPdf,
  renderApzpenTypst,
  markdownToTypstBody,
} from "./report-pdf";
import { buildReportPack } from "./reports";
import { resetAllApzpenStoresForTests } from "./follow-on-service";
import {
  createCustomerPortalGrant,
  ensureDemoPrSecurity,
  getCustomerPortalView,
  runSecurityIntelligence,
} from "./follow-on-service";
import { ensureDemoEngagement } from "./service";
import type { Engagement, Finding, SecurityPosture } from "./types";

beforeEach(() => {
  resetAllApzpenStoresForTests();
});

describe("APZPEN GitHub PR security", () => {
  it("detects sensitive paths and blocks on failed required checks", () => {
    expect(detectSensitivePaths(["src/auth/login.ts", "readme.md"])).toEqual([
      "src/auth/login.ts",
    ]);
    const eng = ensureDemoEngagement("t_gh", "tester");
    const event = seedDemoPrEvent(eng, "pr_1");
    const failed = {
      ...event,
      checks: event.checks.map((c) =>
        c.required ? { ...c, status: "failure" as const } : c,
      ),
    };
    const assessment = computePrSecurityPosition({
      event: failed,
      findings: [],
    });
    expect(assessment.position).toBe("blocked");
    expect(assessment.sensitivePaths.length).toBeGreaterThan(0);
  });

  it("verifies HMAC signatures", () => {
    const body = '{"ok":true}';
    const sig = "sha256=" + createHmac("sha256", "secret").update(body).digest("hex");
    expect(
      verifyGithubWebhookSignature({
        secret: "secret",
        rawBody: body,
        signatureHeader: sig,
      }),
    ).toBe(true);
    expect(
      verifyGithubWebhookSignature({
        secret: "secret",
        rawBody: body,
        signatureHeader: "sha256=deadbeef",
      }),
    ).toBe(false);
  });
});

describe("APZPEN customer grants", () => {
  it("issues hashed tokens and resolves portal view", () => {
    const eng = ensureDemoEngagement("t_cust", "op");
    const issued = createCustomerPortalGrant({
      tenantId: "t_cust",
      engagementId: eng.engagementId,
      customerEmail: "buyer@acme.test",
      createdBy: "op",
    });
    expect(issued.token.startsWith("apzpen_")).toBe(true);
    expect(issued.grant.tokenHash).not.toContain(issued.token);
    const view = getCustomerPortalView(issued.token);
    expect(view.engagement.engagementId).toBe(eng.engagementId);
    expect(view.grant.customerEmail).toBe("buyer@acme.test");
  });

  it("rejects unknown tokens", () => {
    const issued = issueCustomerGrant({
      grantId: "g1",
      tenantId: "t",
      engagementId: "e",
      customerEmail: "a@b.c",
      createdBy: "op",
    });
    expect(findGrantByToken([issued.grant], "wrong")).toBeUndefined();
    expect(findGrantByToken([issued.grant], issued.token)?.grantId).toBe("g1");
  });
});

describe("APZPEN intelligence", () => {
  it("returns offline suggestions and never auto-certifies", () => {
    const eng = ensureDemoEngagement("t_ai", "op");
    const assist = runSecurityIntelligence("t_ai", eng.engagementId);
    expect(assist.autoCertify).toBe(false);
    expect(assist.mode).toBe("offline_rules");
    expect(assist.suggestions.length).toBeGreaterThanOrEqual(3);
    expect(assist.suggestions[0]?.disclaimer).toMatch(/Never auto-certifies/i);
  });

  it("summarises empty findings", () => {
    const engagement = {
      engagementId: "e",
      tenantId: "t",
      customerName: "C",
      applicationName: "A",
      title: "T",
      status: "in_progress",
      environment: "staging",
      methodology: [],
      scope: [],
      roe: {
        roeId: "r",
        status: "approved",
        allowedTechniques: [],
        restrictedTechniques: [],
      },
      assessmentPosition: "in_progress",
      createdAt: "",
      updatedAt: "",
      createdBy: "x",
      scheduleMode: "once",
    } as Engagement;
    const result = assistSecurityIntelligence({
      engagement,
      findings: [] as Finding[],
    });
    expect(result.suggestions.some((s) => s.kind === "engagement_summary")).toBe(true);
  });
});

describe("APZPEN PDF", () => {
  it("renders typst and embedded PDF from report pack", () => {
    const engagement = {
      engagementId: "eng_pdf",
      tenantId: "t",
      customerName: "Acme",
      applicationName: "Portal",
      title: "Assessment",
      status: "in_progress",
      environment: "staging",
      methodology: ["OWASP WSTG"],
      scope: [],
      roe: {
        roeId: "r",
        status: "approved",
        allowedTechniques: [],
        restrictedTechniques: [],
      },
      assessmentPosition: "in_progress",
      createdAt: "2026-08-14T00:00:00.000Z",
      updatedAt: "2026-08-14T00:00:00.000Z",
      createdBy: "t",
      scheduleMode: "once",
    } as Engagement;
    const posture = {
      engagementId: "eng_pdf",
      status: "in_progress",
      assessmentPosition: "in_progress",
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
      scopeCount: 0,
    } as SecurityPosture;
    const pack = buildReportPack({
      kind: "executive",
      engagement,
      findings: [],
      posture,
    });
    expect(markdownToTypstBody("# Hello\n- item")).toContain("= Hello");
    const typst = renderApzpenTypst(pack);
    expect(typst).toContain("APZPEN");
    const pdf = renderEmbeddedPdf(pack);
    expect(pdf.subarray(0, 5).toString("utf8")).toBe("%PDF-");
  });
});

describe("APZPEN demo PR seed", () => {
  it("seeds PR assessments for an engagement", () => {
    const eng = ensureDemoEngagement("t_pr", "op");
    const assessments = ensureDemoPrSecurity("t_pr", eng.engagementId);
    expect(assessments.length).toBeGreaterThanOrEqual(1);
    expect(assessments[0]?.repository).toBeTruthy();
  });
});
