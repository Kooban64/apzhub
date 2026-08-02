/**
 * Durable Cap A–F idempotency records (APZQEP-151).
 */
import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { DatabaseExecutor } from "./client";
import { qepCoreQeIdempotency } from "./qep-core-qe-schema";
import { getDatabaseExecutor } from "./transaction-context";

export type CoreQeIdempotencyStore = {
  /**
   * Returns existing resourceId when the key was seen; otherwise records and
   * returns undefined so the caller can create the resource.
   */
  claim(
    tenantId: string,
    scope: string,
    idempotencyKey: string,
    resourceId: string,
    now?: string,
  ): Promise<{ readonly duplicate: boolean; readonly resourceId: string }>;
  get(
    tenantId: string,
    scope: string,
    idempotencyKey: string,
  ): Promise<string | undefined>;
};

export function createPostgresCoreQeIdempotencyStore(
  db: DatabaseExecutor,
): CoreQeIdempotencyStore {
  return {
    async get(tenantId, scope, idempotencyKey) {
      const exec = getDatabaseExecutor(db);
      const [row] = await exec
        .select()
        .from(qepCoreQeIdempotency)
        .where(
          and(
            eq(qepCoreQeIdempotency.tenantId, tenantId),
            eq(qepCoreQeIdempotency.scope, scope),
            eq(qepCoreQeIdempotency.idempotencyKey, idempotencyKey),
          ),
        )
        .limit(1);
      return row?.resourceId;
    },

    async claim(tenantId, scope, idempotencyKey, resourceId, now) {
      const exec = getDatabaseExecutor(db);
      const existing = await this.get(tenantId, scope, idempotencyKey);
      if (existing) {
        return { duplicate: true, resourceId: existing };
      }
      const createdAt = new Date(now ?? new Date().toISOString());
      try {
        await exec.insert(qepCoreQeIdempotency).values({
          id: randomUUID(),
          tenantId,
          scope,
          idempotencyKey,
          resourceId,
          createdAt,
        });
        return { duplicate: false, resourceId };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/duplicate|unique/i.test(message)) {
          const again = await this.get(tenantId, scope, idempotencyKey);
          return {
            duplicate: true,
            resourceId: again ?? resourceId,
          };
        }
        throw error;
      }
    },
  };
}
