import type { TestPlan, TestPlanService } from "@apzhub/testing-contracts";
import {
  asRequirementId,
  asRiskId,
  asTestPlanId,
  asTestSuiteId,
  type RequirementId,
  type RiskId,
  type TestStatus,
  type TestSuiteId,
} from "@apzhub/testing-contracts";
import type { TestPlanRecord } from "@apzhub/testing-persistence";

import { assertTestStatusTransition } from "../lifecycle/state-machines";
import { toRepositoryContext } from "../mapping/context";
import { assertNonEmpty, assertValidTestStatus } from "../validation/domain-validation";
import { requireFound } from "./errors";
import type { ServiceRuntime } from "./types";

function toDomain(row: TestPlanRecord): TestPlan {
  return {
    id: asTestPlanId(row.id),
    tenantId: row.tenantId,
    key: row.key,
    name: row.name,
    description: row.description,
    status: row.status,
    suiteIds: row.suiteIds.map((id) => asTestSuiteId(id)),
    requirementIds: row.requirementIds.map((id) => asRequirementId(id)),
    riskIds: row.riskIds.map((id) => asRiskId(id)),
    releaseLabel: row.releaseLabel,
    milestoneLabel: row.milestoneLabel,
    ownerId: row.ownerId,
    assigneeId: row.assigneeId,
    versionNumber: row.versionNumber ?? 1,
    parentPlanId: row.parentPlanId ? asTestPlanId(row.parentPlanId) : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createTestPlanService(rt: ServiceRuntime): TestPlanService {
  return {
    async list(ctx) {
      const page = await rt.persistence.testPlans.list(toRepositoryContext(ctx));
      return page.items.map(toDomain);
    },
    async get(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.testPlans.get(toRepositoryContext(ctx), id),
          "test_plan",
          id,
        ),
      );
    },
    async create(ctx, input) {
      assertNonEmpty(input.key, "key");
      assertNonEmpty(input.name, "name");
      assertValidTestStatus(input.status);
      const row = await rt.persistence.testPlans.create(toRepositoryContext(ctx), {
        key: input.key,
        name: input.name,
        description: input.description,
        status: input.status,
        releaseLabel: input.releaseLabel,
        milestoneLabel: input.milestoneLabel,
        suiteIds: (input.suiteIds as readonly string[]) ?? [],
        requirementIds: (input.requirementIds as readonly string[]) ?? [],
        riskIds: (input.riskIds as readonly string[]) ?? [],
        ownerId: input.ownerId,
        assigneeId: input.assigneeId,
        versionNumber: input.versionNumber ?? 1,
        parentPlanId: input.parentPlanId,
        organisationId: ctx.organisationId,
      });
      rt.events.record({
        eventType: "test_plan.created",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { planId: row.id, key: row.key },
      });
      return toDomain(row);
    },
    async update(ctx, id, input) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testPlans.get(rctx, id),
        "test_plan",
        id,
      );
      if (input.status !== undefined) {
        assertValidTestStatus(input.status);
        assertTestStatusTransition(existing.status, input.status);
      }
      const row = await rt.persistence.testPlans.update(rctx, id, existing.revision, {
        name: input.name,
        description: input.description,
        status: input.status,
        releaseLabel: input.releaseLabel,
        milestoneLabel: input.milestoneLabel,
        suiteIds: input.suiteIds as readonly string[] | undefined,
        requirementIds: input.requirementIds as readonly string[] | undefined,
        riskIds: input.riskIds as readonly string[] | undefined,
        ownerId: input.ownerId,
        assigneeId: input.assigneeId,
        versionNumber: input.versionNumber,
        parentPlanId: input.parentPlanId,
      });
      rt.events.record({
        eventType: "test_plan.updated",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { planId: row.id },
      });
      return toDomain(row);
    },
    async archive(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testPlans.get(rctx, id),
        "test_plan",
        id,
      );
      const row = await rt.persistence.testPlans.archive(rctx, id, existing.revision);
      rt.events.record({
        eventType: "test_plan.archived",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { planId: row.id },
      });
      return toDomain(row);
    },
    async clone(ctx, id, options) {
      const rctx = toRepositoryContext(ctx);
      const source = requireFound(
        await rt.persistence.testPlans.get(rctx, id),
        "test_plan",
        id,
      );
      const row = await rt.persistence.testPlans.create(rctx, {
        key: options?.key ?? `${source.key}-clone-${rt.id().slice(0, 8)}`,
        name: options?.name ?? `${source.name} (clone)`,
        description: source.description,
        status: "draft",
        releaseLabel: source.releaseLabel,
        milestoneLabel: source.milestoneLabel,
        suiteIds: [...source.suiteIds],
        requirementIds: [...source.requirementIds],
        riskIds: [...source.riskIds],
        ownerId: ctx.userId,
        assigneeId: source.assigneeId,
        versionNumber: 1,
        parentPlanId: source.id,
        organisationId: ctx.organisationId,
      });
      rt.events.record({
        eventType: "test_plan.cloned",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { sourcePlanId: source.id, planId: row.id },
      });
      return toDomain(row);
    },
    async version(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testPlans.get(rctx, id),
        "test_plan",
        id,
      );
      const next = (existing.versionNumber ?? 1) + 1;
      const row = await rt.persistence.testPlans.update(rctx, id, existing.revision, {
        versionNumber: next,
      });
      rt.events.record({
        eventType: "test_plan.versioned",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { planId: row.id, versionNumber: next },
      });
      return toDomain(row);
    },
    async setStatus(ctx, id, status: TestStatus) {
      return this.update(ctx, id, { status });
    },
    async assignOwner(ctx, id, ownerId: string) {
      assertNonEmpty(ownerId, "ownerId");
      return this.update(ctx, id, { ownerId });
    },
    async assignAssignee(ctx, id, assigneeId: string) {
      assertNonEmpty(assigneeId, "assigneeId");
      return this.update(ctx, id, { assigneeId });
    },
    async linkSuite(ctx, id, suiteId: TestSuiteId) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testPlans.get(rctx, id),
        "test_plan",
        id,
      );
      if (existing.suiteIds.includes(suiteId)) return toDomain(existing);
      return toDomain(
        await rt.persistence.testPlans.update(rctx, id, existing.revision, {
          suiteIds: [...existing.suiteIds, suiteId],
        }),
      );
    },
    async unlinkSuite(ctx, id, suiteId: TestSuiteId) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testPlans.get(rctx, id),
        "test_plan",
        id,
      );
      return toDomain(
        await rt.persistence.testPlans.update(rctx, id, existing.revision, {
          suiteIds: existing.suiteIds.filter((s) => s !== suiteId),
        }),
      );
    },
    async linkRequirement(ctx, id, requirementId: RequirementId) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testPlans.get(rctx, id),
        "test_plan",
        id,
      );
      if (existing.requirementIds.includes(requirementId)) return toDomain(existing);
      return toDomain(
        await rt.persistence.testPlans.update(rctx, id, existing.revision, {
          requirementIds: [...existing.requirementIds, requirementId],
        }),
      );
    },
    async linkRisk(ctx, id, riskId: RiskId) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testPlans.get(rctx, id),
        "test_plan",
        id,
      );
      if (existing.riskIds.includes(riskId)) return toDomain(existing);
      return toDomain(
        await rt.persistence.testPlans.update(rctx, id, existing.revision, {
          riskIds: [...existing.riskIds, riskId],
        }),
      );
    },
  };
}
