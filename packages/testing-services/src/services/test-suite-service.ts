import type { TestSuite, TestSuiteService } from "@apzhub/testing-contracts";
import {
  asTestCaseId,
  asTestPlanId,
  asTestSuiteId,
  type TestCaseId,
  type TestPlanId,
  type TestStatus,
} from "@apzhub/testing-contracts";
import type { TestSuiteRecord } from "@apzhub/testing-persistence";

import {
  DomainRuleError,
  assertTestStatusTransition,
} from "../lifecycle/state-machines";
import { toRepositoryContext } from "../mapping/context";
import { assertNonEmpty, assertValidTestStatus } from "../validation/domain-validation";
import { requireFound } from "./errors";
import type { ServiceRuntime } from "./types";

function toDomain(row: TestSuiteRecord): TestSuite {
  return {
    id: asTestSuiteId(row.id),
    tenantId: row.tenantId,
    key: row.key,
    name: row.name,
    description: row.description,
    status: row.status,
    planIds: row.planIds.map((id) => asTestPlanId(id)),
    caseIds: row.caseIds.map((id) => asTestCaseId(id)),
    isRegression: row.isRegression,
    ownerId: row.ownerId,
    parentSuiteId: row.parentSuiteId ? asTestSuiteId(row.parentSuiteId) : undefined,
    sortOrder: row.sortOrder ?? 0,
    versionNumber: row.versionNumber ?? 1,
    groupKey: row.groupKey,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createTestSuiteService(rt: ServiceRuntime): TestSuiteService {
  return {
    async list(ctx) {
      const page = await rt.persistence.testSuites.list(toRepositoryContext(ctx));
      return page.items.map(toDomain);
    },
    async get(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.testSuites.get(toRepositoryContext(ctx), id),
          "test_suite",
          id,
        ),
      );
    },
    async create(ctx, input) {
      assertNonEmpty(input.key, "key");
      assertNonEmpty(input.name, "name");
      assertValidTestStatus(input.status);
      const row = await rt.persistence.testSuites.create(toRepositoryContext(ctx), {
        key: input.key,
        name: input.name,
        description: input.description,
        status: input.status,
        isRegression: input.isRegression ?? false,
        planIds: (input.planIds as readonly string[]) ?? [],
        caseIds: (input.caseIds as readonly string[]) ?? [],
        ownerId: input.ownerId,
        parentSuiteId: input.parentSuiteId,
        sortOrder: input.sortOrder ?? 0,
        versionNumber: input.versionNumber ?? 1,
        groupKey: input.groupKey,
        organisationId: ctx.organisationId,
      });
      rt.events.record({
        eventType: "test_suite.created",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { suiteId: row.id, key: row.key },
      });
      return toDomain(row);
    },
    async update(ctx, id, input) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testSuites.get(rctx, id),
        "test_suite",
        id,
      );
      if (input.status !== undefined) {
        assertValidTestStatus(input.status);
        assertTestStatusTransition(existing.status, input.status);
      }
      if (input.parentSuiteId === id) {
        throw new DomainRuleError(
          "invalid_relationship",
          "Suite cannot be its own parent",
        );
      }
      const row = await rt.persistence.testSuites.update(rctx, id, existing.revision, {
        name: input.name,
        description: input.description,
        status: input.status,
        isRegression: input.isRegression,
        planIds: input.planIds as readonly string[] | undefined,
        caseIds: input.caseIds as readonly string[] | undefined,
        ownerId: input.ownerId,
        parentSuiteId: input.parentSuiteId === null ? undefined : input.parentSuiteId,
        sortOrder: input.sortOrder,
        versionNumber: input.versionNumber,
        groupKey: input.groupKey === null ? undefined : input.groupKey,
      });
      rt.events.record({
        eventType: "test_suite.updated",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { suiteId: row.id },
      });
      return toDomain(row);
    },
    async archive(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testSuites.get(rctx, id),
        "test_suite",
        id,
      );
      return toDomain(
        await rt.persistence.testSuites.archive(rctx, id, existing.revision),
      );
    },
    async clone(ctx, id, options) {
      const rctx = toRepositoryContext(ctx);
      const source = requireFound(
        await rt.persistence.testSuites.get(rctx, id),
        "test_suite",
        id,
      );
      const row = await rt.persistence.testSuites.create(rctx, {
        key: options?.key ?? `${source.key}-clone-${rt.id().slice(0, 8)}`,
        name: options?.name ?? `${source.name} (clone)`,
        description: source.description,
        status: "draft",
        isRegression: source.isRegression,
        planIds: [...source.planIds],
        caseIds: [...source.caseIds],
        ownerId: ctx.userId,
        parentSuiteId: source.parentSuiteId,
        sortOrder: source.sortOrder,
        versionNumber: 1,
        groupKey: source.groupKey,
        organisationId: ctx.organisationId,
      });
      rt.events.record({
        eventType: "test_suite.cloned",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { sourceSuiteId: source.id, suiteId: row.id },
      });
      return toDomain(row);
    },
    async version(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testSuites.get(rctx, id),
        "test_suite",
        id,
      );
      const next = (existing.versionNumber ?? 1) + 1;
      const row = await rt.persistence.testSuites.update(rctx, id, existing.revision, {
        versionNumber: next,
      });
      rt.events.record({
        eventType: "test_suite.versioned",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { suiteId: row.id, versionNumber: next },
      });
      return toDomain(row);
    },
    async setParent(ctx, id, parentSuiteId) {
      return this.update(ctx, id, {
        parentSuiteId: parentSuiteId ?? undefined,
      } as never);
    },
    async reorder(ctx, id, sortOrder: number) {
      return this.update(ctx, id, { sortOrder });
    },
    async setGroup(ctx, id, groupKey) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testSuites.get(rctx, id),
        "test_suite",
        id,
      );
      return toDomain(
        await rt.persistence.testSuites.update(rctx, id, existing.revision, {
          groupKey: groupKey ?? undefined,
        }),
      );
    },
    async assignOwner(ctx, id, ownerId: string) {
      assertNonEmpty(ownerId, "ownerId");
      return this.update(ctx, id, { ownerId });
    },
    async linkCase(ctx, id, caseId: TestCaseId) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testSuites.get(rctx, id),
        "test_suite",
        id,
      );
      if (existing.caseIds.includes(caseId)) return toDomain(existing);
      return toDomain(
        await rt.persistence.testSuites.update(rctx, id, existing.revision, {
          caseIds: [...existing.caseIds, caseId],
        }),
      );
    },
    async unlinkCase(ctx, id, caseId: TestCaseId) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testSuites.get(rctx, id),
        "test_suite",
        id,
      );
      return toDomain(
        await rt.persistence.testSuites.update(rctx, id, existing.revision, {
          caseIds: existing.caseIds.filter((c) => c !== caseId),
        }),
      );
    },
    async linkPlan(ctx, id, planId: TestPlanId) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.testSuites.get(rctx, id),
        "test_suite",
        id,
      );
      if (existing.planIds.includes(planId)) return toDomain(existing);
      return toDomain(
        await rt.persistence.testSuites.update(rctx, id, existing.revision, {
          planIds: [...existing.planIds, planId],
        }),
      );
    },
    async setStatus(ctx, id, status: TestStatus) {
      return this.update(ctx, id, { status });
    },
  };
}
