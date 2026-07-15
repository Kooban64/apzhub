import { createHash } from "node:crypto";

import type {
  CanonicalPipelineResult,
  PipelineValidationService,
} from "@apzhub/testing-contracts";
import {
  asPipelineImportId,
  isPipelineProviderKind,
  isPipelineRunStatus,
} from "@apzhub/testing-contracts";
import { hasAnyMatchingPermission } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { DomainRuleError } from "../services/errors";
import type { ServiceRuntime } from "../services/types";

export function fingerprintPipelinePayload(payload: unknown): string {
  let bytes: Uint8Array;
  if (typeof payload === "string") {
    bytes = new TextEncoder().encode(payload);
  } else if (payload instanceof Uint8Array || ArrayBuffer.isView(payload)) {
    bytes = new Uint8Array(
      (payload as ArrayBufferView).buffer,
      (payload as ArrayBufferView).byteOffset,
      (payload as ArrayBufferView).byteLength,
    );
  } else {
    bytes = new TextEncoder().encode(JSON.stringify(payload));
  }
  return createHash("sha256").update(Buffer.from(bytes)).digest("hex");
}

export function createPipelineValidationService(
  rt: ServiceRuntime,
): PipelineValidationService {
  return {
    validateCanonical(result: CanonicalPipelineResult) {
      if (!isPipelineProviderKind(result.providerKind)) {
        throw new DomainRuleError("VALIDATION_FAILED", "Invalid providerKind");
      }
      if (!result.externalRunRef || result.externalRunRef.trim() === "") {
        throw new DomainRuleError("VALIDATION_FAILED", "externalRunRef is required");
      }
      if (!isPipelineRunStatus(result.status)) {
        throw new DomainRuleError("VALIDATION_FAILED", "Invalid status");
      }
      if (!result.summary || !isPipelineRunStatus(result.summary.overallStatus)) {
        throw new DomainRuleError("VALIDATION_FAILED", "Invalid summary.overallStatus");
      }
      for (const stage of result.stages ?? []) {
        if (!stage.name) {
          throw new DomainRuleError("VALIDATION_FAILED", "Stage name is required");
        }
      }
      for (const job of result.jobs ?? []) {
        if (!job.name) {
          throw new DomainRuleError("VALIDATION_FAILED", "Job name is required");
        }
      }
      for (const variable of result.variables ?? []) {
        if (!variable.name) {
          throw new DomainRuleError("VALIDATION_FAILED", "Variable name is required");
        }
      }
      for (const secret of result.secretRefs ?? []) {
        if (!secret.name || !secret.reference) {
          throw new DomainRuleError(
            "VALIDATION_FAILED",
            "Secret reference requires name and reference",
          );
        }
      }
    },

    assertImportAllowed(ctx) {
      const required = ["pipeline.import", "pipeline.admin"];
      if (!hasAnyMatchingPermission(ctx.permissions ?? [], required)) {
        throw new DomainRuleError(
          "UNAUTHORIZED",
          "Missing pipeline.import permission",
          { required },
        );
      }
    },

    async detectDuplicate(ctx, input) {
      const rctx = toRepositoryContext(ctx);
      const imports = await rt.persistence.pipelineImports.list(rctx, {
        pageSize: 500,
      });
      const byRef = imports.items.find(
        (row) =>
          row.providerKind === input.providerKind &&
          row.externalRunRef === input.externalRunRef &&
          row.status !== "failed",
      );
      if (byRef) {
        return {
          id: asPipelineImportId(byRef.id),
          tenantId: byRef.tenantId,
          organisationId: byRef.organisationId,
          providerKind: byRef.providerKind as CanonicalPipelineResult["providerKind"],
          adapterVersion: byRef.adapterVersion,
          externalRunRef: byRef.externalRunRef,
          pipelineId: byRef.pipelineId as never,
          status: byRef.status as never,
          correlationId: byRef.correlationId,
          checksum: byRef.checksum,
          payloadFingerprint: byRef.payloadFingerprint,
          summary: byRef.summary,
          errorSummary: byRef.errorSummary,
          startedAt: byRef.startedAt,
          completedAt: byRef.completedAt,
          canonicalSnapshot: byRef.canonicalSnapshot,
          pipelineRunId: byRef.pipelineRunId as never,
          createdAt: byRef.createdAt,
          updatedAt: byRef.updatedAt,
          createdBy: byRef.createdBy,
          updatedBy: byRef.updatedBy,
          revision: byRef.revision,
        };
      }
      if (input.payloadFingerprint) {
        const byFp = imports.items.find(
          (row) =>
            row.payloadFingerprint === input.payloadFingerprint &&
            row.status !== "failed",
        );
        if (byFp) {
          return {
            id: asPipelineImportId(byFp.id),
            tenantId: byFp.tenantId,
            organisationId: byFp.organisationId,
            providerKind: byFp.providerKind as CanonicalPipelineResult["providerKind"],
            adapterVersion: byFp.adapterVersion,
            externalRunRef: byFp.externalRunRef,
            pipelineId: byFp.pipelineId as never,
            status: byFp.status as never,
            correlationId: byFp.correlationId,
            checksum: byFp.checksum,
            payloadFingerprint: byFp.payloadFingerprint,
            summary: byFp.summary,
            errorSummary: byFp.errorSummary,
            startedAt: byFp.startedAt,
            completedAt: byFp.completedAt,
            canonicalSnapshot: byFp.canonicalSnapshot,
            pipelineRunId: byFp.pipelineRunId as never,
            createdAt: byFp.createdAt,
            updatedAt: byFp.updatedAt,
            createdBy: byFp.createdBy,
            updatedBy: byFp.updatedBy,
            revision: byFp.revision,
          };
        }
      }
      return undefined;
    },
  };
}
