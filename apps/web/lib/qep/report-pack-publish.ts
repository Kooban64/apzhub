/**
 * Flagship F12 — published report pack registry (human sign-off).
 * Draft remains recomputed; publish snapshots sign-off + residual risk.
 * Never auto-certifies / never implies GO by itself.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

import type { ReportPack, ReportPackSignOff } from "@/lib/qep/report-pack";

export type PublishedReportPackRecord = {
  readonly changeEventId: string;
  readonly tenantId: string;
  readonly packId: string;
  readonly publishedAt: string;
  readonly signOff: ReportPackSignOff & {
    readonly signed: true;
    readonly signerName: string;
    readonly signedAt: string;
    readonly decision: NonNullable<ReportPackSignOff["decision"]>;
  };
  readonly residualRiskStatement: string;
  /** Snapshot of assessment band at publish time. */
  readonly assessmentBand: string;
  readonly assessmentHeadline: string;
  readonly findingTotal: number;
};

function publishDir(): string {
  const cwd = process.cwd();
  if (cwd.endsWith("/apps/web") || cwd.endsWith("\\apps/web")) {
    return join(cwd, ".data/qep-report-packs", "published");
  }
  return join(cwd, "apps/web/.data/qep-report-packs", "published");
}

function publishPath(changeEventId: string): string {
  const safe = changeEventId.replace(/[^a-zA-Z0-9._:-]/g, "_");
  return join(publishDir(), `${safe}.json`);
}

export async function getPublishedReportPack(
  changeEventId: string,
): Promise<PublishedReportPackRecord | undefined> {
  const path = publishPath(changeEventId);
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(await readFile(path, "utf8")) as PublishedReportPackRecord;
  } catch {
    return undefined;
  }
}

export async function savePublishedReportPack(
  record: PublishedReportPackRecord,
): Promise<PublishedReportPackRecord> {
  await mkdir(publishDir(), { recursive: true });
  await writeFile(
    publishPath(record.changeEventId),
    JSON.stringify(record, null, 2),
    "utf8",
  );
  return record;
}

/** Apply a published record onto a freshly composed draft pack. */
export function applyPublishedOverlay(
  pack: ReportPack,
  published: PublishedReportPackRecord,
): ReportPack {
  return {
    ...pack,
    status: "published",
    residualRisk: {
      placeholder: false,
      statement: published.residualRiskStatement,
    },
    signOff: published.signOff,
  };
}

export type PublishReportPackInput = {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly signerName: string;
  readonly signerRole?: string;
  readonly decision: NonNullable<ReportPackSignOff["decision"]>;
  readonly residualRiskStatement: string;
  readonly notes?: string;
  readonly pack: ReportPack;
};

export async function publishReportPackRecord(
  input: PublishReportPackInput,
): Promise<{ pack: ReportPack; published: PublishedReportPackRecord }> {
  const signerName = input.signerName.trim();
  const residual = input.residualRiskStatement.trim();
  if (!signerName) {
    throw new Error("report_pack.signer_required");
  }
  if (residual.length < 20) {
    throw new Error("report_pack.residual_risk_required");
  }
  if (
    input.decision !== "accepted_with_residual_risk" &&
    input.decision !== "rejected" &&
    input.decision !== "needs_rework"
  ) {
    throw new Error("report_pack.decision_invalid");
  }

  const publishedAt = new Date().toISOString();
  const published: PublishedReportPackRecord = {
    changeEventId: input.changeEventId,
    tenantId: input.tenantId,
    packId: input.pack.packId,
    publishedAt,
    signOff: {
      signed: true,
      signerName,
      signerRole: input.signerRole?.trim() || undefined,
      signedAt: publishedAt,
      decision: input.decision,
      notes: input.notes?.trim() || undefined,
    },
    residualRiskStatement: residual,
    assessmentBand: input.pack.assessment.band,
    assessmentHeadline: input.pack.assessment.headline,
    findingTotal: input.pack.severityRollup.total,
  };

  await savePublishedReportPack(published);
  return {
    pack: applyPublishedOverlay(input.pack, published),
    published,
  };
}
