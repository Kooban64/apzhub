import type { DatabaseExecutor } from "@apzhub/config";
import {
  qepRequirementsRelationship,
  qepRequirementsRelationshipHistory,
  qepRequirementsRelationshipTaxonomy,
} from "@apzhub/config";
import { and, asc, desc, eq, inArray, ne, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { Relationship } from "../../domain/relationship/relationship";
import type { RelationshipId } from "../../domain/relationship/relationship-id";
import type { RelationshipEdgeFact } from "../../domain/relationship/relationship-policy";
import type {
  RelationshipListQuery,
  RelationshipTaxonomyRepository,
  RequirementsRelationshipRepository,
  StoredRequirementsRelationship,
} from "../../domain/relationship/requirements-relationship-repository";
import {
  NORMATIVE_RELATIONSHIP_TAXONOMY,
  type RelationshipTaxonomyDefinition,
} from "../../domain/relationship/relationship-taxonomy";
import type { RelationshipType } from "../../domain/relationship/relationship-type";
import {
  QepConflictError,
  QepRelationshipNotFoundError,
  QepRevisionConflictError,
} from "../../shared/errors";
import {
  computeRelationshipDuplicateKey,
  toStoredRelationship,
} from "../mappers/relationship-mapper";

type RelationshipRow = typeof qepRequirementsRelationship.$inferSelect;
type HistoryRow = typeof qepRequirementsRelationshipHistory.$inferSelect;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function mapHistoryRows(rows: readonly HistoryRow[]) {
  return rows.map((row) => ({
    at: row.occurredAt.toISOString(),
    by: row.actorUserId,
    kind: row.kind,
    summary: row.summary,
  }));
}

function mapRelationshipRow(
  row: RelationshipRow,
  history: ReturnType<typeof mapHistoryRows>,
): StoredRequirementsRelationship {
  return toStoredRelationship(
    {
      id: row.id as RelationshipId,
      tenantId: row.tenantId,
      type: row.relationshipType as Relationship["type"],
      direction: {
        source: {
          mode: row.sourceMode as Relationship["direction"]["source"]["mode"],
          requirementId:
            row.sourceRequirementId as Relationship["direction"]["source"]["requirementId"],
          tenantId: row.tenantId,
          ...(row.sourceContentVersionId
            ? {
                contentVersionId: row.sourceContentVersionId as NonNullable<
                  Relationship["direction"]["source"]["contentVersionId"]
                >,
              }
            : {}),
        },
        target: {
          mode: row.targetMode as Relationship["direction"]["target"]["mode"],
          requirementId:
            row.targetRequirementId as Relationship["direction"]["target"]["requirementId"],
          tenantId: row.tenantId,
          ...(row.targetContentVersionId
            ? {
                contentVersionId: row.targetContentVersionId as NonNullable<
                  Relationship["direction"]["target"]["contentVersionId"]
                >,
              }
            : {}),
        },
      },
      lifecycleState: row.lifecycleState as Relationship["lifecycleState"],
      strength: row.strength as Relationship["strength"],
      criticality: row.criticality as Relationship["criticality"],
      classification: row.classification as Relationship["classification"],
      scope: {
        kind: row.scopeKind as Relationship["scope"]["kind"],
        ...(row.scopeReferenceId ? { referenceId: row.scopeReferenceId } : {}),
      },
      ...(row.rationale
        ? { rationale: row.rationale as Relationship["rationale"] }
        : {}),
      createdAt: row.createdAt.toISOString(),
      createdBy: row.createdBy,
      updatedAt: row.updatedAt.toISOString(),
      updatedBy: row.updatedBy,
      correlationId: row.correlationId,
      ...(row.activatedAt ? { activatedAt: row.activatedAt.toISOString() } : {}),
      ...(row.activatedBy ? { activatedBy: row.activatedBy } : {}),
      ...(row.deprecatedAt ? { deprecatedAt: row.deprecatedAt.toISOString() } : {}),
      ...(row.deprecatedBy ? { deprecatedBy: row.deprecatedBy } : {}),
      ...(row.retiredAt ? { retiredAt: row.retiredAt.toISOString() } : {}),
      ...(row.retiredBy ? { retiredBy: row.retiredBy } : {}),
      history,
      domainEvents: [],
    },
    row.revision,
  );
}

function toInsertValues(relationship: Relationship, revision: number) {
  return {
    id: relationship.id,
    tenantId: relationship.tenantId,
    relationshipType: relationship.type,
    lifecycleState: relationship.lifecycleState,
    sourceMode: relationship.direction.source.mode,
    sourceRequirementId: relationship.direction.source.requirementId,
    sourceContentVersionId: relationship.direction.source.contentVersionId ?? null,
    targetMode: relationship.direction.target.mode,
    targetRequirementId: relationship.direction.target.requirementId,
    targetContentVersionId: relationship.direction.target.contentVersionId ?? null,
    strength: relationship.strength,
    criticality: relationship.criticality,
    classification: relationship.classification,
    scopeKind: relationship.scope.kind,
    scopeReferenceId: relationship.scope.referenceId ?? null,
    rationale: relationship.rationale ?? null,
    duplicateKey: computeRelationshipDuplicateKey(relationship),
    createdAt: new Date(relationship.createdAt),
    createdBy: relationship.createdBy,
    updatedAt: new Date(relationship.updatedAt),
    updatedBy: relationship.updatedBy,
    activatedAt: relationship.activatedAt ? new Date(relationship.activatedAt) : null,
    activatedBy: relationship.activatedBy ?? null,
    deprecatedAt: relationship.deprecatedAt
      ? new Date(relationship.deprecatedAt)
      : null,
    deprecatedBy: relationship.deprecatedBy ?? null,
    retiredAt: relationship.retiredAt ? new Date(relationship.retiredAt) : null,
    retiredBy: relationship.retiredBy ?? null,
    correlationId: relationship.correlationId,
    revision,
  };
}

export function createPostgresRequirementsRelationshipRepository(
  db: DatabaseExecutor,
): RequirementsRelationshipRepository {
  async function loadHistory(
    tenantId: string,
    relationshipId: string,
  ): Promise<ReturnType<typeof mapHistoryRows>> {
    const rows = await db
      .select()
      .from(qepRequirementsRelationshipHistory)
      .where(
        and(
          eq(qepRequirementsRelationshipHistory.tenantId, tenantId),
          eq(qepRequirementsRelationshipHistory.relationshipId, relationshipId),
        ),
      )
      .orderBy(asc(qepRequirementsRelationshipHistory.sequence));
    return mapHistoryRows(rows);
  }

  async function syncHistory(
    tenantId: string,
    relationshipId: string,
    history: Relationship["history"],
  ): Promise<void> {
    const existing = await db
      .select()
      .from(qepRequirementsRelationshipHistory)
      .where(
        and(
          eq(qepRequirementsRelationshipHistory.tenantId, tenantId),
          eq(qepRequirementsRelationshipHistory.relationshipId, relationshipId),
        ),
      );
    const start = existing.length;
    if (history.length <= start) return;
    const inserts = history.slice(start).map((entry, index) => ({
      id: randomUUID(),
      tenantId,
      relationshipId,
      occurredAt: new Date(entry.at),
      actorUserId: entry.by,
      kind: entry.kind,
      summary: entry.summary,
      sequence: start + index + 1,
    }));
    if (inserts.length > 0) {
      await db.insert(qepRequirementsRelationshipHistory).values(inserts);
    }
  }

  async function load(
    tenantId: string,
    id: RelationshipId,
  ): Promise<StoredRequirementsRelationship | null> {
    const [row] = await db
      .select()
      .from(qepRequirementsRelationship)
      .where(
        and(
          eq(qepRequirementsRelationship.tenantId, tenantId),
          eq(qepRequirementsRelationship.id, id),
        ),
      )
      .limit(1);
    if (!row) return null;
    const history = await loadHistory(tenantId, id);
    return mapRelationshipRow(row, history);
  }

  return {
    async create(relationship) {
      try {
        const [row] = await db
          .insert(qepRequirementsRelationship)
          .values(toInsertValues(relationship, 1))
          .returning();
        if (!row) throw new QepConflictError("Failed to create relationship");
        await syncHistory(relationship.tenantId, relationship.id, relationship.history);
        return mapRelationshipRow(row, [...relationship.history]);
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new QepConflictError(
            "Duplicate relationship for the same type, endpoints, and scope is not allowed",
          );
        }
        throw error;
      }
    },

    async get(tenantId, id) {
      return load(tenantId, id);
    },

    async save(relationship, expectedRevision) {
      try {
        const [row] = await db
          .update(qepRequirementsRelationship)
          .set(toInsertValues(relationship, expectedRevision + 1))
          .where(
            and(
              eq(qepRequirementsRelationship.id, relationship.id),
              eq(qepRequirementsRelationship.tenantId, relationship.tenantId),
              eq(qepRequirementsRelationship.revision, expectedRevision),
            ),
          )
          .returning();
        if (!row) {
          const existing = await load(relationship.tenantId, relationship.id);
          if (!existing) {
            throw new QepRelationshipNotFoundError(
              `Relationship not found: ${relationship.id}`,
            );
          }
          throw new QepRevisionConflictError(
            relationship.id,
            expectedRevision,
            existing.revision,
          );
        }
        await syncHistory(relationship.tenantId, relationship.id, relationship.history);
        const history = await loadHistory(relationship.tenantId, relationship.id);
        return mapRelationshipRow(row, history);
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new QepConflictError(
            "Duplicate relationship for the same type, endpoints, and scope is not allowed",
          );
        }
        throw error;
      }
    },

    async list(tenantId, query: RelationshipListQuery = {}) {
      const conditions = [eq(qepRequirementsRelationship.tenantId, tenantId)];
      if (query.type) {
        conditions.push(eq(qepRequirementsRelationship.relationshipType, query.type));
      }
      if (query.lifecycleState) {
        conditions.push(
          eq(qepRequirementsRelationship.lifecycleState, query.lifecycleState),
        );
      }
      if (query.conflictsOnly) {
        conditions.push(
          eq(qepRequirementsRelationship.relationshipType, "conflicts_with"),
        );
      }
      if (query.supersessionOnly) {
        conditions.push(eq(qepRequirementsRelationship.relationshipType, "supersedes"));
      }
      if (query.baselineId) {
        conditions.push(eq(qepRequirementsRelationship.scopeKind, "baseline"));
        conditions.push(
          eq(qepRequirementsRelationship.scopeReferenceId, query.baselineId),
        );
      }
      if (query.contentVersionId) {
        conditions.push(
          or(
            eq(
              qepRequirementsRelationship.sourceContentVersionId,
              query.contentVersionId,
            ),
            eq(
              qepRequirementsRelationship.targetContentVersionId,
              query.contentVersionId,
            ),
          )!,
        );
      }
      if (query.requirementId) {
        const direction = query.direction ?? "both";
        if (direction === "outbound") {
          conditions.push(
            eq(qepRequirementsRelationship.sourceRequirementId, query.requirementId),
          );
        } else if (direction === "inbound") {
          conditions.push(
            eq(qepRequirementsRelationship.targetRequirementId, query.requirementId),
          );
        } else {
          conditions.push(
            or(
              eq(qepRequirementsRelationship.sourceRequirementId, query.requirementId),
              eq(qepRequirementsRelationship.targetRequirementId, query.requirementId),
            )!,
          );
        }
      }

      const rows = await db
        .select()
        .from(qepRequirementsRelationship)
        .where(and(...conditions))
        .orderBy(desc(qepRequirementsRelationship.updatedAt))
        .limit(query.limit ?? 100)
        .offset(query.offset ?? 0);

      const results: StoredRequirementsRelationship[] = [];
      for (const row of rows) {
        const history = await loadHistory(tenantId, row.id);
        results.push(mapRelationshipRow(row, history));
      }
      return results;
    },

    async listEdgeFacts(tenantId, options = {}) {
      const conditions = [eq(qepRequirementsRelationship.tenantId, tenantId)];
      if (options.excludeRelationshipId) {
        conditions.push(
          ne(qepRequirementsRelationship.id, options.excludeRelationshipId),
        );
      }
      if (options.types && options.types.length > 0) {
        conditions.push(
          inArray(qepRequirementsRelationship.relationshipType, [...options.types]),
        );
      }
      const rows = await db
        .select()
        .from(qepRequirementsRelationship)
        .where(and(...conditions));
      return rows.map((row): RelationshipEdgeFact => ({
        relationshipId: row.id,
        type: row.relationshipType as RelationshipType,
        source: {
          mode: row.sourceMode as RelationshipEdgeFact["source"]["mode"],
          requirementId:
            row.sourceRequirementId as RelationshipEdgeFact["source"]["requirementId"],
          tenantId: row.tenantId,
          ...(row.sourceContentVersionId
            ? {
                contentVersionId: row.sourceContentVersionId as NonNullable<
                  RelationshipEdgeFact["source"]["contentVersionId"]
                >,
              }
            : {}),
        },
        target: {
          mode: row.targetMode as RelationshipEdgeFact["target"]["mode"],
          requirementId:
            row.targetRequirementId as RelationshipEdgeFact["target"]["requirementId"],
          tenantId: row.tenantId,
          ...(row.targetContentVersionId
            ? {
                contentVersionId: row.targetContentVersionId as NonNullable<
                  RelationshipEdgeFact["target"]["contentVersionId"]
                >,
              }
            : {}),
        },
        scope: {
          kind: row.scopeKind as RelationshipEdgeFact["scope"]["kind"],
          ...(row.scopeReferenceId ? { referenceId: row.scopeReferenceId } : {}),
        },
        lifecycleState: row.lifecycleState as RelationshipEdgeFact["lifecycleState"],
      }));
    },

    async exists(tenantId, id) {
      const [row] = await db
        .select({ id: qepRequirementsRelationship.id })
        .from(qepRequirementsRelationship)
        .where(
          and(
            eq(qepRequirementsRelationship.tenantId, tenantId),
            eq(qepRequirementsRelationship.id, id),
          ),
        )
        .limit(1);
      return Boolean(row);
    },

    async listHistory(tenantId, id) {
      return loadHistory(tenantId, id);
    },
  };
}

