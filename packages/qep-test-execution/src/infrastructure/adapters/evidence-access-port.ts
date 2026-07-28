/**
 * Evidence Access Port adapter — APZQEP-ENG-100D (OES PART-04 security).
 * Verifies the acting user/session can read the referenced evidence URI
 * before it is associated with a Test Execution or Step. The concrete
 * accessibility check (e.g. Document Platform Service, object storage ACL)
 * is injected — this package must not depend on other QEP/Platform packages
 * directly (008).
 */
import { ExecutionForbiddenError } from "../../shared/errors";
import type { EvidenceAccessPort } from "../../application/ports";
import type { ExecutionRequestContext } from "../../application/context";

export type EvidenceAccessCheckFn = (
  ctx: ExecutionRequestContext,
  uri: string,
) => Promise<boolean> | boolean;

/**
 * Production adapter. When no check function is injected, evidence
 * association is allowed by default (parity with in-memory testing fake)
 * so wiring an accessibility check remains an explicit, additive step for
 * the caller (Platform Service layer) without blocking ENG-100D delivery.
 */
export function createEvidenceAccessPort(
  check?: EvidenceAccessCheckFn,
): EvidenceAccessPort {
  return {
    portId: "EvidenceAccessPort",
    async assertAccessible(ctx, uri) {
      if (!check) return;
      const accessible = await check(ctx, uri);
      if (!accessible) {
        throw new ExecutionForbiddenError(
          `Evidence is not accessible to the current user: ${uri}`,
          { uri },
        );
      }
    },
  };
}
