import type { AutomationExecutionRecord } from "../contracts/execution";

export class InMemoryExecutionStore {
  private readonly records = new Map<string, AutomationExecutionRecord>();

  save(record: AutomationExecutionRecord): void {
    this.records.set(record.executionId, record);
  }

  get(executionId: string): AutomationExecutionRecord | undefined {
    return this.records.get(executionId);
  }

  list(tenantId?: string): readonly AutomationExecutionRecord[] {
    const all = [...this.records.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return tenantId ? all.filter((r) => r.tenantId === tenantId) : all;
  }
}
