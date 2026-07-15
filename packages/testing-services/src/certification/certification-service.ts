import type {
  CertificationEngineRecordService,
  CertificationStatus,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { appendCertificationAudit } from "./audit-service";
import { appendCertificationHistory } from "./history-service";
import { eventTypeForStatus, linksToJson, toCertificationDomain } from "./mapping";
import { assertCertificationTransition } from "./state-machine";
import {
  assertHasPermission,
  assertNonEmptyString,
  assertTenantOrganisationMatch,
  emptyEvidenceLinks,
} from "./validation";

export function createCertificationService(
  rt: ServiceRuntime,
): CertificationEngineRecordService {
  return {
    async listCertificationRecords(ctx) {
      assertHasPermission(ctx, "certification.records.list");
      const page = await rt.persistence.certificationRecords.list(
        toRepositoryContext(ctx),
      );
      return page.items.map(toCertificationDomain);
    },
    async getCertificationRecord(ctx, id) {
      assertHasPermission(ctx, "certification.records.read");
      const row = requireFound(
        await rt.persistence.certificationRecords.get(
          toRepositoryContext(ctx),
          id,
        ),
        "certification_record",
        id,
      );
      assertTenantOrganisationMatch(ctx, row);
      return toCertificationDomain(row);
    },
    async createCertificationRecord(ctx, input) {
      assertHasPermission(ctx, "certification.create");
      assertNonEmptyString(input.key, "key");
      assertNonEmptyString(input.name, "name");
      const status: CertificationStatus = input.status ?? "draft";
      const rctx = toRepositoryContext(ctx);
      const row = await rt.persistence.certificationRecords.create(rctx, {
        id: rt.id(),
        key: input.key,
        name: input.name,
        status,
        planId: input.planId,
        productLabel: input.productLabel,
        releaseLabel: input.releaseLabel,
        gateIds: input.gateIds ?? [],
        approvalIds: input.approvalIds ?? [],
        conditions: input.conditions,
        certifiedAt: input.certifiedAt,
        expiresAt: input.expiresAt,
        gateEvaluationIds: [],
        evidenceLinksJson: linksToJson(input.evidenceLinks ?? emptyEvidenceLinks()),
        ruleId: input.ruleId,
        organisationId: ctx.organisationId,
      });
      await appendCertificationHistory(rt, ctx, {
        certificationRecordId: row.id as never,
        toStatus: status,
        reason: "created",
      });
      await appendCertificationAudit(rt, ctx, {
        certificationRecordId: row.id as never,
        action: "certification.created",
        summary: `Created certification ${row.key}`,
        detailsJson: { status },
      });
      rt.events.record({
        eventType: "certification.created",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { certificationRecordId: row.id, status },
      });
      return toCertificationDomain(row);
    },
    async updateCertificationRecord(ctx, id, patch) {
      assertHasPermission(ctx, "certification.review");
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.certificationRecords.get(rctx, id),
        "certification_record",
        id,
      );
      assertTenantOrganisationMatch(ctx, existing);
      const row = await rt.persistence.certificationRecords.update(
        rctx,
        id,
        existing.revision,
        {
          name: patch.name,
          productLabel: patch.productLabel,
          releaseLabel: patch.releaseLabel,
          conditions: patch.conditions,
          expiresAt: patch.expiresAt,
          planId: patch.planId,
          ruleId: patch.ruleId,
          evidenceLinksJson: patch.evidenceLinks
            ? linksToJson(patch.evidenceLinks)
            : existing.evidenceLinksJson,
        },
      );
      await appendCertificationAudit(rt, ctx, {
        certificationRecordId: id,
        action: "certification.updated",
        summary: `Updated certification ${row.key}`,
      });
      return toCertificationDomain(row);
    },
    async transitionCertificationState(ctx, id, nextStatus, reason) {
      assertHasPermission(ctx, "certification.records.transition");
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.certificationRecords.get(rctx, id),
        "certification_record",
        id,
      );
      assertTenantOrganisationMatch(ctx, existing);
      assertCertificationTransition(existing.status, nextStatus);
      const certifiedAt =
        nextStatus === "approved" || nextStatus === "certified"
          ? rt.now()
          : existing.certifiedAt;
      const row = await rt.persistence.certificationRecords.update(
        rctx,
        id,
        existing.revision,
        { status: nextStatus, certifiedAt },
      );
      await appendCertificationHistory(rt, ctx, {
        certificationRecordId: id,
        fromStatus: existing.status,
        toStatus: nextStatus,
        reason,
      });
      await appendCertificationAudit(rt, ctx, {
        certificationRecordId: id,
        action: "certification.transitioned",
        summary: `Transitioned ${existing.status} → ${nextStatus}`,
        detailsJson: { reason },
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
    },
  };
}
