import type { DatabaseExecutor } from "@apzhub/config";
import {
  qepTestSpecification,
  qepTestSpecificationHistory,
  qepTestSpecificationRelationship,
  qepTestSpecificationVersion,
} from "@apzhub/config";
import { and, asc, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { SpecificationApproval } from "../../domain/test-specification/specification-approval";
import type { SpecificationHistoryEntry } from "../../domain/test-specification/specification-history";
import {
  createSpecificationId,
  type SpecificationId,
} from "../../domain/test-specification/specification-id";
import type { SpecificationMetadata } from "../../domain/test-specification/specification-metadata";
import type { SpecificationRecord } from "../../domain/test-specification/specification-record";
import type { SpecificationRelationship } from "../../domain/test-specification/specification-relationship";
import type { SpecificationStatus } from "../../domain/test-specification/specification-status";
import type { TestSpecification } from "../../domain/test-specification/test-specification";
import type {
  StoredTestSpecification,
  TestSpecificationListQuery,
  TestSpecificationRepository,
} from "../../domain/test-specification/specification-repository";
import {
  createSpecificationAcceptanceCriteria,
  createSpecificationAuthor,
  createSpecificationClassification,
  createSpecificationComplexity,
  createSpecificationDependency,
  createSpecificationDescription,
  createSpecificationNumber,
  createSpecificationObjective,
  createSpecificationOwner,
  createSpecificationPostconditions,
  createSpecificationPreconditions,
  createSpecificationPriority,
  createSpecificationReference,
  createSpecificationReviewer,
  createSpecificationRisk,
  createSpecificationScope,
  createSpecificationTag,
  createSpecificationTimestamp,
  createSpecificationTitle,
  createSpecificationType,
  createSpecificationVersion,
} from "../../domain/test-specification/value-objects";
import { createSpecificationMetadata } from "../../domain/test-specification/specification-metadata";
import { createSpecificationRelationshipId } from "../../domain/test-specification/specification-relationship";
import {
  TestSpecificationConflictError,
  TestSpecificationNotFoundError,
  TestSpecificationRevisionConflictError,
} from "../../shared/errors";
import { matchesListFilters } from "../mappers/specification-mapper";

type SpecificationRow = typeof qepTestSpecification.$inferSelect;
type RelationshipRow = typeof qepTestSpecificationRelationship.$inferSelect;
type HistoryRow = typeof qepTestSpecificationHistory.$inferSelect;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function mapHistoryRows(rows: readonly HistoryRow[]): SpecificationHistoryEntry[] {
  return rows.map((row) => ({
    at: row.occurredAt.toISOString(),
    by: row.actorUserId,
    kind: row.kind,
    summary: row.summary,
  }));
}

function mapRelationshipRows(rows: readonly RelationshipRow[]): SpecificationRelationship[] {
  return rows.map((row) => ({
    id: createSpecificationRelationshipId(row.id),
    specificationId: createSpecificationId(row.specificationId),
    reference: createSpecificationReference({
      kind: row.kind,
      artefactId: row.artefactId,
      ...(row.owningDomain ? { owningDomain: row.owningDomain } : {}),
      ...(row.label ? { label: row.label } : {}),
    }),
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
  }));
}

function mapApproval(row: SpecificationRow): SpecificationApproval | undefined {
  if (!row.approvalDecision || !row.approvalDecidedAt || !row.approvalDecidedBy) {
    return undefined;
  }
  return {
    decision: row.approvalDecision as SpecificationApproval["decision"],
    decidedAt: createSpecificationTimestamp(row.approvalDecidedAt.toISOString()),
    decidedBy: createSpecificationOwner(row.approvalDecidedBy),
    ...(row.approvalReviewComment ? { reviewComment: row.approvalReviewComment } : {}),
    ...(row.approvalApprovalComment ? { approvalComment: row.approvalApprovalComment } : {}),
  };
}

function mapRecord(row: SpecificationRow): SpecificationRecord {
  return {
    id: createSpecificationId(row.id),
    number: createSpecificationNumber(row.number),
    title: createSpecificationTitle(row.title),
    description: createSpecificationDescription(row.description),
    objective: createSpecificationObjective(row.objective),
    scope: createSpecificationScope(row.scope),
    status: row.status as SpecificationStatus,
    version: createSpecificationVersion(row.majorVersion, row.minorVersion),
    type: createSpecificationType(row.type),
    priority: createSpecificationPriority(row.priority),
    complexity: createSpecificationComplexity(row.complexity),
    classification: createSpecificationClassification(row.classification),
    owner: createSpecificationOwner(row.owner),
    author: createSpecificationAuthor(row.author),
    ...(row.reviewer ? { reviewer: createSpecificationReviewer(row.reviewer) } : {}),
    preconditions: createSpecificationPreconditions(row.preconditionsJson ?? []),
    postconditions: createSpecificationPostconditions(row.postconditionsJson ?? []),
    acceptanceCriteria: createSpecificationAcceptanceCriteria(row.acceptanceCriteriaJson ?? []),
    risks: (row.risksJson ?? []).map(createSpecificationRisk),
    dependencies: (row.dependenciesJson ?? []).map(createSpecificationDependency),
    tags: (row.tagsJson ?? []).map(createSpecificationTag),
    isAuthoritative: row.isAuthoritative,
    ...(row.predecessorSpecificationId
      ? { predecessorSpecificationId: createSpecificationId(row.predecessorSpecificationId) }
      : {}),
    ...(row.successorSpecificationId
      ? { successorSpecificationId: createSpecificationId(row.successorSpecificationId) }
      : {}),
    ...(row.comparisonNotes ? { comparisonNotes: row.comparisonNotes } : {}),
  };
}

function mapSpecificationRow(
  row: SpecificationRow,
  historyEntries: readonly SpecificationHistoryEntry[],
  relationships: readonly SpecificationRelationship[],
): StoredTestSpecification {
  const metadata: SpecificationMetadata = createSpecificationMetadata(row.metadataJson ?? {});
  return {
    record: mapRecord(row),
    metadata,
    history: { entries: historyEntries },
    relationships,
    ...(mapApproval(row) ? { approval: mapApproval(row) } : {}),
    tenantId: row.tenantId,
    revision: row.revision,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
    correlationId: row.correlationId,
    versionLineage: row.versionLineageJson ?? [],
    ...(row.reviewStartedAt ? { reviewStartedAt: row.reviewStartedAt.toISOString() } : {}),
    ...(row.reviewStartedBy ? { reviewStartedBy: row.reviewStartedBy } : {}),
    ...(row.withdrawnAt ? { withdrawnAt: row.withdrawnAt.toISOString() } : {}),
    ...(row.cancelledAt ? { cancelledAt: row.cancelledAt.toISOString() } : {}),
    ...(row.retiredAt ? { retiredAt: row.retiredAt.toISOString() } : {}),
    ...(row.supersededAt ? { supersededAt: row.supersededAt.toISOString() } : {}),
    domainEvents: [],
  };
}

function toInsertValues(specification: TestSpecification) {
  const { record, metadata, approval } = specification;
  return {
    id: record.id,
    tenantId: specification.tenantId,
    number: record.number,
    title: record.title,
    description: record.description,
    objective: record.objective,
    scope: record.scope,
    status: record.status,
    type: record.type,
    priority: record.priority,
    complexity: record.complexity,
    classification: record.classification,
    owner: record.owner,
    author: record.author,
    reviewer: record.reviewer ?? null,
    majorVersion: record.version.major,
    minorVersion: record.version.minor,
    versionLabel: record.version.label,
    isAuthoritative: record.isAuthoritative,
    preconditionsJson: [...record.preconditions.items],
    postconditionsJson: [...record.postconditions.items],
    acceptanceCriteriaJson: [...record.acceptanceCriteria.items],
    risksJson: record.risks.map((risk) => ({ ...risk })),
    dependenciesJson: record.dependencies.map((dependency) => ({ ...dependency })),
    tagsJson: record.tags.map((tag) => String(tag)),
    metadataJson: { ...metadata.entries },
    predecessorSpecificationId: record.predecessorSpecificationId ?? null,
    successorSpecificationId: record.successorSpecificationId ?? null,
    comparisonNotes: record.comparisonNotes ?? null,
    approvalDecision: approval?.decision ?? null,
    approvalDecidedAt: approval?.decidedAt ? new Date(approval.decidedAt) : null,
    approvalDecidedBy: approval?.decidedBy ?? null,
    approvalReviewComment: approval?.reviewComment ?? null,
    approvalApprovalComment: approval?.approvalComment ?? null,
    revision: specification.revision,
    reviewStartedAt: specification.reviewStartedAt
      ? new Date(specification.reviewStartedAt)
      : null,
    reviewStartedBy: specification.reviewStartedBy ?? null,
    withdrawnAt: specification.withdrawnAt ? new Date(specification.withdrawnAt) : null,
    cancelledAt: specification.cancelledAt ? new Date(specification.cancelledAt) : null,
    retiredAt: specification.retiredAt ? new Date(specification.retiredAt) : null,
    supersededAt: specification.supersededAt ? new Date(specification.supersededAt) : null,
    versionLineageJson: [...specification.versionLineage],
    createdAt: new Date(specification.createdAt),
    createdBy: specification.createdBy,
    updatedAt: new Date(specification.updatedAt),
    updatedBy: specification.updatedBy,
    correlationId: specification.correlationId,
  };
}

function toVersionValues(specification: TestSpecification) {
  const { record } = specification;
  return {
    id: record.id,
    tenantId: specification.tenantId,
    specificationId: record.id,
    specificationNumber: record.number,
    majorVersion: record.version.major,
    minorVersion: record.version.minor,
    versionLabel: record.version.label,
    status: record.status,
    isAuthoritative: record.isAuthoritative,
    predecessorSpecificationId: record.predecessorSpecificationId ?? null,
    successorSpecificationId: record.successorSpecificationId ?? null,
    comparisonNotes: record.comparisonNotes ?? null,
    revision: specification.revision,
    createdAt: new Date(specification.createdAt),
    createdBy: specification.createdBy,
    updatedAt: new Date(specification.updatedAt),
    updatedBy: specification.updatedBy,
  };
}

export function createPostgresTestSpecificationRepository(
  db: DatabaseExecutor,
): TestSpecificationRepository {
  async function loadHistory(
    tenantId: string,
    specificationId: string,
  ): Promise<SpecificationHistoryEntry[]> {
    const rows = await db
      .select()
      .from(qepTestSpecificationHistory)
      .where(
        and(
          eq(qepTestSpecificationHistory.tenantId, tenantId),
          eq(qepTestSpecificationHistory.specificationId, specificationId),
        ),
      )
      .orderBy(asc(qepTestSpecificationHistory.sequence));
    return mapHistoryRows(rows);
  }

  async function loadRelationships(
    tenantId: string,
    specificationId: string,
  ): Promise<SpecificationRelationship[]> {
    const rows = await db
      .select()
      .from(qepTestSpecificationRelationship)
      .where(
        and(
          eq(qepTestSpecificationRelationship.tenantId, tenantId),
          eq(qepTestSpecificationRelationship.specificationId, specificationId),
        ),
      );
    return mapRelationshipRows(rows);
  }

  async function syncHistory(
    tenantId: string,
    specificationId: string,
    history: readonly SpecificationHistoryEntry[],
    audit: { readonly updatedBy: string; readonly revision: number },
  ): Promise<void> {
    const existing = await db
      .select()
      .from(qepTestSpecificationHistory)
      .where(
        and(
          eq(qepTestSpecificationHistory.tenantId, tenantId),
          eq(qepTestSpecificationHistory.specificationId, specificationId),
        ),
      );
    const start = existing.length;
    if (history.length <= start) return;
    const inserts = history.slice(start).map((entry, index) => ({
      id: randomUUID(),
      tenantId,
      specificationId,
      occurredAt: new Date(entry.at),
      actorUserId: entry.by,
      kind: entry.kind,
      summary: entry.summary,
      sequence: start + index + 1,
      createdBy: entry.by,
      updatedBy: audit.updatedBy,
      revision: audit.revision,
    }));
    if (inserts.length > 0) {
      await db.insert(qepTestSpecificationHistory).values(inserts);
    }
  }

  async function syncRelationships(
    tenantId: string,
    specification: TestSpecification,
  ): Promise<void> {
    await db
      .delete(qepTestSpecificationRelationship)
      .where(
        and(
          eq(qepTestSpecificationRelationship.tenantId, tenantId),
          eq(qepTestSpecificationRelationship.specificationId, specification.record.id),
        ),
      );
    if (specification.relationships.length === 0) return;
    await db.insert(qepTestSpecificationRelationship).values(
      specification.relationships.map((relationship) => ({
        id: relationship.id,
        tenantId,
        specificationId: specification.record.id,
        kind: relationship.reference.kind,
        artefactId: relationship.reference.artefactId,
        owningDomain: relationship.reference.owningDomain,
        label: relationship.reference.label ?? null,
        createdAt: new Date(relationship.createdAt),
        createdBy: relationship.createdBy,
        revision: specification.revision,
        updatedAt: new Date(specification.updatedAt),
        updatedBy: specification.updatedBy,
      })),
    );
  }

  async function upsertVersion(specification: TestSpecification): Promise<void> {
    const values = toVersionValues(specification);
    await db
      .insert(qepTestSpecificationVersion)
      .values(values)
      .onConflictDoUpdate({
        target: qepTestSpecificationVersion.id,
        set: {
          specificationNumber: values.specificationNumber,
          majorVersion: values.majorVersion,
          minorVersion: values.minorVersion,
          versionLabel: values.versionLabel,
          status: values.status,
          isAuthoritative: values.isAuthoritative,
          predecessorSpecificationId: values.predecessorSpecificationId,
          successorSpecificationId: values.successorSpecificationId,
          comparisonNotes: values.comparisonNotes,
          revision: values.revision,
          updatedAt: values.updatedAt,
          updatedBy: values.updatedBy,
        },
      });
  }

  async function load(
    tenantId: string,
    id: SpecificationId,
  ): Promise<StoredTestSpecification | null> {
    const [row] = await db
      .select()
      .from(qepTestSpecification)
      .where(and(eq(qepTestSpecification.tenantId, tenantId), eq(qepTestSpecification.id, id)))
      .limit(1);
    if (!row) return null;
    const history = await loadHistory(tenantId, id);
    const relationships = await loadRelationships(tenantId, id);
    return mapSpecificationRow(row, history, relationships);
  }

  return {
    async create(specification) {
      try {
        const [row] = await db
          .insert(qepTestSpecification)
          .values(toInsertValues(specification))
          .returning();
        if (!row) {
          throw new TestSpecificationConflictError("Failed to create Test Specification");
        }
        await upsertVersion(specification);
        await syncRelationships(specification.tenantId, specification);
        await syncHistory(
          specification.tenantId,
          specification.record.id,
          specification.history.entries,
          { updatedBy: specification.updatedBy, revision: specification.revision },
        );
        return mapSpecificationRow(
          row,
          [...specification.history.entries],
          [...specification.relationships],
        );
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new TestSpecificationConflictError(
            `Test Specification already exists: ${specification.record.id}`,
          );
        }
        throw error;
      }
    },

    async get(tenantId, id) {
      return load(tenantId, id);
    },

    async save(specification, expectedRevision) {
      try {
        const [row] = await db
          .update(qepTestSpecification)
          .set(toInsertValues(specification))
          .where(
            and(
              eq(qepTestSpecification.id, specification.record.id),
              eq(qepTestSpecification.tenantId, specification.tenantId),
              eq(qepTestSpecification.revision, expectedRevision),
            ),
          )
          .returning();
        if (!row) {
          const existing = await load(specification.tenantId, specification.record.id);
          if (!existing) {
            throw new TestSpecificationNotFoundError(
              `Test Specification not found: ${specification.record.id}`,
            );
          }
          throw new TestSpecificationRevisionConflictError(
            specification.record.id,
            expectedRevision,
            existing.revision,
          );
        }
        await upsertVersion(specification);
        await syncRelationships(specification.tenantId, specification);
        await syncHistory(
          specification.tenantId,
          specification.record.id,
          specification.history.entries,
          { updatedBy: specification.updatedBy, revision: specification.revision },
        );
        const history = await loadHistory(specification.tenantId, specification.record.id);
        const relationships = await loadRelationships(
          specification.tenantId,
          specification.record.id,
        );
        return mapSpecificationRow(row, history, relationships);
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new TestSpecificationConflictError(
            `Test Specification already exists: ${specification.record.id}`,
          );
        }
        throw error;
      }
    },

    async list(tenantId, query: TestSpecificationListQuery = {}) {
      const conditions = [eq(qepTestSpecification.tenantId, tenantId)];
      if (query.status) conditions.push(eq(qepTestSpecification.status, query.status));
      if (query.type) conditions.push(eq(qepTestSpecification.type, query.type));
      if (query.owner) conditions.push(eq(qepTestSpecification.owner, query.owner));
      if (query.classification) {
        conditions.push(eq(qepTestSpecification.classification, query.classification));
      }
      if (query.priority) conditions.push(eq(qepTestSpecification.priority, query.priority));
      if (query.number) conditions.push(eq(qepTestSpecification.number, query.number));
      if (query.isAuthoritative !== undefined) {
        conditions.push(eq(qepTestSpecification.isAuthoritative, query.isAuthoritative));
      }

      const rows = await db
        .select()
        .from(qepTestSpecification)
        .where(and(...conditions))
        .orderBy(desc(qepTestSpecification.updatedAt));

      const results: StoredTestSpecification[] = [];
      for (const row of rows) {
        const candidateQuery = { ...query };
        const stored = mapSpecificationRow(row, [], []);
        if (!matchesListFilters(stored, candidateQuery)) continue;
        const history = await loadHistory(tenantId, row.id);
        const relationships = await loadRelationships(tenantId, row.id);
        results.push(mapSpecificationRow(row, history, relationships));
      }

      const offset = query.offset ?? 0;
      const limit = query.limit ?? results.length;
      return results.slice(offset, offset + limit);
    },

    async exists(tenantId, id) {
      const [row] = await db
        .select({ id: qepTestSpecification.id })
        .from(qepTestSpecification)
        .where(and(eq(qepTestSpecification.tenantId, tenantId), eq(qepTestSpecification.id, id)))
        .limit(1);
      return Boolean(row);
    },

    async listHistory(tenantId, id) {
      return loadHistory(tenantId, id);
    },

    async listVersionsByNumber(tenantId, number) {
      const versionRows = await db
        .select()
        .from(qepTestSpecificationVersion)
        .where(
          and(
            eq(qepTestSpecificationVersion.tenantId, tenantId),
            eq(qepTestSpecificationVersion.specificationNumber, number),
          ),
        )
        .orderBy(
          desc(qepTestSpecificationVersion.majorVersion),
          desc(qepTestSpecificationVersion.minorVersion),
        );

      const results: StoredTestSpecification[] = [];
      for (const versionRow of versionRows) {
        const loaded = await load(tenantId, createSpecificationId(versionRow.specificationId));
        if (loaded) results.push(loaded);
      }
      return results;
    },

    async findLatestApprovedByNumber(tenantId, number) {
      const versions = await this.listVersionsByNumber(tenantId, number);
      return (
        versions.find(
          (row) => row.record.status === "approved" && row.record.isAuthoritative,
        ) ??
        versions.find((row) => row.record.status === "approved") ??
        null
      );
    },

    async listRelationships(tenantId, id) {
      return loadRelationships(tenantId, id);
    },
  };
}
