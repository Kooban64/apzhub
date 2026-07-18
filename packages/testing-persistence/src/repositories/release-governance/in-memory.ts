import { randomUUID } from "node:crypto";

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
  CrudRepository,
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
  ReleaseAuditRecord,
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
  compareValues,
  matchesFilters,
  matchesSearch,
  normalizeListQuery,
  paginateItems,
} from "../types";
import { baseMeta, createInMemoryCrudRepository } from "../in-memory/generic-crud";

export interface ReleaseGovernanceInMemoryStores {
  releases: Map<string, ReleaseRecord>;
  releaseScopes: Map<string, ReleaseScopeRecord>;
  releasePackages: Map<string, ReleasePackageRecord>;
  releaseCandidates: Map<string, ReleaseCandidateRecord>;
  releaseApprovals: Map<string, ReleaseApprovalRecord>;
  releaseDecisions: Map<string, ReleaseDecisionRecord>;
  releaseEvidence: Map<string, ReleaseEvidenceRecord>;
  releaseDependencies: Map<string, ReleaseDependencyRecord>;
  releaseNotes: Map<string, ReleaseNoteRecord>;
  releaseRiskAssessments: Map<string, ReleaseRiskAssessmentRecord>;
  releaseReadinessSnapshots: Map<string, ReleaseReadinessSnapshotRecord>;
  releaseSummarySnapshots: Map<string, ReleaseSummarySnapshotRecord>;
  releaseAudits: Map<string, ReleaseAuditRecord>;
}

export function createEmptyReleaseGovernanceInMemoryStores(): ReleaseGovernanceInMemoryStores {
  return {
    releases: new Map(),
    releaseScopes: new Map(),
    releasePackages: new Map(),
    releaseCandidates: new Map(),
    releaseApprovals: new Map(),
    releaseDecisions: new Map(),
    releaseEvidence: new Map(),
    releaseDependencies: new Map(),
    releaseNotes: new Map(),
    releaseRiskAssessments: new Map(),
    releaseReadinessSnapshots: new Map(),
    releaseSummarySnapshots: new Map(),
    releaseAudits: new Map(),
  };
}

