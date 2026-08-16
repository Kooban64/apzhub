/**
 * Stream 6 flagship — User Inspector: explain-why effective access.
 * Tabs: Overview · Products · Roles · Scopes · Professional Tools · Provisioning.
 */

import { resolveStaffFunctionTemplateForOrgJob } from "@apzhub/platform-authorization";
import { resolveSessionAuthorization } from "@apzhub/platform-authorization/server";

import { resolveTenantEntitlements } from "@/lib/commercial/resolve-entitlements";
import {
  listOrgProductSubscriptions,
  listUserProductGrants,
} from "@/lib/commercial/product-access";
import { getProduct, moduleIdsForProductKeys } from "@/lib/commercial/catalogue";
import { getOrgMember } from "@/lib/iam/org-member-store";
import {
  listProfessionalToolGrants,
  listProfessionalToolsCatalogue,
} from "@/lib/iam/professional-tools";
import { PROJECTS_SCOPE_PREFIX } from "@/lib/projects/project-scope";
import { SOURCE_REPO_SCOPE_PREFIX } from "@/lib/source/repo-scope";
import { SUPPORT_QUEUE_SCOPE_PREFIX } from "@/lib/support/queue-scope";

export type ProductAccessLine = {
  readonly productKey: string;
  readonly displayName: string;
  readonly status:
    "granted" | "org_subscribed_user_denied" | "org_not_subscribed" | "suggested_only";
  readonly why: string;
};

export type RoleAccessLine = {
  readonly source: "org_job" | "staff_function_hint" | "authz_assignment";
  readonly id: string;
  readonly label: string;
  readonly why: string;
};

export type ScopeAccessLine = {
  readonly kind: "support.queue" | "projects.project" | "source.repo";
  readonly resourceId: string;
  readonly grantKey: string;
  readonly why: string;
};

export type ProfessionalToolAccessLine = {
  readonly toolId: string;
  readonly label: string;
  readonly status: "granted" | "not_granted";
  readonly expiresAt?: string;
  readonly why: string;
};

export type EffectiveAccessInspection = {
  readonly membershipId: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly email: string;
  readonly status: string;
  readonly orgJobRoleId: string;
  readonly staffFunctionId: string | null;
  readonly staffFunctionName: string | null;
  readonly productKeys: readonly string[];
  readonly moduleIds: readonly string[];
  readonly orgProductKeys: readonly string[];
  readonly productRoles: readonly {
    readonly productKey: string;
    readonly roleHint: string;
  }[];
  readonly provisionStatus:
    "invited" | "active" | "suspended" | "pending_user" | "unknown";
  readonly suggestedProducts: readonly {
    readonly productKey: string;
    readonly roleId: string;
    readonly label: string;
  }[];
  /** Flattened explain-why (Overview + legacy clients). */
  readonly why: readonly string[];
  readonly tabs: {
    readonly products: readonly ProductAccessLine[];
    readonly roles: readonly RoleAccessLine[];
    readonly scopes: readonly ScopeAccessLine[];
    readonly professionalTools: readonly ProfessionalToolAccessLine[];
    readonly provisioning: {
      readonly provisionStatus: EffectiveAccessInspection["provisionStatus"];
      readonly membershipStatus: string;
      readonly userId: string;
      readonly why: readonly string[];
    };
  };
};

function parseScopeLines(permissions: readonly string[]): ScopeAccessLine[] {
  const lines: ScopeAccessLine[] = [];
  for (const grant of permissions) {
    if (grant.startsWith(SUPPORT_QUEUE_SCOPE_PREFIX)) {
      const resourceId = grant.slice(SUPPORT_QUEUE_SCOPE_PREFIX.length);
      if (resourceId) {
        lines.push({
          kind: "support.queue",
          resourceId,
          grantKey: grant,
          why: `Support queue scope grant ${grant} — tickets/groups outside this queue are denied.`,
        });
      }
    } else if (grant.startsWith(PROJECTS_SCOPE_PREFIX)) {
      const resourceId = grant.slice(PROJECTS_SCOPE_PREFIX.length);
      if (resourceId) {
        lines.push({
          kind: "projects.project",
          resourceId,
          grantKey: grant,
          why: `Projects scope grant ${grant} — other projects are denied.`,
        });
      }
    } else if (grant.startsWith(SOURCE_REPO_SCOPE_PREFIX)) {
      const resourceId = grant.slice(SOURCE_REPO_SCOPE_PREFIX.length);
      if (resourceId) {
        lines.push({
          kind: "source.repo",
          resourceId,
          grantKey: grant,
          why: `Source repository scope grant ${grant} — other repos are denied.`,
        });
      }
    }
  }
  return lines;
}

