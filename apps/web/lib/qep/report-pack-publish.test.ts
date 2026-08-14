import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

import {
  applyPublishedOverlay,
  getPublishedReportPack,
  publishReportPackRecord,
} from "./report-pack-publish";
import { composeReportPack, renderReportPackMarkdown } from "./report-pack";

const TENANT = "tenant-publish-1";
const CHANGE = "chg-publish-test-1";

describe("F12 report-pack publish", () => {
  function publishedFileFor(changeEventId: string): string {
    const cwd = process.cwd();
    const root =
      cwd.endsWith("/apps/web") || cwd.endsWith("\\apps/web")
        ? join(cwd, ".data/qep-report-packs", "published")
        : join(cwd, "apps/web/.data/qep-report-packs", "published");
    return join(root, `${changeEventId.replace(/[^a-zA-Z0-9._:-]/g, "_")}.json`);
  }
  const publishedFile = publishedFileFor(CHANGE);

  beforeEach(async () => {
    if (existsSync(publishedFile)) {
      await rm(publishedFile, { force: true });
    }
  });

  afterEach(async () => {
    if (existsSync(publishedFile)) {
      await rm(publishedFile, { force: true });
    }
  });

  it("publishes with residual risk and overlays status", async () => {
    const draft = composeReportPack({
      tenantId: TENANT,
      changeEventId: CHANGE,
      generatedAt: "2026-08-10T00:00:00.000Z",
      executions: [],
      evidenceLinks: [],
      dispatches: [],
    });
    expect(draft.status).toBe("draft");
    expect(draft.signOff.signed).toBe(false);

    const { pack, published } = await publishReportPackRecord({
      tenantId: TENANT,
      changeEventId: CHANGE,
      signerName: "Ada Operator",
      signerRole: "QA Manager",
      decision: "accepted_with_residual_risk",
      residualRiskStatement:
        "Accepted residual: low/info items only; P0 cleared in follow-up ticket #42.",
      notes: "Lovebloom proof publish",
      pack: draft,
    });

    expect(pack.status).toBe("published");
    expect(pack.signOff.signed).toBe(true);
    expect(pack.signOff.signerName).toBe("Ada Operator");
    expect(pack.residualRisk.placeholder).toBe(false);
    expect(published.findingTotal).toBe(draft.severityRollup.total);

    const md = renderReportPackMarkdown(pack);
    expect(md).toMatch(/PUBLISHED/);
    expect(md).toMatch(/Ada Operator/);

    const stored = await getPublishedReportPack(CHANGE);
    expect(stored?.signOff.decision).toBe("accepted_with_residual_risk");

    const overlaid = applyPublishedOverlay(draft, stored!);
    expect(overlaid.status).toBe("published");
  });

  it("rejects short residual risk", async () => {
    const draft = composeReportPack({
      tenantId: TENANT,
      changeEventId: CHANGE,
      generatedAt: "2026-08-10T00:00:00.000Z",
      executions: [],
      evidenceLinks: [],
      dispatches: [],
    });
    await expect(
      publishReportPackRecord({
        tenantId: TENANT,
        changeEventId: CHANGE,
        signerName: "Ada",
        decision: "needs_rework",
        residualRiskStatement: "too short",
        pack: draft,
      }),
    ).rejects.toThrow("report_pack.residual_risk_required");
  });
});
