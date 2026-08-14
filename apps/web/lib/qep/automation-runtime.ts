import {
  createQepAutomation,
  createAutomationPersistence,
  type QepAutomationFacade,
} from "@apzhub/qep-automation";
import type { AutomationExecutionRecord } from "@apzhub/platform-automation";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "@/lib/api/v1/gateway/bootstrap";
import { resolveAutomationPersistence } from "@/lib/qep/persistence/resolve-automation-persistence";
import { linkEvidenceToChange } from "@/lib/qep/evidence-change-link";
import {
  publishAutomationEvidence,
  type EvidencePublishCataloguePort,
} from "@/lib/qep/evidence-publish-bridge";

let singleton: QepAutomationFacade | undefined;

const AUTOMATION_EVIDENCE_PERMISSIONS = [
  "qep.evidence.create",
  "qep.evidence.associate",
  "qep.evidence.admin",
] as const;

function serviceContextFor(record: AutomationExecutionRecord): ServiceRequestContext {
  return {
    tenantId: record.tenantId,
    userId: record.requestedBy,
    correlationId: record.correlationId,
    permissions: AUTOMATION_EVIDENCE_PERMISSIONS,
  };
}

async function resolveEvidenceCatalogue(
  record: AutomationExecutionRecord,
): Promise<EvidencePublishCataloguePort | null> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.qepEnabled) {
    return null;
  }
  const gateway = await getPlatformServiceGateway();
  const evidence = gateway.qep.evidence;
  const ctx = serviceContextFor(record);
  return {
    async capture(input) {
      const dto = await evidence.capture(ctx, input);
      return { id: dto.id, revision: dto.revision };
    },
    async associate(input) {
      await evidence.associate(ctx, input.evidenceId, {
        expectedRevision: input.expectedRevision,
        targetCapability: input.targetCapability,
        targetId: input.targetId,
        relationType: input.relationType,
      });
    },
  };
}

/**
 * Automation Foundation runtime (APZQEP-161 / QX-PR-01).
 * Production defaults to PostgreSQL ExecutionStore (fail-closed).
 *
 * Q4: `onEvidencePublished` persists refs via Evidence StoragePort
 * (local under APZQEP_EVIDENCE_STORAGE_ROOT) and catalogues through
 * gateway evidence services when QEP is enabled.
 */
export function getQepAutomationRuntime(): QepAutomationFacade {
  if (!singleton) {
    const persistence = resolveAutomationPersistence();
    const store = createAutomationPersistence({
      mode: persistence.mode,
      db: persistence.db,
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    const events: string[] = [];
    // Dual gate for live Playwright: env must be true *and* request options.dryRun
    // must not be true. Restart the web process after changing the env flag.
    singleton = createQepAutomation({
      store,
      playwrightDryRun: process.env.APZHUB_AUTOMATION_LIVE !== "true",
      onEvent: (event) => {
        events.push(event.type);
        if (events.length > 500) {
          events.splice(0, events.length - 500);
        }
      },
      onEvidencePublished: async (record) => {
        const published = await publishAutomationEvidence(record, {
          resolveCatalogue: () => resolveEvidenceCatalogue(record),
        });
        const changeEventId = record.target.metadata?.changeEventId?.trim();
        if (!changeEventId || published.catalogueIds.length === 0) {
          return;
        }
        for (const evidenceId of published.catalogueIds) {
          try {
            const linked = await linkEvidenceToChange({
              tenantId: record.tenantId,
              changeEventId,
              evidenceId,
              createdBy: record.requestedBy,
              providerId: record.providerId,
              note: `F3 provider evidence (domain:${published.domain ?? "automation"}/${record.providerId}) for change ${changeEventId}`,
            });
            console.info(
              JSON.stringify({
                channel: "qep-evidence-publish",
                event: "qep.automation.evidence.change_linked",
                executionId: record.executionId,
                evidenceId,
                changeEventId,
                linked: linked.linked,
                linkId: linked.linkId ?? null,
                reason: linked.reason ?? null,
              }),
            );
          } catch (error) {
            console.info(
              JSON.stringify({
                channel: "qep-evidence-publish",
                event: "qep.automation.evidence.change_link_failed",
                executionId: record.executionId,
                evidenceId,
                changeEventId,
                softFail: true,
                error: error instanceof Error ? error.message : "unknown",
              }),
            );
          }
        }
      },
    });
  }
  return singleton;
}

/** Test helper — reset singleton between suites. */
export function resetQepAutomationRuntimeForTests(): void {
  singleton = undefined;
}
