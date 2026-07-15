import { randomUUID } from "node:crypto";

import {
  testingRelease,
  testingReleaseApproval,
  testingReleaseAuditEntry,
  testingReleaseCandidate,
  testingReleaseDecision,
  testingReleaseDependency,
  testingReleaseEvidence,
  testingReleaseNote,
  testingReleasePackage,
  testingReleaseReadinessSnapshot,
  testingReleaseRiskAssessment,
  testingReleaseScope,
  testingReleaseSummarySnapshot,
  type DatabaseExecutor,
} from "@apzhub/config";
import { and, eq } from "drizzle-orm";

import { assertPermission } from "../../authorization/testing-authorization";
import {
  assertRequiredString,
  validateReleaseApprovalStageKind,
  validateReleaseApprovalStatus,
  validateReleaseDecisionVerdict,
  validateReleaseGovernanceStatus,
  validateReleaseScopeKind,
} from "../../validation/persistence-validation";
import type {
  ReleaseApprovalCreate,
  ReleaseApprovalUpdate,
  ReleaseAuditRepository,
  ReleaseCandidateCreate,
  ReleaseCandidateUpdate,
  ReleaseCreate,
  ReleaseDecisionCreate,
  ReleaseDecisionUpdate,
  ReleaseDependencyCreate,
  ReleaseDependencyUpdate,
  ReleaseEvidenceCreate,
  ReleaseEvidenceUpdate,
  ReleaseNoteCreate,
  ReleaseNoteUpdate,
  ReleasePackageCreate,
  ReleasePackageUpdate,
  ReleaseReadinessSnapshotCreate,
  ReleaseReadinessSnapshotUpdate,
  ReleaseRiskAssessmentCreate,
  ReleaseRiskAssessmentUpdate,
  ReleaseScopeCreate,
  ReleaseScopeUpdate,
  ReleaseSummarySnapshotCreate,
  ReleaseSummarySnapshotUpdate,
  ReleaseUpdate,
} from "../interfaces";
import type {
  ReleaseApprovalRecord,
  ReleaseCandidateRecord,
  ReleaseDecisionRecord,
  ReleaseDependencyRecord,
  ReleaseEvidenceRecord,
  ReleaseNoteRecord,
  ReleasePackageRecord,
  ReleaseReadinessSnapshotRecord,
  ReleaseRecord,
  ReleaseRiskAssessmentRecord,
  ReleaseScopeRecord,
  ReleaseSummarySnapshotRecord,
} from "../records";
import {
  releaseApprovalToRow,
  releaseAuditToRow,
  releaseCandidateToRow,
  releaseDecisionToRow,
  releaseDependencyToRow,
  releaseEvidenceToRow,
  releaseNoteToRow,
  releasePackageToRow,
  releaseReadinessSnapshotToRow,
  releaseRiskAssessmentToRow,
  releaseScopeToRow,
  releaseSummarySnapshotToRow,
  releaseToRow,
  rowToRelease,
  rowToReleaseApproval,
  rowToReleaseAudit,
  rowToReleaseCandidate,
  rowToReleaseDecision,
  rowToReleaseDependency,
  rowToReleaseEvidence,
  rowToReleaseNote,
  rowToReleasePackage,
  rowToReleaseReadinessSnapshot,
  rowToReleaseRiskAssessment,
  rowToReleaseScope,
  rowToReleaseSummarySnapshot,
} from "../mappers/row-mappers";
import { normalizeListQuery, paginateItems } from "../types";
import {
  createPostgresCrudRepository,
  type PostgresCrudTable,
} from "../postgres/generic-crud";
import { baseMeta } from "../in-memory/generic-crud";

function asTable(table: unknown): PostgresCrudTable {
  return table as PostgresCrudTable;
}

