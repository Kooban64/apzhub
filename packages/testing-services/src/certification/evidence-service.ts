import type {
  CertificationEvidenceLinks,
  CertificationEvidenceService,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { appendCertificationAudit } from "./audit-service";
import { linksToJson } from "./mapping";
import {
  assertHasPermission,
  assertTenantOrganisationMatch,
  evidenceLinksFromJson,
  mergeEvidenceLinks,
} from "./validation";

export function createCertificationEvidenceService(
  rt: ServiceRuntime,
): CertificationEvidenceService {
  return {
    async getLinks(ctx, certificationRecordId) {
      assertHasPermission(ctx, "certification.records.read");
      const row = requireFound(
        await rt.persistence.certificationRecords.get(
          toRepositoryContext(ctx),
          certificationRecordId,
        ),
        "certification_record",
        certificationRecordId,
      );
      assertTenantOrganisationMatch(ctx, row);
      return evidenceLinksFromJson(row.evidenceLinksJson);
    },
    async linkEvidence(ctx, certificationRecordId, links) {
      assertHasPermission(ctx, "certification.review");
      return mutateLinks(rt, ctx, certificationRecordId, links, "link");
    },
    async unlinkEvidence(ctx, certificationRecordId, links) {
      assertHasPermission(ctx, "certification.review");
      return mutateLinks(rt, ctx, certificationRecordId, links, "unlink");
    },
  };
}

async function mutateLinks(
  rt: ServiceRuntime,
  ctx: Parameters<CertificationEvidenceService["linkEvidence"]>[0],
  certificationRecordId: string,
  links: Partial<CertificationEvidenceLinks>,
  mode: "link" | "unlink",
): Promise<CertificationEvidenceLinks> {
  const rctx = toRepositoryContext(ctx);
  const existing = requireFound(
    await rt.persistence.certificationRecords.get(rctx, certificationRecordId),
    "certification_record",
    certificationRecordId,
  );
  assertTenantOrganisationMatch(ctx, existing);
  const merged = mergeEvidenceLinks(
    evidenceLinksFromJson(existing.evidenceLinksJson),
    links,
    mode,
  );
  await rt.persistence.certificationRecords.update(
    rctx,
    certificationRecordId,
    existing.revision,
    { evidenceLinksJson: linksToJson(merged) },
  );
  await appendCertificationAudit(rt, ctx, {
    certificationRecordId: certificationRecordId as never,
    action:
      mode === "link"
        ? "certification.evidence_linked"
        : "certification.evidence_unlinked",
    summary: `${mode === "link" ? "Linked" : "Unlinked"} evidence for certification`,
    detailsJson: { mode, links },
  });
  rt.events.record({
    eventType: "certification.evidence_linked",
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
    actorUserId: ctx.userId,
    payload: { certificationRecordId, mode },
  });
  return merged;
}
