import type { DatabaseExecutor } from "@apzhub/config";
import { qepTraceLink, qepTraceLinkHistory, qepTraceLinkTaxonomy } from "@apzhub/config";
import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type {
  TraceAuthority,
  TraceAuthorityKind,
} from "../../domain/trace-link/trace-authority";
import type { TraceConfidence } from "../../domain/trace-link/trace-confidence";
import type { TraceDirection } from "../../domain/trace-link/trace-direction";
import type {
  TraceEndpoint,
  TraceEndpointKind,
} from "../../domain/trace-link/trace-endpoint";
import type { TraceHistoryEntry } from "../../domain/trace-link/trace-history";
import type { TraceId } from "../../domain/trace-link/trace-id";
import type { TraceLifecycleState } from "../../domain/trace-link/trace-lifecycle-state";
import type { TraceLink } from "../../domain/trace-link/trace-link";
import type {
  StoredTraceLink,
  TraceLinkRepository,
  TraceListQuery,
  TraceTaxonomyRepository,
} from "../../domain/trace-link/trace-link-repository";
import type { TraceOrigin } from "../../domain/trace-link/trace-origin";
import type { TraceEdgeFact } from "../../domain/trace-link/trace-policy";
import type { TraceProvenance } from "../../domain/trace-link/trace-provenance";
import type { TraceRationale } from "../../domain/trace-link/trace-rationale";
import type { TraceScopeKind } from "../../domain/trace-link/trace-scope";
import type { TraceStrength } from "../../domain/trace-link/trace-strength";
import {
  NORMATIVE_TRACE_TAXONOMY,
  type TraceCyclePolicy,
  type TraceGovernanceClass,
  type TraceRationalePolicy,
  type TraceTaxonomyDefinition,
} from "../../domain/trace-link/trace-taxonomy";
import type { TraceType } from "../../domain/trace-link/trace-type";
import { TraceConflictError, TraceNotFoundError, TraceRevisionConflictError } from "../../shared/errors";
import { computeTraceLinkDuplicateKey, toStoredTraceLink } from "../mappers/trace-link-mapper";

type TraceLinkRow = typeof qepTraceLink.$inferSelect;
type HistoryRow = typeof qepTraceLinkHistory.$inferSelect;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function mapHistoryRows(rows: readonly HistoryRow[]): TraceHistoryEntry[] {
  return rows.map((row) => ({
    at: row.occurredAt.toISOString(),
    by: row.actorUserId,
    kind: row.kind,
    summary: row.summary,
  }));
}

