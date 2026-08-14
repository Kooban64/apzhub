import { describe, expect, it, beforeEach } from "vitest";

import { composeReportPack } from "./report-pack";
import {
  confirmQaGateFindings,
  getQaGateConfirmations,
  resetQaGateConfirmStoreForTests,
} from "./qa-gate-confirm-store";
import { composeFixDirectionPackFromReport } from "./fix-direction-pack";
import type { ReportFinding } from "./report-pack-findings";

describe("F15 qa-gate confirm + fix direction", () => {
  beforeEach(() => {
    resetQaGateConfirmStoreForTests();
  });

  it("records human confirmations without certifying", () => {
    const record = confirmQaGateFindings({
      tenantId: "tenant-1",
      changeEventId: "chg-qa-1",
      confirmedBy: "qa-user",
      findingIds: ["f-1", "f-2"],
      notes: "Reproduced on staging",
      now: () => new Date("2026-08-10T12:00:00.000Z"),
    });
    expect(record.findings).toHaveLength(2);
    expect(getQaGateConfirmations("tenant-1", "chg-qa-1")?.findings[0]?.notes).toBe(
      "Reproduced on staging",
    );
  });

  it("builds Fix Direction Pack preferring confirmed findings", () => {
    const findings: ReportFinding[] = [
      {
        id: "f-1",
        toolId: "trivy",
        severity: "critical",
        title: "CVE critical",
        description: "bad dep",
        recommendation: "upgrade",
      },
      {
        id: "f-2",
        toolId: "zap",
        severity: "low",
        title: "Cookie flag",
        description: "missing flag",
        recommendation: "set Secure",
      },
    ];
    const report = composeReportPack({
      tenantId: "tenant-1",
      changeEventId: "chg-qa-1",
      generatedAt: "2026-08-10T12:00:00.000Z",
      executions: [],
      evidenceLinks: [],
      dispatches: [],
      findings,
    });
    const pack = composeFixDirectionPackFromReport({
      tenantId: "tenant-1",
      changeEventId: "chg-qa-1",
      generatedAt: "2026-08-10T12:00:00.000Z",
      report,
      confirmedFindingIds: ["f-1"],
      preferConfirmed: true,
    });
    expect(pack.kind).toBe("fix_direction_pack");
    expect(pack.purpose).toBe("qa_gate_fix_direction");
    expect(pack.autoCertified).toBe(false);
    expect(pack.confirmedOnly).toBe(true);
    expect(pack.items.every((i) => i.relatedFindingIds.includes("f-1"))).toBe(true);
  });

  it("source policy: QA gate packs must not mutate certification", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    for (const file of [
      "apps/web/lib/qep/run-qa-gate-packs.ts",
      "apps/web/lib/qep/qa-gate.ts",
      "apps/web/lib/qep/fix-direction-pack.ts",
    ]) {
      const source = await fs.readFile(path.join(process.cwd(), file), "utf8");
      expect(source).not.toMatch(/recordHumanCertificationDecision/);
      expect(source).toMatch(/autoCertified: false|Never certifies|never GO/i);
    }
    const runner = await fs.readFile(
      path.join(process.cwd(), "apps/web/lib/qep/run-qa-gate-packs.ts"),
      "utf8",
    );
    expect(runner).toMatch(/includePenTest/);
    expect(runner).toMatch(/security/);
  });
});
