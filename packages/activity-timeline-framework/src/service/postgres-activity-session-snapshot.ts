/**
 * PostgreSQL Law activity session snapshot SoR (APZHUB-ENG-0002 / R12-PERSIST-02).
 * Platform-owned behind ActivitySessionStore; sync store API preserved via write-through cache.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import { sql } from "drizzle-orm";

import type { ActivityDocument } from "../types/activity-document";
import type { ActivitySessionStore } from "./activity-session-store";
import {
  createLawActivityPersistenceStorageKey,
  createPersistedActivitySessionStore,
  type ActivityPersistenceStorage,
} from "./persisted-activity-session-store";

type SnapshotRow = {
  tenant_id: string;
  user_id: string;
  payload_json: unknown;
};

function asRows(result: unknown): SnapshotRow[] {
  if (Array.isArray(result)) return result as SnapshotRow[];
  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows: unknown }).rows)
  ) {
    return (result as { rows: SnapshotRow[] }).rows;
  }
  return [];
}

function normalizeScope(input: {
  readonly tenantId?: string;
  readonly userId?: string;
}): { tenantId: string; userId: string } {
  return {
    tenantId: input.tenantId?.trim() || "default-tenant",
    userId: input.userId?.trim() || "anonymous",
  };
}

export async function loadPostgresActivitySessionSnapshot(
  db: DatabaseExecutor,
  scope: { readonly tenantId?: string; readonly userId?: string },
): Promise<readonly ActivityDocument[]> {
  const { tenantId, userId } = normalizeScope(scope);
  const result = await db.execute(sql`
    SELECT payload_json
    FROM platform_law_activity_session
    WHERE tenant_id = ${tenantId} AND user_id = ${userId}
    LIMIT 1
  `);
  const row = asRows(result)[0];
  if (!row) {
    return [];
  }
  const payload = row.payload_json;
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload) as unknown;
      return Array.isArray(parsed) ? (parsed as ActivityDocument[]) : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(payload) ? (payload as ActivityDocument[]) : [];
}

export async function savePostgresActivitySessionSnapshot(
  db: DatabaseExecutor,
  scope: { readonly tenantId?: string; readonly userId?: string },
  items: readonly ActivityDocument[],
): Promise<void> {
  const { tenantId, userId } = normalizeScope(scope);
  const payload = JSON.stringify(items);
  await db.execute(sql`
    INSERT INTO platform_law_activity_session (
      tenant_id, user_id, payload_json, updated_at, created_at
    ) VALUES (
      ${tenantId}, ${userId}, ${payload}::jsonb, now(), now()
    )
    ON CONFLICT (tenant_id, user_id) DO UPDATE SET
      payload_json = EXCLUDED.payload_json,
      updated_at = now()
  `);
}

/**
 * Sync Storage façade over Postgres — in-memory cache + async write-through.
 * Call hydrate() before constructing PersistedActivitySessionStore in production.
 */
export function createPostgresActivityPersistenceStorage(options: {
  readonly db: DatabaseExecutor;
  readonly tenantId?: string;
  readonly userId?: string;
}): ActivityPersistenceStorage & {
  hydrate(): Promise<void>;
  flush(): Promise<void>;
} {
  const scope = normalizeScope(options);
  const storageKey = createLawActivityPersistenceStorageKey(scope);
  let cache: string | null = null;
  const writes: Promise<void>[] = [];

  return {
    getItem(key: string) {
      return key === storageKey ? cache : null;
    },
    setItem(key: string, value: string) {
      if (key !== storageKey) {
        return;
      }
      cache = value;
      let items: ActivityDocument[] = [];
      try {
        const parsed = JSON.parse(value) as unknown;
        items = Array.isArray(parsed) ? (parsed as ActivityDocument[]) : [];
      } catch {
        items = [];
      }
      writes.push(savePostgresActivitySessionSnapshot(options.db, scope, items));
    },
    removeItem(key: string) {
      if (key !== storageKey) {
        return;
      }
      cache = null;
      writes.push(savePostgresActivitySessionSnapshot(options.db, scope, []));
    },
    async hydrate() {
      const items = await loadPostgresActivitySessionSnapshot(options.db, scope);
      cache = JSON.stringify(items);
    },
    async flush() {
      await Promise.all(writes.splice(0, writes.length));
    },
  };
}

/**
 * Production helper — PostgreSQL mandatory; hydrates before returning sync store.
 */
export async function createProductionPostgresActivitySessionStore(input: {
  readonly db: DatabaseExecutor;
  readonly tenantId?: string;
  readonly userId?: string;
}): Promise<ActivitySessionStore> {
  if (!input?.db) {
    throw new Error(
      "createProductionPostgresActivitySessionStore requires explicit postgres db — in-memory/localStorage fallback is forbidden",
    );
  }
  const scope = normalizeScope(input);
  const storage = createPostgresActivityPersistenceStorage({
    db: input.db,
    tenantId: scope.tenantId,
    userId: scope.userId,
  });
  await storage.hydrate();
  return createPersistedActivitySessionStore({
    storageKey: createLawActivityPersistenceStorageKey(scope),
    storage,
  });
}