function mapTraceLinkRow(row: TraceLinkRow, historyEntries: readonly TraceHistoryEntry[]): StoredTraceLink {
  const source: TraceEndpoint = {
    role: "source",
    kind: row.sourceKind as TraceEndpointKind,
    artefactId: row.sourceArtefactId,
    tenantId: row.tenantId,
    ...(row.sourceContentVersionId ? { contentVersionId: row.sourceContentVersionId } : {}),
    ...(row.sourceBaselineId ? { baselineId: row.sourceBaselineId } : {}),
    ...(row.sourceExternalUri ? { externalUri: row.sourceExternalUri } : {}),
    owningDomain: row.sourceOwningDomain,
  };
  const target: TraceEndpoint = {
    role: "target",
    kind: row.targetKind as TraceEndpointKind,
    artefactId: row.targetArtefactId,
    tenantId: row.tenantId,
    ...(row.targetContentVersionId ? { contentVersionId: row.targetContentVersionId } : {}),
    ...(row.targetBaselineId ? { baselineId: row.targetBaselineId } : {}),
    ...(row.targetExternalUri ? { externalUri: row.targetExternalUri } : {}),
    owningDomain: row.targetOwningDomain,
  };
  const authority: TraceAuthority = {
    kind: row.authorityKind as TraceAuthorityKind,
    actorId: row.authorityActorId,
  };
  const provenance: TraceProvenance = {
    actorId: row.provenanceActorId,
    correlationId: row.provenanceCorrelationId,
    ...(row.provenanceSourceSystem ? { sourceSystem: row.provenanceSourceSystem } : {}),
    ...(row.provenanceImportBatchId ? { importBatchId: row.provenanceImportBatchId } : {}),
    ...(row.provenanceRationaleRef ? { rationaleRef: row.provenanceRationaleRef } : {}),
  };

  return {
    id: row.id as TraceId,
    tenantId: row.tenantId,
    type: row.traceType as TraceType,
    direction: row.direction as TraceDirection,
    source,
    target,
    lifecycleState: row.lifecycleState as TraceLifecycleState,
    strength: row.strength as TraceStrength,
    confidence: row.confidence as TraceConfidence,
    origin: row.origin as TraceOrigin,
    authority,
    provenance,
    scope: {
      kind: row.scopeKind as TraceScopeKind,
      ...(row.scopeReferenceId ? { referenceId: row.scopeReferenceId } : {}),
    },
    context: {
      ...(row.contextBaselineId ? { baselineId: row.contextBaselineId } : {}),
      ...(row.contextContentVersionId ? { contentVersionId: row.contextContentVersionId } : {}),
      immutable: row.contextImmutable,
    },
    ...(row.rationale ? { rationale: row.rationale as TraceRationale } : {}),
    metadata: { entries: row.metadataJson ?? {} },
    history: { entries: historyEntries },
    revision: row.revision,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
    correlationId: row.correlationId,
    ...(row.validatedAt ? { validatedAt: row.validatedAt.toISOString() } : {}),
    ...(row.validatedBy ? { validatedBy: row.validatedBy } : {}),
    ...(row.approvedAt ? { approvedAt: row.approvedAt.toISOString() } : {}),
    ...(row.approvedBy ? { approvedBy: row.approvedBy } : {}),
    ...(row.retiredAt ? { retiredAt: row.retiredAt.toISOString() } : {}),
    ...(row.retiredBy ? { retiredBy: row.retiredBy } : {}),
    ...(row.supersededAt ? { supersededAt: row.supersededAt.toISOString() } : {}),
    ...(row.supersededBy ? { supersededBy: row.supersededBy } : {}),
    ...(row.successorTraceId ? { successorTraceId: row.successorTraceId as TraceId } : {}),
    domainEvents: [],
  };
}

function toInsertValues(trace: TraceLink) {
  return {
    id: trace.id,
    tenantId: trace.tenantId,
    traceType: trace.type,
    lifecycleState: trace.lifecycleState,
    direction: trace.direction,
    strength: trace.strength,
    confidence: trace.confidence,
    origin: trace.origin,

    sourceKind: trace.source.kind,
    sourceArtefactId: trace.source.artefactId,
    sourceContentVersionId: trace.source.contentVersionId ?? null,
    sourceBaselineId: trace.source.baselineId ?? null,
    sourceExternalUri: trace.source.externalUri ?? null,
    sourceOwningDomain: trace.source.owningDomain,

    targetKind: trace.target.kind,
    targetArtefactId: trace.target.artefactId,
    targetContentVersionId: trace.target.contentVersionId ?? null,
    targetBaselineId: trace.target.baselineId ?? null,
    targetExternalUri: trace.target.externalUri ?? null,
    targetOwningDomain: trace.target.owningDomain,

    authorityKind: trace.authority.kind,
    authorityActorId: trace.authority.actorId,

    provenanceActorId: trace.provenance.actorId,
    provenanceCorrelationId: trace.provenance.correlationId,
    provenanceSourceSystem: trace.provenance.sourceSystem ?? null,
    provenanceImportBatchId: trace.provenance.importBatchId ?? null,
    provenanceRationaleRef: trace.provenance.rationaleRef ?? null,

    scopeKind: trace.scope.kind,
    scopeReferenceId: trace.scope.referenceId ?? null,

    contextBaselineId: trace.context.baselineId ?? null,
    contextContentVersionId: trace.context.contentVersionId ?? null,
    contextImmutable: trace.context.immutable,

    rationale: trace.rationale ?? null,
    metadataJson: { ...trace.metadata.entries },

    duplicateKey: computeTraceLinkDuplicateKey(trace),
    revision: trace.revision,

    successorTraceId: trace.successorTraceId ?? null,

    createdAt: new Date(trace.createdAt),
    createdBy: trace.createdBy,
    updatedAt: new Date(trace.updatedAt),
    updatedBy: trace.updatedBy,
    validatedAt: trace.validatedAt ? new Date(trace.validatedAt) : null,
    validatedBy: trace.validatedBy ?? null,
    approvedAt: trace.approvedAt ? new Date(trace.approvedAt) : null,
    approvedBy: trace.approvedBy ?? null,
    retiredAt: trace.retiredAt ? new Date(trace.retiredAt) : null,
    retiredBy: trace.retiredBy ?? null,
    supersededAt: trace.supersededAt ? new Date(trace.supersededAt) : null,
    supersededBy: trace.supersededBy ?? null,
    correlationId: trace.correlationId,
  };
}

