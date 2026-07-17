/** TanStack Query keys for Identity Administration (APZIDENTITY-003). */

import type { QueryClient } from "@tanstack/react-query";

import type {
  IdentityHistoryListClientQuery,
  IdentityListClientQuery,
  IdentityReferencesListClientQuery,
} from "./identity-types";

const ROOT = ["identity"] as const;

function stableParams(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

export const identityQueryKeys = {
  all: ROOT,
  users: {
    all: [...ROOT, "users"] as const,
    list: (params?: IdentityListClientQuery) =>
      [...ROOT, "users", "list", stableParams(params as Record<string, unknown>)] as const,
    detail: (userId: string) => [...ROOT, "users", "detail", userId] as const,
  },
  user: (userId: string) => [...ROOT, "users", "detail", userId] as const,
  groups: {
    all: [...ROOT, "groups"] as const,
    list: (params?: IdentityListClientQuery) =>
      [...ROOT, "groups", "list", stableParams(params as Record<string, unknown>)] as const,
    detail: (groupId: string) => [...ROOT, "groups", "detail", groupId] as const,
  },
  roles: {
    all: [...ROOT, "roles"] as const,
    list: (params?: IdentityListClientQuery) =>
      [...ROOT, "roles", "list", stableParams(params as Record<string, unknown>)] as const,
    detail: (roleId: string) => [...ROOT, "roles", "detail", roleId] as const,
  },
  organisations: {
    all: [...ROOT, "organisations"] as const,
    list: (params?: IdentityListClientQuery) =>
      [
        ...ROOT,
        "organisations",
        "list",
        stableParams(params as Record<string, unknown>),
      ] as const,
    detail: (organisationId: string) =>
      [...ROOT, "organisations", "detail", organisationId] as const,
  },
  tenants: {
    all: [...ROOT, "tenants"] as const,
    list: (params?: IdentityListClientQuery) =>
      [...ROOT, "tenants", "list", stableParams(params as Record<string, unknown>)] as const,
    detail: (tenantId: string) => [...ROOT, "tenants", "detail", tenantId] as const,
  },
  departments: {
    all: [...ROOT, "departments"] as const,
    list: (params?: IdentityListClientQuery) =>
      [
        ...ROOT,
        "departments",
        "list",
        stableParams(params as Record<string, unknown>),
      ] as const,
    detail: (departmentId: string) =>
      [...ROOT, "departments", "detail", departmentId] as const,
  },
  positions: {
    all: [...ROOT, "positions"] as const,
    list: (params?: IdentityListClientQuery) =>
      [...ROOT, "positions", "list", stableParams(params as Record<string, unknown>)] as const,
    detail: (positionId: string) => [...ROOT, "positions", "detail", positionId] as const,
  },
  memberships: {
    all: [...ROOT, "memberships"] as const,
    list: (params?: IdentityListClientQuery) =>
      [
        ...ROOT,
        "memberships",
        "list",
        stableParams(params as Record<string, unknown>),
      ] as const,
    detail: (membershipId: string) =>
      [...ROOT, "memberships", "detail", membershipId] as const,
  },
  serviceAssignments: {
    all: [...ROOT, "service-assignments"] as const,
    list: (params?: IdentityListClientQuery) =>
      [
        ...ROOT,
        "service-assignments",
        "list",
        stableParams(params as Record<string, unknown>),
      ] as const,
    detail: (assignmentId: string) =>
      [...ROOT, "service-assignments", "detail", assignmentId] as const,
  },
  invitations: {
    all: [...ROOT, "invitations"] as const,
    list: (params?: IdentityListClientQuery) =>
      [
        ...ROOT,
        "invitations",
        "list",
        stableParams(params as Record<string, unknown>),
      ] as const,
    detail: (invitationId: string) =>
      [...ROOT, "invitations", "detail", invitationId] as const,
  },
  activation: {
    all: [...ROOT, "activation"] as const,
    list: (params?: IdentityListClientQuery) =>
      [
        ...ROOT,
        "activation",
        "list",
        stableParams(params as Record<string, unknown>),
      ] as const,
    detail: (activationId: string) =>
      [...ROOT, "activation", "detail", activationId] as const,
  },
  deactivation: {
    all: [...ROOT, "deactivation"] as const,
    list: (params?: IdentityListClientQuery) =>
      [
        ...ROOT,
        "deactivation",
        "list",
        stableParams(params as Record<string, unknown>),
      ] as const,
    detail: (deactivationId: string) =>
      [...ROOT, "deactivation", "detail", deactivationId] as const,
  },
  policies: {
    all: [...ROOT, "policies"] as const,
    list: (params?: IdentityListClientQuery) =>
      [...ROOT, "policies", "list", stableParams(params as Record<string, unknown>)] as const,
    detail: (policyId: string) => [...ROOT, "policies", "detail", policyId] as const,
  },
  audit: {
    all: [...ROOT, "audit"] as const,
    list: (params?: IdentityListClientQuery) =>
      [...ROOT, "audit", "list", stableParams(params as Record<string, unknown>)] as const,
    detail: (auditId: string) => [...ROOT, "audit", "detail", auditId] as const,
  },
  history: {
    all: [...ROOT, "history"] as const,
    list: (params?: IdentityHistoryListClientQuery) =>
      [...ROOT, "history", "list", stableParams(params as Record<string, unknown>)] as const,
    detail: (historyId: string) => [...ROOT, "history", "detail", historyId] as const,
  },
  references: {
    all: [...ROOT, "references"] as const,
    list: (params?: IdentityReferencesListClientQuery) =>
      [
        ...ROOT,
        "references",
        "list",
        stableParams(params as Record<string, unknown>),
      ] as const,
    detail: (referenceId: string) =>
      [...ROOT, "references", "detail", referenceId] as const,
  },
  diagnostics: {
    health: () => [...ROOT, "diagnostics", "health"] as const,
    readiness: () => [...ROOT, "diagnostics", "readiness"] as const,
    capabilities: () => [...ROOT, "diagnostics", "capabilities"] as const,
    managementCapabilities: () =>
      [...ROOT, "diagnostics", "management-capabilities"] as const,
  },
} as const;

export function clearIdentityQueries(queryClient: QueryClient): void {
  void queryClient.removeQueries({ queryKey: identityQueryKeys.all });
}
