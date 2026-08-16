/**
 * Stream 1 — commerce organisation onboarding for new buyers.
 * Creates tenant + membership + org-admin + active tenant. No parallel IAM.
 */

import { randomUUID } from "node:crypto";

import {
  DEFAULT_ORG_ADMIN_ROLE_ID,
  getSharedAuthorizationService,
} from "@apzhub/platform-authorization";
import {
  ensurePlatformTenantRow,
  upsertPostgresRoleAssignment,
} from "@apzhub/platform-authorization/postgres";
import { getSharedTenantManagementService } from "@apzhub/platform-identity";

import { switchActiveTenant } from "@/lib/identity/switch-active-tenant";

export type CommerceOnboardOrganisationInput = {
  readonly userId: string;
  readonly name: string;
  readonly slug: string;
};

export type CommerceOnboardOrganisationResult = {
  readonly organisationId: string;
  readonly slug: string;
  readonly name: string;
  readonly activeTenantId: string;
  readonly source: "postgres" | "in_memory";
};

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function onboardCommerceOrganisation(
  input: CommerceOnboardOrganisationInput,
): Promise<CommerceOnboardOrganisationResult> {
  const name = input.name.trim();
  const slug = normalizeSlug(input.slug || name);
  if (!name) throw new Error("commerce.org_name_required");
  if (!slug || slug.length < 2) throw new Error("commerce.org_slug_invalid");

  const organisationId = `t-${randomUUID()}`;

  if (process.env.DATABASE_URL) {
    await ensurePlatformTenantRow({
      tenantId: organisationId,
      slug,
      name,
    });
    const { ensureUserTenantMembership } =
      await import("@apzhub/platform-identity/postgres");
    await ensureUserTenantMembership({
      userId: input.userId,
      tenantId: organisationId,
    });
    await upsertPostgresRoleAssignment({
      userId: input.userId,
      roleId: DEFAULT_ORG_ADMIN_ROLE_ID,
      tenantId: organisationId,
    });
    await upsertPostgresRoleAssignment({
      userId: input.userId,
      roleId: "role-tenant-member",
      tenantId: organisationId,
    });
    const switched = await switchActiveTenant({
      userId: input.userId,
      tenantId: organisationId,
    });
    return {
      organisationId,
      slug,
      name,
      activeTenantId: switched.activeTenantId,
      source: switched.source,
    };
  }

  const service = getSharedTenantManagementService();
  try {
    service.createTenant({
      tenantId: organisationId,
      slug,
      name,
      status: "active",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("already exists")) {
      throw new Error("commerce.org_slug_taken");
    }
    throw error;
  }
  service.assignUserToTenant({
    userId: input.userId,
    tenantId: organisationId,
    isPrimary: true,
  });
  getSharedAuthorizationService().assignRole({
    userId: input.userId,
    roleId: DEFAULT_ORG_ADMIN_ROLE_ID,
    tenantId: organisationId,
  });
  getSharedAuthorizationService().assignRole({
    userId: input.userId,
    roleId: "role-tenant-member",
    tenantId: organisationId,
  });
  const switched = await switchActiveTenant({
    userId: input.userId,
    tenantId: organisationId,
  });

  return {
    organisationId,
    slug,
    name,
    activeTenantId: switched.activeTenantId,
    source: "in_memory",
  };
}
