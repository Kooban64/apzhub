import type { WorkbenchSessionPayload } from "./workbench-session-payload";
import type { SessionStore } from "./session-store";

export class MemorySessionStore implements SessionStore {
  private readonly records = new Map<string, WorkbenchSessionPayload>();

  async load(userId: string): Promise<WorkbenchSessionPayload | null> {
    return this.records.get(userId) ?? null;
  }

  async save(userId: string, payload: WorkbenchSessionPayload): Promise<void> {
    this.records.set(userId, payload);
  }

  async clear(userId: string): Promise<void> {
    this.records.delete(userId);
  }

  /** @internal Test helper */
  snapshot(): ReadonlyMap<string, WorkbenchSessionPayload> {
    return this.records;
  }
}

export function createMemorySessionStore(): MemorySessionStore {
  return new MemorySessionStore();
}
