import type {
  CertificationStatus,
  CertificationWorkflowService,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import { DomainRuleError, requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { appendCertificationAudit } from "./audit-service";
import { appendCertificationHistory } from "./history-service";
import { eventTypeForStatus, toCertificationDomain } from "./mapping";
import { assertCertificationTransition } from "./state-machine";
import {
  assertHasPermission,
  assertNonEmptyString,
  assertTenantOrganisationMatch,
} from "./validation";

async function performTransition(
  rt: ServiceRuntime,
  ctx: Parameters<CertificationWorkflowService["transition"]>[0],
  id: Parameters<CertificationWorkflowService["transition"]>[1],
  nextStatus: CertificationStatus,
  reason: string | undefined,
  requiredPermission: string,
  options?: { readonly allowOverride?: boolean },
) {
  assertHasPermission(ctx, requiredPermission);
  const rctx = toRepositoryContext(ctx);
  const existing = requireFound(
    await rt.persistence.certificationRecords.get(rctx, id),
    "certification_record",
    id,
  );
  assertTenantOrganisationMatch(ctx, existing);
  assertCertificationTransition(existing.status, nextStatus, options);

  const certifiedAt =
    nextStatus === "approved" || nextStatus === "certified"
      ? rt.now()
      : existing.certifiedAt;

  const row = await rt.persistence.certificationRecords.update(
    rctx,
    id,
    existing.revision,
    {
      status: nextStatus,
      certifiedAt,
      conditions:
        nextStatus === "conditionally_approved" || nextStatus === "conditional_approval"
          ? (reason ?? existing.conditions)
          : existing.conditions,
    },
  );

  await appendCertificationHistory(rt, ctx, {
    certificationRecordId: id,
    fromStatus: existing.status,
    toStatus: nextStatus,
    reason,
  });
  await appendCertificationAudit(rt, ctx, {
    certificationRecordId: id,
    action: "certification.workflow_transition",
    summary: `Workflow ${existing.status} → ${nextStatus}`,
    detailsJson: { reason, permission: requiredPermission },
  });

  const eventType = eventTypeForStatus(nextStatus);
  rt.events.record({
    eventType,
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
    actorUserId: ctx.userId,
    payload: {
      certificationRecordId: id,
      previousStatus: existing.status,
      nextStatus,
      reason,
    },
  });
  rt.events.record({
    eventType: "certification.transitioned",
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
    actorUserId: ctx.userId,
    payload: {
      certificationRecordId: id,
      previousStatus: existing.status,
      nextStatus,
      reason,
    },
  });
  rt.events.record({
    eventType: "certification.state_changed",
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
    actorUserId: ctx.userId,
    payload: {
      certificationRecordId: id,
      previousStatus: existing.status,
      nextStatus,
      reason,
    },
  });

  return toCertificationDomain(row);
}

export function createCertificationWorkflowService(
  rt: ServiceRuntime,
): CertificationWorkflowService {
  return {
    async transition(ctx, id, nextStatus, reason) {
      return performTransition(
        rt,
        ctx,
        id,
        nextStatus,
        reason,
        "certification.records.transition",
      );
    },
    async startReview(ctx, id, reason) {
      return performTransition(
        rt,
        ctx,
        id,
        "in_review",
        reason,
        "certification.review",
      );
    },
    async requestChanges(ctx, id, reason) {
      assertNonEmptyString(reason, "reason");
      return performTransition(
        rt,
        ctx,
        id,
        "changes_required",
        reason,
        "certification.review",
      );
    },
    async submitForApproval(ctx, id, reason) {
      return performTransition(
        rt,
        ctx,
        id,
        "awaiting_approval",
        reason,
        "certification.review",
      );
    },
    async approve(ctx, id, reason) {
      // Humans only — never auto-approve.
      return performTransition(
        rt,
        ctx,
        id,
        "approved",
        reason,
        "certification.approve",
      );
    },
    async conditionallyApprove(ctx, id, conditions) {
      assertNonEmptyString(conditions, "conditions");
      return performTransition(
        rt,
        ctx,
        id,
        "conditionally_approved",
        conditions,
        "certification.approve",
      );
    },
    async reject(ctx, id, reason) {
      assertNonEmptyString(reason, "reason");
      return performTransition(rt, ctx, id, "rejected", reason, "certification.reject");
    },
    async expire(ctx, id, reason) {
      return performTransition(
        rt,
        ctx,
        id,
        "expired",
        reason,
        "certification.records.transition",
      );
    },
    async archive(ctx, id, reason) {
      return performTransition(
        rt,
        ctx,
        id,
        "archived",
        reason,
        "certification.records.transition",
      );
    },
    async restore(ctx, id, nextStatus = "draft", reason) {
      if (nextStatus !== "draft" && nextStatus !== "preparing") {
        throw new DomainRuleError(
          "invalid_restore_target",
          "Restore target must be draft or preparing",
          { nextStatus },
        );
      }
      return performTransition(
        rt,
        ctx,
        id,
        nextStatus,
        reason,
        "certification.override",
        { allowOverride: true },
      );
    },
  };
}