export function createInMemoryReleaseGovernanceRepos(
  stores: ReleaseGovernanceInMemoryStores,
) {
  const releases = createInMemoryCrudRepository<
    ReleaseCreate,
    ReleaseUpdate,
    ReleaseRecord
  >({
    kind: "release",
    store: stores.releases,
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
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        key: String(existing?.key ?? input.key),
        name: String(input.name ?? existing?.name ?? ""),
        status:
          (input.status as ReleaseRecord["status"]) ?? existing?.status ?? "draft",
        description: (input.description as string | undefined) ?? existing?.description,
        windowJson:
          (input.windowJson as Readonly<Record<string, unknown>> | undefined) ??
          existing?.windowJson,
        metadataJson:
          (input.metadataJson as Readonly<Record<string, unknown>> | undefined) ??
          existing?.metadataJson,
      };
    },
  });

  const releaseScopes = createInMemoryCrudRepository<
    ReleaseScopeCreate,
    ReleaseScopeUpdate,
    ReleaseScopeRecord
  >({
    kind: "release_scope",
    store: stores.releaseScopes,
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
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? input.releaseId),
        kind: (input.kind as ReleaseScopeRecord["kind"]) ?? existing?.kind ?? "other",
        refId: String(input.refId ?? existing?.refId ?? ""),
        label: (input.label as string | undefined) ?? existing?.label,
      };
    },
  });

  const releasePackages = createInMemoryCrudRepository<
    ReleasePackageCreate,
    ReleasePackageUpdate,
    ReleasePackageRecord
  >({
    kind: "release_package",
    store: stores.releasePackages,
    searchFields: ["name", "versionLabel", "description"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.name, "name");
      assertRequiredString(input.versionLabel, "versionLabel");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? input.releaseId),
        name: String(input.name ?? existing?.name ?? ""),
        versionLabel: String(input.versionLabel ?? existing?.versionLabel ?? ""),
        description: (input.description as string | undefined) ?? existing?.description,
      };
    },
  });

  const releaseCandidates = createInMemoryCrudRepository<
    ReleaseCandidateCreate,
    ReleaseCandidateUpdate,
    ReleaseCandidateRecord
  >({
    kind: "release_candidate",
    store: stores.releaseCandidates,
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
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? input.releaseId),
        label: String(input.label ?? existing?.label ?? ""),
        status:
          (input.status as ReleaseCandidateRecord["status"]) ??
          existing?.status ??
          "draft",
        notes: (input.notes as string | undefined) ?? existing?.notes,
      };
    },
  });

  const releaseApprovals = createInMemoryCrudRepository<
    ReleaseApprovalCreate,
    ReleaseApprovalUpdate,
    ReleaseApprovalRecord
  >({
    kind: "release_approval",
    store: stores.releaseApprovals,
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
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? input.releaseId),
        stageKind:
          (input.stageKind as ReleaseApprovalRecord["stageKind"]) ??
          existing?.stageKind ??
          "technical",
        status:
          (input.status as ReleaseApprovalRecord["status"]) ??
          existing?.status ??
          "pending",
        requestedFromUserId:
          (input.requestedFromUserId as string | undefined) ??
          existing?.requestedFromUserId,
        decidedByUserId:
          (input.decidedByUserId as string | undefined) ?? existing?.decidedByUserId,
        decidedAt: (input.decidedAt as string | undefined) ?? existing?.decidedAt,
        comments: (input.comments as string | undefined) ?? existing?.comments,
        conditions: (input.conditions as string | undefined) ?? existing?.conditions,
      };
    },
  });

  const releaseDecisions = createInMemoryCrudRepository<
    ReleaseDecisionCreate,
    ReleaseDecisionUpdate,
    ReleaseDecisionRecord
  >({
    kind: "release_decision",
    store: stores.releaseDecisions,
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
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? input.releaseId),
        verdict:
          (input.verdict as ReleaseDecisionRecord["verdict"]) ??
          existing?.verdict ??
          "rejected",
        decidedByUserId: String(
          input.decidedByUserId ?? existing?.decidedByUserId ?? "",
        ),
        decidedAt: String(
          input.decidedAt ?? existing?.decidedAt ?? new Date().toISOString(),
        ),
        rationale: String(input.rationale ?? existing?.rationale ?? ""),
        isAutomatic: false as const,
      };
    },
  });

  const releaseEvidence = createInMemoryCrudRepository<
    ReleaseEvidenceCreate,
    ReleaseEvidenceUpdate,
    ReleaseEvidenceRecord
  >({
    kind: "release_evidence",
    store: stores.releaseEvidence,
    searchFields: ["kind", "refId", "summary"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.kind, "kind");
      assertRequiredString(input.refId, "refId");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? input.releaseId),
        kind: String(input.kind ?? existing?.kind ?? ""),
        refId: String(input.refId ?? existing?.refId ?? ""),
        summary: (input.summary as string | undefined) ?? existing?.summary,
      };
    },
  });

  const releaseDependencies = createInMemoryCrudRepository<
    ReleaseDependencyCreate,
    ReleaseDependencyUpdate,
    ReleaseDependencyRecord
  >({
    kind: "release_dependency",
    store: stores.releaseDependencies,
    searchFields: ["kind", "notes"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.kind, "kind");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? input.releaseId),
        dependsOnReleaseId:
          (input.dependsOnReleaseId as string | undefined) ??
          existing?.dependsOnReleaseId,
        kind: String(input.kind ?? existing?.kind ?? ""),
        required: Boolean(input.required ?? existing?.required ?? true),
        notes: (input.notes as string | undefined) ?? existing?.notes,
        blocked: Boolean(input.blocked ?? existing?.blocked ?? false),
      };
    },
  });

  const releaseNotes = createInMemoryCrudRepository<
    ReleaseNoteCreate,
    ReleaseNoteUpdate,
    ReleaseNoteRecord
  >({
    kind: "release_note",
    store: stores.releaseNotes,
    searchFields: ["title", "body"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.title, "title");
      assertRequiredString(input.body, "body");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? input.releaseId),
        title: String(input.title ?? existing?.title ?? ""),
        body: String(input.body ?? existing?.body ?? ""),
        authoredAt: String(
          input.authoredAt ?? existing?.authoredAt ?? new Date().toISOString(),
        ),
        authorUserId:
          (input.authorUserId as string | undefined) ?? existing?.authorUserId,
      };
    },
  });

  const releaseRiskAssessments = createInMemoryCrudRepository<
    ReleaseRiskAssessmentCreate,
    ReleaseRiskAssessmentUpdate,
    ReleaseRiskAssessmentRecord
  >({
    kind: "release_risk_assessment",
    store: stores.releaseRiskAssessments,
    searchFields: ["releaseId"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? input.releaseId),
        snapshotJson:
          (input.snapshotJson as Readonly<Record<string, unknown>> | undefined) ??
          existing?.snapshotJson ??
          {},
        computedAt: String(
          input.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
        ),
        isDecision: false as const,
      };
    },
  });

  const releaseReadinessSnapshots = createInMemoryCrudRepository<
    ReleaseReadinessSnapshotCreate,
    ReleaseReadinessSnapshotUpdate,
    ReleaseReadinessSnapshotRecord
  >({
    kind: "release_readiness_snapshot",
    store: stores.releaseReadinessSnapshots,
    searchFields: ["releaseId"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? input.releaseId),
        snapshotJson:
          (input.snapshotJson as Readonly<Record<string, unknown>> | undefined) ??
          existing?.snapshotJson ??
          {},
        computedAt: String(
          input.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
        ),
        isDecision: false as const,
      };
    },
  });

  const releaseSummarySnapshots = createInMemoryCrudRepository<
    ReleaseSummarySnapshotCreate,
    ReleaseSummarySnapshotUpdate,
    ReleaseSummarySnapshotRecord
  >({
    kind: "release_summary_snapshot",
    store: stores.releaseSummarySnapshots,
    searchFields: ["releaseId"],
    validateCreate: (input) => {
      assertRequiredString(input.releaseId, "releaseId");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        releaseId: String(existing?.releaseId ?? input.releaseId),
        snapshotJson:
          (input.snapshotJson as Readonly<Record<string, unknown>> | undefined) ??
          existing?.snapshotJson ??
          {},
        computedAt: String(
          input.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
        ),
        isDecision: false as const,
      };
    },
  });

  const releaseAudits: ReleaseAuditRepository = {
    async append(ctx, input) {
      assertPermission(ctx, "release_audit_entry", "append");
      assertRequiredString(input.releaseId, "releaseId");
      assertRequiredString(input.action, "action");
      assertRequiredString(input.summary, "summary");
      const id =
        typeof input.id === "string" && input.id.length > 0 ? input.id : randomUUID();
      const row: ReleaseAuditRecord = {
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
      stores.releaseAudits.set(id, row);
      return row;
    },
    async listByRelease(ctx, releaseId, query) {
      assertPermission(ctx, "release_audit_entry", "list");
      const q = normalizeListQuery(query);
      let items = [...stores.releaseAudits.values()].filter(
        (row) => row.tenantId === ctx.tenantId && row.releaseId === releaseId,
      );
      if (q.search) {
        items = items.filter((row) =>
          matchesSearch(row as unknown as Record<string, unknown>, q.search, [
            "action",
            "summary",
          ]),
        );
      }
      items = items.filter((row) =>
        matchesFilters(row as unknown as Record<string, unknown>, q.filters),
      );
      items.sort((a, b) => compareValues(a.occurredAt, b.occurredAt, "desc"));
      return paginateItems(items, q.page, q.pageSize);
    },
    async get(ctx, id) {
      assertPermission(ctx, "release_audit_entry", "get");
      const row = stores.releaseAudits.get(id);
      if (!row || row.tenantId !== ctx.tenantId) return undefined;
      return row;
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
  } satisfies {
    releases: CrudRepository<ReleaseCreate, ReleaseUpdate, ReleaseRecord>;
    releaseScopes: CrudRepository<
      ReleaseScopeCreate,
      ReleaseScopeUpdate,
      ReleaseScopeRecord
    >;
    releasePackages: CrudRepository<
      ReleasePackageCreate,
      ReleasePackageUpdate,
      ReleasePackageRecord
    >;
    releaseCandidates: CrudRepository<
      ReleaseCandidateCreate,
      ReleaseCandidateUpdate,
      ReleaseCandidateRecord
    >;
    releaseApprovals: CrudRepository<
      ReleaseApprovalCreate,
      ReleaseApprovalUpdate,
      ReleaseApprovalRecord
    >;
    releaseDecisions: CrudRepository<
      ReleaseDecisionCreate,
      ReleaseDecisionUpdate,
      ReleaseDecisionRecord
    >;
    releaseEvidence: CrudRepository<
      ReleaseEvidenceCreate,
      ReleaseEvidenceUpdate,
      ReleaseEvidenceRecord
    >;
    releaseDependencies: CrudRepository<
      ReleaseDependencyCreate,
      ReleaseDependencyUpdate,
      ReleaseDependencyRecord
    >;
    releaseNotes: CrudRepository<
      ReleaseNoteCreate,
      ReleaseNoteUpdate,
      ReleaseNoteRecord
    >;
    releaseRiskAssessments: CrudRepository<
      ReleaseRiskAssessmentCreate,
      ReleaseRiskAssessmentUpdate,
      ReleaseRiskAssessmentRecord
    >;
    releaseReadinessSnapshots: CrudRepository<
      ReleaseReadinessSnapshotCreate,
      ReleaseReadinessSnapshotUpdate,
      ReleaseReadinessSnapshotRecord
    >;
    releaseSummarySnapshots: CrudRepository<
      ReleaseSummarySnapshotCreate,
      ReleaseSummarySnapshotUpdate,
      ReleaseSummarySnapshotRecord
    >;
    releaseAudits: ReleaseAuditRepository;
  };
}
