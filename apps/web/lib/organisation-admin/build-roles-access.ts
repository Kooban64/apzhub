/**
 * Organisation Admin Roles & Access — access map across products (session tenant).
 * Product role names from catalogue — never invented mockup names.
 */

import { and, eq } from "drizzle-orm";

import {
  getDb,
  platformAuthorizationRole,
  platformAuthorizationTeamRole,
  platformIamGroup,
  user,
} from "@apzhub/config/db";
import { listProductRoles } from "@apzhub/platform-authorization";
import { listProductRoleAssignmentsForUser } from "@apzhub/platform-authorization/postgres";
import {
  listMembershipsForTenant,
  listPlatformTenants,
} from "@apzhub/platform-identity/server";

import { listOrgProductSubscriptionsDurable } from "@/lib/commercial/product-access-durable";
import {
  listProfessionalToolGrants,
  listProfessionalToolsCatalogue,
} from "@/lib/iam/professional-tools";
import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";
import {
  ORG_ADMIN_SUITE_SECTION,
  orgAdminProductLabel,
} from "@/lib/organisation-admin/product-labels";
import {
  SUITE_CATALOGUE,
  type ProductKey,
  type SuiteId,
} from "@/lib/commercial/catalogue";

export type AccessProvenance = "direct" | "team";

export type OrganisationAdminAccessRow = {
  readonly userId: string;
  readonly displayName: string;
  readonly productKey: string;
  readonly productLabel: string;
  readonly roleName: string;
  readonly roleId: string;
  readonly provenance: AccessProvenance;
  readonly provenanceLabel: string;
  readonly scopeLabel: string;
  readonly personHref: string;
  readonly productHref: string | null;
};

export type OrganisationAdminRolesAccessPayload = {
  readonly generatedAt: string;
  readonly tenant: {
    readonly tenantId: string;
    readonly name: string;
    readonly status: string;
  };
  readonly users: readonly OrganisationAdminAccessRow[];
  readonly teams: readonly {
    readonly teamId: string;
    readonly teamName: string;
    readonly productKey: string;
    readonly productLabel: string;
    readonly roleName: string;
    readonly href: string;
  }[];
  readonly productRoles: readonly {
    readonly section: string;
    readonly suiteId: SuiteId;
    readonly suiteBrand: string;
    readonly products: readonly {
      readonly productKey: string;
      readonly productLabel: string;
      readonly roles: readonly {
        readonly roleId: string;
        readonly roleName: string;
        readonly slug: string;
      }[];
    }[];
  }[];
  readonly professionalTools: {
    readonly availability: "ok" | "empty" | "not_configured";
    readonly message: string;
    readonly catalogue: readonly {
      readonly toolKey: string;
      readonly label: string;
    }[];
    readonly grants: readonly {
      readonly userId: string;
      readonly displayName: string;
      readonly toolKey: string;
      readonly label: string;
      readonly status: string;
    }[];
  };
  readonly subscribedProductKeys: readonly string[];
  readonly note: string;
  readonly permissionGaps: readonly string[];
};

function suiteForProduct(productKey: string): SuiteId | null {
  const suite = SUITE_CATALOGUE.find((s) =>
    s.productKeys.includes(productKey as ProductKey),
  );
  return suite?.suiteId ?? null;
}

function productHref(productKey: string): string | null {
  const suiteId = suiteForProduct(productKey);
  if (!suiteId || suiteId === "law") return null;
  return `${ORGANISATION_ADMIN_BASE}/products/${encodeURIComponent(suiteId)}`;
}

