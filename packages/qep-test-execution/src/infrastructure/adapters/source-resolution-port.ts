/**
 * Source Resolution Port adapter — APZQEP-ENG-100D.
 * Resolves manifest step content from Test Plan / Test Specification sources
 * at seal time. The concrete cross-package lookup (Plan/Specification
 * platform services) is injected by the caller; this package must not depend
 * on `@apzhub/qep-test-plans` or `@apzhub/qep-test-specifications` directly
 * (008 — never combine module/service/connector responsibilities).
 */
import type { ResolvedManifestInput } from "../../domain/test-execution/manifest";
import { ExecutionPreconditionError } from "../../shared/errors";
import type {
  SourceResolutionPort,
  SourceResolutionRequest,
} from "../../application/ports";

export type SourceResolveFn = (
  request: SourceResolutionRequest,
) => Promise<ResolvedManifestInput> | ResolvedManifestInput;

/**
 * Production adapter — requires an injected resolver (wired by the Platform
 * Service layer to Plan/Specification services). Throws a controlled
 * precondition error when no resolver is configured, rather than silently
 * fabricating manifest content.
 */
export function createSourceResolutionPort(
  resolve?: SourceResolveFn,
): SourceResolutionPort {
  return {
    portId: "SourceResolutionPort",
    async resolveForSeal(request) {
      if (!resolve) {
        throw new ExecutionPreconditionError(
          "SourceResolutionPort has no resolver configured — cannot seal manifest",
          { tenantId: request.tenantId },
        );
      }
      return resolve(request);
    },
  };
}

/** Fixed-content adapter for tests / static wiring. */
export { createStaticSourceResolutionPort } from "../../application/testing/in-memory-ports";
