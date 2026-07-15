import type { EnrichedValidatedSession } from "./tenant-session";
import { getSessionSecurityPolicy } from "./session-policy";

export interface SessionValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly severity: "warn" | "fail";
}

export interface SessionValidationResult {
  readonly valid: boolean;
  readonly issues: readonly SessionValidationIssue[];
}

export interface TenantSessionConsistencyInput {
  readonly userId?: string;
  readonly tenantId?: string;
  readonly tenantSource?: string;
  readonly requireTenant?: boolean;
}

export function isSessionExpired(expiresAt: string | Date): boolean {
  const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return expiry.getTime() <= Date.now();
}

export function validateSessionActive(
  session: { readonly session: { readonly expiresAt: string | Date } } | null | undefined,
): SessionValidationResult {
  if (!session?.session) {
    return {
      valid: false,
      issues: [{ code: "session_missing", message: "Session is required.", severity: "fail" }],
    };
  }

  if (isSessionExpired(session.session.expiresAt)) {
    return {
      valid: false,
      issues: [{ code: "session_expired", message: "Session has expired.", severity: "fail" }],
    };
  }

  return { valid: true, issues: [] };
}

export function validateTenantSessionConsistency(
  input: TenantSessionConsistencyInput,
): SessionValidationResult {
  const issues: SessionValidationIssue[] = [];
  const policy = getSessionSecurityPolicy();

  if (!input.userId) {
    return {
      valid: false,
      issues: [{ code: "user_missing", message: "User binding is required.", severity: "fail" }],
    };
  }

  if (input.requireTenant && !input.tenantId) {
    issues.push({
      code: "tenant_missing",
      message: "Tenant binding is required for this operation.",
      severity: "fail",
    });
  }

  if (
    input.tenantId &&
    input.tenantSource === "development_fallback" &&
    policy.environment === "production"
  ) {
    issues.push({
      code: "dev_tenant_fallback",
      message: "Development tenant fallback is not permitted in production.",
      severity: "fail",
    });
  }

  return {
    valid: issues.every((issue) => issue.severity !== "fail"),
    issues,
  };
}

export function validateEnrichedSession(
  session: EnrichedValidatedSession | null | undefined,
  options: { readonly requireTenant?: boolean } = {},
): SessionValidationResult {
  const active = validateSessionActive(session);
  if (!active.valid) {
    return active;
  }

  return validateTenantSessionConsistency({
    userId: session?.user.id,
    tenantId: session?.tenantId,
    tenantSource: session?.tenantSource,
    requireTenant: options.requireTenant,
  });
}
