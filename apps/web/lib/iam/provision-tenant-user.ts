/**
 * Phase A vertical — create + provision a tenant user from a staff-function template.
 * Extends BetterAuth + PermissionService + product grants. No parallel IAM.
 */

import { randomBytes } from "node:crypto";

import { ensureCredentialUser } from "@apzhub/config";
import {
  getStaffFunctionTemplate,
  resolveStaffFunctionTemplateForOrgJob,
  STAFF_FUNCTION_CUSTOMER_SUPPORT_ID,
  type StaffFunctionTemplate,
} from "@apzhub/platform-authorization";
import {
  seedDefaultAuthorizationRows,
  upsertPostgresRoleAssignment,
} from "@apzhub/platform-authorization/postgres";
import { hashPassword } from "better-auth/crypto";

import type { ProductKey } from "@/lib/commercial/catalogue";
import {
  listOrgProductSubscriptions,
  setUserProductGrants,
} from "@/lib/commercial/product-access";
import {
  inviteOrgMember,
  setOrgMemberStatus,
  type OrgMemberRecord,
} from "@/lib/iam/org-member-store";

export type ProvisionTenantUserInput = {
  readonly organisationId: string;
  readonly email: string;
  readonly displayName: string;
  readonly invitedBy: string;
  /** Staff function template id (preferred) or org-job persona role id. */
  readonly staffFunctionId?: string;
  readonly orgJobRoleId?: string;
  /** Optional password; generated when omitted (returned once). */
  readonly temporaryPassword?: string;
  /** Override suggested products (must be org-subscribed). */
  readonly productKeys?: readonly ProductKey[];
};

export type ProvisionTenantUserResult = {
  readonly member: OrgMemberRecord;
  readonly userId: string;
  readonly created: boolean;
  readonly temporaryPassword: string;
  readonly staffFunction: StaffFunctionTemplate;
  readonly productKeys: readonly ProductKey[];
  readonly productRoleIds: readonly string[];
  readonly effectiveAccessSummary: {
    readonly orgJobRoleId: string;
    readonly products: readonly {
      readonly productKey: string;
      readonly roleId: string;
      readonly label: string;
    }[];
  };
};

function resolveTemplate(input: ProvisionTenantUserInput): StaffFunctionTemplate {
  if (input.staffFunctionId?.trim()) {
    const byId = getStaffFunctionTemplate(input.staffFunctionId.trim());
    if (!byId) throw new Error("iam.provision.staff_function_unknown");
    return byId;
  }
  const orgJob = input.orgJobRoleId?.trim() || "role-support-agent";
  const byJob = resolveStaffFunctionTemplateForOrgJob(orgJob);
  if (byJob) return byJob;
  // Fallback: Customer Support template when org-job is support-agent without match.
  if (orgJob === "role-support-agent") {
    return getStaffFunctionTemplate(STAFF_FUNCTION_CUSTOMER_SUPPORT_ID)!;
  }
  throw new Error("iam.provision.staff_function_required");
}

function generateTemporaryPassword(): string {
  return `Apz-${randomBytes(9).toString("base64url")}!1`;
}

async function ensureTenantMembership(userId: string, tenantId: string): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const { ensureUserTenantMembership } =
      await import("@apzhub/platform-identity/postgres");
    await ensureUserTenantMembership({ userId, tenantId });
  } catch {
    /* identity postgres optional in unit tests; tenant must already exist in dogfood */
  }
}

/**
 * Create BetterAuth user → org member → product grants → product role assignments.
 * Staff function is recorded as org-job persona; access comes from product roles.
 */
export async function provisionTenantUserFromStaffFunction(
  input: ProvisionTenantUserInput,
): Promise<ProvisionTenantUserResult> {
  const staffFunction = resolveTemplate(input);
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("iam.invite.email_invalid");

  const temporaryPassword =
    input.temporaryPassword?.trim() || generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  await seedDefaultAuthorizationRows();

  const { userId, created } = await ensureCredentialUser({
    email,
    name: input.displayName.trim() || email.split("@")[0] || "User",
    passwordHash,
    activeTenantId: input.organisationId,
    emailVerified: true,
  });

  await ensureTenantMembership(userId, input.organisationId);

  const orgProducts = new Set(
    listOrgProductSubscriptions(input.organisationId).map((s) => s.productKey),
  );
  const suggested = staffFunction.suggestedProducts.map((p) => p.productKey);
  const requested =
    input.productKeys && input.productKeys.length > 0
      ? input.productKeys
      : (suggested as ProductKey[]);
  const productKeys = requested.filter((key): key is ProductKey =>
    orgProducts.has(key as ProductKey),
  );

  const productHints = staffFunction.suggestedProducts.filter((hint) =>
    productKeys.includes(hint.productKey as ProductKey),
  );

  // Org-job persona = TENANT_BASE shell only (not product wildcards).
  // Deliberately do NOT assign role-tenant-member (fat wildcard set).
  await upsertPostgresRoleAssignment({
    userId,
    roleId: staffFunction.orgJobRoleId,
    tenantId: input.organisationId,
  });

  const productRoleIds: string[] = [];
  for (const hint of productHints) {
    await upsertPostgresRoleAssignment({
      userId,
      roleId: hint.roleId,
      tenantId: input.organisationId,
      productKey: hint.productKey,
    });
    productRoleIds.push(hint.roleId);
  }

  if (productKeys.length > 0) {
    setUserProductGrants({
      organisationId: input.organisationId,
      userId,
      productKeys,
    });
  }

  const member = inviteOrgMember({
    organisationId: input.organisationId,
    email,
    personaRoleId: staffFunction.orgJobRoleId,
    invitedBy: input.invitedBy,
    userId,
    displayName: input.displayName.trim() || undefined,
  });

  const activated = setOrgMemberStatus({
    organisationId: input.organisationId,
    membershipId: member.membershipId,
    status: "active",
  });

  return {
    member: activated,
    userId,
    created,
    temporaryPassword,
    staffFunction,
    productKeys,
    productRoleIds,
    effectiveAccessSummary: {
      orgJobRoleId: staffFunction.orgJobRoleId,
      products: productHints.map((h) => ({
        productKey: h.productKey,
        roleId: h.roleId,
        label: h.label,
      })),
    },
  };
}
