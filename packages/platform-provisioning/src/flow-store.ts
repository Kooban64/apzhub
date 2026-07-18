import type { ProvisioningFlow, ProvisioningFlowStatus } from "./types";

export type ProvisioningFlowStore = {
  save(flow: ProvisioningFlow): void;
  get(flowId: string): ProvisioningFlow | undefined;
  list(filter?: {
    readonly tenantId?: string;
    readonly status?: ProvisioningFlowStatus;
  }): readonly ProvisioningFlow[];
  countByStatus(): Record<ProvisioningFlowStatus, number>;
};

export function createInMemoryProvisioningFlowStore(
  seed: readonly ProvisioningFlow[] = [],
): ProvisioningFlowStore {
  const rows = new Map<string, ProvisioningFlow>(
    seed.map((flow) => [flow.flowId, flow]),
  );

  return {
    save(flow) {
      rows.set(flow.flowId, flow);
    },
    get(flowId) {
      return rows.get(flowId);
    },
    list(filter) {
      let items = [...rows.values()];
      if (filter?.tenantId) {
        items = items.filter((f) => f.tenantId === filter.tenantId);
      }
      if (filter?.status) {
        items = items.filter((f) => f.status === filter.status);
      }
      return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    countByStatus() {
      const counts: Record<ProvisioningFlowStatus, number> = {
        pending: 0,
        in_progress: 0,
        completed: 0,
        failed: 0,
      };
      for (const flow of rows.values()) {
        counts[flow.status] += 1;
      }
      return counts;
    },
  };
}
