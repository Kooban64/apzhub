/**
 * APE-Audit source provider for commercial configuration history.
 * Domain SoR remains the commercial control-plane history log.
 */

import type {
  PlatformAuditEvent,
  PlatformAuditListQuery,
  PlatformAuditSourceProvider,
} from "@apzhub/platform-audit";

import { listPriceHistory } from "@/lib/commercial/commercial-config";

export const COMMERCIAL_AUDIT_TENANT_ID = "platform";

export function createCommercialAuditProvider(): PlatformAuditSourceProvider {
  return {
    source: "administration",
    async list(query: PlatformAuditListQuery): Promise<readonly PlatformAuditEvent[]> {
      if (query.tenantId !== COMMERCIAL_AUDIT_TENANT_ID && query.tenantId !== "*") {
        return [];
      }
      return listPriceHistory().map((row) => ({
        id: row.id,
        tenantId: COMMERCIAL_AUDIT_TENANT_ID,
        source: "administration" as const,
        product: "commerce",
        action: row.action,
        actorUserId: row.actorUserId,
        occurredAt: row.occurredAt,
        summary: `${row.action} ${row.itemId}${row.regionId ? ` (${row.regionId})` : ""} — ${row.reason}`,
        detail: {
          itemId: row.itemId,
          regionId: row.regionId ?? null,
          from: row.from,
          to: row.to,
          reason: row.reason,
        },
      }));
    },
  };
}
