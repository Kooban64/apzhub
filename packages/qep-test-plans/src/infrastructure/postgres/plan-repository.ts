import type { DatabaseExecutor } from "@apzhub/config";
import {
  qepTestPlan,
  qepTestPlanApproval,
  qepTestPlanHistory,
  qepTestPlanItem,
  qepTestPlanRevision,
} from "@apzhub/config";
import { and, asc, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { TestPlanApproval } from "../../domain/test-plan/plan-approval";
import type { TestPlanAssignment } from "../../domain/test-plan/plan-assignment";
import type {
  TestPlanHistory,
  TestPlanHistoryEntry,
} from "../../domain/test-plan/plan-history";
import type { TestPlanItem } from "../../domain/test-plan/plan-item";
import type {
  StoredTestPlan,
  TestPlanListQuery,
  TestPlanRepository,
} from "../../domain/test-plan/plan-repository";
import type { TestPlanRevision } from "../../domain/test-plan/plan-revision";
import type { TestPlanSchedule } from "../../domain/test-plan/plan-schedule";
import type { TestPlan } from "../../domain/test-plan/test-plan";
import type { PlanMetrics } from "../../domain/test-plan/value-objects";
import {
  createActorId,
  createPlanDescription,
  createPlanNotes,
  createPlanNumber,
  createPlanObjective,
  createPlanScope,
  createPlanStatus,
  createPlanTitle,
  createPriority,
  createRequirementId,
  createSpecificationId,
  createTenantId,
} from "../../domain/test-plan/value-objects";
import {
  PlanConcurrencyError,
  PlanConflictError,
  PlanNotFoundError,
} from "../../shared/errors";
import { matchesListFilters } from "../mappers/plan-mapper";

type PlanRow = typeof qepTestPlan.$inferSelect;
type ItemRow = typeof qepTestPlanItem.$inferSelect;
type ApprovalRow = typeof qepTestPlanApproval.$inferSelect;
type RevisionRow = typeof qepTestPlanRevision.$inferSelect;
type HistoryRow = typeof qepTestPlanHistory.$inferSelect;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function mapItemRow(row: ItemRow): TestPlanItem {
  return {
    id: row.id,
    specificationId: createSpecificationId(row.specificationId),
    specificationVersionPin: row.specificationVersionPin ?? undefined,
    sequence: row.sequence,
    itemStatus: row.itemStatus as TestPlanItem["itemStatus"],
    notes: row.notes ? createPlanNotes(row.notes) : undefined,
    requirementRefs:
      row.requirementRefsJson && row.requirementRefsJson.length > 0
        ? row.requirementRefsJson.map((ref) => createRequirementId(ref))
        : undefined,
  };
}

function mapApprovalRow(row: ApprovalRow): TestPlanApproval {
  return {
    id: row.id,
    decision: row.decision as TestPlanApproval["decision"],
    decidedBy: createActorId(row.decidedBy),
    decidedAt: row.decidedAt.toISOString(),
    comment: row.comment ?? undefined,
    fromStatus: createPlanStatus(row.fromStatus),
    toStatus: createPlanStatus(row.toStatus),
  };
}

function mapRevisionRow(row: RevisionRow): TestPlanRevision {
  return {
    versionLabel: row.versionLabel,
    sealedAt: row.sealedAt.toISOString(),
    sealedBy: createActorId(row.sealedBy),
    statusAtSeal: createPlanStatus(row.statusAtSeal),
    itemFingerprint: row.itemFingerprint,
    predecessorVersionLabel: row.predecessorVersionLabel ?? undefined,
  };
}

function mapHistoryRow(row: HistoryRow): TestPlanHistoryEntry {
  return {
    sequence: row.sequence,
    at: row.occurredAt.toISOString(),
    actorId: createActorId(row.actorUserId),
    action: row.action,
    summary: row.summary,
    fromStatus: row.fromStatus ? createPlanStatus(row.fromStatus) : undefined,
    toStatus: row.toStatus ? createPlanStatus(row.toStatus) : undefined,
    correlationId: row.correlationId ?? undefined,
  };
}

function mapSchedule(row: PlanRow): TestPlanSchedule {
  return {
    plannedStart: row.plannedStart?.toISOString(),
    plannedEnd: row.plannedEnd?.toISOString(),
    milestoneRef: row.milestoneRef ?? undefined,
    timezone: row.timezone ?? undefined,
  };
}

function mapAssignment(row: PlanRow): TestPlanAssignment {
  return {
    leadId: row.leadId ?? undefined,
    assigneeIds: row.assigneeIdsJson ?? [],
    updatedAt: row.assignmentUpdatedAt.toISOString(),
    updatedBy: row.assignmentUpdatedBy,
  };
}

function mapMetrics(row: PlanRow): PlanMetrics {
  return {
    totalItems: row.metricsJson.totalItems,
    includedCount: row.metricsJson.includedCount,
    optionalCount: row.metricsJson.optionalCount,
    deferredCount: row.metricsJson.deferredCount,
    pinnedIncludedCount: row.metricsJson.pinnedIncludedCount,
  };
}

function mapPlanRow(
  row: PlanRow,
  items: readonly TestPlanItem[],
  approvals: readonly TestPlanApproval[],
  revisions: readonly TestPlanRevision[],
  history: TestPlanHistory,
): StoredTestPlan {
  const scope = createPlanScope({
    class: row.scopeClass,
    label: row.scopeLabel ?? undefined,
    externalRef: row.scopeExternalRef ?? undefined,
  });
  return {
    id: row.id,
    tenantId: createTenantId(row.tenantId),
    number: createPlanNumber(row.number),
    revision: row.revision,
    title: createPlanTitle(row.title),
    description: row.description ? createPlanDescription(row.description) : undefined,
    objective: row.objective ? createPlanObjective(row.objective) : "",
    scope,
    status: createPlanStatus(row.status),
    priority: createPriority(row.priority),
    planType: scope.class,
    ownerId: createActorId(row.ownerId),
    versionLabel: row.versionLabel,
    predecessorPlanId: row.predecessorPlanId ?? undefined,
    predecessorSealedVersionLabel: row.predecessorSealedVersionLabel ?? undefined,
    successorPlanId: row.successorPlanId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
    items,
    schedule: mapSchedule(row),
    assignment: mapAssignment(row),
    approvals,
    revisions,
    history,
    externalReferences:
      row.externalReferencesJson && row.externalReferencesJson.length > 0
        ? row.externalReferencesJson
        : undefined,
    metadata:
      row.metadataJson && Object.keys(row.metadataJson).length > 0
        ? row.metadataJson
        : undefined,
    metrics: mapMetrics(row),
    uncommittedEvents: [],
  };
}

function toPlanRowValues(plan: TestPlan) {
  return {
    id: plan.id,
    tenantId: plan.tenantId,
    number: plan.number,
    title: plan.title,
    description: plan.description ?? null,
    objective: plan.objective,
    scopeClass: plan.scope.class,
    scopeLabel: plan.scope.label ?? null,
    scopeExternalRef: plan.scope.externalRef ?? null,
    status: plan.status,
    priority: plan.priority,
    planType: plan.planType,
    ownerId: plan.ownerId,
    versionLabel: plan.versionLabel,
    predecessorPlanId: plan.predecessorPlanId ?? null,
    predecessorSealedVersionLabel: plan.predecessorSealedVersionLabel ?? null,
    successorPlanId: plan.successorPlanId ?? null,
    leadId: plan.assignment.leadId ?? null,
    assigneeIdsJson: [...plan.assignment.assigneeIds],
    assignmentUpdatedAt: new Date(plan.assignment.updatedAt),
    assignmentUpdatedBy: plan.assignment.updatedBy,
    plannedStart: plan.schedule.plannedStart
      ? new Date(plan.schedule.plannedStart)
      : null,
    plannedEnd: plan.schedule.plannedEnd ? new Date(plan.schedule.plannedEnd) : null,
    milestoneRef: plan.schedule.milestoneRef ?? null,
    timezone: plan.schedule.timezone ?? null,
    externalReferencesJson: plan.externalReferences ? [...plan.externalReferences] : [],
    metadataJson: plan.metadata ? { ...plan.metadata } : {},
    metricsJson: { ...plan.metrics },
    revision: plan.revision,
    createdAt: new Date(plan.createdAt),
    createdBy: plan.createdBy,
    updatedAt: new Date(plan.updatedAt),
    updatedBy: plan.updatedBy,
    correlationId: null,
  };
}

export function createPostgresTestPlanRepository(
  db: DatabaseExecutor,
): TestPlanRepository {
  async function loadItems(tenantId: string, planId: string): Promise<TestPlanItem[]> {
    const rows = await db
      .select()
      .from(qepTestPlanItem)
      .where(
        and(eq(qepTestPlanItem.tenantId, tenantId), eq(qepTestPlanItem.planId, planId)),
      )
      .orderBy(asc(qepTestPlanItem.sequence));
    return rows.map(mapItemRow);
  }

  async function loadApprovals(
    tenantId: string,
    planId: string,
  ): Promise<TestPlanApproval[]> {
    const rows = await db
      .select()
      .from(qepTestPlanApproval)
      .where(
        and(
          eq(qepTestPlanApproval.tenantId, tenantId),
          eq(qepTestPlanApproval.planId, planId),
        ),
      )
      .orderBy(asc(qepTestPlanApproval.decidedAt));
    return rows.map(mapApprovalRow);
  }

  async function loadRevisions(
    tenantId: string,
    planId: string,
  ): Promise<TestPlanRevision[]> {
    const rows = await db
      .select()
      .from(qepTestPlanRevision)
      .where(
        and(
          eq(qepTestPlanRevision.tenantId, tenantId),
          eq(qepTestPlanRevision.planId, planId),
        ),
      )
      .orderBy(asc(qepTestPlanRevision.sealedAt));
    return rows.map(mapRevisionRow);
  }

  async function loadHistory(
    tenantId: string,
    planId: string,
  ): Promise<TestPlanHistory> {
    const rows = await db
      .select()
      .from(qepTestPlanHistory)
      .where(
        and(
          eq(qepTestPlanHistory.tenantId, tenantId),
          eq(qepTestPlanHistory.planId, planId),
        ),
      )
      .orderBy(asc(qepTestPlanHistory.sequence));
    return { entries: rows.map(mapHistoryRow) };
  }

  async function syncItems(tenantId: string, plan: TestPlan): Promise<void> {
    await db
      .delete(qepTestPlanItem)
      .where(
        and(
          eq(qepTestPlanItem.tenantId, tenantId),
          eq(qepTestPlanItem.planId, plan.id),
        ),
      );
    if (plan.items.length === 0) return;
    await db.insert(qepTestPlanItem).values(
      plan.items.map((item) => ({
        id: item.id,
        tenantId,
        planId: plan.id,
        specificationId: item.specificationId,
        specificationVersionPin: item.specificationVersionPin ?? null,
        sequence: item.sequence,
        itemStatus: item.itemStatus,
        notes: item.notes ?? null,
        requirementRefsJson: item.requirementRefs ? [...item.requirementRefs] : [],
        revision: plan.revision,
        createdBy: plan.updatedBy,
        updatedAt: new Date(plan.updatedAt),
        updatedBy: plan.updatedBy,
      })),
    );
  }

  async function syncApprovals(tenantId: string, plan: TestPlan): Promise<void> {
    const existing = await db
      .select({ id: qepTestPlanApproval.id })
      .from(qepTestPlanApproval)
      .where(
        and(
          eq(qepTestPlanApproval.tenantId, tenantId),
          eq(qepTestPlanApproval.planId, plan.id),
        ),
      );
    const existingIds = new Set(existing.map((row) => row.id));
    const missing = plan.approvals.filter((approval) => !existingIds.has(approval.id));
    if (missing.length === 0) return;
    await db.insert(qepTestPlanApproval).values(
      missing.map((approval) => ({
        id: approval.id,
        tenantId,
        planId: plan.id,
        decision: approval.decision,
        decidedBy: approval.decidedBy,
        decidedAt: new Date(approval.decidedAt),
        comment: approval.comment ?? null,
        fromStatus: approval.fromStatus,
        toStatus: approval.toStatus,
        createdBy: approval.decidedBy,
      })),
    );
  }

  async function syncRevisions(tenantId: string, plan: TestPlan): Promise<void> {
    const existing = await db
      .select({ versionLabel: qepTestPlanRevision.versionLabel })
      .from(qepTestPlanRevision)
      .where(
        and(
          eq(qepTestPlanRevision.tenantId, tenantId),
          eq(qepTestPlanRevision.planId, plan.id),
        ),
      );
    const existingLabels = new Set(existing.map((row) => row.versionLabel));
    const missing = plan.revisions.filter(
      (revision) => !existingLabels.has(revision.versionLabel),
    );
    if (missing.length === 0) return;
    await db.insert(qepTestPlanRevision).values(
      missing.map((revision) => ({
        id: randomUUID(),
        tenantId,
        planId: plan.id,
        versionLabel: revision.versionLabel,
        sealedAt: new Date(revision.sealedAt),
        sealedBy: revision.sealedBy,
        statusAtSeal: revision.statusAtSeal,
        itemFingerprint: revision.itemFingerprint,
        predecessorVersionLabel: revision.predecessorVersionLabel ?? null,
      })),
    );
  }

  async function syncHistory(tenantId: string, plan: TestPlan): Promise<void> {
    const existing = await db
      .select()
      .from(qepTestPlanHistory)
      .where(
        and(
          eq(qepTestPlanHistory.tenantId, tenantId),
          eq(qepTestPlanHistory.planId, plan.id),
        ),
      );
    const start = existing.length;
    if (plan.history.entries.length <= start) return;
    const inserts = plan.history.entries.slice(start).map((entry) => ({
      id: randomUUID(),
      tenantId,
      planId: plan.id,
      sequence: entry.sequence,
      occurredAt: new Date(entry.at),
      actorUserId: entry.actorId,
      action: entry.action,
      summary: entry.summary,
      fromStatus: entry.fromStatus ?? null,
      toStatus: entry.toStatus ?? null,
      correlationId: entry.correlationId ?? null,
      createdBy: entry.actorId,
      updatedBy: plan.updatedBy,
      revision: plan.revision,
    }));
    await db.insert(qepTestPlanHistory).values(inserts);
  }

  async function load(tenantId: string, id: string): Promise<StoredTestPlan | null> {
    const [row] = await db
      .select()
      .from(qepTestPlan)
      .where(and(eq(qepTestPlan.tenantId, tenantId), eq(qepTestPlan.id, id)))
      .limit(1);
    if (!row) return null;
    const [items, approvals, revisions, history] = await Promise.all([
      loadItems(tenantId, id),
      loadApprovals(tenantId, id),
      loadRevisions(tenantId, id),
      loadHistory(tenantId, id),
    ]);
    return mapPlanRow(row, items, approvals, revisions, history);
  }

  return {
    async create(plan) {
      try {
        const [row] = await db
          .insert(qepTestPlan)
          .values(toPlanRowValues(plan))
          .returning();
        if (!row) {
          throw new PlanConflictError("Failed to create Test Plan");
        }
        await syncItems(plan.tenantId, plan);
        await syncApprovals(plan.tenantId, plan);
        await syncRevisions(plan.tenantId, plan);
        await syncHistory(plan.tenantId, plan);
        return (await load(plan.tenantId, plan.id)) as StoredTestPlan;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new PlanConflictError(`Test Plan already exists: ${plan.id}`);
        }
        throw error;
      }
    },

    async get(tenantId, id) {
      return load(tenantId, id);
    },

    async getByNumber(tenantId, number) {
      const [row] = await db
        .select({ id: qepTestPlan.id })
        .from(qepTestPlan)
        .where(and(eq(qepTestPlan.tenantId, tenantId), eq(qepTestPlan.number, number)))
        .limit(1);
      if (!row) return null;
      return load(tenantId, row.id);
    },

    async save(plan, expectedRevision) {
      try {
        const [row] = await db
          .update(qepTestPlan)
          .set(toPlanRowValues(plan))
          .where(
            and(
              eq(qepTestPlan.id, plan.id),
              eq(qepTestPlan.tenantId, plan.tenantId),
              eq(qepTestPlan.revision, expectedRevision),
            ),
          )
          .returning();
        if (!row) {
          const existing = await load(plan.tenantId, plan.id);
          if (!existing) {
            throw new PlanNotFoundError(`Test Plan not found: ${plan.id}`);
          }
          throw new PlanConcurrencyError(plan.id, expectedRevision, existing.revision);
        }
        await syncItems(plan.tenantId, plan);
        await syncApprovals(plan.tenantId, plan);
        await syncRevisions(plan.tenantId, plan);
        await syncHistory(plan.tenantId, plan);
        return (await load(plan.tenantId, plan.id)) as StoredTestPlan;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new PlanConflictError(`Test Plan already exists: ${plan.id}`);
        }
        throw error;
      }
    },

    async list(tenantId, query: TestPlanListQuery = {}) {
      const conditions = [eq(qepTestPlan.tenantId, tenantId)];
      if (query.status) conditions.push(eq(qepTestPlan.status, query.status));
      if (query.ownerId) conditions.push(eq(qepTestPlan.ownerId, query.ownerId));
      if (query.priority) conditions.push(eq(qepTestPlan.priority, query.priority));
      if (query.planType) conditions.push(eq(qepTestPlan.planType, query.planType));
      if (query.number) conditions.push(eq(qepTestPlan.number, query.number));

      const rows = await db
        .select()
        .from(qepTestPlan)
        .where(and(...conditions))
        .orderBy(desc(qepTestPlan.updatedAt));

      const results: StoredTestPlan[] = [];
      for (const row of rows) {
        const candidate = mapPlanRow(row, [], [], [], { entries: [] });
        if (!matchesListFilters(candidate, query)) continue;
        const [items, approvals, revisions, history] = await Promise.all([
          loadItems(tenantId, row.id),
          loadApprovals(tenantId, row.id),
          loadRevisions(tenantId, row.id),
          loadHistory(tenantId, row.id),
        ]);
        results.push(mapPlanRow(row, items, approvals, revisions, history));
      }

      const offset = query.offset ?? 0;
      const limit = query.limit ?? results.length;
      return results.slice(offset, offset + limit);
    },

    async exists(tenantId, id) {
      const [row] = await db
        .select({ id: qepTestPlan.id })
        .from(qepTestPlan)
        .where(and(eq(qepTestPlan.tenantId, tenantId), eq(qepTestPlan.id, id)))
        .limit(1);
      return Boolean(row);
    },

    async existsByNumber(tenantId, number) {
      const [row] = await db
        .select({ id: qepTestPlan.id })
        .from(qepTestPlan)
        .where(and(eq(qepTestPlan.tenantId, tenantId), eq(qepTestPlan.number, number)))
        .limit(1);
      return Boolean(row);
    },

    async listHistory(tenantId, id) {
      const history = await loadHistory(tenantId, id);
      return history.entries;
    },

    async listRevisions(tenantId, id) {
      return loadRevisions(tenantId, id);
    },
  };
}
