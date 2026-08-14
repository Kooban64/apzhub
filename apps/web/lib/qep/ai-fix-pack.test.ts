import { describe, expect, it } from "vitest";

import { composeReportPack } from "./report-pack";
import {
  assertAiFixPackAdvisory,
  composeAiFixPack,
  renderAiFixPackMarkdown,
} from "./ai-fix-pack";
import type { ReportFinding } from "./report-pack-findings";

describe("F13 ai-fix-pack", () => {
  it("composes advisory pack with agent instructions from findings", () => {
    const findings: ReportFinding[] = [
      {
        id: "f-1",
        toolId: "trivy",
        severity: "critical",
        title: "Vulnerable dependency",
        description: "CVE-2024-0001 in package x",
        location: "package-lock.json",
        recommendation: "Upgrade package x to >=2.0.0",
      },
      {
        id: "f-2",
        toolId: "semgrep",
        severity: "high",
        title: "SQL injection sink",
        description: "Untrusted input reaches query",
        location: "src/db.ts:42",
        recommendation: "Use parameterized queries",
      },
    ];

    const report = composeReportPack({
      tenantId: "tenant-1",
      changeEventId: "chg-early-1",
      generatedAt: "2026-08-10T08:00:00.000Z",
      executions: [],
      evidenceLinks: [],
      dispatches: [],
      findings,
    });

    const pack = composeAiFixPack({
      tenantId: "tenant-1",
      changeEventId: "chg-early-1",
      generatedAt: "2026-08-10T08:00:00.000Z",
      report,
    });

    expect(pack.kind).toBe("ai_fix_pack");
    expect(pack.advisory).toBe(true);
    expect(pack.autoCertified).toBe(false);
    expect(pack.purpose).toBe("developer_early_check");
    expect(pack.items.length).toBeGreaterThan(0);
    expect(pack.items[0]?.agentInstruction).toMatch(/Not a release GO/i);
    expect(pack.items[0]?.agentInstruction).toMatch(
      /Vulnerable dependency|SQL injection/,
    );

    assertAiFixPackAdvisory(pack);

    const md = renderAiFixPackMarkdown(pack);
    expect(md).toMatch(/AI Fix Pack/);
    expect(md).toMatch(/Not certification/);
    expect(md).toMatch(/Agent instruction/);
    expect(md).not.toMatch(/GO\/NO-GO decision recorded/);
  });

  it("source policy: must not call certification mutation APIs", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const source = await fs.readFile(
      path.join(process.cwd(), "apps/web/lib/qep/ai-fix-pack.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/recordHumanCertificationDecision/);
    expect(source).not.toMatch(/evaluateChangeCertification/);
    expect(source).toMatch(/autoCertified: false/);
  });
});