export function createPostgresReleaseGovernanceRepos(db: DatabaseExecutor) {
  const releases = createPostgresCrudRepository<
    ReleaseCreate,
    ReleaseUpdate,
    ReleaseRecord
  >({
    kind: "release",
    db,
    table: asTable(testingRelease),
    searchFields: ["key", "name", "status", "description"],
    validateCreate: (input) => {
      assertRequiredString(input.key, "key");
      assertRequiredString(input.name, "name");
      validateReleaseGovernanceStatus(String(input.status));
    },
    validateUpdate: (input) => {
      if (input.status !== undefined) {
        validateReleaseGovernanceStatus(String(input.status));
      }
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleaseRecord>;
      return {
        ...meta,
        key: String(existing?.key ?? data.key),
        name: String(data.name ?? existing?.name ?? ""),
        status: (data.status ?? existing?.status ?? "draft") as ReleaseRecord["status"],
        description: data.description ?? existing?.description,
        windowJson: data.windowJson ?? existing?.windowJson,
        metadataJson: data.metadataJson ?? existing?.metadataJson,
      };
    },
    toRow: (record) => releaseToRow(record),
    rowToRecord: (row) => rowToRelease(row as never),
  });

  const releaseScopes = createPostgresCrudRepository<
    ReleaseScopeCreate,
    ReleaseScopeUpdate,
    ReleaseScopeRecord
  >({
    kind: "release_scope",
    db,
    table: asTable(testingReleaseScope),
    searchFields: ["kind", "refId", "label"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.refId, "refId");
      validateReleaseScopeKind(String(input.kind));
    },
    validateUpdate: (input) => {
      if (input.kind !== undefined) validateReleaseScopeKind(String(input.kind));
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleaseScopeRecord>;
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? data.releaseId),
        kind: (data.kind ?? existing?.kind ?? "other") as ReleaseScopeRecord["kind"],
        refId: String(data.refId ?? existing?.refId ?? ""),
        label: data.label ?? existing?.label,
      };
    },
    toRow: (record) => releaseScopeToRow(record),
    rowToRecord: (row) => rowToReleaseScope(row as never),
  });

  const releasePackages = createPostgresCrudRepository<
    ReleasePackageCreate,
    ReleasePackageUpdate,
    ReleasePackageRecord
  >({
    kind: "release_package",
    db,
    table: asTable(testingReleasePackage),
    searchFields: ["name", "versionLabel", "description"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.name, "name");
      assertRequiredString(input.versionLabel, "versionLabel");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleasePackageRecord>;
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? data.releaseId),
        name: String(data.name ?? existing?.name ?? ""),
        versionLabel: String(data.versionLabel ?? existing?.versionLabel ?? ""),
        description: data.description ?? existing?.description,
      };
    },
    toRow: (record) => releasePackageToRow(record),
    rowToRecord: (row) => rowToReleasePackage(row as never),
  });

  const releaseCandidates = createPostgresCrudRepository<
    ReleaseCandidateCreate,
    ReleaseCandidateUpdate,
    ReleaseCandidateRecord
  >({
    kind: "release_candidate",
    db,
    table: asTable(testingReleaseCandidate),
    searchFields: ["label", "status", "notes"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.label, "label");
      validateReleaseGovernanceStatus(String(input.status));
    },
    validateUpdate: (input) => {
      if (input.status !== undefined) {
        validateReleaseGovernanceStatus(String(input.status));
      }
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleaseCandidateRecord>;
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? data.releaseId),
        label: String(data.label ?? existing?.label ?? ""),
        status:
          (data.status ?? existing?.status ?? "draft") as ReleaseCandidateRecord["status"],
        notes: data.notes ?? existing?.notes,
      };
    },
    toRow: (record) => releaseCandidateToRow(record),
    rowToRecord: (row) => rowToReleaseCandidate(row as never),
  });

  const releaseApprovals = createPostgresCrudRepository<
    ReleaseApprovalCreate,
    ReleaseApprovalUpdate,
    ReleaseApprovalRecord
  >({
    kind: "release_approval",
    db,
    table: asTable(testingReleaseApproval),
    searchFields: ["stageKind", "status", "comments"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
      validateReleaseApprovalStageKind(String(input.stageKind));
      validateReleaseApprovalStatus(String(input.status));
    },
    validateUpdate: (input) => {
      if (input.stageKind !== undefined) {
        validateReleaseApprovalStageKind(String(input.stageKind));
      }
      if (input.status !== undefined) {
        validateReleaseApprovalStatus(String(input.status));
      }
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleaseApprovalRecord>;
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? data.releaseId),
        stageKind:
          (data.stageKind ??
            existing?.stageKind ??
            "technical") as ReleaseApprovalRecord["stageKind"],
        status:
          (data.status ?? existing?.status ?? "pending") as ReleaseApprovalRecord["status"],
        requestedFromUserId:
          data.requestedFromUserId ?? existing?.requestedFromUserId,
        decidedByUserId: data.decidedByUserId ?? existing?.decidedByUserId,
        decidedAt: data.decidedAt ?? existing?.decidedAt,
        comments: data.comments ?? existing?.comments,
        conditions: data.conditions ?? existing?.conditions,
      };
    },
    toRow: (record) => releaseApprovalToRow(record),
    rowToRecord: (row) => rowToReleaseApproval(row as never),
  });

  const releaseDecisions = createPostgresCrudRepository<
    ReleaseDecisionCreate,
    ReleaseDecisionUpdate,
    ReleaseDecisionRecord
  >({
    kind: "release_decision",
    db,
    table: asTable(testingReleaseDecision),
    searchFields: ["verdict", "rationale"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.decidedByUserId, "decidedByUserId");
      assertRequiredString(input.rationale, "rationale");
      validateReleaseDecisionVerdict(String(input.verdict));
    },
    validateUpdate: (input) => {
      if (input.verdict !== undefined) {
        validateReleaseDecisionVerdict(String(input.verdict));
      }
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleaseDecisionRecord>;
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? data.releaseId),
        verdict:
          (data.verdict ??
            existing?.verdict ??
            "rejected") as ReleaseDecisionRecord["verdict"],
        decidedByUserId: String(
          data.decidedByUserId ?? existing?.decidedByUserId ?? "",
        ),
        decidedAt: String(
          data.decidedAt ?? existing?.decidedAt ?? new Date().toISOString(),
        ),
        rationale: String(data.rationale ?? existing?.rationale ?? ""),
        isAutomatic: false as const,
      };
    },
    toRow: (record) => releaseDecisionToRow(record),
    rowToRecord: (row) => rowToReleaseDecision(row as never),
  });

  const releaseEvidence = createPostgresCrudRepository<
    ReleaseEvidenceCreate,
    ReleaseEvidenceUpdate,
    ReleaseEvidenceRecord
  >({
    kind: "release_evidence",
    db,
    table: asTable(testingReleaseEvidence),
    searchFields: ["kind", "refId", "summary"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.kind, "kind");
      assertRequiredString(input.refId, "refId");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleaseEvidenceRecord>;
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? data.releaseId),
        kind: String(data.kind ?? existing?.kind ?? ""),
        refId: String(data.refId ?? existing?.refId ?? ""),
        summary: data.summary ?? existing?.summary,
      };
    },
    toRow: (record) => releaseEvidenceToRow(record),
    rowToRecord: (row) => rowToReleaseEvidence(row as never),
  });

  const releaseDependencies = createPostgresCrudRepository<
    ReleaseDependencyCreate,
    ReleaseDependencyUpdate,
    ReleaseDependencyRecord
  >({
    kind: "release_dependency",
    db,
    table: asTable(testingReleaseDependency),
    searchFields: ["kind", "notes"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.kind, "kind");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleaseDependencyRecord>;
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? data.releaseId),
        dependsOnReleaseId:
          data.dependsOnReleaseId ?? existing?.dependsOnReleaseId,
        kind: String(data.kind ?? existing?.kind ?? ""),
        required: Boolean(data.required ?? existing?.required ?? true),
        notes: data.notes ?? existing?.notes,
        blocked: Boolean(data.blocked ?? existing?.blocked ?? false),
      };
    },
    toRow: (record) => releaseDependencyToRow(record),
    rowToRecord: (row) => rowToReleaseDependency(row as never),
  });

  const releaseNotes = createPostgresCrudRepository<
    ReleaseNoteCreate,
    ReleaseNoteUpdate,
    ReleaseNoteRecord
  >({
    kind: "release_note",
    db,
    table: asTable(testingReleaseNote),
    searchFields: ["title", "body"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.title, "title");
      assertRequiredString(input.body, "body");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleaseNoteRecord>;
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? data.releaseId),
        title: String(data.title ?? existing?.title ?? ""),
        body: String(data.body ?? existing?.body ?? ""),
        authoredAt: String(
          data.authoredAt ?? existing?.authoredAt ?? new Date().toISOString(),
        ),
        authorUserId: data.authorUserId ?? existing?.authorUserId,
      };
    },
    toRow: (record) => releaseNoteToRow(record),
    rowToRecord: (row) => rowToReleaseNote(row as never),
  });

  const releaseRiskAssessments = createPostgresCrudRepository<
    ReleaseRiskAssessmentCreate,
    ReleaseRiskAssessmentUpdate,
    ReleaseRiskAssessmentRecord
  >({
    kind: "release_risk_assessment",
    db,
    table: asTable(testingReleaseRiskAssessment),
    searchFields: ["releaseId"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleaseRiskAssessmentRecord>;
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? data.releaseId),
        snapshotJson: data.snapshotJson ?? existing?.snapshotJson ?? {},
        computedAt: String(
          data.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
        ),
        isDecision: false as const,
      };
    },
    toRow: (record) => releaseRiskAssessmentToRow(record),
    rowToRecord: (row) => rowToReleaseRiskAssessment(row as never),
  });

  const releaseReadinessSnapshots = createPostgresCrudRepository<
    ReleaseReadinessSnapshotCreate,
    ReleaseReadinessSnapshotUpdate,
    ReleaseReadinessSnapshotRecord
  >({
    kind: "release_readiness_snapshot",
    db,
    table: asTable(testingReleaseReadinessSnapshot),
    searchFields: ["releaseId"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleaseReadinessSnapshotRecord>;
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? data.releaseId),
        snapshotJson: data.snapshotJson ?? existing?.snapshotJson ?? {},
        computedAt: String(
          data.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
        ),
        isDecision: false as const,
      };
    },
    toRow: (record) => releaseReadinessSnapshotToRow(record),
    rowToRecord: (row) => rowToReleaseReadinessSnapshot(row as never),
  });

  const releaseSummarySnapshots = createPostgresCrudRepository<
    ReleaseSummarySnapshotCreate,
    ReleaseSummarySnapshotUpdate,
    ReleaseSummarySnapshotRecord
  >({
    kind: "release_summary_snapshot",
    db,
    table: asTable(testingReleaseSummarySnapshot),
    searchFields: ["releaseId"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleaseSummarySnapshotRecord>;
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? data.releaseId),
        snapshotJson: data.snapshotJson ?? existing?.snapshotJson ?? {},
        computedAt: String(
          data.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
        ),
        isDecision: false as const,
      };
    },
    toRow: (record) => releaseSummarySnapshotToRow(record),
    rowToRecord: (row) => rowToReleaseSummarySnapshot(row as never),
  });

  const releaseAudits: ReleaseAuditRepository = {
    async append(ctx, input) {
      assertPermission(ctx, "release_audit_entry", "append");
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.action, "action");
      assertRequiredString(input.summary, "summary");
      const id =
        typeof input.id === "string" && input.id.length > 0
          ? input.id
          : randomUUID();
      const row = {
        id,
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        releaseId: input.releaseId,
        occurredAt: input.occurredAt ?? new Date().toISOString(),
        actorUserId: input.actorUserId ?? ctx.actorUserId,
        action: input.action,
        summary: input.summary,
        detailsJson: input.detailsJson,
        correlationId: input.correlationId ?? ctx.correlationId,
      };
      await db.insert(testingReleaseAuditEntry).values(releaseAuditToRow(row));
      return row;
    },
    async listByRelease(ctx, releaseId, query) {
      assertPermission(ctx, "release_audit_entry", "list");
      const q = normalizeListQuery(query);
      const rows = await db
        .select()
        .from(testingReleaseAuditEntry)
        .where(
          and(
            eq(testingReleaseAuditEntry.tenantId, ctx.tenantId),
            eq(testingReleaseAuditEntry.releaseId, releaseId),
          ),
        );
      const items = rows
        .map((r) => rowToReleaseAudit(r as never))
        .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
      return paginateItems(items, q.page, q.pageSize);
    },
    async get(ctx, id) {
      assertPermission(ctx, "release_audit_entry", "get");
      const rows = await db
        .select()
        .from(testingReleaseAuditEntry)
        .where(
          and(
            eq(testingReleaseAuditEntry.tenantId, ctx.tenantId),
            eq(testingReleaseAuditEntry.id, id),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? rowToReleaseAudit(row as never) : undefined;
    },
  };

  return {
    releases,
    releaseScopes,
    releasePackages,
    releaseCandidates,
    releaseApprovals,
    releaseDecisions,
    releaseEvidence,
    releaseDependencies,
    releaseNotes,
    releaseRiskAssessments,
    releaseReadinessSnapshots,
    releaseSummarySnapshots,
    releaseAudits,
  };
}
