/**
 * Ensure Better Auth demo users exist + Postgres authorization role assignments.
 */

import { ensureCredentialUser } from "@apzhub/config";
import {
  ensurePlatformTenantRow,
  seedDefaultAuthorizationRows,
  upsertPostgresRoleAssignment,
} from "@apzhub/platform-authorization/postgres";
import { hashPassword } from "better-auth/crypto";

import {
  DEMO_ORG_TENANT_ID,
  DEMO_PERSONAS,
  isDemoPersonasEnabled,
  type DemoPersona,
} from "@/lib/demo/demo-personas";
import {
  setUserProductGrants,
  startPlanProductSubscriptions,
} from "@/lib/commercial/product-access";
import type { ProductKey } from "@/lib/commercial/catalogue";
import { ensureApzorAllSuitesFree } from "@/lib/commercial/provisioning";
import {
  subscribeOrganisationToPackage,
  subscribeOrganisationToSuites,
} from "@/lib/commercial/provisioning";

async function ensureDemoTenants(): Promise<void> {
  await ensurePlatformTenantRow({
    tenantId: "t0000001-0000-4000-8000-000000000001",
    slug: "apzhub-platform",
    name: "APZHUB Platform",
  });
  await ensurePlatformTenantRow({
    tenantId: DEMO_ORG_TENANT_ID,
    slug: "demo-org",
    name: "Demo Organisation",
  });
  await ensurePlatformTenantRow({
    tenantId: "t-individual-self",
    slug: "individual-self",
    name: "Individual Self",
  });
}

async function ensureAuthUser(persona: DemoPersona): Promise<string> {
  const passwordHash = await hashPassword(persona.password);
  const result = await ensureCredentialUser({
    email: persona.email,
    name: persona.name,
    passwordHash,
    activeTenantId: persona.tenantId,
    emailVerified: true,
  });
  return result.userId;
}

async function assignPersonaRoles(userId: string, persona: DemoPersona): Promise<void> {
  await upsertPostgresRoleAssignment({
    userId,
    roleId: persona.roleId,
    tenantId: persona.tenantId,
  });

  if (persona.kind === "superadmin") {
    await upsertPostgresRoleAssignment({
      userId,
      roleId: "role-platform-admin",
      tenantId: persona.tenantId,
    });
  }

  if (
    persona.kind === "org_admin" ||
    persona.kind === "individual" ||
    persona.kind === "superadmin" ||
    persona.kind === "platform_admin" ||
    persona.kind === "org_member"
  ) {
    await upsertPostgresRoleAssignment({
      userId,
      roleId: "role-qep-operator",
      tenantId: persona.tenantId,
      productKey: "apzqep",
    });
  }

  // Baseline tenant member so home/nav remain usable.
  await upsertPostgresRoleAssignment({
    userId,
    roleId: "role-tenant-member",
    tenantId: persona.tenantId,
  });
}

function seedProductAccess(persona: DemoPersona, userId: string): void {
  if (
    persona.kind !== "org_admin" &&
    persona.kind !== "org_member" &&
    persona.kind !== "individual" &&
    persona.kind !== "superadmin" &&
    persona.kind !== "platform_admin"
  ) {
    return;
  }
  try {
    startPlanProductSubscriptions({
      organisationId: persona.tenantId,
      planId: persona.kind === "individual" ? "plan.individual" : "plan.business",
      status: "active",
      grantUserId: persona.kind === "org_member" ? undefined : userId,
    });
    // SPR-APZPRD-002-A — merge Projects (and pentest for admins) onto plan grants.
    const productKeys = new Set<ProductKey>([
      "qep",
      "projects",
      "pentest",
      "support",
      "time",
      "analytics",
      "workflow",
    ]);
    setUserProductGrants({
      organisationId: persona.tenantId,
      userId,
      productKeys: [...productKeys],
    });
  } catch {
    /* ignore seed races */
  }
}

export async function ensureDemoPersonasSeeded(): Promise<{
  readonly ok: boolean;
  readonly seeded: number;
  readonly disabled?: boolean;
}> {
  if (!isDemoPersonasEnabled()) {
    return { ok: false, seeded: 0, disabled: true };
  }

  await seedDefaultAuthorizationRows();
  await ensureDemoTenants();
  ensureApzorAllSuitesFree();

  // Demo org gets QA suite + first APZPRD slice (Projects) before user grants.
  subscribeOrganisationToSuites({
    organisationId: DEMO_ORG_TENANT_ID,
    suiteIds: ["qa"],
    planId: "plan.business",
  });
  subscribeOrganisationToPackage({
    organisationId: DEMO_ORG_TENANT_ID,
    packageId: "pkg.apzprd.projects",
    planId: "plan.business",
  });
  subscribeOrganisationToPackage({
    organisationId: DEMO_ORG_TENANT_ID,
    packageId: "pkg.apzprd.service",
    planId: "plan.business",
  });
  subscribeOrganisationToPackage({
    organisationId: DEMO_ORG_TENANT_ID,
    packageId: "pkg.apzprd.time",
    planId: "plan.business",
  });
  subscribeOrganisationToPackage({
    organisationId: DEMO_ORG_TENANT_ID,
    packageId: "pkg.apzprd.delivery",
    planId: "plan.business",
  });
  subscribeOrganisationToPackage({
    organisationId: DEMO_ORG_TENANT_ID,
    packageId: "pkg.apzprd.operations",
    planId: "plan.business",
  });
  subscribeOrganisationToPackage({
    organisationId: DEMO_ORG_TENANT_ID,
    packageId: "pkg.apzpen.starter",
    planId: "plan.business",
  });
  subscribeOrganisationToPackage({
    organisationId: "t-individual-self",
    packageId: "pkg.apzprd.projects",
    planId: "plan.individual",
  });
  subscribeOrganisationToPackage({
    organisationId: "t-individual-self",
    packageId: "pkg.apzprd.service",
    planId: "plan.individual",
  });
  subscribeOrganisationToPackage({
    organisationId: "t-individual-self",
    packageId: "pkg.apzprd.time",
    planId: "plan.individual",
  });
  subscribeOrganisationToPackage({
    organisationId: "t-individual-self",
    packageId: "pkg.apzprd.delivery",
    planId: "plan.individual",
  });
  subscribeOrganisationToPackage({
    organisationId: "t-individual-self",
    packageId: "pkg.apzprd.operations",
    planId: "plan.individual",
  });
  subscribeOrganisationToPackage({
    organisationId: "t-individual-self",
    packageId: "pkg.apzpen.starter",
    planId: "plan.individual",
  });

  let seeded = 0;
  for (const persona of DEMO_PERSONAS) {
    const userId = await ensureAuthUser(persona);
    await assignPersonaRoles(userId, persona);
    seedProductAccess(persona, userId);
    seeded += 1;
  }

  // Promote classic e2e / dogfood user when present (roles + product grants).
  try {
    const classic = {
      ...DEMO_PERSONAS[0]!,
      email: "dev@apzhub.local",
      name: "Dev Super Admin",
    };
    const passwordHash = await hashPassword("DevPassword123!");
    const { userId } = await ensureCredentialUser({
      email: classic.email,
      name: classic.name,
      passwordHash,
      activeTenantId: classic.tenantId,
      emailVerified: true,
    });
    await assignPersonaRoles(userId, classic);
    seedProductAccess(classic, userId);
  } catch {
    /* optional */
  }

  return { ok: true, seeded };
}
