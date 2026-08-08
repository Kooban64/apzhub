import type { AutomationExecutionRecord } from "../contracts/execution";

/**
 * Execution Source of Record port (QX-PR-01).
 * Production implementations must survive process restart.
 */
export interface ExecutionStore {
  save(record: AutomationExecutionRecord): Promise<void>;
  get(executionId: string): Promise<AutomationExecutionRecord | undefined>;
  list(tenantId?: string): Promise<readonly AutomationExecutionRecord[]>;
}

/** Process-local store — allowed in development/tests only. */
export class InMemoryExecutionStore implements ExecutionStore {
  private readonly records = new Map<string, AutomationExecutionRecord>();

  async save(record: AutomationExecutionRecord): Promise<void> {
    this.records.set(record.executionId, record);
  }

  async get(executionId: string): Promise<AutomationExecutionRecord | undefined> {
    return this.records.get(executionId);
  }

  async list(tenantId?: string): Promise<readonly AutomationExecutionRecord[]> {
    const all = [...this.records.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return tenantId ? all.filter((r) => r.tenantId === tenantId) : all;
  }
}
