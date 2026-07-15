import {
  validateUserTenantMembership,
  type TenantMembershipValidationResult,
} from "@apzhub/platform-identity";

import { DEFAULT_LAW_TENANT_ID } from "./law-tenant-ids";
import type { LawApiTenantSource } from "./tenant-resolver";

export interface ValidateLawApiTenantMembershipInput {
  readonly userId: string;
  readonly tenantId: string;
  readonly tenantSource: LawApiTenantSource;
}

/** Validate resolved Law API tenant against platform membership (PRH-007). */
export async function validateLawApiTenantMembership(
  input: ValidateLawApiTenantMembershipInput,
): Promise<TenantMembershipValidationResult> {
  const allowDefaultWithoutMembership =
    input.tenantId === DEFAULT_LAW_TENANT_ID &&
    (input.tenantSource === "development_fallback" || process.env.NODE_ENV === "test");

  return validateUserTenantMembership(input.userId, input.tenantId, {
    allowDefaultWithoutMembership,
  });
}
