/**
 * PostgreSQL publication journal (APZSEARCH-016).
 * Production SoR for orchestration — no silent in-memory fallback.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import { sql } from "drizzle-orm";

import { assertPublicationTransition } from "../lifecycle";
import type {
  PublicationJournalEntry,
  PublicationOperation,
  PublicationProductId,
  PublicationStatus,
} from "../types";
import type { PublicationJournalRepository } from "./port";

type JournalRow = {
  id: string;
  tenant_id: string;
  organisation_id: string | null;
  entity_id: string;
  entity_type: string;
  product_id: string;
  operation: string;
  payload_json: string;
  payload_hash: string;
  status: string;
  attempt_count: number;
  max_attempts: number;
  next_attempt_at: string | null;
  last_error: string | null;
  correlation_id: string;
  actor_user_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

function mapRow(row: JournalRow): PublicationJournalEntry {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    organisationId: row.organisation_id ?? undefined,
    entityId: row.entity_id,
    entityType: row.entity_type,
    productId: row.product_id as PublicationProductId,
    operation: row.operation as PublicationOperation,
    payloadJson: row.payload_json,
    payloadHash: row.payload_hash,
    status: row.status as PublicationStatus,
    attemptCount: Number(row.attempt_count),
    maxAttempts: Number(row.max_attempts),
    nextAttemptAt: row.next_attempt_at ?? undefined,
    lastError: row.last_error ?? undefined,
    correlationId: row.correlation_id,
    actorUserId: row.actor_user_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? undefined,
  };
}

function asRows(result: unknown): JournalRow[] {
  if (Array.isArray(result)) return result as JournalRow[];
  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows: unknown }).rows)
  ) {
    return (result as { rows: JournalRow[] }).rows;
  }
  return [];
}

export function createPostgresPublicationJournal(
  db: DatabaseExecutor,
): PublicationJournalRepository {
  if (!db) {
    throw new Error(
      "createPostgresPublicationJournal requires db — in-memory fallback is forbidden",
    );
  }

  return {
    async enqueue(input) {
      const result = await db.execute(sql`
        INSERT INTO platform_search_publication_journal (
          id, tenant_id, organisation_id, entity_id, entity_type, product_id,
          operation, payload_json, payload_hash, status, attempt_count, max_attempts,
          correlation_id, actor_user_id, created_at, updated_at
        ) VALUES (
          ${input.id}, ${input.tenantId}, ${input.organisationId ?? null},
          ${input.entityId}, ${input.entityType}, ${input.productId},
          ${input.operation}, ${input.payloadJson}, ${input.payloadHash},
          ${"queued"}, ${0}, ${input.maxAttempts},
          ${input.correlationId}, ${input.actorUserId ?? null},
          ${input.now}, ${input.now}
        )
        RETURNING *
      `);
      const row = asRows(result)[0];
      if (!row) throw new Error("Failed to insert publication journal entry");
      return mapRow(row);
    },

    async findById(id) {
      const result = await db.execute(sql`
        SELECT * FROM platform_search_publication_journal WHERE id = ${id} LIMIT 1
      `);
      const row = asRows(result)[0];
      return row ? mapRow(row) : null;
    },

    async findDuplicate(input) {
      const result = await db.execute(sql`
        SELECT * FROM platform_search_publication_journal
        WHERE tenant_id = ${input.tenantId}
          AND entity_id = ${input.entityId}
          AND operation = ${input.operation}
          AND payload_hash = ${input.payloadHash}
          AND status IN ('queued', 'publishing', 'published', 'retrying')
        ORDER BY created_at ASC
        LIMIT 1
      `);
      const row = asRows(result)[0];
      return row ? mapRow(row) : null;
    },

    async claimBatch(input) {
      const result = await db.execute(sql`
        WITH candidates AS (
          SELECT id FROM platform_search_publication_journal
          WHERE status = 'queued'
             OR (status = 'retrying' AND (next_attempt_at IS NULL OR next_attempt_at <= ${input.now}))
          ORDER BY created_at ASC
          LIMIT ${input.limit}
          FOR UPDATE SKIP LOCKED
        )
        UPDATE platform_search_publication_journal AS j
        SET status = 'publishing',
            attempt_count = j.attempt_count + 1,
            updated_at = ${input.now},
            next_attempt_at = NULL
        FROM candidates
        WHERE j.id = candidates.id
        RETURNING j.*
      `);
      return asRows(result).map(mapRow);
    },

    async updateStatus(input) {
      const current = await this.findById(input.id);
      if (!current) {
        throw new Error(`Publication journal entry not found: ${input.id}`);
      }
      if (current.status !== input.from) {
        throw new Error(
          `Publication status mismatch for ${input.id}: expected ${input.from}, found ${current.status}`,
        );
      }
      assertPublicationTransition(input.from, input.to);
      const result = await db.execute(sql`
        UPDATE platform_search_publication_journal
        SET status = ${input.to},
            updated_at = ${input.now},
            attempt_count = ${input.attemptCount ?? current.attemptCount},
            next_attempt_at = ${
              input.nextAttemptAt === null
                ? null
                : (input.nextAttemptAt ?? current.nextAttemptAt ?? null)
            },
            last_error = ${
              input.lastError === null
                ? null
                : (input.lastError ?? current.lastError ?? null)
            },
            published_at = ${
              input.publishedAt === null
                ? null
                : (input.publishedAt ?? current.publishedAt ?? null)
            }
        WHERE id = ${input.id}
        RETURNING *
      `);
      const row = asRows(result)[0];
      if (!row) throw new Error(`Failed to update publication ${input.id}`);
      return mapRow(row);
    },

    async countByStatus(status) {
      const result = await db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM platform_search_publication_journal
        WHERE status = ${status}
      `);
      const row = asRows(result)[0] as unknown as { count: number } | undefined;
      return Number(row?.count ?? 0);
    },

    async listByStatus(status, limit = 100) {
      const result = await db.execute(sql`
        SELECT * FROM platform_search_publication_journal
        WHERE status = ${status}
        ORDER BY created_at ASC
        LIMIT ${limit}
      `);
      return asRows(result).map(mapRow);
    },
  };
}
