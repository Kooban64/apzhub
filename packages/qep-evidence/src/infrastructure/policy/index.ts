/**
 * Policy adapter — APZQEP-ENG-110E.
 * Wires Application EvidenceAccessPolicyService. Does not default-allow.
 */

import type { EvidenceUnitOfWork } from "../../domain/ports/repositories";
import {
  createEvidenceAccessPolicyService,
  createPermissionPort,
  type EvidenceAccessPolicyService,
} from "../../application/security";
import type { PermissionPort } from "../../application/ports";

export type PolicyAdapterScaffoldId = "EvidenceAccessPolicyAdapter";

export interface PolicyAdapterScaffold {
  readonly adapterId: PolicyAdapterScaffoldId;
}

export const EVIDENCE_ACCESS_POLICY_ADAPTER: PolicyAdapterScaffold = {
  adapterId: "EvidenceAccessPolicyAdapter",
};

/**
 * Build the Application policy service from repository UnitOfWork.
 * No external policy engine implementation — reuses approved grant/permission model.
 */
export function createEvidenceAccessPolicyAdapter(input: {
  readonly uow: EvidenceUnitOfWork;
  readonly permissions?: PermissionPort;
}): EvidenceAccessPolicyService {
  return createEvidenceAccessPolicyService({
    uow: input.uow,
    permissions: input.permissions ?? createPermissionPort(),
  });
}