function boolFlag(value: boolean): string {
  return value ? "true" : "false";
}

function certFlag(value: boolean | "conditional"): string {
  if (value === "conditional") return "conditional";
  return boolFlag(value);
}

function mapTaxonomyRow(
  row: typeof qepRequirementsRelationshipTaxonomy.$inferSelect,
): RelationshipTaxonomyDefinition {
  return {
    type: row.relationshipType as RelationshipType,
    displayName: row.displayName,
    description: row.description,
    symmetric: row.symmetric === "true",
    inverseLabel: row.inverseLabel,
    cyclePolicy: row.cyclePolicy as RelationshipTaxonomyDefinition["cyclePolicy"],
    rationalePolicy:
      row.rationalePolicy as RelationshipTaxonomyDefinition["rationalePolicy"],
    defaultStrength:
      row.defaultStrength as RelationshipTaxonomyDefinition["defaultStrength"],
    certificationRelevant:
      row.certificationRelevant === "conditional"
        ? "conditional"
        : row.certificationRelevant === "true",
    baselineProjectionDefault:
      row.baselineProjectionDefault as RelationshipTaxonomyDefinition["baselineProjectionDefault"],
    strictTraceabilityDefault: row.strictTraceabilityDefault === "true",
    highlightInTraceability: row.highlightInTraceability === "true",
  };
}

