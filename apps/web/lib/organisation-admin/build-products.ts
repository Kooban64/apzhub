/**
 * Organisation Admin Products — what the org purchased and can assign.
 * Same Stream 6 grants as People → Products (no duplicate assignment store).
 */

import { eq } from "drizzle-orm";

import {
  getDb,
  platformAuthorizationRole,
  platformAuthorizationTeamRole,
  platformIamGroup,
  user,
} from "@apzhub/config/db";
import { listProductRoleAssignmentsForUser } from "@apzhub/platform-authorization/postgres";
import {
  listMembershipsForTenant,
  listPlatformTenants,
} from "@apzhub/platform-identity/server";

import {
  SUITE_CATALOGUE,
  getProduct,
  type ProductKey,
  type SuiteId,
} from "@/lib/commercial/catalogue";
import {
  listAllUserProductGrantsForOrgDurable,
  listOrgProductSubscriptionsDurable,
} from "@/lib/commercial/product-access-durable";
import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";
import {
  ORG_ADMIN_SUITE_BRAND,
  ORG_ADMIN_SUITE_SECTION,
  orgAdminProductLabel,
} from "@/lib/organisation-admin/product-labels";

export type OrganisationAdminProductsPayload = {
  readonly generatedAt: string;
  readonly tenant: {
    readonly tenantId: string;
    readonly name: string;
    readonly status: string;
  };
  readonly suites: readonly {
    readonly suiteId: SuiteId;
    readonly section: string;
    readonly brand: string;
    readonly status: "active" | "not_subscribed" | "coming_soon";
    readonly assignedUsers: number;
    readonly capabilities: readonly {
      readonly productKey: string;
      readonly label: string;
      readonly enabled: boolean;
    }[];
    readonly href: string;
    readonly manageAccessHref: string;
  }[];
  readonly note: string;
};

export type OrganisationAdminProductDetailPayload = {
  readonly generatedAt: string;
  readonly tenant: OrganisationAdminProductsPayload["tenant"];
  readonly suiteId: SuiteId;
  readonly brand: string;
  readonly subscribed: boolean;
  readonly assignedUsers: number;
  readonly assignedTeams: number;
  readonly capabilities: readonly {
    readonly productKey: string;
    readonly label: string;
    readonly enabled: boolean;
  }[];
  readonly users: readonly {
    readonly userId: string;
    readonly displayName: string;
    readonly productKey: string;
    readonly roleName: string;
    readonly provenance: "direct" | "team";
    readonly provenanceLabel: string;
    readonly href: string;
  }[];
  readonly teams: readonly {
    readonly teamId: string;
    readonly teamName: string;
    readonly productKey: string;
    readonly roleName: string;
    readonly href: string;
  }[];
  readonly roles: readonly {
    readonly productKey: string;
    readonly productLabel: string;
    readonly roleId: string;
    readonly roleName: string;
  }[];
  readonly provisioning: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly backHref: string;
};

function suiteKeys(suiteId: SuiteId): readonly ProductKey[] {
  return SUITE_CATALOGUE.find((s) => s.suiteId === suiteId)?.productKeys ?? [];
}