function buildProductLines(input: {
  readonly orgProducts: readonly string[];
  readonly effectiveProducts: readonly string[];
  readonly suggestedKeys: readonly string[];
}): ProductAccessLine[] {
  const keys = new Set([
    ...input.orgProducts,
    ...input.effectiveProducts,
    ...input.suggestedKeys,
  ]);
  return [...keys].sort().map((productKey) => {
    const displayName = getProduct(productKey)?.name ?? productKey;
    const orgHas = input.orgProducts.includes(productKey);
    const userHas = input.effectiveProducts.includes(productKey);
    const suggested = input.suggestedKeys.includes(productKey);
    if (userHas) {
      return {
        productKey,
        displayName,
        status: "granted" as const,
        why: `Granted — org subscribed and user product grant includes ${productKey}.`,
      };
    }
    if (orgHas) {
      return {
        productKey,
        displayName,
        status: "org_subscribed_user_denied" as const,
        why: `Denied — org is subscribed to ${productKey}, but this user has no product grant.`,
      };
    }
    if (suggested) {
      return {
        productKey,
        displayName,
        status: "suggested_only" as const,
        why: `Suggested by staff-function template only — org not subscribed and no user grant.`,
      };
    }
    return {
      productKey,
      displayName,
      status: "org_not_subscribed" as const,
      why: `Denied — organisation is not subscribed to ${productKey}.`,
    };
  });
}

