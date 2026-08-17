/**
 * Platform Admin — Security posture (read-first).
 */

import { checkDatabaseHealth } from "@apzhub/config";

import { countActiveSessions } from "@/lib/iam/better-auth-sessions";
import { buildPlatformAdminIdentityAccess } from "@/lib/platform-admin/build-platform-identity";
import { opsField, type OpsStatusField } from "@/lib/platform-admin/ops-status";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";

export type PlatformSecurityPayload = {
  readonly generatedAt: string;
  readonly tabs: readonly string[];
  readonly authentication: {
    readonly provider: string;
    readonly health: OpsStatusField;
    readonly activeSessions: TenantListField<number>;
    readonly mfaCoverage: TenantListField<string>;
    readonly failedSignIns24h: TenantListField<string>;
    readonly platformAdminMfa: TenantListField<string>;
    readonly sessionPolicy: TenantListField<string>;
    readonly passwordPolicy: TenantListField<string>;
    readonly sso: TenantListField<string>;
    readonly trustedDomains: TenantListField<string>;
  };
  readonly access: {
    readonly platformAdministrators: TenantListField<number>;
    readonly privilegedGrants: TenantListField<string>;
    readonly pendingAccessReviews: TenantListField<string>;
  };
  readonly securityEvents: {
    readonly availability: "not_configured" | "empty" | "ok";
    readonly message: string;
    readonly high: TenantListField<number>;
    readonly medium: TenantListField<number>;
    readonly low: TenantListField<number>;
    readonly rows: readonly never[];
  };
  readonly accessReviews: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly attention: readonly { readonly title: string; readonly detail: string }[];
  readonly note: string;
};

export async function buildPlatformAdminSecurity(): Promise<PlatformSecurityPayload> {
  const identity = await buildPlatformAdminIdentityAccess();
  const db = await checkDatabaseHealth().catch(() => ({
    ok: false,
    message: "failed",
  }));
  const activeSessions = await countActiveSessions();

  const authHealth: OpsStatusField = db.ok
    ? opsField("healthy", "BetterAuth session store reachable via platform database")
    : opsField("unavailable", db.message ?? "Database health check failed");

  const attention: { title: string; detail: string }[] = [];
  if (identity.administrators.length === 0) {
    attention.push({
      title: "No platform administrators listed",
      detail:
        "No active platform-scope control-plane role assignments were found. Org Admins are intentionally excluded.",
    });
  }
  attention.push({
    title: "MFA coverage unavailable",
    detail: "BetterAuth MFA is not configured in the current auth server plugins.",
  });
  attention.push({
    title: "Security event stream not configured",
    detail:
      "Failed sign-ins and security events are not persisted as a platform feed yet.",
  });

  return {
    generatedAt: new Date().toISOString(),
    tabs: ["overview", "authentication", "security-events", "access-reviews"],
    authentication: {
      provider: "BetterAuth",
      health: authHealth,
      activeSessions:
        activeSessions === null
          ? {
              availability: "unavailable",
              message: "Session count unavailable",
            }
          : { availability: "ok", value: activeSessions },
      mfaCoverage: {
        availability: "unavailable",
        value: "Unavailable",
        message: "MFA coverage is not tracked in the current BetterAuth configuration",
      },
      failedSignIns24h: {
        availability: "unavailable",
        value: "Unavailable",
        message: "Failed sign-in telemetry is not configured",
      },
      platformAdminMfa: {
        availability: "not_configured",
        value: "Not configured",
        message: "Platform Admin MFA requirement is not stored as editable policy here",
      },
      sessionPolicy: {
        availability: "not_configured",
        value: "Not configured",
        message:
          "Session policy read surface is not configured beyond BetterAuth defaults",
      },
      passwordPolicy: {
        availability: "not_configured",
        value: "Not configured",
        message: "Password policy engine is not exposed on this surface",
      },
      sso: {
        availability: "not_configured",
        value: "Not configured",
        message: "SSO configuration is not exposed on this surface",
      },
      trustedDomains: {
        availability: "not_configured",
        value: "Not configured",
        message: "Trusted domains are not configured on this surface",
      },
    },
    access: {
      platformAdministrators: {
        availability: "ok",
        value: identity.administrators.length,
      },
      privilegedGrants: {
        availability: "not_configured",
        value: "Not configured",
        message: identity.privilegedAccess.message,
      },
      pendingAccessReviews: {
        availability: "not_configured",
        value: "Not configured",
        message: "Access-review workflows have not been enabled",
      },
    },
    securityEvents: {
      availability: "not_configured",
      message: "No durable security-event feed is attached. Do not invent SIEM rows.",
      high: { availability: "not_configured", message: "Not configured" },
      medium: { availability: "not_configured", message: "Not configured" },
      low: { availability: "not_configured", message: "Not configured" },
      rows: [],
    },
    accessReviews: {
      availability: "not_configured",
      message:
        "Periodic access-review workflows have not yet been enabled for this platform.",
    },
    attention,
    note: "Security is posture and authentication inspection only — figures are real or Unavailable / Not configured.",
  };
}