export async function buildOrganisationAdminProducts(
  tenantId: string,
): Promise<OrganisationAdminProductsPayload | null> {
  const tenants = await listPlatformTenants().catch(() => []);
  const tenant = tenants.find((t) => t.tenantId === tenantId);
  if (!tenant) return null;

  const [subs, grants] = await Promise.all([
    listOrgProductSubscriptionsDurable(tenantId).catch(() => []),
    listAllUserProductGrantsForOrgDurable(tenantId).catch(() => []),
  ]);
  const subscribed = new Set(
    subs.filter((s) => s.status === "active").map((s) => s.productKey),
  );

  const display = SUITE_CATALOGUE.filter((s) => s.suiteId !== "law");
  const suites = display.map((suite) => {
    const keys = suite.productKeys;
    const anySub = keys.some((k) => subscribed.has(k));
    const assignedUsers = new Set(
      grants.filter((g) => keys.includes(g.productKey)).map((g) => g.userId),
    ).size;
    return {
      suiteId: suite.suiteId,
      section: ORG_ADMIN_SUITE_SECTION[suite.suiteId],
      brand: ORG_ADMIN_SUITE_BRAND[suite.suiteId],
      status: (anySub
        ? "active"
        : suite.status === "coming_soon"
          ? "coming_soon"
          : "not_subscribed") as "active" | "not_subscribed" | "coming_soon",
      assignedUsers,
      capabilities: keys.map((productKey) => ({
        productKey,
        label: orgAdminProductLabel(productKey),
        enabled: subscribed.has(productKey),
      })),
      href: `${ORGANISATION_ADMIN_BASE}/products/${encodeURIComponent(suite.suiteId)}`,
      manageAccessHref: `${ORGANISATION_ADMIN_BASE}/roles-access`,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      status: tenant.status,
    },
    suites,
    note: "Counts use durable org subscriptions and user product grants. Provider engines are never shown.",
  };
}

export async function buildOrganisationAdminProductDetail(
  tenantId: string,
  suiteIdRaw: string,
): Promise<OrganisationAdminProductDetailPayload | null> {
  const suite = SUITE_CATALOGUE.find((s) => s.suiteId === suiteIdRaw);
  if (!suite || suite.suiteId === "law") return null;

  const list = await buildOrganisationAdminProducts(tenantId);
  if (!list) return null;

  const keys = new Set(suite.productKeys);
  const card = list.suites.find((s) => s.suiteId === suite.suiteId);
  if (!card) return null;

  const memberships = await listMembershipsForTenant(tenantId).catch(() => []);
  const userIds = [
    ...new Set(memberships.filter((m) => m.status === "active").map((m) => m.userId)),
  ];
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

  const usersOut: OrganisationAdminProductDetailPayload["users"] = [];
  for (const userId of userIds) {
    const assignments = await listProductRoleAssignmentsForUser({
      userId,
      tenantId,
    }).catch(() => []);
    for (const a of assignments) {
      if (!keys.has(a.productKey as ProductKey)) continue;
      const u = userById.get(userId);
      const teamName =
        a.sourceKind === "team" ? groupById.get(a.sourceId)?.name : undefined;
      usersOut.push({
        userId,
        displayName: u?.name ?? u?.email ?? userId,
        productKey: a.productKey,
        roleName: a.roleName,
        provenance: a.sourceKind,
        provenanceLabel:
          a.sourceKind === "team"
            ? `Inherited from ${teamName ?? "team"}`
            : "Direct assignment",
        href: `${ORGANISATION_ADMIN_BASE}/people/${encodeURIComponent(userId)}`,
      });
    }
  }

  const teamRoles = await getDb()
    .select()
    .from(platformAuthorizationTeamRole)
    .where(eq(platformAuthorizationTeamRole.tenantId, tenantId))
    .catch(() => []);
  const roles = await getDb()
    .select()
    .from(platformAuthorizationRole)
    .catch(() => []);
  const roleById = new Map(roles.map((r) => [r.roleId, r]));

  const teamsOut = teamRoles
    .map((tr) => {
      const role = roleById.get(tr.roleId);
      const productKey = tr.productKey ?? role?.productKey ?? "";
      if (!keys.has(productKey as ProductKey)) return null;
      const team = groupById.get(tr.teamId);
      return {
        teamId: tr.teamId,
        teamName: team?.name ?? tr.teamId,
        productKey,
        roleName: role?.name ?? tr.roleId,
        href: `${ORGANISATION_ADMIN_BASE}/teams/${encodeURIComponent(tr.teamId)}`,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const { listProductRoles } = await import("@apzhub/platform-authorization");
  const catalogueRoles = listProductRoles()
    .filter((r) => r.productKey && keys.has(r.productKey as ProductKey))
    .map((r) => ({
      productKey: r.productKey!,
      productLabel: orgAdminProductLabel(r.productKey!),
      roleId: r.roleId,
      roleName: r.name,
    }));

  return {
    generatedAt: new Date().toISOString(),
    tenant: list.tenant,
    suiteId: suite.suiteId,
    brand: ORG_ADMIN_SUITE_BRAND[suite.suiteId],
    subscribed: card.status === "active",
    assignedUsers: new Set(usersOut.map((u) => u.userId)).size,
    assignedTeams: new Set(teamsOut.map((t) => t.teamId)).size,
    capabilities: card.capabilities,
    users: usersOut,
    teams: teamsOut,
    roles: catalogueRoles,
    provisioning: {
      availability: "not_configured",
      message:
        "Product delivery job queue is not configured — see Provisioning for entitlement readiness",
    },
    backHref: `${ORGANISATION_ADMIN_BASE}/products`,
  };
}

/** Guard helper: product must be org-subscribed before assignment UX offers it. */
export async function isProductAssignableForTenant(
  tenantId: string,
  productKey: string,
): Promise<boolean> {
  const subs = await listOrgProductSubscriptionsDurable(tenantId).catch(() => []);
  return subs.some((s) => s.productKey === productKey && s.status === "active");
}

export function productCatalogueLabel(productKey: string): string {
  return (
    orgAdminProductLabel(productKey) ||
    getProduct(productKey as ProductKey)?.name ||
    productKey
  );
}

export { suiteKeys };
