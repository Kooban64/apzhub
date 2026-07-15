import { createHash } from "node:crypto";

import type {
  AutomationAdapterInput,
  AutomationValidationService,
  CanonicalAutomationResult,
} from "@apzhub/testing-contracts";
import {
  asAutomationImportId,
  isAutomationAdapterKind,
  isNormalizedResultStatus,
} from "@apzhub/testing-contracts";
import { hasAnyMatchingPermission } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { DomainRuleError } from "../services/errors";
import type { ServiceRuntime } from "../services/types";

export function fingerprintPayload(
  payload: AutomationAdapterInput["payload"],
): string {
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

export function createAutomationValidationService(
  rt: ServiceRuntime,
): AutomationValidationService {
  return {
    validateCanonical(result: CanonicalAutomationResult) {
      if (!isAutomationAdapterKind(result.adapterKind)) {
        throw new DomainRuleError("VALIDATION_FAILED", "Invalid adapterKind");
      }
      if (!result.externalRunRef || result.externalRunRef.trim() === "") {
        throw new DomainRuleError("VALIDATION_FAILED", "externalRunRef is required");
      }
      if (!isNormalizedResultStatus(result.overallStatus)) {
        throw new DomainRuleError("VALIDATION_FAILED", "Invalid overallStatus");
      }
      if (!Array.isArray(result.suites) || result.suites.length === 0) {
        throw new DomainRuleError("VALIDATION_FAILED", "At least one suite is required");
      }
      for (const suite of result.suites) {
        if (!suite.name) {
          throw new DomainRuleError("VALIDATION_FAILED", "Suite name is required");
        }
        if (!suite.cases || suite.cases.length === 0) {
          throw new DomainRuleError(
            "VALIDATION_FAILED",
            `Suite ${suite.name} has no cases`,
          );
        }
        for (const c of suite.cases) {
          if (!c.title) {
            throw new DomainRuleError("VALIDATION_FAILED", "Case title is required");
          }
          if (!isNormalizedResultStatus(c.status)) {
            throw new DomainRuleError(
              "VALIDATION_FAILED",
              `Invalid case status: ${c.status}`,
            );
          }
        }
      }
    },

    assertImportAllowed(ctx) {
      const required = ["automation.import", "automation.admin"];
      if (!hasAnyMatchingPermission(ctx.permissions ?? [], required)) {
        throw new DomainRuleError(
          "UNAUTHORIZED",
          "Missing automation.import permission",
          { required },
        );
      }
    },

    async detectDuplicate(ctx, input) {
      const rctx = toRepositoryContext(ctx);
      const imports = await rt.persistence.automationImports.list(rctx, {
        pageSize: 500,
      });
      const byRef = imports.items.find(
        (row) =>
          row.adapterKind === input.adapterKind &&
          row.externalRunRef === input.externalRunRef &&
          row.status !== "failed",
      );
      if (byRef) {
        return {
          id: asAutomationImportId(byRef.id),
          tenantId: byRef.tenantId,
          organisationId: byRef.organisationId,
          adapterKind: byRef.adapterKind as CanonicalAutomationResult["adapterKind"],
          adapterVersion: byRef.adapterVersion,
          externalRunRef: byRef.externalRunRef,
          status: byRef.status as never,
          correlationId: byRef.correlationId,
          checksum: byRef.checksum,
          payloadFingerprint: byRef.payloadFingerprint,
          summary: byRef.summary,
          errorSummary: byRef.errorSummary,
          startedAt: byRef.startedAt,
          completedAt: byRef.completedAt,
          canonicalSnapshot: byRef.canonicalSnapshot,
          automatedExecutionId: byRef.automatedExecutionId as never,
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
            id: asAutomationImportId(byFp.id),
            tenantId: byFp.tenantId,
            organisationId: byFp.organisationId,
            adapterKind: byFp.adapterKind as CanonicalAutomationResult["adapterKind"],
            adapterVersion: byFp.adapterVersion,
            externalRunRef: byFp.externalRunRef,
            status: byFp.status as never,
            correlationId: byFp.correlationId,
            checksum: byFp.checksum,
            payloadFingerprint: byFp.payloadFingerprint,
            summary: byFp.summary,
            errorSummary: byFp.errorSummary,
            startedAt: byFp.startedAt,
            completedAt: byFp.completedAt,
            canonicalSnapshot: byFp.canonicalSnapshot,
            automatedExecutionId: byFp.automatedExecutionId as never,
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
