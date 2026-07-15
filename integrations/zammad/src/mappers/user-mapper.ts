import type { SupportUser, SupportUserRole } from "../models/canonical";
import type { ZammadUserRecord } from "../internal/zammad-api-types";
import {
  type MapperContext,
  toSupportOrganizationId,
  toSupportUserId,
} from "./mapper-context";

function mapSupportUserRole(record: ZammadUserRecord): SupportUserRole {
  const roles = (record.roles ?? []).map((role) => role.toLowerCase());
  if (roles.some((role) => role.includes("admin"))) return "admin";
  if (roles.some((role) => role.includes("agent"))) return "agent";
  if (roles.some((role) => role.includes("customer"))) return "customer";
  if (record.role_ids?.includes(1)) return "admin";
  if (record.role_ids?.includes(2)) return "agent";
  if (record.role_ids?.includes(3)) return "customer";
  return "unknown";
}

function buildDisplayName(record: ZammadUserRecord): string {
  const parts = [record.firstname, record.lastname].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  return record.login ?? record.email ?? `user-${record.id}`;
}

export function mapZammadUser(
  record: ZammadUserRecord,
  ctx: MapperContext,
): SupportUser {
  const organizationIds = [
    ...(record.organization_id !== undefined && record.organization_id !== null
      ? [toSupportOrganizationId(record.organization_id)]
      : []),
    ...(record.organization_ids ?? []).map((id) => toSupportOrganizationId(id)),
  ];

  return {
    id: toSupportUserId(record.id),
    tenantId: ctx.tenantId,
    email: record.email,
    login: record.login,
    displayName: buildDisplayName(record),
    firstName: record.firstname,
    lastName: record.lastname,
    active: record.active !== false,
    role: mapSupportUserRole(record),
    organizationIds: organizationIds.length > 0 ? [...new Set(organizationIds)] : undefined,
    createdAt: record.created_at ?? new Date(0).toISOString(),
    updatedAt: record.updated_at ?? record.created_at ?? new Date(0).toISOString(),
  };
}
