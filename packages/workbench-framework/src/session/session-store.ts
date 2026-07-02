import type { WorkbenchSessionPayload } from "./workbench-session-payload";

export interface SessionStore {
  load(userId: string): Promise<WorkbenchSessionPayload | null>;
  save(userId: string, payload: WorkbenchSessionPayload): Promise<void>;
  clear(userId: string): Promise<void>;
}

export function createWorkbenchSessionStorageKey(userId: string): string {
  return `apzhub:workbench:session:${userId}`;
}
