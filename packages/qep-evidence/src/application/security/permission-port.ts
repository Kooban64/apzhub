/**
 * PermissionPort implementation — APZQEP-ENG-110E.
 * Reads permissions from security context. Default-deny.
 */

import { EvidenceForbiddenError } from "../../shared/errors";
import type { EvidenceRequestContext } from "../context";
import type { PermissionPort } from "../ports";

export function createPermissionPort(): PermissionPort {
  return {
    portId: "PermissionPort",
    has(ctx: EvidenceRequestContext, permission: string): boolean {
      const granted = ctx.permissions ?? [];
      return granted.includes(permission) || granted.includes("qep.evidence.admin");
    },
    assertAny(ctx: EvidenceRequestContext, requiredOneOf: readonly string[]): void {
      if (!ctx.tenantId?.trim() || !ctx.userId?.trim()) {
        throw new EvidenceForbiddenError(
          "Authenticated actor and tenant are required",
          {
            outcome: "denied",
            reason: "missing_authenticated_actor_or_tenant",
          },
        );
      }
      if (!requiredOneOf.some((permission) => this.has(ctx, permission))) {
        throw new EvidenceForbiddenError("Caller lacks required Evidence permission", {
          outcome: "denied",
          reason: "insufficient_permission",
          requiredOneOf: [...requiredOneOf],
        });
      }
    },
  };
}
