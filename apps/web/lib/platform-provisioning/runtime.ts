import {
  getSharedGovernanceService,
  type PlatformGovernanceService,
} from "@apzhub/platform-governance";
import {
  createPlatformProvisioning,
  type PlatformProvisioningRuntime,
} from "@apzhub/platform-provisioning";
import { createInMemoryOutboxStore } from "@apzhub/platform-outbox";

const globalForProvisioning = globalThis as typeof globalThis & {
  __apzhubPlatformProvisioning?: PlatformProvisioningRuntime;
  __apzhubPlatformProvisioningGovernance?: PlatformGovernanceService;
};

/**
 * Process singleton for Product Provisioning Flows (OSS-100-12+).
 * Uses shared governance + in-memory outbox for async/retry in this process.
 */
export function getPlatformProvisioningRuntime(): PlatformProvisioningRuntime {
  if (!globalForProvisioning.__apzhubPlatformProvisioning) {
    const governance =
      globalForProvisioning.__apzhubPlatformProvisioningGovernance ??
      getSharedGovernanceService();
    globalForProvisioning.__apzhubPlatformProvisioningGovernance = governance;

    const outboxStore = createInMemoryOutboxStore();
    globalForProvisioning.__apzhubPlatformProvisioning = createPlatformProvisioning({
      governance,
      outboxStore,
    });
  }
  return globalForProvisioning.__apzhubPlatformProvisioning;
}

/** Test helper — reset singleton. */
export function resetPlatformProvisioningRuntimeForTests(): void {
  globalForProvisioning.__apzhubPlatformProvisioning = undefined;
  globalForProvisioning.__apzhubPlatformProvisioningGovernance = undefined;
}
