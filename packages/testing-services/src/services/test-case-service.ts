import type {
  TestCase,
  TestCaseParameter,
  TestCaseService,
  TestCaseVersion,
  TestStep,
} from "@apzhub/testing-contracts";
import {
  asRequirementId,
  asTestCaseId,
  asTestCaseVersionId,
  asTestStepId,
  asTestSuiteId,
  type CaseVersionReason,
  type Priority,
  type Severity,
  type TestCaseVersionId,
  type TestStatus,
  type TestSuiteId,
} from "@apzhub/testing-contracts";
import type { TestCaseRecord, TestStepRecord } from "@apzhub/testing-persistence";

import { assertTestStatusTransition } from "../lifecycle/state-machines";
import { toRepositoryContext } from "../mapping/context";
import {
  assertNonEmpty,
  assertValidPriority,
  assertValidTestStatus,
} from "../validation/domain-validation";
import { requireFound } from "./errors";
import type { ServiceRuntime } from "./types";

async function loadSteps(
  rt: ServiceRuntime,
  ctx: Parameters<TestCaseService["get"]>[0],
  caseId: string,
  stepIds: readonly string[],
): Promise<TestStep[]> {
  const rctx = toRepositoryContext(ctx);
  const steps: TestStep[] = [];
  for (const stepId of stepIds) {
    const row = await rt.persistence.testSteps.get(rctx, stepId);
    if (row) {
      steps.push({
        id: asTestStepId(row.id),
        caseId: asTestCaseId(row.caseId),
        ordinal: row.ordinal,
        action: row.action,
        expectedResult: row.expectedResult,
        dataHint: row.dataHint,
      });
    }
  }
  return steps.sort((a, b) => a.ordinal - b.ordinal);
}