export async function buildOrganisationAdminRolesAccess(
  tenantId: string,
): Promise<OrganisationAdminRolesAccessPayload | null> {
  const tenants = await listPlatformTenants().catch(() => []);
  const tenant = tenants.find((t) => t.tenantId === tenantId);
  if (!tenant) return null;

  const memberships = await listMembershipsForTenant(tenantId).catch(() => []);
  const active = memberships.filter((m) => m.status === "active");
  const userIds = [...new Set(active.map((m) => m.userId))];

  const userRows =
    userIds.length === 0
      ? []
      : await getDb()
          .select({ id: user.id, name: user.name, email: user.email })
          .from(user)
          .catch(() => []);
  const userById = new Map(userRows.map((u) => [u.id, u]));

  const groups = await getDb()
    .select()
    .from(platformIamGroup)
    .where(eq(platformIamGroup.tenantId, tenantId))
    .catch(() => []);
  const groupById = new Map(groups.map((g) => [g.id, g]));

  const userRowsOut: OrganisationAdminAccessRow[] = [];
  for (const userId of userIds) {
    const assignments = await listProductRoleAssignmentsForUser({
      userId,
      tenantId,
    }).catch(() => []);
    const u = userById.get(userId);
    const displayName = u?.name ?? u?.email ?? userId;
    for (const a of assignments) {
      const teamName =
        a.sourceKind === "team" ? groupById.get(a.sourceId)?.name : undefined;
      userRowsOut.push({
        userId,
        displayName,
        productKey: a.productKey,
        productLabel: orgAdminProductLabel(a.productKey),
        roleName: a.roleName,
        roleId: a.roleId,
        provenance: a.sourceKind,
        provenanceLabel:
          a.sourceKind === "team"
            ? `Inherited from ${teamName ?? "team"}`
            : "Direct assignment",
        scopeLabel: "Organisation",
        personHref: `${ORGANISATION_ADMIN_BASE}/people/${encodeURIComponent(userId)}`,
        productHref: productHref(a.productKey, tenantId),
      });
    }
  }

  const teamRoleRows = await getDb()
    .select()
    .from(platformAuthorizationTeamRole)
    .where(
      and(
        eq(platformAuthorizationTeamRole.tenantId, tenantId),
        eq(platformAuthorizationTeamRole.status, "active"),
      ),
    )
    .catch(() => []);
  const roles = await getDb()
    .select()
    .from(platformAuthorizationRole)
    .catch(() => []);
  const roleById = new Map(roles.map((r) => [r.roleId, r]));

  const teamsTab = teamRoleRows.map((tr) => {
    const role = roleById.get(tr.roleId);
    const productKey = tr.productKey ?? role?.productKey ?? "unknown";
    const team = groupById.get(tr.teamId);
    return {
      teamId: tr.teamId,
      teamName: team?.name ?? tr.teamId,
      productKey,
      productLabel: orgAdminProductLabel(productKey),
      roleName: role?.name ?? tr.roleId,
      href: `${ORGANISATION_ADMIN_BASE}/teams/${encodeURIComponent(tr.teamId)}`,
    };
  });

  const catalogueRoles = listProductRoles();
  const displaySuites = SUITE_CATALOGUE.filter((s) => s.suiteId !== "law");
  const productRoles = displaySuites.map((suite) => {
    const products = suite.productKeys.map((productKey) => {
      const rolesForProduct = catalogueRoles
        .filter((r) => r.productKey === productKey)
        .map((r) => ({
          roleId: r.roleId,
          roleName: r.name,
          slug: r.slug,
        }));
      return {
        productKey,
        productLabel: orgAdminProductLabel(productKey),
        roles: rolesForProduct,
      };
    });
    return {
      section: ORG_ADMIN_SUITE_SECTION[suite.suiteId],
      suiteId: suite.suiteId,
      suiteBrand:
        suite.suiteId === "qa"
          ? "APZQEP"
          : suite.suiteId === "pentest"
            ? "APZPEN"
            : suite.suiteId === "productivity"
              ? "APZPRD"
              : suite.name,
      products,
    };
  });

  const subs = await listOrgProductSubscriptionsDurable(tenantId).catch(() => []);
  const subscribedProductKeys = subs
    .filter((s) => s.status === "active")
    .map((s) => s.productKey);

  const catalogue = listProfessionalToolsCatalogue();
  const allToolGrants = listProfessionalToolGrants({
    organisationId: tenantId,
    activeOnly: true,
  });
  const toolGrants = allToolGrants.map((g) => {
    const tool = catalogue.find((t) => t.id === g.toolId);
    const u = userById.get(g.userId);
    return {
      userId: g.userId,
      displayName: u?.name ?? u?.email ?? g.userId,
      toolKey: g.toolId,
      label: tool?.label ?? g.toolId,
      status: g.revokedAt ? "revoked" : "granted",
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      status: tenant.status,
    },
    users: userRowsOut,
    teams: teamsTab,
    productRoles,
    professionalTools: {
      availability:
        toolGrants.length > 0
          ? "ok"
          : catalogue.length > 0
            ? "empty"
            : "not_configured",
      message:
        toolGrants.length > 0
          ? "Professional tool grants for this organisation"
          : "No professional tool grants for members of this organisation",
      catalogue: catalogue.map((t) => ({
        toolKey: t.id,
        label: t.label,
      })),
      grants: toolGrants,
    },
    subscribedProductKeys,
    note: "APZPRD is a suite of independent product role models — not one shared role. Direct vs inherited (team) provenance is shown on the Users tab.",
    permissionGaps: [
      "Product assignment write is not independently gated (entitlement.manage unused by org-admin)",
      "No provisioning.* permission in catalogue",
    ],
  };
}
