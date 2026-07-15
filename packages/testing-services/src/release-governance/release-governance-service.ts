import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  Release,
  ReleaseApproval,
  ReleaseApprovalStageKind,
  ReleaseAuditEntry,
  ReleaseCandidate,
  ReleaseDecision,
  ReleaseDependency,
  ReleaseEvidence,
  ReleaseGovernanceService,
  ReleaseGovernanceStatus,
  ReleaseManifest,
  ReleaseNote,
  ReleasePackage,
  ReleaseScope,
  ReleaseSummary,
  ReleaseWindow,
} from "@apzhub/testing-contracts";
import {
  asReleaseApprovalId,
  asReleaseAuditEntryId,
  asReleaseCandidateId,
  asReleaseDecisionId,
  asReleaseDependencyId,
  asReleaseEvidenceId,
  asReleaseId,
  asReleaseNoteId,
  asReleasePackageId,
  asReleaseScopeId,
  asReleaseSummarySnapshotId,
} from "@apzhub/testing-contracts";
import type {
  ReleaseApprovalRecord,
  ReleaseAuditRecord,
  ReleaseCandidateRecord,
  ReleaseDecisionRecord,
  ReleaseDependencyRecord,
  ReleaseEvidenceRecord,
  ReleaseNoteRecord,
  ReleasePackageRecord,
  ReleaseRecord,
  ReleaseScopeRecord,
} from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { DomainRuleError, requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { evaluateReleaseReadiness } from "./readiness";
import { evaluateReleaseRisk } from "./risk";
import { assertReleaseGovernanceTransition } from "./state-machine";

function assertNonEmpty(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new DomainRuleError("validation_error", `${field} is required`, {
      field,
    });
  }
}

/** Allow release.admin, release.* (and nested wildcards), or exact key. */
export function assertHasReleasePermission(
  ctx: ServiceRequestContext,
  permission: string,
): void {
  const perms = ctx.permissions ?? [];
  const ok = perms.some(
    (p) =>
      p === permission ||
      p === "release.admin" ||
      p === "release.*" ||
      p === "*" ||
      (p.endsWith(".*") && permission.startsWith(p.slice(0, -1))),
  );
  if (!ok) {
    throw new DomainRuleError(
      "permission_denied",
      `Missing permission ${permission}`,
      { permission },
    );
  }
}

function windowFromJson(
  json: Readonly<Record<string, unknown>> | undefined,
): ReleaseWindow | undefined {
  if (!json) return undefined;
  return {
    startsAt: typeof json.startsAt === "string" ? json.startsAt : undefined,
    endsAt: typeof json.endsAt === "string" ? json.endsAt : undefined,
    timezone: typeof json.timezone === "string" ? json.timezone : undefined,
    notes: typeof json.notes === "string" ? json.notes : undefined,
  };
}

function windowToJson(
  window: ReleaseWindow | undefined,
): Readonly<Record<string, unknown>> | undefined {
  if (!window) return undefined;
  return { ...window };
}

function toRelease(row: ReleaseRecord): Release {
  return {
    id: asReleaseId(row.id),
    key: row.key,
    name: row.name,
    status: row.status,
    description: row.description,
    window: windowFromJson(row.windowJson),
    metadata: row.metadataJson,
    organisationId: row.organisationId,
    tenantId: row.tenantId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt,
  };
}

function toScope(row: ReleaseScopeRecord): ReleaseScope {
  return {
    id: asReleaseScopeId(row.id),
    releaseId: asReleaseId(row.releaseId),
    kind: row.kind,
    refId: row.refId,
    label: row.label,
    tenantId: row.tenantId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt,
  };
}

function toPackage(row: ReleasePackageRecord): ReleasePackage {
  return {
    id: asReleasePackageId(row.id),
    releaseId: asReleaseId(row.releaseId),
    name: row.name,
    versionLabel: row.versionLabel,
    description: row.description,
    tenantId: row.tenantId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt,
  };
}

function toCandidate(row: ReleaseCandidateRecord): ReleaseCandidate {
  return {
    id: asReleaseCandidateId(row.id),
    releaseId: asReleaseId(row.releaseId),
    label: row.label,
    status: row.status,
    notes: row.notes,
    tenantId: row.tenantId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt,
  };
}

