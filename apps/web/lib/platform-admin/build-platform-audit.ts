/**
 * Platform Admin — Audit via APE-Audit facade (no parallel audit warehouse).
 */

import { createPlatformAuditService } from "@apzhub/platform-audit";
import { listPlatformTenants } from "@apzhub/platform-identity/server";

import {
  COMMERCIAL_AUDIT_TENANT_ID,
  createCommercialAuditProvider,
} from "@/lib/commercial/commercial-audit";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";

export type PlatformAuditEventRow = {
  readonly id: string;
  readonly occurredAt: string;
  readonly actor: string;
  readonly tenantId: string;
  readonly tenantLabel: string;
  readonly area: string;
  readonly event: string;
  readonly summary: string;
  readonly correlationId: string | null;
  readonly detail: Readonly<Record<string, unknown>> | null;
};

export type PlatformAuditPayload = {
  readonly generatedAt: string;
  readonly tabs: readonly string[];
  readonly feed: {
    readonly availability: "ok" | "empty" | "not_configured";
    readonly message: string;
    readonly engineId: string;
  };
  readonly events: readonly PlatformAuditEventRow[];
  readonly administrativeChanges: {
    readonly availability: "empty" | "ok" | "not_configured";
    readonly message: string;
    readonly events: readonly PlatformAuditEventRow[];
  };
  readonly tenantAccess: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly exports: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly note: string;
};

/**
 * Platform-wide audit list.
 * Commercial configuration history is attached as an APE-Audit administration provider.
 * Domain SoR remains the commercial control-plane history log.
 */
export async function buildPlatformAdminAudit(): Promise<PlatformAuditPayload> {
  const audit = createPlatformAuditService({
    providers: [createCommercialAuditProvider()],
  });
  const tenants = await listPlatformTenants().catch(() => []);
  const tenantName = new Map(tenants.map((t) => [t.tenantId, t.name]));
  tenantName.set(COMMERCIAL_AUDIT_TENANT_ID, "Platform");

  const collected: PlatformAuditEventRow[] = [];
  const tenantIds = [
    COMMERCIAL_AUDIT_TENANT_ID,
    ...tenants.slice(0, 50).map((t) => t.tenantId),
  ];
  for (const tenantId of tenantIds) {
    const result = await audit.list({ tenantId, limit: 50 });
    for (const e of result.items) {
      collected.push({
        id: e.id,
        occurredAt: e.occurredAt,
        actor: e.actorUserId ?? "System",
        tenantId: e.tenantId,
        tenantLabel: tenantName.get(e.tenantId) ?? e.tenantId,
        area: e.source,
        event: e.action,
        summary: e.summary ?? e.action,
        correlationId: e.correlationId ?? null,
        detail: e.detail ?? null,
      });
    }
  }

  collected.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const feed =
    collected.length > 0
      ? {
          availability: "ok" as const,
          message: "Events from APE-Audit facade",
          engineId: "ape-audit",
        }
      : {
          availability: "empty" as const,
          message:
            "APE-Audit facade is active but no domain source providers are attached — event list is empty (domain SoRs remain authoritative).",
          engineId: "ape-audit",
        };

  const adminAreas = new Set(["identity", "administration", "configuration", "other"]);
  const administrative = collected.filter((e) => adminAreas.has(e.area));

  return {
    generatedAt: new Date().toISOString(),
    tabs: ["platform-audit", "administrative-changes", "tenant-access", "exports"],
    feed,
    events: collected.slice(0, 100),
    administrativeChanges:
      administrative.length > 0
        ? {
            availability: "ok",
            message: "Filtered from APE-Audit results",
            events: administrative.slice(0, 100),
          }
        : {
            availability: "empty",
            message:
              "No administrative-change events available through attached APE-Audit providers",
            events: [],
          },
    tenantAccess: {
      availability: "not_configured",
      message:
        "Durable controlled support-session / cross-tenant access records are not configured. Platform roles do not imply tenant business-data access.",
    },
    exports: {
      availability: "not_configured",
      message: "Audit export capability is not configured on this surface",
    },
    note: "Audit answers WHAT happened. Identity answers WHO has authority. Security answers whether access is behaving safely.",
  };
}

export type { TenantListField };