function toDomain(row: TestCaseRecord, steps: readonly TestStep[]): TestCase {
  return {
    id: asTestCaseId(row.id),
    tenantId: row.tenantId,
    key: row.key,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    suiteIds: row.suiteIds.map((id) => asTestSuiteId(id)),
    requirementIds: row.requirementIds.map((id) => asRequirementId(id)),
    steps,
    tags: row.tags,
    estimatedMinutes: row.estimatedMinutes,
    preconditions: row.preconditions,
    postconditions: row.postconditions,
    expectedResultsSummary: row.expectedResultsSummary,
    templateKey: row.templateKey,
    parameters: row.parameters,
    components: row.components,
    ownerId: row.ownerId,
    reviewerId: row.reviewerId,
    versionNumber: row.versionNumber ?? 1,
    parentCaseId: row.parentCaseId ? asTestCaseId(row.parentCaseId) : undefined,
    riskLevel: row.riskLevel,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

function versionToDomain(
  row: Awaited<ReturnType<ServiceRuntime["persistence"]["testCaseVersions"]["create"]>>,
): TestCaseVersion {
  const snapshot = row.snapshot as TestCaseVersion["snapshot"];
  return {
    id: asTestCaseVersionId(row.id),
    tenantId: row.tenantId,
    caseId: asTestCaseId(row.caseId),
    versionNumber: row.versionNumber,
    reason: row.reason,
    snapshot,
    changedByUserId: row.changedByUserId,
    changeSummary: row.changeSummary,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

async function snapshotCase(
  rt: ServiceRuntime,
  ctx: Parameters<TestCaseService["get"]>[0],
  row: TestCaseRecord,
  reason: CaseVersionReason,
  summary?: string,
): Promise<TestCaseVersion> {
  const steps = await loadSteps(rt, ctx, row.id, row.stepIds);
  const domain = toDomain(row, steps);
  const created = await rt.persistence.testCaseVersions.create(
    toRepositoryContext(ctx),
    {
      caseId: row.id,
      versionNumber: row.versionNumber ?? 1,
      reason,
      snapshot: {
        ...domain,
        steps: steps.map(({ ordinal, action, expectedResult, dataHint }) => ({
          ordinal,
          action,
          expectedResult,
          dataHint,
        })),
      },
      changedByUserId: ctx.userId,
      changeSummary: summary,
      organisationId: ctx.organisationId,
    },
  );
  return versionToDomain(created);
}

export function createTestCaseService(rt: ServiceRuntime): TestCaseService {
  return {
    async list(ctx) {
      const page = await rt.persistence.testCases.list(toRepositoryContext(ctx));
      const out: TestCase[] = [];
      for (const row of page.items) {
        out.push(toDomain(row, await loadSteps(rt, ctx, row.id, row.stepIds)));
      }
      return out;
    },
    async get(ctx, id) {
      const row = requireFound(
        await rt.persistence.testCases.get(toRepositoryContext(ctx), id),
        "test_case",
        id,
      );
      return toDomain(row, await loadSteps(rt, ctx, row.id, row.stepIds));
    },
    async create(ctx, input) {
      assertNonEmpty(input.key, "key");
      assertNonEmpty(input.title, "title");
      assertValidTestStatus(input.status);
      assertValidPriority(input.priority);
      const rctx = toRepositoryContext(ctx);
      const row = await rt.persistence.testCases.create(rctx, {
        key: input.key,
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        tags: input.tags ?? [],
        estimatedMinutes: input.estimatedMinutes,
        suiteIds: (input.suiteIds as readonly string[]) ?? [],
        requirementIds: (input.requirementIds as readonly string[]) ?? [],
        stepIds: [],
        preconditions: input.preconditions,
        postconditions: input.postconditions,
        expectedResultsSummary: input.expectedResultsSummary,
        templateKey: input.templateKey,
        parameters: input.parameters ?? [],
        components: input.components ?? [],
        ownerId: input.ownerId,
        reviewerId: input.reviewerId,
        versionNumber: input.versionNumber ?? 1,
        parentCaseId: input.parentCaseId,
        riskLevel: input.riskLevel,
        organisationId: ctx.organisationId,
      });
      const stepIds: string[] = [];
      for (const step of input.steps ?? []) {
        const created: TestStepRecord = await rt.persistence.testSteps.create(rctx, {
          caseId: row.id,
          ordinal: step.ordinal,
          action: step.action,
          expectedResult: step.expectedResult,
          dataHint: step.dataHint,
          organisationId: ctx.organisationId,
        });
        stepIds.push(created.id);
      }
      const withSteps =
        stepIds.length > 0
          ? await rt.persistence.testCases.update(rctx, row.id, row.revision, {
              stepIds,
            })
          : row;
      await snapshotCase(rt, ctx, withSteps, "created", "Initial version");
      rt.events.record({
        eventType: "test_case.created",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          testCaseId: withSteps.id,
          key: withSteps.key,
          title: withSteps.title,
        },
      });
      return toDomain(
        withSteps,
        await loadSteps(rt, ctx, withSteps.id, withSteps.stepIds),
      );
    },
    async update(ctx, id, input) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testCases.get(rctx, id),
        "test_case",
        id,
      );
      if (input.status !== undefined) {
        assertValidTestStatus(input.status);
        assertTestStatusTransition(existing.status, input.status);
      }
      if (input.priority !== undefined) assertValidPriority(input.priority);
      const row = await rt.persistence.testCases.update(rctx, id, existing.revision, {
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        tags: input.tags,
        estimatedMinutes: input.estimatedMinutes,
        suiteIds: input.suiteIds as readonly string[] | undefined,
        requirementIds: input.requirementIds as readonly string[] | undefined,
        preconditions: input.preconditions,
        postconditions: input.postconditions,
        expectedResultsSummary: input.expectedResultsSummary,
        templateKey: input.templateKey,
        parameters: input.parameters,
        components: input.components,
        ownerId: input.ownerId,
        reviewerId: input.reviewerId,
        versionNumber: input.versionNumber,
        parentCaseId: input.parentCaseId,
        riskLevel: input.riskLevel,
      });
      rt.events.record({
        eventType: "test_case.updated",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { testCaseId: row.id },
      });
      return toDomain(row, await loadSteps(rt, ctx, row.id, row.stepIds));
    },
    async archive(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testCases.get(rctx, id),
        "test_case",
        id,
      );
      assertTestStatusTransition(existing.status, "archived");
      const row = await rt.persistence.testCases.update(rctx, id, existing.revision, {
        status: "archived",
      });
      return toDomain(row, await loadSteps(rt, ctx, row.id, row.stepIds));
    },
    async transitionStatus(ctx, id, status: TestStatus) {
      return this.update(ctx, id, { status });
    },
    async clone(ctx, id, options) {
      const source = await this.get(ctx, id);
      const cloned = await this.create(ctx, {
        ...source,
        key: options?.key ?? `${source.key}-clone-${rt.id().slice(0, 8)}`,
        title: options?.title ?? `${source.title} (clone)`,
        status: "draft",
        parentCaseId: source.id,
        versionNumber: 1,
        ownerId: ctx.userId,
      });
      rt.events.record({
        eventType: "test_case.cloned",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { sourceCaseId: source.id, testCaseId: cloned.id },
      });
      return cloned;
    },
    async createFromTemplate(ctx, templateKey, input) {
      assertNonEmpty(templateKey, "templateKey");
      return this.create(ctx, {
        key: input.key,
        title: input.title,
        tenantId: input.tenantId,
        description: input.description,
        status: input.status ?? "draft",
        priority: input.priority ?? "medium",
        suiteIds: input.suiteIds ?? [],
        requirementIds: input.requirementIds ?? [],
        steps: input.steps ?? [],
        tags: input.tags,
        estimatedMinutes: input.estimatedMinutes,
        preconditions: input.preconditions,
        postconditions: input.postconditions,
        expectedResultsSummary: input.expectedResultsSummary,
        templateKey,
        parameters: input.parameters ?? [],
        components: input.components ?? [],
        ownerId: input.ownerId ?? ctx.userId,
        reviewerId: input.reviewerId,
        versionNumber: 1,
        riskLevel: input.riskLevel,
      });
    },
    async version(ctx, id, reason, summary) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testCases.get(rctx, id),
        "test_case",
        id,
      );
      const next = (existing.versionNumber ?? 1) + 1;
      const updated = await rt.persistence.testCases.update(
        rctx,
        id,
        existing.revision,
        { versionNumber: next },
      );
      const snap = await snapshotCase(
        rt,
        ctx,
        updated,
        (reason as CaseVersionReason) || "manual_version",
        summary,
      );
      rt.events.record({
        eventType: "test_case.versioned",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { testCaseId: updated.id, versionNumber: next },
      });
      return snap;
    },
    async listVersions(ctx, id) {
      const page = await rt.persistence.testCaseVersions.listByCase(
        toRepositoryContext(ctx),
        id,
      );
      return page.items.map(versionToDomain);
    },
    async getVersion(ctx, versionId: TestCaseVersionId) {
      return versionToDomain(
        requireFound(
          await rt.persistence.testCaseVersions.get(
            toRepositoryContext(ctx),
            versionId,
          ),
          "test_case_version",
          versionId,
        ),
      );
    },
    async replaceSteps(ctx, id, steps: readonly TestStep[]) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testCases.get(rctx, id),
        "test_case",
        id,
      );
      const stepIds: string[] = [];
      for (const step of steps) {
        const created = await rt.persistence.testSteps.create(rctx, {
          caseId: id,
          ordinal: step.ordinal,
          action: step.action,
          expectedResult: step.expectedResult,
          dataHint: step.dataHint,
          organisationId: ctx.organisationId,
        });
        stepIds.push(created.id);
      }
      const row = await rt.persistence.testCases.update(rctx, id, existing.revision, {
        stepIds,
      });
      return toDomain(row, await loadSteps(rt, ctx, row.id, row.stepIds));
    },
    async setParameters(ctx, id, parameters: readonly TestCaseParameter[]) {
      return this.update(ctx, id, { parameters });
    },
    async setPreconditions(ctx, id, preconditions) {
      return this.update(ctx, id, { preconditions });
    },
    async setPostconditions(ctx, id, postconditions) {
      return this.update(ctx, id, { postconditions });
    },
    async setPriority(ctx, id, priority: Priority) {
      return this.update(ctx, id, { priority });
    },
    async setRisk(ctx, id, riskLevel: Severity | undefined) {
      return this.update(ctx, id, { riskLevel });
    },
    async setTags(ctx, id, tags: readonly string[]) {
      return this.update(ctx, id, { tags });
    },
    async setComponents(ctx, id, components: readonly string[]) {
      return this.update(ctx, id, { components });
    },
    async assignOwner(ctx, id, ownerId: string) {
      assertNonEmpty(ownerId, "ownerId");
      return this.update(ctx, id, { ownerId });
    },
    async assignReviewer(ctx, id, reviewerId: string) {
      assertNonEmpty(reviewerId, "reviewerId");
      return this.update(ctx, id, { reviewerId });
    },
    async linkSuite(ctx, id, suiteId: TestSuiteId) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testCases.get(rctx, id),
        "test_case",
        id,
      );
      if (existing.suiteIds.includes(suiteId)) {
        return toDomain(
          existing,
          await loadSteps(rt, ctx, existing.id, existing.stepIds),
        );
      }
      const row = await rt.persistence.testCases.update(rctx, id, existing.revision, {
        suiteIds: [...existing.suiteIds, suiteId],
      });
      return toDomain(row, await loadSteps(rt, ctx, row.id, row.stepIds));
    },
  };
}
