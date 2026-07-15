import type {
  AutomationEvidenceRegistration,
  AutomationEvidenceService,
  CanonicalAutomationEvidenceMeta,
  EvidenceType,
} from "@apzhub/testing-contracts";
import { asEvidenceId, isEvidenceType } from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import type { ServiceRuntime } from "../services/types";

function toEvidenceType(raw: string): EvidenceType {
  return isEvidenceType(raw) ? raw : "attachment";
}

export function createAutomationEvidenceService(
  rt: ServiceRuntime,
): AutomationEvidenceService {
  return {
    async registerFromCanonical(ctx, input) {
      const rctx = toRepositoryContext(ctx);
      const registered: AutomationEvidenceRegistration[] = [];

      for (const meta of input.evidence) {
        let storageRef = meta.storageRef ?? meta.pathHint ?? `automation://${input.importId}/${rt.id()}`;
        if (meta.bytesBase64) {
          const bytes = Uint8Array.from(Buffer.from(meta.bytesBase64, "base64"));
          const put = await rt.storage.put({
            contentType: meta.mimeType ?? "application/octet-stream",
            bytes,
            keyHint: meta.pathHint ?? meta.title,
          });
          storageRef = put.storageRef;
        }

        const row = await rt.persistence.evidence.create(rctx, {
          type: toEvidenceType(meta.type),
          title: meta.title,
          storageRef,
          contentType: meta.mimeType,
          mimeType: meta.mimeType,
          sizeBytes: meta.sizeBytes,
          checksum: meta.checksum,
          contentHash: meta.checksum,
          executionId: input.executionId,
          lifecycleStatus: "captured",
          authorUserId: ctx.userId,
          captureTime: rt.now(),
          relationships: [
            { kind: "automation_import", targetId: input.importId },
            { kind: "automated_execution", targetId: input.executionId },
          ],
        });

        registered.push({
          evidenceId: asEvidenceId(row.id),
          storageRef: row.storageRef,
          title: row.title,
          type: row.type,
        });
      }

      if (registered.length > 0) {
        rt.events.record({
          eventType: "automation.evidence_registered",
          tenantId: ctx.tenantId,
          correlationId: ctx.correlationId,
          actorUserId: ctx.userId,
          payload: {
            importId: input.importId,
            executionId: input.executionId,
            count: registered.length,
          },
        });
      }

      return registered;
    },
  };
}

export type { CanonicalAutomationEvidenceMeta };
