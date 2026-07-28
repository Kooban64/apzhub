/**
 * PostgreSQL Test Execution repository — APZQEP-ENG-100D (OES-ENG-090A PART-03).
 * Persists the full aggregate (root + manifest + steps + observations +
 * evidence + reviews + external submissions + history) via Drizzle.
 */
import type { DatabaseExecutor } from "@apzhub/config";
import {
  qepTestExecution,
  qepTestExecutionEvidenceReference,
  qepTestExecutionExternalSubmission,
  qepTestExecutionHistory,
  qepTestExecutionManifest,
  qepTestExecutionObservation,
  qepTestExecutionReview,
  qepTestExecutionStep,
} from "@apzhub/config";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { TestExecution } from "../../domain/test-execution/test-execution";
import {
  ExecutionConcurrencyError,
  ExecutionConflictError,
  ExecutionNotFoundError,
} from "../../shared/errors";
import type {
  StoredTestExecution,
  TestExecutionListQuery,
  TestExecutionRepository,
} from "../../application/ports";
import {
  mapExecutionAggregate,
  toExecutionRowValues,
} from "../mappers/execution-mapper";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export function createPostgresTestExecutionRepository(
  db: DatabaseExecutor,
): TestExecutionRepository {
  async function loadManifest(tenantId: string, executionId: string) {
    const [row] = await db
      .select()
      .from(qepTestExecutionManifest)
      .where(
        and(
          eq(qepTestExecutionManifest.tenantId, tenantId),
          eq(qepTestExecutionManifest.executionId, executionId),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async function loadSteps(tenantId: string, executionId: string) {
    return db
      .select()
      .from(qepTestExecutionStep)
      .where(
        and(
          eq(qepTestExecutionStep.tenantId, tenantId),
          eq(qepTestExecutionStep.executionId, executionId),
        ),
      );
  }

  async function loadObservations(tenantId: string, executionId: string) {
    return db
      .select()
      .from(qepTestExecutionObservation)
      .where(
        and(
          eq(qepTestExecutionObservation.tenantId, tenantId),
          eq(qepTestExecutionObservation.executionId, executionId),
        ),
      );
  }

  async function loadEvidence(tenantId: string, executionId: string) {
    return db
      .select()
      .from(qepTestExecutionEvidenceReference)
      .where(
        and(
          eq(qepTestExecutionEvidenceReference.tenantId, tenantId),
          eq(qepTestExecutionEvidenceReference.executionId, executionId),
        ),
      );
  }

  async function loadReviews(tenantId: string, executionId: string) {
    return db
      .select()
      .from(qepTestExecutionReview)
      .where(
        and(
          eq(qepTestExecutionReview.tenantId, tenantId),
          eq(qepTestExecutionReview.executionId, executionId),
        ),
      );
  }

  async function loadSubmissions(tenantId: string, executionId: string) {
    return db
      .select()
      .from(qepTestExecutionExternalSubmission)
      .where(
        and(
          eq(qepTestExecutionExternalSubmission.tenantId, tenantId),
          eq(qepTestExecutionExternalSubmission.executionId, executionId),
        ),
      );
  }

  async function loadHistory(tenantId: string, executionId: string) {
    return db
      .select()
      .from(qepTestExecutionHistory)
      .where(
        and(
          eq(qepTestExecutionHistory.tenantId, tenantId),
          eq(qepTestExecutionHistory.executionId, executionId),
        ),
      );
  }

  async function syncManifest(
    tenantId: string,
    execution: TestExecution,
  ): Promise<void> {
    if (!execution.manifest) return;
    const existing = await loadManifest(tenantId, execution.id);
    if (existing) return;
    await db.insert(qepTestExecutionManifest).values({
      id: randomUUID(),
      tenantId,
      executionId: execution.id,
      contentHash: execution.manifest.contentHash,
      sealedAt: new Date(execution.manifest.sealedAt),
      sealedBy: execution.manifest.sealedBy,
      preconditionsJson: [...execution.manifest.preconditions],
      stepsJson: execution.manifest.steps.map((step) => ({
        order: step.order,
        instruction: step.instruction,
        expectedResult: step.expectedResult,
        preconditions: [...step.preconditions],
        requireActualResult: step.requireActualResult,
        allowUnordered: step.allowUnordered,
      })),
    });
  }

  async function syncSteps(tenantId: string, execution: TestExecution): Promise<void> {
    await db
      .delete(qepTestExecutionStep)
      .where(
        and(
          eq(qepTestExecutionStep.tenantId, tenantId),
          eq(qepTestExecutionStep.executionId, execution.id),
        ),
      );
    if (execution.steps.length === 0) return;
    await db.insert(qepTestExecutionStep).values(
      execution.steps.map((step) => ({
        id: randomUUID(),
        tenantId,
        executionId: execution.id,
        order: step.order,
        instruction: step.instruction,
        expectedResult: step.expectedResult,
        preconditionsJson: [...step.preconditions],
        requireActualResult: step.requireActualResult,
        allowUnordered: step.allowUnordered,
        actualResult: step.actualResult ?? null,
        outcome: step.outcome ?? null,
        evidenceIdsJson: [...step.evidenceIds],
        skipReason: step.skipReason ?? null,
        blockReason: step.blockReason ?? null,
        notApplicableReason: step.notApplicableReason ?? null,
        comment: step.comment ?? null,
        attemptCount: step.attemptCount,
        startedAt: step.startedAt ? new Date(step.startedAt) : null,
        completedAt: step.completedAt ? new Date(step.completedAt) : null,
      })),
    );
  }

  async function syncObservations(
    tenantId: string,
    execution: TestExecution,
  ): Promise<void> {
    if (execution.observations.length === 0) return;
    const existing = await db
      .select({ id: qepTestExecutionObservation.id })
      .from(qepTestExecutionObservation)
      .where(
        and(
          eq(qepTestExecutionObservation.tenantId, tenantId),
          eq(qepTestExecutionObservation.executionId, execution.id),
        ),
      );
    const existingIds = new Set(existing.map((row) => row.id));
    const missing = execution.observations.filter(
      (observation) => !existingIds.has(observation.id),
    );
    if (missing.length === 0) return;
    await db.insert(qepTestExecutionObservation).values(
      missing.map((observation) => ({
        id: observation.id,
        tenantId,
        executionId: execution.id,
        body: observation.body,
        actorUserId: observation.actorId,
        recordedAt: new Date(observation.recordedAt),
        severityHint: observation.severityHint ?? null,
        structuredJson: observation.structured ? { ...observation.structured } : null,
      })),
    );
  }

  async function syncEvidence(
    tenantId: string,
    execution: TestExecution,
  ): Promise<void> {
    if (execution.evidenceReferences.length === 0) return;
    const existing = await db
      .select({ id: qepTestExecutionEvidenceReference.id })
      .from(qepTestExecutionEvidenceReference)
      .where(
        and(
          eq(qepTestExecutionEvidenceReference.tenantId, tenantId),
          eq(qepTestExecutionEvidenceReference.executionId, execution.id),
        ),
      );
    const existingIds = new Set(existing.map((row) => row.id));
    const missing = execution.evidenceReferences.filter(
      (evidence) => !existingIds.has(evidence.id),
    );
    if (missing.length === 0) return;
    await db.insert(qepTestExecutionEvidenceReference).values(
      missing.map((evidence) => ({
        id: evidence.id,
        tenantId,
        executionId: execution.id,
        uri: evidence.uri,
        integrityHash: evidence.integrityHash ?? null,
        associatedAt: new Date(evidence.associatedAt),
        associatedBy: evidence.associatedBy,
        stepOrder: evidence.stepOrder ?? null,
      })),
    );
  }

  async function syncReview(tenantId: string, execution: TestExecution): Promise<void> {
    if (!execution.review) return;
    const existing = await db
      .select({ decidedAt: qepTestExecutionReview.decidedAt })
      .from(qepTestExecutionReview)
      .where(
        and(
          eq(qepTestExecutionReview.tenantId, tenantId),
          eq(qepTestExecutionReview.executionId, execution.id),
        ),
      );
    const alreadyRecorded = existing.some(
      (row) => row.decidedAt.toISOString() === execution.review!.decidedAt,
    );
    if (alreadyRecorded) return;
    await db.insert(qepTestExecutionReview).values({
      id: randomUUID(),
      tenantId,
      executionId: execution.id,
      reviewerId: execution.review.reviewerId,
      decision: execution.review.decision,
      reason: execution.review.reason ?? null,
      decidedAt: new Date(execution.review.decidedAt),
      preReviewDerivedOutcome: execution.review.preReviewDerivedOutcome,
      outcomeOverride: execution.review.outcomeOverride ?? null,
    });
  }

  async function syncSubmissions(
    tenantId: string,
    execution: TestExecution,
  ): Promise<void> {
    if (execution.externalSubmissions.length === 0) return;
    const existing = await db
      .select({ id: qepTestExecutionExternalSubmission.id })
      .from(qepTestExecutionExternalSubmission)
      .where(
        and(
          eq(qepTestExecutionExternalSubmission.tenantId, tenantId),
          eq(qepTestExecutionExternalSubmission.executionId, execution.id),
        ),
      );
    const existingIds = new Set(existing.map((row) => row.id));
    const missing = execution.externalSubmissions.filter(
      (submission) => !existingIds.has(submission.id),
    );
    if (missing.length === 0) return;
    await db.insert(qepTestExecutionExternalSubmission).values(
      missing.map((submission) => ({
        id: submission.id,
        tenantId,
        executionId: execution.id,
        sourceSystemId: submission.sourceSystemId,
        agentIdentity: submission.agentIdentity,
        idempotencyKey: submission.idempotencyKey,
        payloadHash: submission.payloadHash,
        signatureMetadata: submission.signatureMetadata ?? null,
        isComplete: submission.isComplete,
        correlationId: submission.correlationId ?? null,
        receivedAt: new Date(submission.receivedAt),
        receivedBy: submission.receivedBy,
        quarantineReason: submission.quarantineReason ?? null,
      })),
    );
  }

  async function syncHistory(
    tenantId: string,
    execution: TestExecution,
  ): Promise<void> {
    const existing = await db
      .select({ sequence: qepTestExecutionHistory.sequence })
      .from(qepTestExecutionHistory)
      .where(
        and(
          eq(qepTestExecutionHistory.tenantId, tenantId),
          eq(qepTestExecutionHistory.executionId, execution.id),
        ),
      );
    const start = existing.length;
    if (execution.history.entries.length <= start) return;
    const inserts = execution.history.entries.slice(start).map((entry) => ({
      id: randomUUID(),
      tenantId,
      executionId: execution.id,
      sequence: entry.sequence,
      occurredAt: new Date(entry.at),
      actorUserId: entry.actorId,
      action: entry.action,
      summary: entry.summary,
      fromStatus: entry.fromStatus ?? null,
      toStatus: entry.toStatus ?? null,
      correlationId: entry.correlationId ?? null,
    }));
    await db.insert(qepTestExecutionHistory).values(inserts);
  }

  async function syncAll(tenantId: string, execution: TestExecution): Promise<void> {
    await syncManifest(tenantId, execution);
    await syncSteps(tenantId, execution);
    await syncObservations(tenantId, execution);
    await syncEvidence(tenantId, execution);
    await syncReview(tenantId, execution);
    await syncSubmissions(tenantId, execution);
    await syncHistory(tenantId, execution);
  }

  async function load(
    tenantId: string,
    id: string,
  ): Promise<StoredTestExecution | null> {
    const [row] = await db
      .select()
      .from(qepTestExecution)
      .where(and(eq(qepTestExecution.tenantId, tenantId), eq(qepTestExecution.id, id)))
      .limit(1);
    if (!row) return null;
    const [manifest, steps, observations, evidence, reviews, submissions, history] =
      await Promise.all([
        loadManifest(tenantId, id),
        loadSteps(tenantId, id),
        loadObservations(tenantId, id),
        loadEvidence(tenantId, id),
        loadReviews(tenantId, id),
        loadSubmissions(tenantId, id),
        loadHistory(tenantId, id),
      ]);
    return mapExecutionAggregate({
      row,
      manifest,
      steps,
      observations,
      evidence,
      reviews,
      submissions,
      history,
    });
  }

  return {
    portId: "TestExecutionRepository",

    async create(execution) {
      try {
        const [row] = await db
          .insert(qepTestExecution)
          .values(toExecutionRowValues(execution))
          .returning();
        if (!row) {
          throw new ExecutionConflictError("Failed to create Test Execution");
        }
        await syncAll(execution.tenantId, execution);
        return (await load(execution.tenantId, execution.id)) as StoredTestExecution;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new ExecutionConflictError(
            `Test Execution already exists: ${execution.id}`,
          );
        }
        throw error;
      }
    },

    async get(tenantId, id) {
      return load(tenantId, id);
    },

    async getByNumber(tenantId, number) {
      const [row] = await db
        .select({ id: qepTestExecution.id })
        .from(qepTestExecution)
        .where(
          and(
            eq(qepTestExecution.tenantId, tenantId),
            eq(qepTestExecution.executionNumber, number),
          ),
        )
        .limit(1);
      if (!row) return null;
      return load(tenantId, row.id);
    },

    async save(execution, expectedRevision) {
      try {
        const [row] = await db
          .update(qepTestExecution)
          .set(toExecutionRowValues(execution))
          .where(
            and(
              eq(qepTestExecution.id, execution.id),
              eq(qepTestExecution.tenantId, execution.tenantId),
              eq(qepTestExecution.revision, expectedRevision),
            ),
          )
          .returning();
        if (!row) {
          const existing = await load(execution.tenantId, execution.id);
          if (!existing) {
            throw new ExecutionNotFoundError(
              `Test Execution not found: ${execution.id}`,
            );
          }
          throw new ExecutionConcurrencyError(
            execution.id,
            expectedRevision,
            existing.revision,
          );
        }
        await syncAll(execution.tenantId, execution);
        return (await load(execution.tenantId, execution.id)) as StoredTestExecution;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new ExecutionConflictError(
            `Test Execution already exists: ${execution.id}`,
          );
        }
        throw error;
      }
    },

    async list(tenantId, query: TestExecutionListQuery = {}) {
      const conditions = [eq(qepTestExecution.tenantId, tenantId)];
      if (query.status) {
        const statuses = Array.isArray(query.status) ? query.status : [query.status];
        conditions.push(inArray(qepTestExecution.status, statuses));
      }
      if (query.assigneeId) {
        conditions.push(
          or(
            eq(qepTestExecution.executorId, query.assigneeId),
            eq(qepTestExecution.ownerId, query.assigneeId),
          )!,
        );
      }
      if (query.reviewerId) {
        conditions.push(eq(qepTestExecution.reviewerId, query.reviewerId));
      }
      if (query.ownerId) {
        conditions.push(eq(qepTestExecution.ownerId, query.ownerId));
      }
      if (query.planId) {
        conditions.push(eq(qepTestExecution.planRefId, query.planId));
      }
      if (query.specId) {
        conditions.push(eq(qepTestExecution.specRefId, query.specId));
      }
      if (query.projectId) {
        conditions.push(eq(qepTestExecution.projectId, query.projectId));
      }
      if (query.workspaceId) {
        conditions.push(eq(qepTestExecution.workspaceId, query.workspaceId));
      }
      if (query.reviewQueue) {
        conditions.push(eq(qepTestExecution.status, "submitted_for_review"));
      }

      const offset = query.offset ?? 0;
      const limitClause = db
        .select()
        .from(qepTestExecution)
        .where(and(...conditions))
        .orderBy(desc(qepTestExecution.updatedAt))
        .offset(offset);
      const rows = query.limit
        ? await limitClause.limit(query.limit)
        : await limitClause;

      const results: StoredTestExecution[] = [];
      for (const row of rows) {
        const [manifest, steps, observations, evidence, reviews, submissions, history] =
          await Promise.all([
            loadManifest(tenantId, row.id),
            loadSteps(tenantId, row.id),
            loadObservations(tenantId, row.id),
            loadEvidence(tenantId, row.id),
            loadReviews(tenantId, row.id),
            loadSubmissions(tenantId, row.id),
            loadHistory(tenantId, row.id),
          ]);
        results.push(
          mapExecutionAggregate({
            row,
            manifest,
            steps,
            observations,
            evidence,
            reviews,
            submissions,
            history,
          }),
        );
      }
      return results;
    },

    async findByIngestionKey(tenantId, sourceSystemId, idempotencyKey) {
      const [row] = await db
        .select({ executionId: qepTestExecutionExternalSubmission.executionId })
        .from(qepTestExecutionExternalSubmission)
        .where(
          and(
            eq(qepTestExecutionExternalSubmission.tenantId, tenantId),
            eq(qepTestExecutionExternalSubmission.sourceSystemId, sourceSystemId),
            eq(qepTestExecutionExternalSubmission.idempotencyKey, idempotencyKey),
          ),
        )
        .limit(1);
      if (!row) return null;
      return load(tenantId, row.executionId);
    },
  };
}