export function createPostgresRelationshipTaxonomyRepository(
  db: DatabaseExecutor,
): RelationshipTaxonomyRepository {
  return {
    async ensureSeeded(tenantId) {
      const existing = await db
        .select({ type: qepRequirementsRelationshipTaxonomy.relationshipType })
        .from(qepRequirementsRelationshipTaxonomy)
        .where(eq(qepRequirementsRelationshipTaxonomy.tenantId, tenantId));
      if (existing.length >= NORMATIVE_RELATIONSHIP_TAXONOMY.length) return;
      const now = new Date();
      for (const definition of NORMATIVE_RELATIONSHIP_TAXONOMY) {
        await db
          .insert(qepRequirementsRelationshipTaxonomy)
          .values({
            tenantId,
            relationshipType: definition.type,
            displayName: definition.displayName,
            description: definition.description,
            symmetric: boolFlag(definition.symmetric),
            inverseLabel: definition.inverseLabel,
            cyclePolicy: definition.cyclePolicy,
            rationalePolicy: definition.rationalePolicy,
            defaultStrength: definition.defaultStrength,
            certificationRelevant: certFlag(definition.certificationRelevant),
            baselineProjectionDefault: definition.baselineProjectionDefault,
            strictTraceabilityDefault: boolFlag(definition.strictTraceabilityDefault),
            highlightInTraceability: boolFlag(definition.highlightInTraceability),
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoNothing();
      }
    },

    async list(tenantId) {
      await this.ensureSeeded(tenantId);
      const rows = await db
        .select()
        .from(qepRequirementsRelationshipTaxonomy)
        .where(eq(qepRequirementsRelationshipTaxonomy.tenantId, tenantId))
        .orderBy(asc(qepRequirementsRelationshipTaxonomy.relationshipType));
      return rows.map(mapTaxonomyRow);
    },

    async get(tenantId, type) {
      await this.ensureSeeded(tenantId);
      const [row] = await db
        .select()
        .from(qepRequirementsRelationshipTaxonomy)
        .where(
          and(
            eq(qepRequirementsRelationshipTaxonomy.tenantId, tenantId),
            eq(qepRequirementsRelationshipTaxonomy.relationshipType, type),
          ),
        )
        .limit(1);
      return row ? mapTaxonomyRow(row) : null;
    },
  };
}
