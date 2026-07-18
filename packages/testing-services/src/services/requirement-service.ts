import type {
  Requirement,
  RequirementService,
  WorkItemRef,
} from "@apzhub/testing-contracts";
import { asRequirementId, asRiskId } from "@apzhub/testing-contracts";
import type { RequirementRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { assertNonEmpty } from "../validation/domain-validation";
import { requireFound } from "./errors";
import type { ServiceRuntime } from "./types";

function toDomain(row: RequirementRecord): Requirement {
  return {
    id: asRequirementId(row.id),
    tenantId: row.tenantId,
    key: row.key,
    title: row.title,
    description: row.description,
    priority: row.priority,
    workItemRefs: row.workItemRefs,
    riskIds: row.riskIds.map((id) => asRiskId(id)),
    tags: row.tags,
    ownerId: row.ownerId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createRequirementService(rt: ServiceRuntime): RequirementService {
  return {
    async list(ctx) {
      const page = await rt.persistence.requirements.list(toRepositoryContext(ctx));
      return page.items.map(toDomain);
    },
    async get(ctx, id) {
      const row = requireFound(
        await rt.persistence.requirements.get(toRepositoryContext(ctx), id),
        "requirement",
        id,
      );
      return toDomain(row);
    },
    async create(ctx, input) {
      assertNonEmpty(input.key, "key");
      assertNonEmpty(input.title, "title");
      const row = await rt.persistence.requirements.create(toRepositoryContext(ctx), {
        key: input.key,
        title: input.title,
        description: input.description,
        priority: input.priority,
        tags: input.tags ?? [],
        workItemRefs: input.workItemRefs ?? [],
        riskIds: (input.riskIds as readonly string[]) ?? [],
        ownerId: input.ownerId,
        organisationId: ctx.organisationId,
      });
      rt.events.record({
        eventType: "requirement.created",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { requirementId: row.id, key: row.key },
      });
      return toDomain(row);
    },
    async update(ctx, id, input) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.requirements.get(rctx, id),
        "requirement",
        id,
      );
      const row = await rt.persistence.requirements.update(
        rctx,
        id,
        existing.revision,
        {
          title: input.title,
          description: input.description,
          priority: input.priority,
          tags: input.tags,
          workItemRefs: input.workItemRefs,
          riskIds: input.riskIds as readonly string[] | undefined,
          ownerId: input.ownerId,
        },
      );
      rt.events.record({
        eventType: "requirement.updated",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { requirementId: row.id },
      });
      return toDomain(row);
    },
    async archive(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.requirements.get(rctx, id),
        "requirement",
        id,
      );
      return toDomain(
        await rt.persistence.requirements.archive(rctx, id, existing.revision),
      );
    },
    async linkWorkItem(ctx, id, workItemRef: WorkItemRef) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.requirements.get(rctx, id),
        "requirement",
        id,
      );
      const refs = [...existing.workItemRefs, workItemRef];
      return toDomain(
        await rt.persistence.requirements.update(rctx, id, existing.revision, {
          workItemRefs: refs,
        }),
      );
    },
    async unlinkWorkItem(ctx, id, workItemId: string) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.requirements.get(rctx, id),
        "requirement",
        id,
      );
      const refs = existing.workItemRefs.filter((r) => r.workItemId !== workItemId);
      return toDomain(
        await rt.persistence.requirements.update(rctx, id, existing.revision, {
          workItemRefs: refs,
        }),
      );
    },
  };
}
