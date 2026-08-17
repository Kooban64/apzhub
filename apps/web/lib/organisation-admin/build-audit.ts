/**
 * Organisation Admin Audit — session tenant only via APE-Audit facade.
 * Never accepts client tenantId; never invents events.
 */

import { createPlatformAuditService } from "@apzhub/platform-audit";
import { listPlatformTenants } from "@apzhub/platform-identity/server";

export type OrganisationAdminAuditEvent = {
  readonly id: string;
  readonly occurredAt: string;
  readonly actor: string;
  readonly area: string;
  readonly event: string;
  readonly summary: string;
  readonly correlationId: string | null;
  readonly detail: Readonly<Record<string, unknown>> | null;
};

export type OrganisationAdminAuditPayload = {
  readonly generatedAt: string;
  readonly tenant: {
    readonly tenantId: string;
    readonly name: string;
    readonly status: string;
  };
  readonly feed: {
    readonly availability: "ok" | "empty" | "not_configured";
    readonly message: string;
  };
  readonly events: readonly OrganisationAdminAuditEvent[];
  readonly note: string;
};

export async function buildOrganisationAdminAudit(
  tenantId: string,
  filters?: {
    readonly q?: string;
    readonly area?: string;
    readonly actor?: string;
    readonly limit?: number;
  },
): Promise<OrganisationAdminAuditPayload | null> {
  const tenants = await listPlatformTenants().catch(() => []);
  const tenant = tenants.find((t) => t.tenantId === tenantId);
  if (!tenant) return null;

  const limit =
    typeof filters?.limit === "number" && filters.limit > 0
      ? Math.min(filters.limit, 200)
      : 100;

  // Empty providers — same honest facade as Platform Admin; tenant filter is mandatory.
  // Never accept client tenantId — session tenant only.
  const audit = createPlatformAuditService({ providers: [] });
  const result = await audit.list({ tenantId, limit });

  const q = filters?.q?.trim().toLowerCase() ?? "";
  const area = filters?.area?.trim().toLowerCase() ?? "";
  const actor = filters?.actor?.trim().toLowerCase() ?? "";

  const events: OrganisationAdminAuditEvent[] = result.items
    .filter((e) => e.tenantId === tenantId)
    .map((e) => ({
      id: e.id,
      occurredAt: e.occurredAt,
      actor: e.actorUserId ?? "System",
      area: e.source,
      event: e.action,
      summary: e.summary ?? e.action,
      correlationId: e.correlationId ?? null,
      detail: e.detail ?? null,
    }))
    .filter((e) => {
      if (area && area !== "all" && !e.area.toLowerCase().includes(area)) {
        return false;
      }
      if (actor && actor !== "all" && !e.actor.toLowerCase().includes(actor)) {
        return false;
      }
      if (!q) return true;
      const hay = `${e.actor} ${e.area} ${e.event} ${e.summary}`.toLowerCase();
      return hay.includes(q);
    });

  return {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      status: tenant.status,
    },
    feed: {
      availability: events.length > 0 ? "ok" : "empty",
      message:
        events.length > 0
          ? "Administrative activity for this organisation"
          : "No audit events are currently available for this organisation (audit providers not attached)",
    },
    events,
    note: "Strictly tenant-scoped. Cross-tenant audit is never available on Organisation Admin.",
  };
}
