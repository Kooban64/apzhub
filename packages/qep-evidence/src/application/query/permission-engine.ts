/**
 * Evidence Permission Engine — APZQEP-120-S02.
 *
 * Reusable visibility evaluation for Evidence enumeration and reads.
 * Delegates to EvidenceSecurityGate / AccessPolicy — does NOT invent a
 * second authorisation framework (S01 model preserved).
 */

import type { EvidenceDto } from "../dto/evidence-dto";
import type { EvidenceRequestContext } from "../context";
import type { EvidenceSecurityGate } from "../security/security-gate";
import type { EvidenceAccessDecision } from "../security/types";
import { decisionGrantsAccess } from "../security/types";
import type { EvidenceSecurityOperation } from "../security/operations";

export type EvidencePermissionEngine = {
  readonly engineId: "EvidencePermissionEngine";
  /**
   * Operation-level authorize (audited via gate).
   */
  authorizeEnumeration(
    ctx: EvidenceRequestContext,
    operation: "listEvidence" | "searchEvidence",
  ): Promise<void>;
  /**
   * Per-item read visibility (same rules as getEvidence).
   */
  evaluateReadVisibility(
    ctx: EvidenceRequestContext,
    evidenceId: string,
  ): Promise<EvidenceAccessDecision>;
  /**
   * Filter DTOs to those visible to the principal. Tenant defence-in-depth.
   * Admin short-circuits per-item evaluation within tenant.
   */
  filterVisible(
    ctx: EvidenceRequestContext,
    items: readonly EvidenceDto[],
  ): Promise<EvidenceDto[]>;
  /**
   * Effective constraints for future push-down (S03+). Today: tenant + admin flag.
   */
  effectiveConstraints(ctx: EvidenceRequestContext): {
    readonly tenantId: string;
    readonly principalId: string;
    readonly adminBypassItemAcl: boolean;
  };
};

function isAdmin(ctx: EvidenceRequestContext): boolean {
  return (ctx.permissions ?? []).includes("qep.evidence.admin");
}

export function createEvidencePermissionEngine(
  gate: EvidenceSecurityGate,
): EvidencePermissionEngine {
  return {
    engineId: "EvidencePermissionEngine",

    authorizeEnumeration(ctx, operation) {
      return gate.authorize(ctx, operation as EvidenceSecurityOperation);
    },

    evaluateReadVisibility(ctx, evidenceId) {
      return gate.evaluate(ctx, "getEvidence", { evidenceId });
    },

    async filterVisible(ctx, items) {
      const tenantScoped = items.filter((item) => item.tenantId === ctx.tenantId);
      if (isAdmin(ctx)) {
        return tenantScoped;
      }
      const visible: EvidenceDto[] = [];
      for (const item of tenantScoped) {
        const decision = await gate.evaluate(ctx, "getEvidence", {
          evidenceId: item.id,
        });
        if (decisionGrantsAccess(decision)) {
          visible.push(item);
        }
      }
      return visible;
    },

    effectiveConstraints(ctx) {
      return {
        tenantId: ctx.tenantId,
        principalId: ctx.userId,
        adminBypassItemAcl: isAdmin(ctx),
      };
    },
  };
}