export function createPostgresTraceLinkRepository(db: DatabaseExecutor): TraceLinkRepository {
  async function loadHistory(tenantId: string, traceId: string): Promise<TraceHistoryEntry[]> {
    const rows = await db
      .select()
      .from(qepTraceLinkHistory)
      .where(
        and(
          eq(qepTraceLinkHistory.tenantId, tenantId),
          eq(qepTraceLinkHistory.traceId, traceId),
        ),
      )
      .orderBy(asc(qepTraceLinkHistory.sequence));
    return mapHistoryRows(rows);
  }

  async function syncHistory(
    tenantId: string,
    traceId: string,
    history: readonly TraceHistoryEntry[],
  ): Promise<void> {
    const existing = await db
      .select()
      .from(qepTraceLinkHistory)
      .where(
        and(
          eq(qepTraceLinkHistory.tenantId, tenantId),
          eq(qepTraceLinkHistory.traceId, traceId),
        ),
      );
    const start = existing.length;
    if (history.length <= start) return;
    const inserts = history.slice(start).map((entry, index) => ({
      id: randomUUID(),
      tenantId,
      traceId,
      occurredAt: new Date(entry.at),
      actorUserId: entry.by,
      kind: entry.kind,
      summary: entry.summary,
      sequence: start + index + 1,
    }));
    if (inserts.length > 0) {
      await db.insert(qepTraceLinkHistory).values(inserts);
    }
  }

  async function load(tenantId: string, id: TraceId): Promise<StoredTraceLink | null> {
    const [row] = await db
      .select()
      .from(qepTraceLink)
      .where(and(eq(qepTraceLink.tenantId, tenantId), eq(qepTraceLink.id, id)))
      .limit(1);
    if (!row) return null;
    const history = await loadHistory(tenantId, id);
    return mapTraceLinkRow(row, history);
  }

  return {
    async create(trace) {
      try {
        const [row] = await db.insert(qepTraceLink).values(toInsertValues(trace)).returning();
        if (!row) throw new TraceConflictError("Failed to create Trace Link");
        await syncHistory(trace.tenantId, trace.id, trace.history.entries);
        return mapTraceLinkRow(row, [...trace.history.entries]);
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new TraceConflictError(`Duplicate Trace Link already exists: ${trace.id}`);
        }
        throw error;
      }
    },

    async get(tenantId, id) {
      return load(tenantId, id);
    },

    async save(trace, expectedRevision) {
      try {
        const [row] = await db
          .update(qepTraceLink)
          .set(toInsertValues(trace))
          .where(
            and(
              eq(qepTraceLink.id, trace.id),
              eq(qepTraceLink.tenantId, trace.tenantId),
              eq(qepTraceLink.revision, expectedRevision),
            ),
          )
          .returning();
        if (!row) {
          const existing = await load(trace.tenantId, trace.id);
          if (!existing) {
            throw new TraceNotFoundError(`Trace Link not found: ${trace.id}`);
          }
          throw new TraceRevisionConflictError(trace.id, expectedRevision, existing.revision);
        }
        await syncHistory(trace.tenantId, trace.id, trace.history.entries);
        const history = await loadHistory(trace.tenantId, trace.id);
        return mapTraceLinkRow(row, history);
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new TraceConflictError(`Duplicate Trace Link already exists: ${trace.id}`);
        }
        throw error;
      }
    },

    async list(tenantId, query: TraceListQuery = {}) {
      const conditions = [eq(qepTraceLink.tenantId, tenantId)];
      if (query.type) {
        conditions.push(eq(qepTraceLink.traceType, query.type));
      }
      if (query.lifecycleState) {
        conditions.push(eq(qepTraceLink.lifecycleState, query.lifecycleState));
      }
      if (query.sourceKind) {
        conditions.push(eq(qepTraceLink.sourceKind, query.sourceKind));
      }
      if (query.sourceArtefactId) {
        conditions.push(eq(qepTraceLink.sourceArtefactId, query.sourceArtefactId));
      }
      if (query.targetKind) {
        conditions.push(eq(qepTraceLink.targetKind, query.targetKind));
      }
      if (query.targetArtefactId) {
        conditions.push(eq(qepTraceLink.targetArtefactId, query.targetArtefactId));
      }
      if (query.scopeReferenceId) {
        conditions.push(eq(qepTraceLink.scopeReferenceId, query.scopeReferenceId));
      }

      const rows = await db
        .select()
        .from(qepTraceLink)
        .where(and(...conditions))
        .orderBy(desc(qepTraceLink.updatedAt))
        .limit(query.limit ?? 100)
        .offset(query.offset ?? 0);

      let results: StoredTraceLink[] = [];
      for (const row of rows) {
        const history = await loadHistory(tenantId, row.id);
        results.push(mapTraceLinkRow(row, history));
      }

      if (query.artefactId) {
        const direction = query.direction ?? "both";
        results = results.filter((row) => {
          const matchesSource = row.source.artefactId === query.artefactId;
          const matchesTarget = row.target.artefactId === query.artefactId;
          if (direction === "outbound") return matchesSource;
          if (direction === "inbound") return matchesTarget;
          return matchesSource || matchesTarget;
        });
      }

      return results;
    },

    async listEdgeFacts(tenantId, options = {}) {
      const conditions = [eq(qepTraceLink.tenantId, tenantId)];
      if (options.excludeTraceId) {
        conditions.push(ne(qepTraceLink.id, options.excludeTraceId));
      }
      if (options.types && options.types.length > 0) {
        conditions.push(inArray(qepTraceLink.traceType, [...options.types]));
      }
      const rows = await db
        .select()
        .from(qepTraceLink)
        .where(and(...conditions));
      return rows.map(
        (row): TraceEdgeFact => ({
          traceId: row.id as TraceId,
          type: row.traceType as TraceType,
          source: {
            kind: row.sourceKind as TraceEndpointKind,
            artefactId: row.sourceArtefactId,
            tenantId: row.tenantId,
            ...(row.sourceContentVersionId ? { contentVersionId: row.sourceContentVersionId } : {}),
            ...(row.sourceBaselineId ? { baselineId: row.sourceBaselineId } : {}),
            ...(row.sourceExternalUri ? { externalUri: row.sourceExternalUri } : {}),
            owningDomain: row.sourceOwningDomain,
          },
          target: {
            kind: row.targetKind as TraceEndpointKind,
            artefactId: row.targetArtefactId,
            tenantId: row.tenantId,
            ...(row.targetContentVersionId ? { contentVersionId: row.targetContentVersionId } : {}),
            ...(row.targetBaselineId ? { baselineId: row.targetBaselineId } : {}),
            ...(row.targetExternalUri ? { externalUri: row.targetExternalUri } : {}),
            owningDomain: row.targetOwningDomain,
          },
          scope: {
            kind: row.scopeKind as TraceScopeKind,
            ...(row.scopeReferenceId ? { referenceId: row.scopeReferenceId } : {}),
          },
          lifecycleState: row.lifecycleState as TraceLifecycleState,
        }),
      );
    },

    async exists(tenantId, id) {
      const [row] = await db
        .select({ id: qepTraceLink.id })
        .from(qepTraceLink)
        .where(and(eq(qepTraceLink.tenantId, tenantId), eq(qepTraceLink.id, id)))
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

function mapTaxonomyRow(
  row: typeof qepTraceLinkTaxonomy.$inferSelect,
): TraceTaxonomyDefinition {
  return {
    type: row.traceType as TraceType,
    displayName: row.displayName,
    description: row.description,
    family: row.family,
    allowedSourceKinds: row.allowedSourceKinds as TraceEndpointKind[],
    allowedTargetKinds: row.allowedTargetKinds as TraceEndpointKind[],
    directionDefault: row.directionDefault as TraceTaxonomyDefinition["directionDefault"],
    symmetric: row.symmetric === "true",
    governanceClass: row.governanceClass as TraceGovernanceClass,
    cyclePolicy: row.cyclePolicy as TraceCyclePolicy,
    rationalePolicy: row.rationalePolicy as TraceRationalePolicy,
    defaultStrength: row.defaultStrength as TraceStrength,
    projectionOnly: row.projectionOnly === "true",
    allowsSelfLink: row.allowsSelfLink === "true",
  };
}

export function createPostgresTraceTaxonomyRepository(
  db: DatabaseExecutor,
): TraceTaxonomyRepository {
  return {
    async ensureSeeded(tenantId) {
      const existing = await db
        .select({ type: qepTraceLinkTaxonomy.traceType })
        .from(qepTraceLinkTaxonomy)
        .where(eq(qepTraceLinkTaxonomy.tenantId, tenantId));
      if (existing.length >= NORMATIVE_TRACE_TAXONOMY.length) return;
      const now = new Date();
      for (const definition of NORMATIVE_TRACE_TAXONOMY) {
        await db
          .insert(qepTraceLinkTaxonomy)
          .values({
            tenantId,
            traceType: definition.type,
            displayName: definition.displayName,
            description: definition.description,
            family: definition.family,
            allowedSourceKinds: [...definition.allowedSourceKinds],
            allowedTargetKinds: [...definition.allowedTargetKinds],
            directionDefault: definition.directionDefault,
            symmetric: boolFlag(definition.symmetric),
            governanceClass: definition.governanceClass,
            cyclePolicy: definition.cyclePolicy,
            rationalePolicy: definition.rationalePolicy,
            defaultStrength: definition.defaultStrength,
            projectionOnly: boolFlag(definition.projectionOnly),
            allowsSelfLink: boolFlag(definition.allowsSelfLink),
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
        .from(qepTraceLinkTaxonomy)
        .where(eq(qepTraceLinkTaxonomy.tenantId, tenantId))
        .orderBy(asc(qepTraceLinkTaxonomy.traceType));
      return rows.map(mapTaxonomyRow);
    },

    async get(tenantId, type) {
      await this.ensureSeeded(tenantId);
      const [row] = await db
        .select()
        .from(qepTraceLinkTaxonomy)
        .where(
          and(eq(qepTraceLinkTaxonomy.tenantId, tenantId), eq(qepTraceLinkTaxonomy.traceType, type)),
        )
        .limit(1);
      return row ? mapTaxonomyRow(row) : null;
    },
  };
}
