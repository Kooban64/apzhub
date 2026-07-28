/**
 * PostgreSQL Automation execution journal (APZHUB-ENG-0001 / R12-PERSIST-01).
 * Production System of Record — no silent in-memory fallback.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import { sql } from "drizzle-orm";

import type { AutomationExecutionJournal } from "./automation-execution-journal";
import type { AutomationExecutionRecord, AutomationExecutionStatus } from "./types";

type JournalRow = {
  id: string;
  registration_id: string;
  registration_key: string;
  event_id: string;
  envelope_id: string;
  status: string;
  reason: string | null;
  correlation_id: string;
  tenant_id: string | null;
  executed_at: string | Date;
  details_json: unknown;
};

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

function toIso(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

function mapDetails(
  detailsJson: unknown,
): Readonly<Record<string, string>> | undefined {
  if (!detailsJson || typeof detailsJson !== "object") {
    return undefined;
  }
  const entries = Object.entries(detailsJson as Record<string, unknown>).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );
  if (entries.length === 0) {
    return undefined;
  }
  return Object.fromEntries(entries);
}

function mapRow(row: JournalRow): AutomationExecutionRecord {
  return {
    id: row.id,
    registrationId: row.registration_id,
    registrationKey: row.registration_key,
    eventId: row.event_id,
    envelopeId: row.envelope_id,
    status: row.status as AutomationExecutionStatus,
    reason: row.reason ?? undefined,
    correlationId: row.correlation_id,
    tenantId: row.tenant_id ?? undefined,
    executedAt: toIso(row.executed_at),
    details: mapDetails(row.details_json),
  };
}

export function createPostgresAutomationExecutionJournal(
  db: DatabaseExecutor,
): AutomationExecutionJournal {
  if (!db) {
    throw new Error(
      "createPostgresAutomationExecutionJournal requires db — in-memory fallback is forbidden",
    );
  }

  return {
    async record(entry) {
      const detailsJson = JSON.stringify(entry.details ?? {});
      await db.execute(sql`
        INSERT INTO platform_automation_execution_journal (
          id, registration_id, registration_key, event_id, envelope_id,
          status, reason, correlation_id, tenant_id, executed_at, details_json
        ) VALUES (
          ${entry.id},
          ${entry.registrationId},
          ${entry.registrationKey},
          ${entry.eventId},
          ${entry.envelopeId},
          ${entry.status},
          ${entry.reason ?? null},
          ${entry.correlationId},
          ${entry.tenantId ?? null},
          ${entry.executedAt},
          ${detailsJson}::jsonb
        )
        ON CONFLICT (envelope_id, registration_id) DO NOTHING
      `);
    },

    async hasProcessed(envelopeId, registrationId) {
      const result = await db.execute(sql`
        SELECT 1 AS present
        FROM platform_automation_execution_journal
        WHERE envelope_id = ${envelopeId}
          AND registration_id = ${registrationId}
        LIMIT 1
      `);
      return asRows(result).length > 0;
    },

    async list(filter) {
      const envelopeId = filter?.envelopeId ?? null;
      const registrationId = filter?.registrationId ?? null;
      const eventId = filter?.eventId ?? null;
      const result = await db.execute(sql`
        SELECT
          id, registration_id, registration_key, event_id, envelope_id,
          status, reason, correlation_id, tenant_id, executed_at, details_json
        FROM platform_automation_execution_journal
        WHERE
          (${envelopeId}::text IS NULL OR envelope_id = ${envelopeId})
          AND (${registrationId}::text IS NULL OR registration_id = ${registrationId})
          AND (${eventId}::text IS NULL OR event_id = ${eventId})
        ORDER BY executed_at ASC, id ASC
      `);
      return asRows(result).map(mapRow);
    },
  };
}

/**
 * Production helper — PostgreSQL mandatory.
 */
export function createProductionAutomationExecutionJournal(input: {
  readonly db: DatabaseExecutor;
}): AutomationExecutionJournal {
  if (!input?.db) {
    throw new Error(
      "createProductionAutomationExecutionJournal requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return createPostgresAutomationExecutionJournal(input.db);
}
