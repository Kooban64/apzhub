import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  ReleaseAdvisoryVerdict,
  ReleaseId,
  ReleaseReadinessSnapshot,
} from "@apzhub/testing-contracts";
import { asReleaseId, asReleaseReadinessSnapshotId } from "@apzhub/testing-contracts";
import type { ReleaseReadinessSnapshotRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";

export type ReadinessFocus = "full" | "certification" | "approvals";

function asStringArray(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function readinessSnapshotFromRecord(
  row: ReleaseReadinessSnapshotRecord,
): ReleaseReadinessSnapshot {
  const snap = row.snapshotJson;
  return {
    id: asReleaseReadinessSnapshotId(row.id),
    releaseId: asReleaseId(row.releaseId),
    verdict: (snap.verdict as ReleaseAdvisoryVerdict) ?? "NOT_READY",
    certificationLabels: asStringArray(snap.certificationLabels),
    coverageLabels: asStringArray(snap.coverageLabels),
    defectLabels: asStringArray(snap.defectLabels),
    evidenceLabels: asStringArray(snap.evidenceLabels),
    executionLabels: asStringArray(snap.executionLabels),
    approvalLabels: asStringArray(snap.approvalLabels),
    blockingFactors: asStringArray(snap.blockingFactors),
    warningFactors: asStringArray(snap.warningFactors),
    detailsJson:
      typeof snap.detailsJson === "object" && snap.detailsJson !== null
        ? (snap.detailsJson as Readonly<Record<string, unknown>>)
        : undefined,
    computedAt: row.computedAt,
    isDecision: false,
  };
}

function verdictFromFactors(
  blockers: readonly string[],
  warnings: readonly string[],
): ReleaseAdvisoryVerdict {
  if (blockers.length > 0) return "NOT_READY";
  if (warnings.length > 0) return "READY_WITH_WARNINGS";
  return "READY";
}

/**
 * Aggregate release readiness by calling existing persistence.
 * Always advisory (`isDecision: false`).
 */
export async function evaluateReleaseReadiness(
  rt: ServiceRuntime,
  ctx: ServiceRequestContext,
  releaseId: ReleaseId,
  focus: ReadinessFocus = "full",
): Promise<ReleaseReadinessSnapshot> {
  const rctx = toRepositoryContext(ctx);
  requireFound(
    await rt.persistence.releases.get(rctx, releaseId),
    "release",
    releaseId,
  );

  const listAll = { pageSize: 200 as const };
  const scopes = (
    await rt.persistence.releaseScopes.list(rctx, {
      ...listAll,
      filters: { releaseId },
    })
  ).items;

  const certificationLabels: string[] = [];
  const coverageLabels: string[] = [];
  const defectLabels: string[] = [];
  const evidenceLabels: string[] = [];
  const executionLabels: string[] = [];
  const approvalLabels: string[] = [];
  const blockingFactors: string[] = [];
  const warningFactors: string[] = [];

  const certScopes = scopes.filter((s) => s.kind === "certification");
  for (const scope of certScopes) {
    const cert = await rt.persistence.certificationRecords.get(rctx, scope.refId);
    if (!cert) {
      const label = `missing_certification:${scope.refId}`;
      certificationLabels.push(label);
      blockingFactors.push(label);
      continue;
    }
    const label = `certification:${cert.key}:${cert.status}`;
    certificationLabels.push(label);
    if (
      cert.status === "rejected" ||
      cert.status === "failed_certification" ||
      cert.status === "expired"
    ) {
      blockingFactors.push(label);
    } else if (
      cert.status !== "approved" &&
      cert.status !== "certified" &&
      cert.status !== "conditionally_approved" &&
      cert.status !== "conditional_approval"
    ) {
      warningFactors.push(label);
    }
    if (cert.expiresAt && cert.expiresAt < rt.now()) {
      const expired = `expired_certification:${cert.key}`;
      certificationLabels.push(expired);
      blockingFactors.push(expired);
    }
  }

  const coverage = (await rt.persistence.coverageRecords.list(rctx, listAll)).items;
  for (const row of coverage) {
    const label = `coverage:${row.kind}:${row.percentage}%`;
    coverageLabels.push(label);
    if (row.percentage < 50) blockingFactors.push(label);
    else if (row.percentage < 100) warningFactors.push(label);
  }

  const defects = (await rt.persistence.defectLinks.list(rctx, listAll)).items;
  const openDefects = defects.filter((d) =>
    ["open", "in_progress", "reopened"].includes(d.status),
  );
  for (const d of openDefects) {
    const label = `defect:${d.externalRef ?? d.internalRef ?? d.id}:${d.status}:${d.severity ?? "unknown"}`;
    defectLabels.push(label);
    if (d.severity === "critical" || d.severity === "blocker") {
      blockingFactors.push(label);
    } else {
      warningFactors.push(label);
    }
  }

  const evidence = (await rt.persistence.evidence.list(rctx, listAll)).items;
  const releaseEvidence = (
    await rt.persistence.releaseEvidence.list(rctx, {
      ...listAll,
      filters: { releaseId },
    })
  ).items;
  if (evidence.length === 0 && releaseEvidence.length === 0) {
    const label = "missing_evidence:none";
    evidenceLabels.push(label);
    warningFactors.push(label);
  } else {
    evidenceLabels.push(`evidence_count:${evidence.length + releaseEvidence.length}`);
  }

  const executions = (await rt.persistence.manualExecutions.list(rctx, listAll)).items;
  for (const ex of executions) {
    if (
      ex.overallResult === "fail" ||
      ex.status === "failed" ||
      ex.status === "blocked"
    ) {
      const label = `execution_failed:${ex.id}`;
      executionLabels.push(label);
      blockingFactors.push(label);
    } else if (
      ex.status === "in_progress" ||
      ex.status === "paused" ||
      ex.status === "assigned"
    ) {
      const label = `execution_incomplete:${ex.id}:${ex.status}`;
      executionLabels.push(label);
      warningFactors.push(label);
    }
  }

  const platformApprovals = (await rt.persistence.approvals.list(rctx, listAll)).items;
  for (const a of platformApprovals) {
    const label = `platform_approval:${a.id}:${a.status}`;
    approvalLabels.push(label);
    if (a.status === "rejected") blockingFactors.push(label);
    else if (a.status === "pending") warningFactors.push(label);
  }

  const releaseApprovals = (
    await rt.persistence.releaseApprovals.list(rctx, {
      ...listAll,
      filters: { releaseId },
    })
  ).items;
  for (const a of releaseApprovals) {
    const label = `release_approval:${a.stageKind}:${a.status}`;
    approvalLabels.push(label);
    if (a.status === "rejected") blockingFactors.push(label);
    else if (a.status === "pending") {
      if (focus === "approvals") blockingFactors.push(label);
      else warningFactors.push(label);
    }
  }

  if (focus === "certification" && certificationLabels.length === 0) {
    const label = "certification_scope:none";
    certificationLabels.push(label);
    warningFactors.push(label);
  }
  if (focus === "approvals" && approvalLabels.length === 0) {
    const label = "approvals:none";
    approvalLabels.push(label);
    warningFactors.push(label);
  }

  // Specialize factor weighting for focused evaluations.
  let finalBlockers = [...blockingFactors];
  let finalWarnings = [...warningFactors];
  if (focus === "certification") {
    finalBlockers = blockingFactors.filter(
      (f) => f.includes("certification") || f.includes("expired_certification"),
    );
    finalWarnings = warningFactors.filter(
      (f) =>
        f.includes("certification") ||
        f.includes("expired_certification") ||
        f.includes("certification_scope"),
    );
    if (finalBlockers.length === 0 && finalWarnings.length === 0) {
      // Keep non-cert noise out of verdict but retain labels for transparency.
    }
  } else if (focus === "approvals") {
    finalBlockers = blockingFactors.filter(
      (f) => f.includes("approval") || f.includes("approvals"),
    );
    finalWarnings = warningFactors.filter(
      (f) => f.includes("approval") || f.includes("approvals"),
    );
  }

  const verdict = verdictFromFactors(finalBlockers, finalWarnings);
  const computedAt = rt.now();
  const detailsJson: Record<string, unknown> = {
    focus,
    scopeCount: scopes.length,
    coverageCount: coverage.length,
    openDefectCount: openDefects.length,
  };

  const snapshotJson: Record<string, unknown> = {
    verdict,
    certificationLabels,
    coverageLabels,
    defectLabels,
    evidenceLabels,
    executionLabels,
    approvalLabels,
    blockingFactors: finalBlockers,
    warningFactors: finalWarnings,
    detailsJson,
  };

  const row = await rt.persistence.releaseReadinessSnapshots.create(rctx, {
    id: rt.id(),
    releaseId,
    snapshotJson,
    computedAt,
    isDecision: false,
    organisationId: ctx.organisationId,
  });

  return readinessSnapshotFromRecord(row);
}
