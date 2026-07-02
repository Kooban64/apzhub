import { parseWorkbenchSessionPayload } from "./workbench-session-payload";
import type { WorkbenchSessionPayload } from "./workbench-session-payload";
import { createWorkbenchSessionStorageKey, type SessionStore } from "./session-store";

export interface LocalStorageSessionStoreOptions {
  readonly storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">;
}

export class LocalStorageSessionStore implements SessionStore {
  private readonly storage: Pick<Storage, "getItem" | "setItem" | "removeItem">;

  constructor(options: LocalStorageSessionStoreOptions = {}) {
    this.storage = options.storage ?? getDefaultStorage();
  }

  async load(userId: string): Promise<WorkbenchSessionPayload | null> {
    const raw = this.storage.getItem(createWorkbenchSessionStorageKey(userId));
    if (!raw) {
      return null;
    }

    try {
      const parsed = parseWorkbenchSessionPayload(JSON.parse(raw) as unknown);
      if (!parsed.ok) {
        this.storage.removeItem(createWorkbenchSessionStorageKey(userId));
        return null;
      }

      return parsed.payload;
    } catch {
      this.storage.removeItem(createWorkbenchSessionStorageKey(userId));
      return null;
    }
  }

  async save(userId: string, payload: WorkbenchSessionPayload): Promise<void> {
    this.storage.setItem(
      createWorkbenchSessionStorageKey(userId),
      JSON.stringify(payload),
    );
  }

  async clear(userId: string): Promise<void> {
    this.storage.removeItem(createWorkbenchSessionStorageKey(userId));
  }
}

export function createLocalStorageSessionStore(
  options?: LocalStorageSessionStoreOptions,
): LocalStorageSessionStore {
  return new LocalStorageSessionStore(options);
}

function getDefaultStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  if (typeof globalThis.localStorage === "undefined") {
    throw new Error("localStorage is not available in this environment");
  }

  return globalThis.localStorage;
}
