import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import type { AutomationExecutionRecord } from "@apzhub/platform-automation";

import {
  composeReportPack,
  parseSeverityRollup,
  renderReportPackMarkdown,
  renderReportPackTypst,
  resolveTypstBinary,
  tryCompileReportPackPdf,
  type ReportPack,
} from "./report-pack";

function execution(
  overrides: Partial<AutomationExecutionRecord> &
    Pick<AutomationExecutionRecord, "executionId">,
): AutomationExecutionRecord {
  return {
    tenantId: "tenant-1",
    providerId: "security",
    correlationId: "corr-1",
    requestedBy: "user-1",
    target: {
      kind: "script",
      name: "trivy-scan",
      metadata: {
        changeEventId: "chg-demo-1",
        tool: "trivy",
        metricsJson: JSON.stringify({ critical: 1, high: 2, medium: 3 }),
      },
    },
    options: {},
    state: "completed",
    attempt: 1,
    maxAttempts: 1,
    createdAt: "2026-08-09T00:00:00.000Z",
    updatedAt: "2026-08-09T00:01:00.000Z",
    artifacts: [],
    timing: {},
    evidenceRefs: [],
    resultSummary: "trivy: 1 critical, 2 high, 3 medium",
    ...overrides,
  };
}

describe("F12 report-pack", () => {
  it("composes a draft pack with tool rollup and unsigned sign-off", () => {
    const pack = composeReportPack({
      tenantId: "tenant-1",
      changeEventId: "chg-demo-1",
      generatedAt: "2026-08-09T12:00:00.000Z",
      executions: [
        execution({ executionId: "exec-trivy" }),
        execution({
          executionId: "exec-semgrep",
          target: {
            kind: "script",
            name: "semgrep",
            metadata: {
              changeEventId: "chg-demo-1",
              tool: "semgrep",
              metricsJson: JSON.stringify({ high: 1 }),
            },
          },
          resultSummary: "semgrep: 1 high finding",
        }),
      ],
      evidenceLinks: [
        {
          evidenceId: "ev-sec-1",
          domain: "security",
          ref: "evidence://ev-sec-1",
          note: "F3 provider evidence (security) domain:security change:chg-demo-1 nuclei",
        },
      ],
      dispatches: [
        {
          dispatchId: "disp-1",
          tenantId: "tenant-1",
          changeEventId: "chg-demo-1",
          domains: ["trivy", "semgrep", "nuclei", "zap"],
          channel: "none",
          status: "dispatched",
          correlationId: "corr-1",
          createdAt: "2026-08-09T11:00:00.000Z",
          assistOrigin: "f11_security_dispatch",
          pack: "security",
        },
      ],
    });

    expect(pack.status).toBe("draft");
    expect(pack.advisory).toBe(true);
    expect(pack.autoCertified).toBe(false);
    expect(pack.signOff.signed).toBe(false);
    expect(pack.residualRisk.placeholder).toBe(true);

    const trivy = pack.tools.find((t) => t.toolId === "trivy");
    const semgrep = pack.tools.find((t) => t.toolId === "semgrep");
    const nuclei = pack.tools.find((t) => t.toolId === "nuclei");
    const greenbone = pack.tools.find((t) => t.toolId === "greenbone");

    expect(trivy?.status).toBe("completed");
    expect(trivy?.findingCounts.critical).toBe(1);
    expect(semgrep?.status).toBe("completed");
    expect(nuclei?.status).toBe("evidence_present");
    expect(greenbone?.status).toBe("not_run");
    expect(pack.severityRollup.critical).toBe(1);
    expect(pack.severityRollup.high).toBe(3);
  });

  it("never auto GO/NO-GO — markdown marks unsigned draft", () => {
    const pack = composeReportPack({
      tenantId: "tenant-1",
      changeEventId: "chg-demo-1",
      generatedAt: "2026-08-09T12:00:00.000Z",
    });
    const md = renderReportPackMarkdown(pack);
    expect(md).toContain("DRAFT");
    expect(md).toContain("Unsigned");
    expect(md).toContain("what was tested");
    expect(md).toContain("what was found");
    expect(md).toContain("what needs to happen");
    expect(md).not.toMatch(/\bGO\b.*auto/i);
    expect(pack.signOff.signed).toBe(false);
    expect(pack.autoCertified).toBe(false);
    expect(pack.assessment.band).toBeTruthy();
  });

  it("includes substantive findings, actions, and adverse assessment", () => {
    const pack = composeReportPack({
      tenantId: "tenant-1",
      changeEventId: "chg-demo-1",
      generatedAt: "2026-08-09T12:00:00.000Z",
      findings: [
        {
          id: "trivy-1",
          toolId: "trivy",
          severity: "high",
          title: "CVE-2026-39356 Package: drizzle-orm",
          description: "High severity dependency vulnerability",
          recommendation: "Upgrade drizzle-orm",
        },
        {
          id: "zap-1",
          toolId: "zap",
          severity: "medium",
          title: "CSP Header Not Set",
          description: "Missing Content-Security-Policy",
          recommendation: "Set CSP header",
        },
      ],
      engagementPartial: {
        repositoryFullName: "kooban-apzor/lovebloom",
        targetUrl: "https://lovebloom.apztdg.com",
      },
    });
    expect(pack.findings).toHaveLength(2);
    expect(pack.actions.length).toBeGreaterThan(0);
    expect(pack.assessment.band).toBe("requires_remediation");
    expect(pack.engagement.scopeSummary).toContain("lovebloom");
    const md = renderReportPackMarkdown(pack);
    expect(md).toContain("CVE-2026-39356");
    expect(md).toContain("Upgrade drizzle-orm");
    expect(md).toContain("Requires remediation");
  });

  it("parses severity from summary text", () => {
    const rollup = parseSeverityRollup({
      resultSummary: "zap: 2 high/critical finding(s) (5 total)",
    });
    expect(rollup.high).toBe(2);
    expect(rollup.total).toBeGreaterThanOrEqual(2);
  });

  it("checks in Typst template and can render placeholders", () => {
    const templatePath = join(
      process.cwd(),
      "apps/web/lib/qep/report-templates/security-bill-of-health.typ",
    );
    expect(existsSync(templatePath)).toBe(true);
    const template = readFileSync(templatePath, "utf8");
    expect(template).toContain("{{changeEventId}}");

    const pack: ReportPack = composeReportPack({
      tenantId: "tenant-1",
      changeEventId: "chg-demo-1",
      generatedAt: "2026-08-09T12:00:00.000Z",
    });
    const typst = renderReportPackTypst(pack, template);
    expect(typst).toContain("chg-demo-1");
    expect(typst).not.toContain("{{changeEventId}}");
  });

  it("compiles PDF when typst binary is available", async () => {
    const binary = resolveTypstBinary();
    if (!binary) {
      // Soft skip — environment without typst still passes scaffold tests above.
      expect(binary).toBeUndefined();
      return;
    }
    const pack = composeReportPack({
      tenantId: "tenant-1",
      changeEventId: "chg-demo-1",
      generatedAt: "2026-08-09T12:00:00.000Z",
      executions: [execution({ executionId: "exec-trivy" })],
    });
    const pdf = await tryCompileReportPackPdf(pack, { typstBinary: binary });
    expect(pdf.ok).toBe(true);
    if (pdf.ok) {
      expect(pdf.bytes.subarray(0, 4).toString("utf8")).toBe("%PDF");
    }
  });
});
