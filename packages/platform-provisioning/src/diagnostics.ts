import type { ProvisioningAuditSink } from "./audit";
import type { PublishCounters } from "./events/publish";
import type { ProvisioningFlowStore } from "./flow-store";
import { toProvisioningHealth } from "./health";
import type { ProvisioningDiagnostics } from "./types";
import { PLATFORM_PROVISIONING_VERSION } from "./version";

export function buildProvisioningDiagnostics(input: {
  readonly store: ProvisioningFlowStore;
  readonly audit: ProvisioningAuditSink;
  readonly publishCounters: PublishCounters;
  readonly recentLimit?: number;
}): ProvisioningDiagnostics {
  return {
    version: PLATFORM_PROVISIONING_VERSION,
    health: toProvisioningHealth(input.store),
    recentFlows: input.store.list().slice(0, input.recentLimit ?? 20),
    auditCount: input.audit.count(),
    eventPublishOk: input.publishCounters.ok,
    eventPublishFailed: input.publishCounters.failed,
  };
}