function toEvidence(row: ReleaseEvidenceRecord): ReleaseEvidence {
  return {
    id: asReleaseEvidenceId(row.id),
    releaseId: asReleaseId(row.releaseId),
    kind: row.kind,
    refId: row.refId,
    summary: row.summary,
    tenantId: row.tenantId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt,
  };
}

function toNote(row: ReleaseNoteRecord): ReleaseNote {
  return {
    id: asReleaseNoteId(row.id),
    releaseId: asReleaseId(row.releaseId),
    title: row.title,
    body: row.body,
    authoredAt: row.authoredAt,
    authorUserId: row.authorUserId,
    tenantId: row.tenantId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt,
  };
}

function toDependency(row: ReleaseDependencyRecord): ReleaseDependency {
  return {
    id: asReleaseDependencyId(row.id),
    releaseId: asReleaseId(row.releaseId),
    dependsOnReleaseId: row.dependsOnReleaseId
      ? asReleaseId(row.dependsOnReleaseId)
      : undefined,
    kind: row.kind,
    required: row.required,
    notes: row.notes,
    blocked: row.blocked,
    tenantId: row.tenantId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt,
  };
}

function toApproval(row: ReleaseApprovalRecord): ReleaseApproval {
  return {
    id: asReleaseApprovalId(row.id),
    releaseId: asReleaseId(row.releaseId),
    stageKind: row.stageKind,
    status: row.status,
    requestedFromUserId: row.requestedFromUserId,
    decidedByUserId: row.decidedByUserId,
    decidedAt: row.decidedAt,
    comments: row.comments,
    conditions: row.conditions,
    tenantId: row.tenantId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt,
  };
}

function toDecision(row: ReleaseDecisionRecord): ReleaseDecision {
  return {
    id: asReleaseDecisionId(row.id),
    releaseId: asReleaseId(row.releaseId),
    verdict: row.verdict,
    decidedByUserId: row.decidedByUserId,
    decidedAt: row.decidedAt,
    rationale: row.rationale,
    isAutomatic: false,
    tenantId: row.tenantId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt,
  };
}

function toAudit(row: ReleaseAuditRecord): ReleaseAuditEntry {
  return {
    id: asReleaseAuditEntryId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId,
    releaseId: asReleaseId(row.releaseId),
    occurredAt: row.occurredAt,
    actorUserId: row.actorUserId,
    action: row.action,
    summary: row.summary,
    detailsJson: row.detailsJson,
    correlationId: row.correlationId,
  };
}

async function appendReleaseAudit(
  rt: ServiceRuntime,
  ctx: ServiceRequestContext,
  input: {
    readonly releaseId: string;
    readonly action: string;
    readonly summary: string;
    readonly detailsJson?: Readonly<Record<string, unknown>>;
  },
): Promise<void> {
  await rt.persistence.releaseAudits.append(toRepositoryContext(ctx), {
    id: rt.id(),
    tenantId: ctx.tenantId,
    organisationId: ctx.organisationId,
    releaseId: input.releaseId,
    action: input.action,
    summary: input.summary,
    detailsJson: input.detailsJson,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    occurredAt: rt.now(),
  });
}

async function loadRelease(
  rt: ServiceRuntime,
  ctx: ServiceRequestContext,
  id: string,
): Promise<ReleaseRecord> {
  return requireFound(
    await rt.persistence.releases.get(toRepositoryContext(ctx), id),
    "release",
    id,
  );
}

async function transitionRelease(
  rt: ServiceRuntime,
  ctx: ServiceRequestContext,
  id: string,
  nextStatus: ReleaseGovernanceStatus,
  action: string,
  summary: string,
  detailsJson?: Readonly<Record<string, unknown>>,
): Promise<Release> {
  const rctx = toRepositoryContext(ctx);
  const existing = await loadRelease(rt, ctx, id);
  assertReleaseGovernanceTransition(existing.status, nextStatus);
  const row = await rt.persistence.releases.update(
    rctx,
    id,
    existing.revision,
    { status: nextStatus },
  );
  await appendReleaseAudit(rt, ctx, {
    releaseId: id,
    action,
    summary,
    detailsJson: {
      ...detailsJson,
      from: existing.status,
      to: nextStatus,
    },
  });
  return toRelease(row);
}

