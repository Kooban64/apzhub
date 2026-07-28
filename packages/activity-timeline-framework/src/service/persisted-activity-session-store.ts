import type { ActivityDocument } from "../types/activity-document";
import type {
  ActivitySessionAppendResult,
  ActivitySessionStore,
  ListActivitiesOptions,
} from "./activity-session-store";
import { createDefaultActivitySessionStore } from "./default-activity-session-store";

/** Minimal storage surface — browser localStorage or test double. */
export type ActivityPersistenceStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export interface PersistedActivitySessionStoreOptions {
  /** Stable key scoped by product/tenant/user. */
  readonly storageKey: string;
  readonly storage?: ActivityPersistenceStorage;
  /** Optional seed applied after restore (deduped by activityId). */
  readonly initialItems?: readonly ActivityDocument[];
  readonly maxItems?: number;
}

const DEFAULT_MAX_ITEMS = 500;

/**
 * Durable ActivitySessionStore — sync API preserved; snapshots to storage.
 * Platform-owned persistence behind ActivityService (OBS-LAW-02 / LAW-012 §9.1).
 */
export class PersistedActivitySessionStore implements ActivitySessionStore {
  private readonly inner: ActivitySessionStore;
  private readonly storage: ActivityPersistenceStorage | null;
  private readonly storageKey: string;
  private readonly maxItems: number;

  constructor(options: PersistedActivitySessionStoreOptions) {
    this.inner = createDefaultActivitySessionStore();
    this.storageKey = options.storageKey;
    this.maxItems = options.maxItems ?? DEFAULT_MAX_ITEMS;
    this.storage = options.storage ?? resolveBrowserStorage();

    this.restore();
    if (options.initialItems && options.initialItems.length > 0) {
      this.inner.append(options.initialItems);
      this.persist();
    }
  }

  append(items: readonly ActivityDocument[]): ActivitySessionAppendResult {
    const result = this.inner.append(items);
    if (result.addedCount > 0) {
      this.trimAndPersist();
    }
    return result;
  }

  get(activityId: string): ActivityDocument | undefined {
    return this.inner.get(activityId);
  }

  list(options?: ListActivitiesOptions): readonly ActivityDocument[] {
    return this.inner.list(options);
  }

  clear(): number {
    const cleared = this.inner.clear();
    this.persist();
    return cleared;
  }

  getTotalCount(): number {
    return this.inner.getTotalCount();
  }

  getLastActivityTimestamp(): string | undefined {
    return this.inner.getLastActivityTimestamp();
  }

  getScopeCounts(): Readonly<Partial<Record<string, number>>> {
    return this.inner.getScopeCounts();
  }

  getCategoryCounts(): ReturnType<ActivitySessionStore["getCategoryCounts"]> {
    return this.inner.getCategoryCounts();
  }

  private restore(): void {
    if (!this.storage) {
      return;
    }

    const raw = this.storage.getItem(this.storageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        this.storage.removeItem(this.storageKey);
        return;
      }

      const items = parsed.filter(isActivityDocumentLike) as ActivityDocument[];
      if (items.length > 0) {
        this.inner.append(items);
      }
    } catch {
      this.storage.removeItem(this.storageKey);
    }
  }

  private trimAndPersist(): void {
    const total = this.inner.getTotalCount();
    if (total > this.maxItems) {
      const all = this.inner.list();
      const keep = all.slice(0, this.maxItems);
      this.inner.clear();
      this.inner.append(keep);
    }
    this.persist();
  }

  private persist(): void {
    if (!this.storage) {
      return;
    }

    const items = this.inner.list({ limit: this.maxItems });
    this.storage.setItem(this.storageKey, JSON.stringify(items));
  }
}

export function createPersistedActivitySessionStore(
  options: PersistedActivitySessionStoreOptions,
): ActivitySessionStore {
  return new PersistedActivitySessionStore(options);
}

export function createLawActivityPersistenceStorageKey(input: {
  readonly tenantId?: string;
  readonly userId?: string;
}): string {
  const tenant = input.tenantId?.trim() || "default-tenant";
  const user = input.userId?.trim() || "anonymous";
  return `apzhub.law.activity.v1.${tenant}.${user}`;
}

function resolveBrowserStorage(): ActivityPersistenceStorage | null {
  if (typeof globalThis.localStorage === "undefined") {
    return null;
  }
  return globalThis.localStorage;
}

function isActivityDocumentLike(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.activityId === "string" &&
    typeof record.activityTypeId === "string" &&
    typeof record.title === "string" &&
    typeof record.timestamp === "string"
  );
}
