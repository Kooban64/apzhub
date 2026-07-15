import type {
  CertificationHistoryEntry,
  CertificationHistoryService,
  CertificationStatus,
} from "@apzhub/testing-contracts";
import {
  asCertificationHistoryEntryId,
  asCertificationRecordId,
} from "@apzhub/testing-contracts";
import type { CertificationHistoryRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import type { ServiceRuntime } from "../services/types";
import { assertHasPermission, assertNonEmptyString } from "./validation";

function toDomain(row: CertificationHistoryRecord): CertificationHistoryEntry {
  return {
    id: asCertificationHistoryEntryId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId,
    certificationRecordId: asCertificationRecordId(row.certificationRecordId),
    occurredAt: row.occurredAt,
    actorUserId: row.actorUserId,
    fromStatus: row.fromStatus as CertificationStatus | undefined,
    toStatus: row.toStatus as CertificationStatus,
    reason: row.reason,
    correlationId: row.correlationId,
    detailsJson: row.detailsJson,
  };
}

export function createCertificationHistoryService(
  rt: ServiceRuntime,
): CertificationHistoryService {
  return {
    async listTransitions(ctx, certificationRecordId) {
      assertHasPermission(ctx, "certification.view");
      const page = await rt.persistence.certificationHistory.listByCertification(
        toRepositoryContext(ctx),
        certificationRecordId,
      );
      return page.items.map(toDomain);
    },
    async appendTransition(ctx, input) {
      assertHasPermission(ctx, "certification.records.transition");
      assertNonEmptyString(input.certificationRecordId, "certificationRecordId");
      assertNonEmptyString(input.toStatus, "toStatus");
      const row = await rt.persistence.certificationHistory.append(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          tenantId: ctx.tenantId,
          certificationRecordId: input.certificationRecordId,
          fromStatus: input.fromStatus,
          toStatus: input.toStatus,
          reason: input.reason,
          detailsJson: input.detailsJson,
          actorUserId: ctx.userId,
          organisationId: ctx.organisationId,
          correlationId: ctx.correlationId,
          occurredAt: rt.now(),
        },
      );
      return toDomain(row);
    },
  };
}

export async function appendCertificationHistory(
  rt: ServiceRuntime,
  ctx: Parameters<CertificationHistoryService["appendTransition"]>[0],
  input: Parameters<CertificationHistoryService["appendTransition"]>[1],
): Promise<CertificationHistoryEntry> {
  const row = await rt.persistence.certificationHistory.append(
    toRepositoryContext(ctx),
    {
      id: rt.id(),
      tenantId: ctx.tenantId,
      certificationRecordId: input.certificationRecordId,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      reason: input.reason,
      detailsJson: input.detailsJson,
      actorUserId: ctx.userId,
      organisationId: ctx.organisationId,
      correlationId: ctx.correlationId,
      occurredAt: rt.now(),
    },
  );
  return toDomain(row);
}