export function createReleaseGovernanceService(
  rt: ServiceRuntime,
): ReleaseGovernanceService {
  return {
    async createRelease(ctx, input) {
      assertHasReleasePermission(ctx, "release.create");
      assertNonEmpty(input.key, "key");
      assertNonEmpty(input.name, "name");
      const status = input.status ?? "draft";
      const rctx = toRepositoryContext(ctx);
      const row = await rt.persistence.releases.create(rctx, {
        id: rt.id(),
        key: input.key,
        name: input.name,
        status,
        description: input.description,
        windowJson: windowToJson(input.window),
        metadataJson: input.metadata,
        organisationId: input.organisationId ?? ctx.organisationId,
      });
      await appendReleaseAudit(rt, ctx, {
        releaseId: row.id,
        action: "release.created",
        summary: `Created release ${row.key}`,
        detailsJson: { status },
      });
      return toRelease(row);
    },

    async getRelease(ctx, id) {
      assertHasReleasePermission(ctx, "release.view");
      return toRelease(await loadRelease(rt, ctx, id));
    },

    async listReleases(ctx) {
      assertHasReleasePermission(ctx, "release.view");
      const page = await rt.persistence.releases.list(toRepositoryContext(ctx), {
        pageSize: 200,
      });
      return page.items.map(toRelease);
    },

    async updateReleaseMetadata(ctx, id, input) {
      assertHasReleasePermission(ctx, "release.update");
      const rctx = toRepositoryContext(ctx);
      const existing = await loadRelease(rt, ctx, id);
      let status = existing.status;
      if (existing.status === "draft") {
        assertReleaseGovernanceTransition(existing.status, "planning");
        status = "planning";
      }
      const row = await rt.persistence.releases.update(
        rctx,
        id,
        existing.revision,
        {
          name: input.name,
          description: input.description,
          windowJson:
            input.window !== undefined
              ? windowToJson(input.window)
              : existing.windowJson,
          metadataJson:
            input.metadata !== undefined ? input.metadata : existing.metadataJson,
          status,
        },
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId: id,
        action: "release.metadata_updated",
        summary: `Updated release metadata ${row.key}`,
        detailsJson:
          status !== existing.status
            ? { from: existing.status, to: status }
            : undefined,
      });
      return toRelease(row);
    },

    async addScope(ctx, releaseId, input) {
      assertHasReleasePermission(ctx, "release.update");
      await loadRelease(rt, ctx, releaseId);
      const row = await rt.persistence.releaseScopes.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          releaseId,
          kind: input.kind,
          refId: input.refId,
          label: input.label,
          organisationId: ctx.organisationId,
        },
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.scope_added",
        summary: `Added scope ${input.kind}:${input.refId}`,
      });
      return toScope(row);
    },

    async removeScope(ctx, releaseId, scopeId) {
      assertHasReleasePermission(ctx, "release.update");
      const rctx = toRepositoryContext(ctx);
      await loadRelease(rt, ctx, releaseId);
      const scope = requireFound(
        await rt.persistence.releaseScopes.get(rctx, scopeId),
        "release_scope",
        scopeId,
      );
      if (scope.releaseId !== releaseId) {
        throw new DomainRuleError(
          "scope_release_mismatch",
          "Scope does not belong to release",
          { releaseId, scopeId },
        );
      }
      await rt.persistence.releaseScopes.archive(rctx, scopeId, scope.revision);
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.scope_removed",
        summary: `Removed scope ${scopeId}`,
      });
    },

    async attachEvidence(ctx, releaseId, input) {
      assertHasReleasePermission(ctx, "release.update");
      await loadRelease(rt, ctx, releaseId);
      const row = await rt.persistence.releaseEvidence.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          releaseId,
          kind: input.kind,
          refId: input.refId,
          summary: input.summary,
          organisationId: ctx.organisationId,
        },
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.evidence_attached",
        summary: `Attached evidence ${input.kind}:${input.refId}`,
      });
      return toEvidence(row);
    },

    async removeEvidence(ctx, releaseId, evidenceId) {
      assertHasReleasePermission(ctx, "release.update");
      const rctx = toRepositoryContext(ctx);
      await loadRelease(rt, ctx, releaseId);
      const evidence = requireFound(
        await rt.persistence.releaseEvidence.get(rctx, evidenceId),
        "release_evidence",
        evidenceId,
      );
      if (evidence.releaseId !== releaseId) {
        throw new DomainRuleError(
          "evidence_release_mismatch",
          "Evidence does not belong to release",
          { releaseId, evidenceId },
        );
      }
      await rt.persistence.releaseEvidence.archive(
        rctx,
        evidenceId,
        evidence.revision,
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.evidence_removed",
        summary: `Removed evidence ${evidenceId}`,
      });
    },

    async addPackage(ctx, releaseId, input) {
      assertHasReleasePermission(ctx, "release.update");
      assertNonEmpty(input.name, "name");
      assertNonEmpty(input.versionLabel, "versionLabel");
      await loadRelease(rt, ctx, releaseId);
      const row = await rt.persistence.releasePackages.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          releaseId,
          name: input.name,
          versionLabel: input.versionLabel,
          description: input.description,
          organisationId: ctx.organisationId,
        },
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.package_added",
        summary: `Added package ${input.name}@${input.versionLabel}`,
      });
      return toPackage(row);
    },

    async addCandidate(ctx, releaseId, input) {
      assertHasReleasePermission(ctx, "release.update");
      assertNonEmpty(input.label, "label");
      const release = await loadRelease(rt, ctx, releaseId);
      const row = await rt.persistence.releaseCandidates.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          releaseId,
          label: input.label,
          status: release.status,
          notes: input.notes,
          organisationId: ctx.organisationId,
        },
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.candidate_added",
        summary: `Added candidate ${input.label}`,
      });
      return toCandidate(row);
    },

    async addNote(ctx, releaseId, input) {
      assertHasReleasePermission(ctx, "release.update");
      assertNonEmpty(input.title, "title");
      assertNonEmpty(input.body, "body");
      await loadRelease(rt, ctx, releaseId);
      const row = await rt.persistence.releaseNotes.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          releaseId,
          title: input.title,
          body: input.body,
          authoredAt: rt.now(),
          authorUserId: ctx.userId,
          organisationId: ctx.organisationId,
        },
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.note_added",
        summary: `Added note ${input.title}`,
      });
      return toNote(row);
    },

    async addDependency(ctx, releaseId, input) {
      assertHasReleasePermission(ctx, "release.update");
      assertNonEmpty(input.kind, "kind");
      await loadRelease(rt, ctx, releaseId);
      const row = await rt.persistence.releaseDependencies.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          releaseId,
          dependsOnReleaseId: input.dependsOnReleaseId,
          kind: input.kind,
          required: input.required ?? true,
          notes: input.notes,
          blocked: input.blocked ?? false,
          organisationId: ctx.organisationId,
        },
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.dependency_added",
        summary: `Added dependency ${input.kind}`,
      });
      return toDependency(row);
    },

    async removeDependency(ctx, releaseId, dependencyId) {
      assertHasReleasePermission(ctx, "release.update");
      const rctx = toRepositoryContext(ctx);
      await loadRelease(rt, ctx, releaseId);
      const dep = requireFound(
        await rt.persistence.releaseDependencies.get(rctx, dependencyId),
        "release_dependency",
        dependencyId,
      );
      if (dep.releaseId !== releaseId) {
        throw new DomainRuleError(
          "dependency_release_mismatch",
          "Dependency does not belong to release",
          { releaseId, dependencyId },
        );
      }
      await rt.persistence.releaseDependencies.archive(
        rctx,
        dependencyId,
        dep.revision,
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.dependency_removed",
        summary: `Removed dependency ${dependencyId}`,
      });
    },

    async evaluateReadiness(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.readiness.evaluate");
      const snapshot = await evaluateReleaseReadiness(rt, ctx, releaseId, "full");
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.readiness_evaluated",
        summary: `Evaluated readiness: ${snapshot.verdict}`,
      });
      return snapshot;
    },

    async evaluateRisk(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.risk.evaluate");
      const assessment = await evaluateReleaseRisk(rt, ctx, releaseId);
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.risk_evaluated",
        summary: `Evaluated risk: ${assessment.overallLabel}`,
      });
      return assessment;
    },

    async evaluateCertification(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.readiness.evaluate");
      const snapshot = await evaluateReleaseReadiness(
        rt,
        ctx,
        releaseId,
        "certification",
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.certification_evaluated",
        summary: `Evaluated certification readiness: ${snapshot.verdict}`,
      });
      return snapshot;
    },

    async evaluateApprovals(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.readiness.evaluate");
      const snapshot = await evaluateReleaseReadiness(
        rt,
        ctx,
        releaseId,
        "approvals",
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.approvals_evaluated",
        summary: `Evaluated approvals readiness: ${snapshot.verdict}`,
      });
      return snapshot;
    },

    async generateReleaseSummary(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.readiness.evaluate");
      const readiness = await evaluateReleaseReadiness(rt, ctx, releaseId, "full");
      const risk = await evaluateReleaseRisk(rt, ctx, releaseId);
      const approvals = (
        await rt.persistence.releaseApprovals.list(toRepositoryContext(ctx), {
          pageSize: 200,
          filters: { releaseId },
        })
      ).items;
      const approvalStatuses: Partial<Record<ReleaseApprovalStageKind, string>> =
        {};
      for (const a of approvals) {
        approvalStatuses[a.stageKind] = a.status;
      }

      let recommendationCode: ReleaseSummary["recommendationCode"] =
        "recommend_release";
      const recommendationReasons: string[] = [];
      if (readiness.verdict === "NOT_READY" || risk.overallLabel === "high_risk") {
        recommendationCode = "recommend_reject";
        recommendationReasons.push(...readiness.blockingFactors);
        if (risk.overallLabel === "high_risk") {
          recommendationReasons.push("high_risk");
        }
      } else if (
        readiness.verdict === "READY_WITH_WARNINGS" ||
        risk.overallLabel === "elevated_risk"
      ) {
        recommendationCode = "recommend_hold";
        recommendationReasons.push(...readiness.warningFactors);
        if (risk.overallLabel === "elevated_risk") {
          recommendationReasons.push("elevated_risk");
        }
      } else {
        recommendationReasons.push("ready");
      }

      const computedAt = rt.now();
      const snapshotJson: Record<string, unknown> = {
        readiness,
        risk,
        approvalStatuses,
        recommendationCode,
        recommendationReasons,
      };
      const row = await rt.persistence.releaseSummarySnapshots.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          releaseId,
          snapshotJson,
          computedAt,
          isDecision: false,
          organisationId: ctx.organisationId,
        },
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.summary_generated",
        summary: `Generated summary: ${recommendationCode}`,
      });
      return {
        id: asReleaseSummarySnapshotId(row.id),
        releaseId: asReleaseId(releaseId),
        readiness,
        risk,
        approvalStatuses,
        recommendationCode,
        recommendationReasons,
        computedAt,
        isDecision: false as const,
      };
    },

    async submitForReview(ctx, releaseId, reason) {
      assertHasReleasePermission(ctx, "release.submit");
      return transitionRelease(
        rt,
        ctx,
        releaseId,
        "ready_for_review",
        "release.submitted_for_review",
        "Submitted release for review",
        { reason },
      );
    },

    async submitForApproval(ctx, releaseId, reason) {
      assertHasReleasePermission(ctx, "release.submit");
      return transitionRelease(
        rt,
        ctx,
        releaseId,
        "ready_for_approval",
        "release.submitted_for_approval",
        "Submitted release for approval",
        { reason },
      );
    },

    async approveRelease(ctx, releaseId, rationale) {
      assertHasReleasePermission(ctx, "release.approve");
      assertNonEmpty(rationale, "rationale");
      const rctx = toRepositoryContext(ctx);
      const existing = await loadRelease(rt, ctx, releaseId);
      assertReleaseGovernanceTransition(existing.status, "approved");
      const decidedAt = rt.now();
      const decisionRow = await rt.persistence.releaseDecisions.create(rctx, {
        id: rt.id(),
        releaseId,
        verdict: "approved",
        decidedByUserId: ctx.userId,
        decidedAt,
        rationale,
        isAutomatic: false,
        organisationId: ctx.organisationId,
      });
      const release = await transitionRelease(
        rt,
        ctx,
        releaseId,
        "approved",
        "release.approved",
        "Approved release",
        { rationale, decisionId: decisionRow.id },
      );
      return { release, decision: toDecision(decisionRow) };
    },

    async conditionallyApproveRelease(ctx, releaseId, rationale, conditions) {
      assertHasReleasePermission(ctx, "release.approve");
      assertNonEmpty(rationale, "rationale");
      const rctx = toRepositoryContext(ctx);
      const existing = await loadRelease(rt, ctx, releaseId);
      assertReleaseGovernanceTransition(existing.status, "conditionally_approved");
      const decidedAt = rt.now();
      const decisionRow = await rt.persistence.releaseDecisions.create(rctx, {
        id: rt.id(),
        releaseId,
        verdict: "conditionally_approved",
        decidedByUserId: ctx.userId,
        decidedAt,
        rationale: conditions ? `${rationale} | ${conditions}` : rationale,
        isAutomatic: false,
        organisationId: ctx.organisationId,
      });
      const release = await transitionRelease(
        rt,
        ctx,
        releaseId,
        "conditionally_approved",
        "release.conditionally_approved",
        "Conditionally approved release",
        { rationale, conditions, decisionId: decisionRow.id },
      );
      return { release, decision: toDecision(decisionRow) };
    },

    async rejectRelease(ctx, releaseId, rationale) {
      assertHasReleasePermission(ctx, "release.reject");
      assertNonEmpty(rationale, "rationale");
      const rctx = toRepositoryContext(ctx);
      const existing = await loadRelease(rt, ctx, releaseId);
      assertReleaseGovernanceTransition(existing.status, "rejected");
      const decidedAt = rt.now();
      const decisionRow = await rt.persistence.releaseDecisions.create(rctx, {
        id: rt.id(),
        releaseId,
        verdict: "rejected",
        decidedByUserId: ctx.userId,
        decidedAt,
        rationale,
        isAutomatic: false,
        organisationId: ctx.organisationId,
      });
      const release = await transitionRelease(
        rt,
        ctx,
        releaseId,
        "rejected",
        "release.rejected",
        "Rejected release",
        { rationale, decisionId: decisionRow.id },
      );
      return { release, decision: toDecision(decisionRow) };
    },

    async withdrawRelease(ctx, releaseId, reason) {
      assertHasReleasePermission(ctx, "release.withdraw");
      return transitionRelease(
        rt,
        ctx,
        releaseId,
        "withdrawn",
        "release.withdrawn",
        "Withdrawn release",
        { reason },
      );
    },

    async archiveRelease(ctx, releaseId, reason) {
      assertHasReleasePermission(ctx, "release.archive");
      return transitionRelease(
        rt,
        ctx,
        releaseId,
        "archived",
        "release.archived",
        "Archived release",
        { reason },
      );
    },

    async restoreRelease(ctx, releaseId, reason) {
      assertHasReleasePermission(ctx, "release.restore");
      return transitionRelease(
        rt,
        ctx,
        releaseId,
        "planning",
        "release.restored",
        "Restored release to planning",
        { reason },
      );
    },

    async requestApproval(ctx, releaseId, input) {
      assertHasReleasePermission(ctx, "release.approvals.request");
      await loadRelease(rt, ctx, releaseId);
      const row = await rt.persistence.releaseApprovals.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          releaseId,
          stageKind: input.stageKind,
          status: "pending",
          requestedFromUserId: input.requestedFromUserId,
          comments: input.comments,
          organisationId: ctx.organisationId,
        },
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId,
        action: "release.approval_requested",
        summary: `Requested ${input.stageKind} approval`,
      });
      return toApproval(row);
    },

    async decideApproval(ctx, approvalId, input) {
      assertHasReleasePermission(ctx, "release.approvals.decide");
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.releaseApprovals.get(rctx, approvalId),
        "release_approval",
        approvalId,
      );
      const row = await rt.persistence.releaseApprovals.update(
        rctx,
        approvalId,
        existing.revision,
        {
          status: input.status,
          comments: input.comments,
          conditions: input.conditions,
          decidedByUserId: ctx.userId,
          decidedAt: rt.now(),
        },
      );
      await appendReleaseAudit(rt, ctx, {
        releaseId: existing.releaseId,
        action: "release.approval_decided",
        summary: `Decided approval ${approvalId}: ${input.status}`,
      });
      return toApproval(row);
    },

    async listAudit(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.audit.view");
      await loadRelease(rt, ctx, releaseId);
      const page = await rt.persistence.releaseAudits.listByRelease(
        toRepositoryContext(ctx),
        releaseId,
        { pageSize: 200 },
      );
      return page.items.map(toAudit);
    },

    async getManifest(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.view");
      await loadRelease(rt, ctx, releaseId);
      const rctx = toRepositoryContext(ctx);
      const filters = { releaseId };
      const listAll = { pageSize: 200 as const, filters };
      const [packages, candidates, scopes, evidence, deps] = await Promise.all([
        rt.persistence.releasePackages.list(rctx, listAll),
        rt.persistence.releaseCandidates.list(rctx, listAll),
        rt.persistence.releaseScopes.list(rctx, listAll),
        rt.persistence.releaseEvidence.list(rctx, listAll),
        rt.persistence.releaseDependencies.list(rctx, listAll),
      ]);
      const manifest: ReleaseManifest = {
        releaseId: asReleaseId(releaseId),
        packageIds: packages.items.map((p) => asReleasePackageId(p.id)),
        candidateIds: candidates.items.map((c) => asReleaseCandidateId(c.id)),
        scopeRefs: scopes.items.map((s) => ({ kind: s.kind, refId: s.refId })),
        evidenceRefs: evidence.items.map((e) => ({
          kind: e.kind,
          refId: e.refId,
        })),
        dependencyIds: deps.items.map((d) => asReleaseDependencyId(d.id)),
        generatedAt: rt.now(),
        isDecision: false,
      };
      return manifest;
    },

    async listPackages(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.view");
      await loadRelease(rt, ctx, releaseId);
      const page = await rt.persistence.releasePackages.list(
        toRepositoryContext(ctx),
        { pageSize: 200, filters: { releaseId } },
      );
      return page.items.map(toPackage);
    },

    async listCandidates(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.view");
      await loadRelease(rt, ctx, releaseId);
      const page = await rt.persistence.releaseCandidates.list(
        toRepositoryContext(ctx),
        { pageSize: 200, filters: { releaseId } },
      );
      return page.items.map(toCandidate);
    },

    async listScope(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.view");
      await loadRelease(rt, ctx, releaseId);
      const page = await rt.persistence.releaseScopes.list(
        toRepositoryContext(ctx),
        { pageSize: 200, filters: { releaseId } },
      );
      return page.items.map(toScope);
    },

    async listEvidence(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.view");
      await loadRelease(rt, ctx, releaseId);
      const page = await rt.persistence.releaseEvidence.list(
        toRepositoryContext(ctx),
        { pageSize: 200, filters: { releaseId } },
      );
      return page.items.map(toEvidence);
    },

    async listNotes(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.view");
      await loadRelease(rt, ctx, releaseId);
      const page = await rt.persistence.releaseNotes.list(
        toRepositoryContext(ctx),
        { pageSize: 200, filters: { releaseId } },
      );
      return page.items.map(toNote);
    },

    async listDependencies(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.view");
      await loadRelease(rt, ctx, releaseId);
      const page = await rt.persistence.releaseDependencies.list(
        toRepositoryContext(ctx),
        { pageSize: 200, filters: { releaseId } },
      );
      return page.items.map(toDependency);
    },

    async listApprovals(ctx, releaseId) {
      assertHasReleasePermission(ctx, "release.approvals.view");
      await loadRelease(rt, ctx, releaseId);
      const page = await rt.persistence.releaseApprovals.list(
        toRepositoryContext(ctx),
        { pageSize: 200, filters: { releaseId } },
      );
      return page.items.map(toApproval);
    },
  };
}
