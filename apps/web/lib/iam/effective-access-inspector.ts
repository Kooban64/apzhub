/**
 * Phase A — thin User Inspector slice: why a member has effective access.
 */

import { resolveStaffFunctionTemplateForOrgJob } from "@apzhub/platform-authorization";

import { resolveTenantEntitlements } from "@/lib/commercial/resolve-entitlements";
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

  const why: string[] = [
    `Org job persona: ${member.personaRoleId} (shell baseline — not product wildcards).`,
  ];
  if (tmpl) {
    why.push(
      `Staff function template "${tmpl.name}" suggests: ${tmpl.suggestedProducts
        .map((p) => p.label)
        .join(", ")}.`,
    );
  }
  why.push(
    `Effective products (org ∩ grant): ${
      entitlements.productKeys.length > 0 ? entitlements.productKeys.join(", ") : "none"
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
    suggestedProducts: (tmpl?.suggestedProducts ?? []).map((p) => ({
      productKey: p.productKey,
      roleId: p.roleId,
      label: p.label,
    })),
    why,
  };
}