export async function inspectMemberEffectiveAccess(input: {
  readonly organisationId: string;
  readonly membershipId: string;
}): Promise<EffectiveAccessInspection | null> {
  const member = getOrgMember(input.organisationId, input.membershipId);
  if (!member || member.status === "removed") return null;

  const tmpl = resolveStaffFunctionTemplateForOrgJob(member.personaRoleId);
  const entitlements = resolveTenantEntitlements({
    organisationId: input.organisationId,
    userId: member.userId,
  });
  const grants = listUserProductGrants({
    organisationId: input.organisationId,
    userId: member.userId,
  });
  const orgProducts = listOrgProductSubscriptions(input.organisationId).map(
    (s) => s.productKey,
  );

  const productRoles = (tmpl?.suggestedProducts ?? [])
    .filter((p) => entitlements.productKeys.includes(p.productKey))
    .map((p) => ({
      productKey: p.productKey,
      roleHint: p.roleId,
    }));

  const provisionStatus: EffectiveAccessInspection["provisionStatus"] =
    member.status === "invited"
      ? "invited"
      : member.status === "suspended"
        ? "suspended"
        : member.userId.startsWith("pending:")
          ? "pending_user"
          : member.status === "active"
            ? "active"
            : "unknown";

  const authz = await resolveSessionAuthorization({
    userId: member.userId.startsWith("pending:") ? undefined : member.userId,
    tenantId: input.organisationId,
    productKey: "platform",
    provisionIfEmpty: false,
  });

  const roleLines: RoleAccessLine[] = [
    {
      source: "org_job",
      id: member.personaRoleId,
      label: member.personaRoleId,
      why: "Org job persona — shell baseline only; does not grant product wildcards.",
    },
  ];
  if (tmpl) {
    roleLines.push({
      source: "staff_function_hint",
      id: tmpl.id,
      label: tmpl.name,
      why: "Staff function template suggests products/roles; admin must still assign grants.",
    });
    for (const hint of tmpl.suggestedProducts) {
      roleLines.push({
        source: "staff_function_hint",
        id: hint.roleId,
        label: `${hint.label} (${hint.productKey})`,
        why: `Template suggests product role ${hint.roleId} when ${hint.productKey} is granted.`,
      });
    }
  }
  for (const roleSlug of authz.roles) {
    roleLines.push({
      source: "authz_assignment",
      id: roleSlug,
      label: roleSlug,
      why: "Active AuthZ role assignment for this user in the organisation tenant.",
    });
  }

  const productLines = buildProductLines({
    orgProducts,
    effectiveProducts: entitlements.productKeys,
    suggestedKeys: (tmpl?.suggestedProducts ?? []).map((p) => p.productKey),
  });

  const scopeLinesMutable = [...parseScopeLines(authz.permissions)];
  if (scopeLinesMutable.length === 0) {
    scopeLinesMutable.push({
      kind: "support.queue",
      resourceId: "*",
      grantKey: "(none)",
      why: "No resource-scope grants — Support/Projects/Source remain unrestricted by scope (permission gates still apply).",
    });
  }
  const scopeLines = scopeLinesMutable;

  const ptGrants = listProfessionalToolGrants({
    organisationId: input.organisationId,
    activeOnly: true,
  }).filter((g) => g.userId === member.userId);
  const ptLines: ProfessionalToolAccessLine[] = listProfessionalToolsCatalogue().map(
    (tool) => {
      const grant = ptGrants.find((g) => g.toolId === tool.id);
      if (grant) {
        return {
          toolId: tool.id,
          label: tool.label,
          status: "granted" as const,
          expiresAt: grant.expiresAt,
          why: `Granted until ${grant.expiresAt} — reason: ${grant.reason}.`,
        };
      }
      return {
        toolId: tool.id,
        label: tool.label,
        status: "not_granted" as const,
        why: "Not granted — Professional Tools are independent of product access.",
      };
    },
  );

  const provisioningWhy = [
    `Membership status: ${member.status}.`,
    `Provision status: ${provisionStatus}.`,
    member.userId.startsWith("pending:")
      ? "User record is pending BetterAuth bind — complete invite/provision."
      : `Bound user id: ${member.userId}.`,
  ];

  const why: string[] = [
    `Org job persona: ${member.personaRoleId} (shell baseline — not product wildcards).`,
    `Membership status: ${member.status}; provision: ${provisionStatus}.`,
  ];
  if (tmpl) {
    why.push(
      `Staff function template "${tmpl.name}" suggests: ${tmpl.suggestedProducts
        .map((p) => p.label)
        .join(", ")}.`,
    );
  }
  why.push(
    `Org entitled products: ${orgProducts.length > 0 ? orgProducts.join(", ") : "none"}.`,
  );
  why.push(
    `User product grants: ${
      grants.length > 0 ? grants.map((g) => g.productKey).join(", ") : "none"
    }.`,
  );
  why.push(
    `Effective products (org ∩ grant): ${
      entitlements.productKeys.length > 0 ? entitlements.productKeys.join(", ") : "none"
    }.`,
  );
  if (productRoles.length > 0) {
    why.push(
      `Product role hints: ${productRoles
        .map((r) => `${r.productKey}→${r.roleHint}`)
        .join(", ")}.`,
    );
  }
  why.push(
    `Resource scopes: ${
      scopeLines.filter((s) => s.grantKey !== "(none)").length > 0
        ? scopeLines
            .filter((s) => s.grantKey !== "(none)")
            .map((s) => s.grantKey)
            .join(", ")
        : "none (unrestricted by scope)"
    }.`,
  );
  why.push(
    `Professional tools: ${
      ptLines
        .filter((t) => t.status === "granted")
        .map((t) => t.toolId)
        .join(", ") || "none"
    }.`,
  );
  why.push(
    "Search, Quick Actions, Activity Bar, and Home use the same effective product set.",
  );

  return {
    membershipId: member.membershipId,
    organisationId: member.organisationId,
    userId: member.userId,
    email: member.email,
    status: member.status,
    orgJobRoleId: member.personaRoleId,
    staffFunctionId: tmpl?.id ?? null,
    staffFunctionName: tmpl?.name ?? null,
    productKeys: entitlements.productKeys,
    moduleIds: moduleIdsForProductKeys(entitlements.productKeys),
    orgProductKeys: orgProducts,
    productRoles,
    provisionStatus,
    suggestedProducts: (tmpl?.suggestedProducts ?? []).map((p) => ({
      productKey: p.productKey,
      roleId: p.roleId,
      label: p.label,
    })),
    why,
    tabs: {
      products: productLines,
      roles: roleLines,
      scopes: scopeLines,
      professionalTools: ptLines,
      provisioning: {
        provisionStatus,
        membershipStatus: member.status,
        userId: member.userId,
        why: provisioningWhy,
      },
    },
  };
}
