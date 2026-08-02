/**
 * Evidence Integrity Platform Service — APZQEP-120-S04.
 *
 * Owns integrity policy. Content I/O only via StoragePort.
 * Domain EvidenceIntegrityService remains pure (no crypto / no I/O).
 */

import {
  establishIntegrity as domainEstablishIntegrity,
  recordIntegrityContentMissing,
  verifyIntegrity as domainVerifyIntegrity,
  type Evidence,
} from "../../domain/evidence";
import { EvidenceIntegrityFailedError } from "../../shared/errors";
import type { EvidenceRequestContext } from "../context";
import {
  commandContext,
  persistEvidenceMutation,
  requireEvidence,
  type ApplicationOrchestrationDeps,
} from "../orchestration";
import { QEP_EVIDENCE_PLATFORM_EVENTS } from "../events/catalogue";
import { buildQepEvidenceEventEnvelope } from "../events/envelope";
import { publishQepEvidenceEventFailSoft } from "../events/publisher";
import type { AuditPort } from "../ports";
import type { EvidenceSecurityGate } from "../security/security-gate";
import type { IntegrityAlgorithmRegistry } from "./algorithms/integrity-algorithm";
import { createIntegrityAlgorithmRegistry } from "./algorithms/registry";
import { digestContentFromStorage } from "./digest-from-storage";
import { EvidenceIntegrityPlatformError } from "./errors";
import {
  mapDomainVerificationToPlatformStatus,
  toIntegrityPublicView,
  toIntegrityRecordView,
} from "./status-mapping";
import type {
  EvidenceIntegrityRecordView,
  IntegrityEstablishResult,
  IntegrityStatusPublicView,
  IntegrityVerifyResult,
} from "./types";

export type EvidenceIntegrityPlatformService = {
  readonly serviceId: "EvidenceIntegrityPlatformService";
  getIntegrityStatus(
    ctx: EvidenceRequestContext,
    evidenceId: string,
  ): Promise<IntegrityStatusPublicView>;
  getIntegrityRecord(
    ctx: EvidenceRequestContext,
    evidenceId: string,
  ): Promise<EvidenceIntegrityRecordView>;
  establishIntegrity(
    ctx: EvidenceRequestContext,
    input: { readonly evidenceId: string; readonly expectedRevision: number },
  ): Promise<IntegrityEstablishResult>;
  verifyIntegrity(
    ctx: EvidenceRequestContext,
    input: {
      readonly evidenceId: string;
      readonly expectedRevision: number;
      /** Optional caller-supplied digest; when omitted, content is hashed via StoragePort. */
      readonly providedActualHash?: string;
    },
  ): Promise<IntegrityVerifyResult>;
};

export type CreateEvidenceIntegrityPlatformServiceInput = {
  readonly deps: ApplicationOrchestrationDeps & { readonly audit?: AuditPort };
  readonly securityGate: EvidenceSecurityGate;
  readonly algorithms?: IntegrityAlgorithmRegistry;
  /** When true, digests are included on getIntegrityRecord (authorised callers). */
  readonly includeDigestsOnRecord?: boolean;
};

async function recordIntegrityAudit(
  deps: CreateEvidenceIntegrityPlatformServiceInput["deps"],
  ctx: EvidenceRequestContext,
  evidenceId: string,
  action: string,
  outcome: "allowed" | "denied" = "allowed",
): Promise<void> {
  const occurredAt = deps.clock.now();
  await deps.uow.audit.append({
    id: deps.ids.createId("audit"),
    tenantId: ctx.tenantId,
    evidenceId,
    action,
    actorId: ctx.userId,
    outcome,
    correlationId: ctx.correlationId,
    occurredAt,
  });
  await deps.audit?.append({
    tenantId: ctx.tenantId,
    evidenceId,
    action,
    actorId: ctx.userId,
    outcome,
    correlationId: ctx.correlationId,
    occurredAt,
  });
}

