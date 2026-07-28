/**
 * Mocked PostgreSQL journal coverage (APZHUB-ENG-0001 / R12-PERSIST-01).
 */

import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";

import {
  createPostgresAutomationExecutionJournal,
  createProductionAutomationExecutionJournal,
} from "./automation-execution-journal-postgres";
import type { AutomationExecutionRecord } from "./types";

function createMockDb(selectResults: unknown[] = []) {
  const execute = vi.fn(async () => ({ rows: selectResults }));
  const db = { execute } as unknown as DatabaseExecutor;
  return { db, execute };
}

const sample: AutomationExecutionRecord = {
  id: "auto_exec_00000001",
  registrationId: "auto_reg_1",
  registrationKey: "support.request.*→automation.journal",
  eventId: "support.request.created",
  envelopeId: "env_1",
  status: "succeeded",
  reason: "JOURNALED",
  correlationId: "corr_1",
  tenantId: "tenant_a",
  executedAt: "2026-07-20T12:00:00.000Z",
  details: { note: "ok" },
};

describe("Postgres AutomationExecutionJournal (R12-PERSIST-01)", () => {
  it("requires db for production helper", () => {
    expect(() =>
      createProductionAutomationExecutionJournal({
        db: undefined as unknown as DatabaseExecutor,
      }),
    ).toThrow(/explicit postgres db/);
  });

  it("records via INSERT … ON CONFLICT DO NOTHING", async () => {
    const { db, execute } = createMockDb();
    const journal = createPostgresAutomationExecutionJournal(db);

    await journal.record(sample);

    expect(execute).toHaveBeenCalledTimes(1);
    const query = JSON.stringify(execute.mock.calls);
    expect(query).toContain("platform_automation_execution_journal");
    expect(query).toMatch(/ON CONFLICT/i);
  });

  it("detects processed envelopes via SELECT", async () => {
    const { db, execute } = createMockDb([{ present: 1 }]);
    const journal = createPostgresAutomationExecutionJournal(db);

    await expect(journal.hasProcessed("env_1", "auto_reg_1")).resolves.toBe(true);
    expect(execute).toHaveBeenCalled();
  });

  it("maps list rows to AutomationExecutionRecord", async () => {
    const { db } = createMockDb([
      {
        id: sample.id,
        registration_id: sample.registrationId,
        registration_key: sample.registrationKey,
        event_id: sample.eventId,
        envelope_id: sample.envelopeId,
        status: sample.status,
        reason: sample.reason,
        correlation_id: sample.correlationId,
        tenant_id: sample.tenantId,
        executed_at: sample.executedAt,
        details_json: sample.details,
      },
    ]);
    const journal = createPostgresAutomationExecutionJournal(db);
    const rows = await journal.list({ envelopeId: "env_1" });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: sample.id,
      registrationId: sample.registrationId,
      status: "succeeded",
      tenantId: "tenant_a",
      details: { note: "ok" },
    });
  });
});
