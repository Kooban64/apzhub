/**
 * QX-PR-01 — Automation ExecutionStore Postgres durability evidence.
 * Proves: migration-backed table · write · restart hydrate · tenant isolation.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { checkDatabaseHealth, createDb } from "@apzhub/config";
import {
  createPostgresExecutionStore,
  deleteAutomationExecutionsForTenant,
} from "@apzhub/qep-automation";
import type { AutomationExecutionRecord } from "@apzhub/platform-automation";

const hasDb = Boolean(process.env.DATABASE_URL?.trim());
const stamp = Date.now().toString(36);
const tenantA = `t-qxpr01-a-${stamp}`;
const tenantB = `t-qxpr01-b-${stamp}`;
const executionIdA = `exec-qxpr01-a-${stamp}`;
const executionIdB = `exec-qxpr01-b-${stamp}`;

function record(executionId: string, tenantId: string): AutomationExecutionRecord {
  const now = new Date().toISOString();
  return {
    executionId,
    tenantId,
    providerId: "playwright",
    correlationId: `corr-${stamp}`,
    requestedBy: "qx-pr-01-verifier",
    target: { kind: "url", name: "blank", baseUrl: "about:blank" },
    options: { dryRun: true },
    state: "completed",
    attempt: 1,
    maxAttempts: 1,
    createdAt: now,
    updatedAt: now,
    artifacts: [],
    timing: {},
    evidenceRefs: ["ev:qx-pr-01"],
    resultSummary: "QX-PR-01 durability probe",
  };
}

describe.skipIf(!hasDb)("QX-PR-01 Automation Postgres durability", () => {
  beforeAll(async () => {
    const health = await checkDatabaseHealth();
    if (!health.ok) {
      throw new Error(`DATABASE_URL unhealthy: ${health.message ?? "unknown"}`);
    }
  });

  afterAll(async () => {
    const db = createDb();
    await deleteAutomationExecutionsForTenant(tenantA, db);
    await deleteAutomationExecutionsForTenant(tenantB, db);
  });

  it("survives client recreation (simulated restart) and isolates tenants", async () => {
    const writer = createPostgresExecutionStore(createDb());
    await writer.save(record(executionIdA, tenantA));
    await writer.save(record(executionIdB, tenantB));

    const reader = createPostgresExecutionStore(createDb(process.env.DATABASE_URL));
    const hydrated = await reader.get(executionIdA);
    expect(hydrated).toBeDefined();
    expect(hydrated?.executionId).toBe(executionIdA);
    expect(hydrated?.tenantId).toBe(tenantA);
    expect(hydrated?.state).toBe("completed");
    expect(hydrated?.providerId).toBe("playwright");
    expect(hydrated?.evidenceRefs).toContain("ev:qx-pr-01");

    const listedA = await reader.list(tenantA);
    expect(listedA.every((row) => row.tenantId === tenantA)).toBe(true);
    expect(listedA.some((row) => row.executionId === executionIdA)).toBe(true);
    expect(listedA.some((row) => row.executionId === executionIdB)).toBe(false);

    const listedB = await reader.list(tenantB);
    expect(listedB.some((row) => row.executionId === executionIdB)).toBe(true);
    expect(listedB.some((row) => row.executionId === executionIdA)).toBe(false);
  });
});