export function createEvidenceIntegrityPlatformService(
  input: CreateEvidenceIntegrityPlatformServiceInput,
): EvidenceIntegrityPlatformService {
  const algorithms = input.algorithms ?? createIntegrityAlgorithmRegistry();
  const { deps, securityGate } = input;

  async function loadAuthorised(
    ctx: EvidenceRequestContext,
    evidenceId: string,
    operation: "getIntegrityStatus" | "establishIntegrity" | "verifyIntegrity",
  ): Promise<Evidence> {
    await securityGate.authorize(ctx, operation, { evidenceId });
    return requireEvidence(deps, ctx, evidenceId);
  }

  return {
    serviceId: "EvidenceIntegrityPlatformService",

    async getIntegrityStatus(ctx, evidenceId) {
      const evidence = await loadAuthorised(ctx, evidenceId, "getIntegrityStatus");
      return toIntegrityPublicView(evidence);
    },

    async getIntegrityRecord(ctx, evidenceId) {
      // Same ACL as status; digests only for callers who can read evidence.
      const evidence = await loadAuthorised(ctx, evidenceId, "getIntegrityStatus");
      const view = toIntegrityRecordView(evidence);
      if (input.includeDigestsOnRecord === false) {
        return { ...view, digest: undefined };
      }
      return view;
    },

    async establishIntegrity(ctx, command) {
      const evidence = await loadAuthorised(
        ctx,
        command.evidenceId,
        "establishIntegrity",
      );
      if (!evidence.content?.storageLocator) {
        throw new EvidenceIntegrityPlatformError(
          "INVALID_REQUEST",
          "Evidence has no stored content for integrity establishment",
        );
      }

      const algorithmId = evidence.content.hashAlgorithm ?? "sha256";
      let algorithm;
      try {
        algorithm = algorithms.get(algorithmId);
      } catch {
        throw new EvidenceIntegrityPlatformError(
          "INTEGRITY_ALGORITHM_UNSUPPORTED",
          "Integrity algorithm is not supported",
          { algorithmId },
        );
      }

      let digest: string;
      let contentLength: number;
      try {
        const hashed = await digestContentFromStorage({
          storage: deps.storage,
          tenantId: ctx.tenantId,
          storageLocator: evidence.content.storageLocator,
          algorithm,
        });
        digest = hashed.digest;
        contentLength = hashed.contentLength;
      } catch (error) {
        if (
          error instanceof EvidenceIntegrityPlatformError &&
          error.integrityCode === "INTEGRITY_CONTENT_MISSING"
        ) {
          await recordIntegrityAudit(
            deps,
            ctx,
            evidence.id,
            "evidence.integrity.content_missing",
          );
        }
        throw error;
      }

      if (evidence.integrity) {
        if (algorithm.digestsEqual(evidence.integrity.contentHash, digest)) {
          await recordIntegrityAudit(
            deps,
            ctx,
            evidence.id,
            "evidence.integrity.established",
          );
          // S07: idempotent establish still emits catalogue event for consumers.
          publishQepEvidenceEventFailSoft(
            deps.platformEvents,
            buildQepEvidenceEventEnvelope({
              eventId: QEP_EVIDENCE_PLATFORM_EVENTS.integrityEstablished,
              evidenceId: evidence.id,
              tenantId: ctx.tenantId,
              timestamp: deps.clock.now(),
              actorId: ctx.userId,
              correlationId: ctx.correlationId,
              revision: evidence.revision,
              payload: {
                algorithm: algorithm.algorithmId,
                idempotent: true,
              },
            }),
          );
          return {
            evidenceId: evidence.id,
            algorithm: algorithm.algorithmId,
            digest: evidence.integrity.contentHash,
            contentLength: evidence.content.byteSize,
            status: mapDomainVerificationToPlatformStatus(evidence),
            establishedAt: evidence.updatedAt,
            idempotent: true,
          };
        }
        await recordIntegrityAudit(
          deps,
          ctx,
          evidence.id,
          "evidence.integrity.mismatch",
        );
        throw new EvidenceIntegrityPlatformError(
          "INTEGRITY_MISMATCH",
          "Stored content does not match the established integrity digest",
          { evidenceId: evidence.id },
        );
      }

      const mutated = domainEstablishIntegrity(
        evidence,
        commandContext(deps, ctx, command.expectedRevision),
        {
          contentHash: digest,
          hashAlgorithm: algorithm.algorithmId,
          byteSize: contentLength,
        },
      );
      const { stored } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      await recordIntegrityAudit(
        deps,
        ctx,
        stored.id,
        "evidence.integrity.established",
      );

      return {
        evidenceId: stored.id,
        algorithm: algorithm.algorithmId,
        digest,
        contentLength,
        status: "ESTABLISHED",
        establishedAt: deps.clock.now(),
        idempotent: false,
      };
    },

    async verifyIntegrity(ctx, command) {
      const evidence = await loadAuthorised(ctx, command.evidenceId, "verifyIntegrity");

      if (!evidence.integrity) {
        throw new EvidenceIntegrityPlatformError(
          "INTEGRITY_NOT_ESTABLISHED",
          "Content integrity has not been established",
          { evidenceId: evidence.id },
        );
      }

      const algorithmId = evidence.integrity.hashAlgorithm ?? "sha256";
      let algorithm;
      try {
        algorithm = algorithms.get(algorithmId);
      } catch {
        await recordIntegrityAudit(
          deps,
          ctx,
          evidence.id,
          "evidence.integrity.verification_failed",
        );
        throw new EvidenceIntegrityPlatformError(
          "INTEGRITY_ALGORITHM_UNSUPPORTED",
          "Integrity algorithm is not supported",
          { algorithmId },
        );
      }

      if (!evidence.content?.storageLocator) {
        const mutated = recordIntegrityContentMissing(
          evidence,
          commandContext(deps, ctx, command.expectedRevision),
        );
        await persistEvidenceMutation(deps, mutated, command.expectedRevision);
        await recordIntegrityAudit(
          deps,
          ctx,
          evidence.id,
          "evidence.integrity.content_missing",
        );
        return {
          evidenceId: evidence.id,
          algorithm: algorithm.algorithmId,
          expectedDigest: evidence.integrity.contentHash,
          status: "CONTENT_MISSING",
          verifiedAt: deps.clock.now(),
        };
      }

      let actualDigest: string;
      let contentLength: number | undefined;
      if (command.providedActualHash?.trim()) {
        actualDigest = command.providedActualHash.trim().toLowerCase();
        if (!algorithm.isSupportedDigest(actualDigest)) {
          throw new EvidenceIntegrityPlatformError(
            "INVALID_REQUEST",
            "providedActualHash is not a valid digest for the algorithm",
          );
        }
        contentLength = evidence.content.byteSize;
      } else {
        try {
          const hashed = await digestContentFromStorage({
            storage: deps.storage,
            tenantId: ctx.tenantId,
            storageLocator: evidence.content.storageLocator,
            algorithm,
          });
          actualDigest = hashed.digest;
          contentLength = hashed.contentLength;
        } catch (error) {
          if (
            error instanceof EvidenceIntegrityPlatformError &&
            error.integrityCode === "INTEGRITY_CONTENT_MISSING"
          ) {
            const mutated = recordIntegrityContentMissing(
              evidence,
              commandContext(deps, ctx, command.expectedRevision),
            );
            await persistEvidenceMutation(deps, mutated, command.expectedRevision);
            await recordIntegrityAudit(
              deps,
              ctx,
              evidence.id,
              "evidence.integrity.content_missing",
            );
            return {
              evidenceId: evidence.id,
              algorithm: algorithm.algorithmId,
              expectedDigest: evidence.integrity.contentHash,
              status: "CONTENT_MISSING",
              verifiedAt: deps.clock.now(),
            };
          }
          await recordIntegrityAudit(
            deps,
            ctx,
            evidence.id,
            "evidence.integrity.verification_failed",
          );
          throw error;
        }
      }

      const matched = algorithm.digestsEqual(
        evidence.integrity.contentHash,
        actualDigest,
      );

      try {
        const mutated = domainVerifyIntegrity(
          evidence,
          commandContext(deps, ctx, command.expectedRevision),
          { providedActualHash: actualDigest },
        );
        await persistEvidenceMutation(deps, mutated, command.expectedRevision);
      } catch (error) {
        if (error instanceof EvidenceIntegrityFailedError) {
          await recordIntegrityAudit(
            deps,
            ctx,
            evidence.id,
            "evidence.integrity.mismatch",
          );
          return {
            evidenceId: evidence.id,
            algorithm: algorithm.algorithmId,
            expectedDigest: evidence.integrity.contentHash,
            actualDigest,
            status: "MISMATCH",
            verifiedAt: deps.clock.now(),
            contentLength,
          };
        }
        throw error;
      }

      if (!matched) {
        await recordIntegrityAudit(
          deps,
          ctx,
          evidence.id,
          "evidence.integrity.mismatch",
        );
        return {
          evidenceId: evidence.id,
          algorithm: algorithm.algorithmId,
          expectedDigest: evidence.integrity.contentHash,
          actualDigest,
          status: "MISMATCH",
          verifiedAt: deps.clock.now(),
          contentLength,
        };
      }

      await recordIntegrityAudit(deps, ctx, evidence.id, "evidence.integrity.verified");
      return {
        evidenceId: evidence.id,
        algorithm: algorithm.algorithmId,
        expectedDigest: evidence.integrity.contentHash,
        actualDigest,
        status: "VERIFIED",
        verifiedAt: deps.clock.now(),
        contentLength,
      };
    },
  };
}
