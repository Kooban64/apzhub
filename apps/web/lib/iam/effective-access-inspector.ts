/**
 * Phase A / Stream 4 — User Inspector: why a member has effective access.
 */

import { resolveStaffFunctionTemplateForOrgJob } from "@apzhub/platform-authorization";

import { resolveTenantEntitlements } from "@/lib/commercial/resolve-entitlements";
import {
  listOrgProductSubscriptions,
  listUserProductGrants,
} from "@/lib/commercial/product-access";
import { getOrgMember } from "@/lib/iam/org-member-store";
import { moduleIdsForProductKeys } from "@/lib/commercial/catalogue";

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
  readonly why: readonly string[];
};

export function inspectMemberEffectiveAccess(input: {
  readonly organisationId: string;
  readonly membershipId: string;
}): EffectiveAccessInspection | null {
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
  };
}
