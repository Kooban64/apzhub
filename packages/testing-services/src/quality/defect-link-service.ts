import type {
  DefectLink,
  DefectLinkCreateInput,
  DefectLinkService,
  DefectLinkUpdateInput,
  DefectLinkTarget,
  DefectStatus,
  WorkItemRef,
} from "@apzhub/testing-contracts";
import {
  asDefectLinkId,
  asTestResultId,
  asTestRunId,
  type DefectLinkId,
} from "@apzhub/testing-contracts";
import type { DefectLinkRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { assertDefectCreateInput, assertRelationshipId } from "./validation";

function toDomain(row: DefectLinkRecord): DefectLink {
  return {
    id: asDefectLinkId(row.id),
    tenantId: row.tenantId,
    providerKind: row.providerKind as DefectLink["providerKind"],
    providerKey: row.providerKey,
    status: row.status as DefectLink["status"],
    internalRef: row.internalRef,
    externalRef: row.externalRef,
    severity: row.severity as DefectLink["severity"],
    priority: row.priority as DefectLink["priority"],
    ownerUserId: row.ownerUserId,
    resolution: row.resolution,
    verificationState: row.verificationState,
    summary: row.summary,
    url: row.url,
    requirementIds: row.requirementIds,
    planIds: row.planIds,
    suiteIds: row.suiteIds,
    caseIds: row.caseIds,
    manualExecutionIds: row.manualExecutionIds,
    automationExecutionIds: row.automationExecutionIds,
    evidenceIds: row.evidenceIds,
    releaseLabel: row.releaseLabel,
    riskIds: row.riskIds,
    workItemRefs: row.workItemRefs as unknown as readonly WorkItemRef[] | undefined,
    target: row.target as DefectLink["target"],
    externalId: row.externalId,
    resultId: row.resultId ? asTestResultId(row.resultId) : undefined,
    runId: row.runId ? asTestRunId(row.runId) : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

function relationshipField(
  entityKind: string,
):
  | keyof Pick<
      DefectLinkRecord,
      | "requirementIds"
      | "planIds"
      | "suiteIds"
      | "caseIds"
      | "manualExecutionIds"
      | "automationExecutionIds"
      | "evidenceIds"
      | "riskIds"
    >
  | "workItemRefs"
  | null {
  switch (entityKind) {
    case "requirement":
      return "requirementIds";
    case "plan":
      return "planIds";
    case "suite":
      return "suiteIds";
    case "case":
    case "project_task":
      return "caseIds";
    case "manual_execution":
      return "manualExecutionIds";
    case "automation_execution":
      return "automationExecutionIds";
    case "evidence":
      return "evidenceIds";
    case "risk":
      return "riskIds";
    case "work_item":
    case "support_ticket":
      return "workItemRefs";
    default:
      return null;
  }
}

export function createDefectLinkService(rt: ServiceRuntime): DefectLinkService {
  return {
    async list(ctx) {
      const page = await rt.persistence.defectLinks.list(toRepositoryContext(ctx));
      return page.items.map(toDomain);
    },
    async get(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.defectLinks.get(toRepositoryContext(ctx), id),
          "defect_link",
          id,
        ),
      );
    },
    async create(ctx, input: DefectLinkCreateInput) {
      assertDefectCreateInput(input);
      const row = await rt.persistence.defectLinks.create(toRepositoryContext(ctx), {
        providerKind: input.providerKind,
        providerKey: input.providerKey,
        status: input.status,
        internalRef: input.internalRef,
        externalRef: input.externalRef ?? input.externalId,
        severity: input.severity,
        priority: input.priority,
        ownerUserId: input.ownerUserId,
        resolution: input.resolution,
        verificationState: input.verificationState,
        summary: input.summary,
        url: input.url,
        requirementIds: input.requirementIds ?? [],
        planIds: input.planIds ?? [],
        suiteIds: input.suiteIds ?? [],
        caseIds: input.caseIds ?? [],
        manualExecutionIds: input.manualExecutionIds ?? [],
        automationExecutionIds: input.automationExecutionIds ?? [],
        evidenceIds: input.evidenceIds ?? [],
        releaseLabel: input.releaseLabel,
        riskIds: input.riskIds ?? [],
        workItemRefs:
          (input.workItemRefs as unknown as
            readonly Readonly<Record<string, unknown>>[] | undefined) ?? [],
        target: input.target,
        externalId: input.externalId ?? input.externalRef,
        resultId: input.resultId,
        runId: input.runId,
        organisationId: ctx.organisationId,
      });
      rt.events.record({
        eventType: "defect_link.created",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { defectLinkId: row.id },
      });
      return toDomain(row);
    },
    async update(ctx, id, input: DefectLinkUpdateInput) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.defectLinks.get(rctx, id),
        "defect_link",
        id,
      );
      const row = await rt.persistence.defectLinks.update(rctx, id, existing.revision, {
        providerKind: input.providerKind,
        providerKey: input.providerKey,
        status: input.status,
        internalRef: input.internalRef,
        externalRef: input.externalRef,
        severity: input.severity,
        priority: input.priority,
        ownerUserId: input.ownerUserId,
        resolution: input.resolution,
        verificationState: input.verificationState,
        summary: input.summary,
        url: input.url,
        requirementIds: input.requirementIds,
        planIds: input.planIds,
        suiteIds: input.suiteIds,
        caseIds: input.caseIds,
        manualExecutionIds: input.manualExecutionIds,
        automationExecutionIds: input.automationExecutionIds,
        evidenceIds: input.evidenceIds,
        releaseLabel: input.releaseLabel,
        riskIds: input.riskIds,
        workItemRefs: input.workItemRefs as unknown as
          readonly Readonly<Record<string, unknown>>[] | undefined,
        target: input.target,
        externalId: input.externalId,
        resultId: input.resultId,
        runId: input.runId,
      });
      rt.events.record({
        eventType: "defect_link.updated",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { defectLinkId: row.id },
      });
      return toDomain(row);
    },
    async linkTo(ctx, id, entityKind: DefectLinkTarget | string, entityId: string) {
      assertRelationshipId(entityId, "entityId");
      const current = await this.get(ctx, id);
      const field = relationshipField(entityKind);
      let patch: DefectLinkUpdateInput = {};
      if (field === "workItemRefs") {
        const refs = [...(current.workItemRefs ?? [])];
        if (!refs.some((r) => String(r.workItemId) === entityId)) {
          refs.push({
            kind: "task",
            projectRefId: "external",
            workItemId: entityId as WorkItemRef["workItemId"],
          });
        }
        patch = { workItemRefs: refs };
      } else if (field) {
        const ids = [...((current[field] as readonly string[] | undefined) ?? [])];
        if (!ids.includes(entityId)) ids.push(entityId);
        patch = { [field]: ids } as DefectLinkUpdateInput;
      } else {
        patch = {
          target: entityKind as DefectLinkTarget,
          externalRef: entityId,
        };
      }

      // Optional traceability link for graph navigation
      try {
        await rt.persistence.traceabilityLinks.create(toRepositoryContext(ctx), {
          type: "related",
          sourceKind: "defect",
          sourceId: id,
          targetKind: entityKind,
          targetId: entityId,
          organisationId: ctx.organisationId,
        });
      } catch {
        // Traceability may deny; relationship arrays remain authoritative.
      }

      const updated = await this.update(ctx, id, patch);
      rt.events.record({
        eventType: "defect_link.linked",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { defectLinkId: id, entityKind, entityId },
      });
      return updated;
    },
    async unlinkFrom(ctx, id, entityKind: DefectLinkTarget | string, entityId: string) {
      assertRelationshipId(entityId, "entityId");
      const current = await this.get(ctx, id);
      const field = relationshipField(entityKind);
      let patch: DefectLinkUpdateInput = {};
      if (field === "workItemRefs") {
        patch = {
          workItemRefs: (current.workItemRefs ?? []).filter(
            (r) => String(r.workItemId) !== entityId,
          ),
        };
      } else if (field) {
        const ids = ((current[field] as readonly string[] | undefined) ?? []).filter(
          (x) => x !== entityId,
        );
        patch = { [field]: ids } as DefectLinkUpdateInput;
      }
      const updated = await this.update(ctx, id, patch);
      rt.events.record({
        eventType: "defect_link.unlinked",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { defectLinkId: id, entityKind, entityId },
      });
      return updated;
    },
    async archive(ctx, id: DefectLinkId) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.defectLinks.get(rctx, id),
        "defect_link",
        id,
      );
      const row = await rt.persistence.defectLinks.archive(rctx, id, existing.revision);
      rt.events.record({
        eventType: "defect_link.archived",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { defectLinkId: id },
      });
      return toDomain(row);
    },
    async listByStatus(ctx, status: DefectStatus) {
      const all = await this.list(ctx);
      return all.filter((d) => d.status === status);
    },
  };
}
