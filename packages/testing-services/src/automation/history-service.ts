import type { AutomationHistoryService } from "@apzhub/testing-contracts";
import {
  asAutomationImportHistoryId,
  asAutomationImportId,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import type { ServiceRuntime } from "../services/types";

export function createAutomationHistoryService(
  rt: ServiceRuntime,
): AutomationHistoryService {
  return {
    async listByImport(ctx, importId) {
      const rctx = toRepositoryContext(ctx);
      const page = await rt.persistence.automationImportHistory.listByImport(
        rctx,
        importId,
      );
      return page.items.map((row) => ({
        id: asAutomationImportHistoryId(row.id),
        tenantId: row.tenantId,
        organisationId: row.organisationId,
        importId: asAutomationImportId(row.importId),
        eventType: row.eventType,
        occurredAt: row.occurredAt,
        actorUserId: row.actorUserId,
        summary: row.summary,
        details: row.details,
        adapterVersion: row.adapterVersion,
        normalizationNotes: row.normalizationNotes,
        correlationId: row.correlationId,
      }));
    },

    async list(ctx) {
      const rctx = toRepositoryContext(ctx);
      const page = await rt.persistence.automationImportHistory.list(rctx, {
        pageSize: 200,
      });
      return page.items.map((row) => ({
        id: asAutomationImportHistoryId(row.id),
        tenantId: row.tenantId,
        organisationId: row.organisationId,
        importId: asAutomationImportId(row.importId),
        eventType: row.eventType,
        occurredAt: row.occurredAt,
        actorUserId: row.actorUserId,
        summary: row.summary,
        details: row.details,
        adapterVersion: row.adapterVersion,
        normalizationNotes: row.normalizationNotes,
        correlationId: row.correlationId,
      }));
    },
  };
}
