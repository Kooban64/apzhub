import type { AccessSourceVisibility } from "@/lib/admin/access/access-source-visibility";
import type { AdminAccessData } from "@/lib/admin/mock-access-data";
import type { AdminBundleDetail } from "@/lib/admin/access/bundles";
import type { AdminServiceDetail } from "@/lib/admin/access/services";

export function roleRank(roleId: string, roleLabel: string): number {
  const id = roleId.toLowerCase();
  const label = roleLabel.toLowerCase();
  if (id.includes("admin") || label.includes("admin")) {
    return 4;
  }
  if (id.includes("edit") || label.includes("editor")) {
    return 3;
  }
  if (id.includes("std") || label.includes("standard")) {
    return 3;
  }
  if (id.includes("view") || label.includes("viewer") || label.includes("read-only")) {
    return 2;
  }
  return 1;
}

/** Union of bundle-defined service roles (strongest role wins per service). */
export function mergeBundleRoleMap(
  bundleIds: string[],
  bundleDetailsById: Record<string, AdminBundleDetail>,
): Map<string, { roleId: string; roleLabel: string }> {
  const m = new Map<string, { roleId: string; roleLabel: string }>();
  for (const bid of bundleIds) {
    const d = bundleDetailsById[bid];
    if (!d) {
      continue;
    }
    for (const sr of d.serviceRoles) {
      const cur = m.get(sr.serviceId);
      const next = { roleId: sr.roleId, roleLabel: sr.roleLabel };
      if (!cur || roleRank(sr.roleId, sr.roleLabel) > roleRank(cur.roleId, cur.roleLabel)) {
        m.set(sr.serviceId, next);
      }
    }
  }
  return m;
}

export function serviceDisplayName(data: AdminAccessData, serviceId: string): string {
  return data.services.services.find((s) => s.id === serviceId)?.name ?? serviceId;
}

/** Resolve a role token (id or label) to a display string using service role mappings when possible. */
export function resolveServiceRoleDisplay(serviceDetail: AdminServiceDetail | undefined, roleToken: string): string {
  if (!serviceDetail) {
    return roleToken;
  }
  const t = roleToken.trim();
  const byId = serviceDetail.roleMappings.find((r) => r.roleId === t);
  if (byId) {
    return byId.roleLabel;
  }
  const byLabel = serviceDetail.roleMappings.find((r) => r.roleLabel.toLowerCase() === t.toLowerCase());
  if (byLabel) {
    return byLabel.roleLabel;
  }
  return roleToken;
}

export type EffectiveServiceAccess = {
  serviceId: string;
  roleId: string;
  roleLabel: string;
  effectiveDisplay: string;
  source: AccessSourceVisibility;
};

/**
 * For each catalog service, compute effective role and attribution from bundle union + optional per-service override.
 * When `suspended` is true, all lines are none (revoked posture).
 */
export function computeEffectiveServiceAccessByServiceId(input: {
  bundleIds: string[];
  bundleDetailsById: Record<string, AdminBundleDetail>;
  serviceDetailsById: Record<string, AdminServiceDetail>;
  serviceIds: string[];
  /** serviceId -> override role token; absent key = no DB override row */
  overrideByServiceId: Map<string, string>;
  suspended: boolean;
}): Map<string, EffectiveServiceAccess | null> {
  const out = new Map<string, EffectiveServiceAccess | null>();
  const bundleMap = mergeBundleRoleMap(input.bundleIds, input.bundleDetailsById);

  for (const serviceId of input.serviceIds) {
    if (input.suspended) {
      out.set(serviceId, null);
      continue;
    }
    const detail = input.serviceDetailsById[serviceId];
    const baseline = bundleMap.get(serviceId) ?? null;
    const overrideToken = input.overrideByServiceId.get(serviceId);
    const hasOverride = overrideToken !== undefined;

    if (hasOverride) {
      const roleId = overrideToken;
      const roleLabel = resolveServiceRoleDisplay(detail, roleId);
      const effectiveDisplay = roleLabel;
      const source: AccessSourceVisibility = baseline ? "bundle_plus_override" : "override";
      out.set(serviceId, { serviceId, roleId, roleLabel, effectiveDisplay, source });
      continue;
    }

    if (baseline) {
      out.set(serviceId, {
        serviceId,
        roleId: baseline.roleId,
        roleLabel: baseline.roleLabel,
        effectiveDisplay: baseline.roleLabel,
        source: "bundle",
      });
      continue;
    }

    out.set(serviceId, null);
  }

  return out;
}
