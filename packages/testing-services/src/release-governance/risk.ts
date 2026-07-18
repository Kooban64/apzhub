import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type { ReleaseId, ReleaseRiskAssessment } from "@apzhub/testing-contracts";
import { asReleaseId, asReleaseRiskAssessmentId } from "@apzhub/testing-contracts";
import type { ReleaseRiskAssessmentRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";

function asStringArray(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function riskAssessmentFromRecord(
  row: ReleaseRiskAssessmentRecord,
): ReleaseRiskAssessment {
  const snap = row.snapshotJson;
  return {
    id: asReleaseRiskAssessmentId(row.id),
    releaseId: asReleaseId(row.releaseId),
    openDefectLabels: asStringArray(snap.openDefectLabels),
    coverageGapLabels: asStringArray(snap.coverageGapLabels),
    failedExecutionLabels: asStringArray(snap.failedExecutionLabels),
    failedAutomationLabels: asStringArray(snap.failedAutomationLabels),
    missingApprovalLabels: asStringArray(snap.missingApprovalLabels),
    missingEvidenceLabels: asStringArray(snap.missingEvidenceLabels),
    expiredCertificationLabels: asStringArray(snap.expiredCertificationLabels),
    manualOverrideLabels: asStringArray(snap.manualOverrideLabels),
    overallLabel: typeof snap.overallLabel === "string" ? snap.overallLabel : "unknown",
    detailsJson:
      typeof snap.detailsJson === "object" && snap.detailsJson !== null
        ? (snap.detailsJson as Readonly<Record<string, unknown>>)
        : undefined,
    computedAt: row.computedAt,
    isDecision: false,
  };
}

function overallRiskLabel(counts: { blockers: number; warnings: number }): string {
  if (counts.blockers > 0) return "high_risk";
  if (counts.warnings > 0) return "elevated_risk";
  return "low_risk";
}

/**
 * Aggregate release risk by calling existing persistence.
 * Always advisory (`isDecision: false`).
 */
export async function evaluateReleaseRisk(
  rt: ServiceRuntime,
  ctx: ServiceRequestContext,
  releaseId: ReleaseId,
): Promise<ReleaseRiskAssessment> {
  const rctx = toRepositoryContext(ctx);
  requireFound(
    await rt.persistence.releases.get(rctx, releaseId),
    "release",
    releaseId,
  );

  const listAll = { pageSize: 200 as const };
  const openDefectLabels: string[] = [];
  const coverageGapLabels: string[] = [];
  const failedExecutionLabels: string[] = [];
  const failedAutomationLabels: string[] = [];
  const missingApprovalLabels: string[] = [];
  const missingEvidenceLabels: string[] = [];
  const expiredCertificationLabels: string[] = [];
  const manualOverrideLabels: string[] = [];

  let blockers = 0;
  let warnings = 0;

  const defects = (await rt.persistence.defectLinks.list(rctx, listAll)).items;
  for (const d of defects) {
    if (!["open", "in_progress", "reopened"].includes(d.status)) continue;
    const label = `open_defect:${d.externalRef ?? d.id}:${d.severity ?? "unknown"}`;
    openDefectLabels.push(label);
    if (d.severity === "critical" || d.severity === "blocker") blockers += 1;
    else warnings += 1;
  }

  const coverage = (await rt.persistence.coverageRecords.list(rctx, listAll)).items;
  for (const row of coverage) {
    if (row.percentage >= 100) continue;
    const label = `coverage_gap:${row.kind}:${row.percentage}%`;
    coverageGapLabels.push(label);
    if (row.percentage < 50) blockers += 1;
    else warnings += 1;
  }

  const executions = (await rt.persistence.manualExecutions.list(rctx, listAll)).items;
  for (const ex of executions) {
    if (
      ex.overallResult === "fail" ||
      ex.status === "failed" ||
      ex.status === "blocked"
    ) {
      failedExecutionLabels.push(`failed_execution:${ex.id}`);
      blockers += 1;
    }
    if (ex.parameterOverrides && Object.keys(ex.parameterOverrides).length > 0) {
      manualOverrideLabels.push(`manual_override:execution:${ex.id}`);
      warnings += 1;
    }
  }

  const autoExecs = (await rt.persistence.automatedExecutions.list(rctx, listAll))
    .items;
  for (const ax of autoExecs) {
    if (
      ax.overallStatus === "fail" ||
      ax.overallStatus === "failed" ||
      ax.status === "failed" ||
      ax.status === "blocked"
    ) {
      failedAutomationLabels.push(`failed_automation:${ax.id}`);
      blockers += 1;
    }
  }

  const releaseApprovals = (
    await rt.persistence.releaseApprovals.list(rctx, {
      ...listAll,
      filters: { releaseId },
    })
  ).items;
  for (const a of releaseApprovals) {
    if (a.status === "pending") {
      missingApprovalLabels.push(`missing_approval:${a.stageKind}`);
      warnings += 1;
    }
  }
  const platformApprovals = (await rt.persistence.approvals.list(rctx, listAll)).items;
  for (const a of platformApprovals) {
    if (a.status === "pending") {
      missingApprovalLabels.push(`missing_platform_approval:${a.id}`);
      warnings += 1;
    }
  }

  const releaseEvidence = (
    await rt.persistence.releaseEvidence.list(rctx, {
      ...listAll,
      filters: { releaseId },
    })
  ).items;
  const evidence = (await rt.persistence.evidence.list(rctx, listAll)).items;
  if (releaseEvidence.length === 0 && evidence.length === 0) {
    missingEvidenceLabels.push("missing_evidence:none");
    warnings += 1;
  }

  const scopes = (
    await rt.persistence.releaseScopes.list(rctx, {
      ...listAll,
      filters: { releaseId },
    })
  ).items;
  for (const scope of scopes.filter((s) => s.kind === "certification")) {
    const cert = await rt.persistence.certificationRecords.get(rctx, scope.refId);
    if (!cert) {
      expiredCertificationLabels.push(`missing_certification:${scope.refId}`);
      blockers += 1;
      continue;
    }
    if (
      cert.status === "expired" ||
      (cert.expiresAt !== undefined && cert.expiresAt < rt.now())
    ) {
      expiredCertificationLabels.push(`expired_certification:${cert.key}`);
      blockers += 1;
    }
  }

  const overallLabel = overallRiskLabel({ blockers, warnings });
  const computedAt = rt.now();
  const detailsJson: Record<string, unknown> = {
    blockers,
    warnings,
  };
  const snapshotJson: Record<string, unknown> = {
    openDefectLabels,
    coverageGapLabels,
    failedExecutionLabels,
    failedAutomationLabels,
    missingApprovalLabels,
    missingEvidenceLabels,
    expiredCertificationLabels,
    manualOverrideLabels,
    overallLabel,
    detailsJson,
  };

  const row = await rt.persistence.releaseRiskAssessments.create(rctx, {
    id: rt.id(),
    releaseId,
    snapshotJson,
    computedAt,
    isDecision: false,
    organisationId: ctx.organisationId,
  });

  return riskAssessmentFromRecord(row);
}
