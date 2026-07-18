import type {
  CertificationAuditEntry,
  CertificationAuditService,
} from "@apzhub/testing-contracts";
import {
  asCertificationAuditEntryId,
  asCertificationRecordId,
} from "@apzhub/testing-contracts";
import type { CertificationAuditRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { DomainRuleError, requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { assertHasPermission, assertNonEmptyString } from "./validation";

function toDomain(row: CertificationAuditRecord): CertificationAuditEntry {
  return {
    id: asCertificationAuditEntryId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId,
    certificationRecordId: asCertificationRecordId(row.certificationRecordId),
    occurredAt: row.occurredAt,
    actorUserId: row.actorUserId,
    action: row.action,
    summary: row.summary,
    detailsJson: row.detailsJson,
    correlationId: row.correlationId,
  };
}

export function createCertificationAuditService(
  rt: ServiceRuntime,
): CertificationAuditService {
  return {
    async append(ctx, input) {
      assertHasPermission(ctx, "certification.audit");
      assertNonEmptyString(input.certificationRecordId, "certificationRecordId");
      assertNonEmptyString(input.action, "action");
      assertNonEmptyString(input.summary, "summary");
      const row = await rt.persistence.certificationAudits.append(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          tenantId: ctx.tenantId,
          certificationRecordId: input.certificationRecordId,
          action: input.action,
          summary: input.summary,
          detailsJson: input.detailsJson,
          actorUserId: ctx.userId,
          organisationId: ctx.organisationId,
          correlationId: ctx.correlationId,
          occurredAt: rt.now(),
        },
      );
      return toDomain(row);
    },
    async list(ctx, certificationRecordId) {
      assertHasPermission(ctx, "certification.audit");
      const page = await rt.persistence.certificationAudits.listByCertification(
        toRepositoryContext(ctx),
        certificationRecordId,
      );
      return page.items.map(toDomain);
    },
    async get(ctx, id) {
      assertHasPermission(ctx, "certification.audit");
      const row = requireFound(
        await rt.persistence.certificationAudits.get(toRepositoryContext(ctx), id),
        "certification_audit",
        id,
      );
      return toDomain(row);
    },
  };
}

/** Internal helper used by other certification services — bypasses audit perm check for system appends when caller already authorized. */
export async function appendCertificationAudit(
  rt: ServiceRuntime,
  ctx: Parameters<CertificationAuditService["append"]>[0],
  input: Parameters<CertificationAuditService["append"]>[1],
): Promise<CertificationAuditEntry> {
  const row = await rt.persistence.certificationAudits.append(
    toRepositoryContext(ctx),
    {
      id: rt.id(),
      tenantId: ctx.tenantId,
      certificationRecordId: input.certificationRecordId,
      action: input.action,
      summary: input.summary,
      detailsJson: input.detailsJson,
      actorUserId: ctx.userId,
      organisationId: ctx.organisationId,
      correlationId: ctx.correlationId,
      occurredAt: rt.now(),
    },
  );
  return toDomain(row);
}

export function assertAuditImmutable(): void {
  throw new DomainRuleError(
    "immutable_audit",
    "Certification audit entries are append-only and cannot be mutated",
  );
}
