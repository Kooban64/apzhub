import type { ProvisioningFlowStore } from "./flow-store";
import type { ProvisioningHealth } from "./types";
import { PLATFORM_PROVISIONING_VERSION } from "./version";

export function toProvisioningHealth(store: ProvisioningFlowStore): ProvisioningHealth {
  const counts = store.countByStatus();
  let status: ProvisioningHealth["status"] = "healthy";
  if (counts.failed > 0 && counts.in_progress === 0 && counts.pending === 0) {
    status = "degraded";
  }
  if (counts.failed > 0 && counts.in_progress > 0) {
    status = "degraded";
  }

  return {
    component: "platform-provisioning",
    version: PLATFORM_PROVISIONING_VERSION,
    status,
    flows: {
      pending: counts.pending,
      inProgress: counts.in_progress,
      completed: counts.completed,
      failed: counts.failed,
    },
  };
}
