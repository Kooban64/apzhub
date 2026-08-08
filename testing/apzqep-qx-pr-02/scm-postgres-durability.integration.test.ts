/**
 * QX-PR-02 — SCM RepositoryStore Postgres durability evidence.
 * Proves: migration-backed tables · write · restart hydrate · tenant isolation.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { checkDatabaseHealth, createDb } from "@apzhub/config";
import { createPostgresRepositoryStore, deleteScmDataForTenant } from "@apzhub/qep-scm";
import type { RegisteredRepository, WebhookAuditRecord } from "@apzhub/platform-scm";

const hasDb = Boolean(process.env.DATABASE_URL?.trim());
const stamp = Date.now().toString(36);
const tenantA = `t-qxpr02-a-${stamp}`;
const tenantB = `t-qxpr02-b-${stamp}`;
const repositoryIdA = `repo-qxpr02-a-${stamp}`;
const repositoryIdB = `repo-qxpr02-b-${stamp}`;
const auditIdA = `audit-qxpr02-a-${stamp}`;

function repository(repositoryId: string, tenantId: string): RegisteredRepository {
  const now = new Date().toISOString();
  return {
    repositoryId,
    tenantId,
    providerId: "github",
    externalId: repositoryId,
    fullName: `${tenantId}/apzhub`,
    defaultBranch: "main",
    visibility: "private",
    state: "enabled",
    registeredAt: now,
    updatedAt: now,
    registeredBy: "qx-pr-02-verifier",
    health: { ok: true, detail: "registered", checkedAt: now },
  };
}

function webhookAudit(auditId: string, tenantId: string): WebhookAuditRecord {
  const now = new Date().toISOString();
  return {
    auditId,
    tenantId,
    providerId: "github",
    deliveryId: `delivery-${auditId}`,
    state: "processed",
    eventKind: "push",
    repositoryFullName: `${tenantId}/apzhub`,
    idempotencyKey: `idem-${auditId}`,
    detail: "QX-PR-02 durability probe",
    occurredAt: now,
  };
}

describe.skipIf(!hasDb)("QX-PR-02 SCM Postgres durability", () => {
  beforeAll(async () => {
    const health = await checkDatabaseHealth();
    if (!health.ok) {
      throw new Error(`DATABASE_URL unhealthy: ${health.message ?? "unknown"}`);
    }
  });

  afterAll(async () => {
    const db = createDb();
    await deleteScmDataForTenant(tenantA, db);
    await deleteScmDataForTenant(tenantB, db);
  });

  it("survives client recreation (simulated restart) and isolates tenants", async () => {
    const writer = createPostgresRepositoryStore(createDb());
    await writer.upsert(repository(repositoryIdA, tenantA));
    await writer.upsert(repository(repositoryIdB, tenantB));
    await writer.recordWebhook(webhookAudit(auditIdA, tenantA));
    await writer.rememberIdempotencyKey(`idem-${auditIdA}`, tenantA);

    const reader = createPostgresRepositoryStore(createDb(process.env.DATABASE_URL));
    const hydrated = await reader.get(repositoryIdA);
    expect(hydrated).toBeDefined();
    expect(hydrated?.repositoryId).toBe(repositoryIdA);
    expect(hydrated?.tenantId).toBe(tenantA);
    expect(hydrated?.providerId).toBe("github");
    expect(hydrated?.fullName).toBe(`${tenantA}/apzhub`);

    const listedA = await reader.list(tenantA);
    expect(listedA.every((row) => row.tenantId === tenantA)).toBe(true);
    expect(listedA.some((row) => row.repositoryId === repositoryIdA)).toBe(true);
    expect(listedA.some((row) => row.repositoryId === repositoryIdB)).toBe(false);

    const listedB = await reader.list(tenantB);
    expect(listedB.some((row) => row.repositoryId === repositoryIdB)).toBe(true);
    expect(listedB.some((row) => row.repositoryId === repositoryIdA)).toBe(false);

    const webhooksA = await reader.listWebhooks(tenantA);
    expect(webhooksA.some((row) => row.auditId === auditIdA)).toBe(true);
    expect(webhooksA.every((row) => row.tenantId === tenantA)).toBe(true);

    expect(await reader.hasIdempotencyKey(`idem-${auditIdA}`)).toBe(true);
    expect(
      await reader.findByFullName(tenantA, "github", `${tenantA}/apzhub`),
    ).toBeDefined();
  });
});
