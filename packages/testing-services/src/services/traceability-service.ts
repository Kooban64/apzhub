import type {
  TraceabilityLink,
  TraceabilityMatrixRow,
  TraceabilityService,
} from "@apzhub/testing-contracts";
import {
  asRequirementId,
  asTestCaseId,
  asTraceabilityLinkId,
  type RequirementId,
  type TraceabilityLinkId,
} from "@apzhub/testing-contracts";
import type { TraceabilityLinkRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { assertNoSelfLink, assertNonEmpty } from "../validation/domain-validation";
import { requireFound } from "./errors";
import type { ServiceRuntime } from "./types";

function toDomain(row: TraceabilityLinkRecord): TraceabilityLink {
  return {
    id: asTraceabilityLinkId(row.id),
    tenantId: row.tenantId,
    type: row.type,
    sourceKind: row.sourceKind,
    sourceId: row.sourceId,
    targetKind: row.targetKind,
    targetId: row.targetId,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createTraceabilityService(rt: ServiceRuntime): TraceabilityService {
  return {
    async listLinks(ctx) {
      const page = await rt.persistence.traceabilityLinks.list(
        toRepositoryContext(ctx),
      );
      return page.items.map(toDomain);
    },
    async getLink(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.traceabilityLinks.get(toRepositoryContext(ctx), id),
          "traceability_link",
          id,
        ),
      );
    },
    async createLink(ctx, input) {
      assertNonEmpty(input.sourceKind, "sourceKind");
      assertNonEmpty(input.sourceId, "sourceId");
      assertNonEmpty(input.targetKind, "targetKind");
      assertNonEmpty(input.targetId, "targetId");
      assertNoSelfLink(
        input.sourceKind,
        input.sourceId,
        input.targetKind,
        input.targetId,
      );
      const row = await rt.persistence.traceabilityLinks.create(
        toRepositoryContext(ctx),
        {
          type: input.type,
          sourceKind: input.sourceKind,
          sourceId: input.sourceId,
          targetKind: input.targetKind,
          targetId: input.targetId,
          notes: input.notes,
          organisationId: ctx.organisationId,
        },
      );
      rt.events.record({
        eventType: "traceability.link_created",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { linkId: row.id },
      });
      return toDomain(row);
    },
    async removeLink(ctx, id: TraceabilityLinkId) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.traceabilityLinks.get(rctx, id),
        "traceability_link",
        id,
      );
      await rt.persistence.traceabilityLinks.archive(rctx, id, existing.revision);
      rt.events.record({
        eventType: "traceability.link_removed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { linkId: id },
      });
    },
    async listOutgoing(ctx, kind, id) {
      const links = await this.listLinks(ctx);
      return links.filter((l) => l.sourceKind === kind && l.sourceId === id);
    },
    async listIncoming(ctx, kind, id) {
      const links = await this.listLinks(ctx);
      return links.filter((l) => l.targetKind === kind && l.targetId === id);
    },
    async getBidirectional(ctx, kind, id) {
      return {
        outgoing: await this.listOutgoing(ctx, kind, id),
        incoming: await this.listIncoming(ctx, kind, id),
      };
    },
    async linkEntities(ctx, input) {
      return this.createLink(ctx, {
        type: input.type,
        sourceKind: input.sourceKind,
        sourceId: input.sourceId,
        targetKind: input.targetKind,
        targetId: input.targetId,
        notes: input.notes,
        tenantId: input.tenantId,
      });
    },
    async getMatrixForRequirement(ctx, requirementId: RequirementId) {
      const rctx = toRepositoryContext(ctx);
      const req = requireFound(
        await rt.persistence.requirements.get(rctx, requirementId),
        "requirement",
        requirementId,
      );
      const links = await this.listLinks(ctx);
      const caseIds = links
        .filter(
          (l) =>
            (l.sourceKind === "requirement" &&
              l.sourceId === requirementId &&
              l.targetKind === "test_case") ||
            (l.targetKind === "requirement" &&
              l.targetId === requirementId &&
              l.sourceKind === "test_case"),
        )
        .map((l) =>
          asTestCaseId(l.sourceKind === "test_case" ? l.sourceId : l.targetId),
        );
      const fromCases = (await rt.persistence.testCases.list(rctx)).items.filter((c) =>
        c.requirementIds.includes(requirementId),
      );
      const allCaseIds = [
        ...new Set([...caseIds, ...fromCases.map((c) => asTestCaseId(c.id))]),
      ];
      return {
        requirementId: asRequirementId(req.id),
        requirementKey: req.key,
        caseIds: allCaseIds,
        covered: allCaseIds.length > 0,
      } satisfies TraceabilityMatrixRow;
    },
    async listMatrix(ctx) {
      const reqs = await rt.persistence.requirements.list(toRepositoryContext(ctx));
      const rows: TraceabilityMatrixRow[] = [];
      for (const req of reqs.items) {
        rows.push(await this.getMatrixForRequirement(ctx, asRequirementId(req.id)));
      }
      return rows;
    },
  };
}
