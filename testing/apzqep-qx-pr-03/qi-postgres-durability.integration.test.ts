/**
 * QX-PR-03 — Quality Intelligence Postgres durability evidence.
 * Proves: migration-backed tables · write · restart hydrate · tenant isolation · immutability.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { checkDatabaseHealth, createDb } from "@apzhub/config";
import {
  createPlatformQualityIntelligence,
  type QualityObservation,
} from "@apzhub/platform-quality-intelligence";
import {
  createPostgresIntelligenceStore,
  deleteQiDataForTenant,
} from "@apzhub/qep-quality-intelligence";

const hasDb = Boolean(process.env.DATABASE_URL?.trim());
const stamp = Date.now().toString(36);
const tenantA = `t-qxpr03-a-${stamp}`;
const tenantB = `t-qxpr03-b-${stamp}`;
const correlationId = `corr-qxpr03-${stamp}`;

function observation(
  observationId: string,
  tenantId: string,
  summary: string,
): QualityObservation {
  const recordedAt = new Date().toISOString();
  return Object.freeze({
    observationId,
    tenantId,
    source: "automation",
    kind: "test_failure",
    summary,
    recordedAt,
    correlationId,
    severity: "warning",
  });
}

describe.skipIf(!hasDb)("QX-PR-03 QI Postgres durability", () => {
  beforeAll(async () => {
    const health = await checkDatabaseHealth();
    if (!health.ok) {
      throw new Error(`DATABASE_URL unhealthy: ${health.message ?? "unknown"}`);
    }
  });

  afterAll(async () => {
    const db = createDb();
    await deleteQiDataForTenant(tenantA, db);
    await deleteQiDataForTenant(tenantB, db);
  });

  it("survives client recreation (simulated restart) and isolates tenants", async () => {
    const observationIdA = `obs-qxpr03-a-${stamp}`;
    const observationIdB = `obs-qxpr03-b-${stamp}`;

    const writer = createPostgresIntelligenceStore(createDb());
    await writer.recordObservation(
      observation(observationIdA, tenantA, "Tenant A failure"),
    );
    await writer.recordObservation(
      observation(observationIdB, tenantB, "Tenant B failure"),
    );

    const reader = createPostgresIntelligenceStore(createDb(process.env.DATABASE_URL));
    const hydrated = await reader.getObservation(observationIdA);
    expect(hydrated).toBeDefined();
    expect(hydrated?.observationId).toBe(observationIdA);
    expect(hydrated?.tenantId).toBe(tenantA);
    expect(hydrated?.summary).toBe("Tenant A failure");

    const listedA = await reader.listObservations(tenantA);
    expect(listedA.every((row) => row.tenantId === tenantA)).toBe(true);
    expect(listedA.some((row) => row.observationId === observationIdA)).toBe(true);
    expect(listedA.some((row) => row.observationId === observationIdB)).toBe(false);

    const listedB = await reader.listObservations(tenantB);
    expect(listedB.some((row) => row.observationId === observationIdB)).toBe(true);
    expect(listedB.some((row) => row.observationId === observationIdA)).toBe(false);
  });

  it("rejects duplicate observation ids (immutable SoR)", async () => {
    const observationId = `obs-qxpr03-immutable-${stamp}`;
    const store = createPostgresIntelligenceStore(createDb());
    const row = observation(observationId, tenantA, "Immutable probe");
    await store.recordObservation(row);

    await expect(store.recordObservation(row)).rejects.toThrow(/immutable/i);
  });

  it("persists full analysis artefacts through engine + postgres store", async () => {
    const store = createPostgresIntelligenceStore(createDb());
    const qi = createPlatformQualityIntelligence({ store });

    await qi.engine.recordObservation({
      tenantId: tenantA,
      source: "evidence",
      kind: "evidence.gap",
      summary: "Missing evidence pack",
      correlationId,
      severity: "warning",
    });
    await qi.engine.recordObservation({
      tenantId: tenantA,
      source: "automation",
      kind: "automation.failure",
      summary: "Regression failed",
      correlationId,
      severity: "critical",
    });

    await qi.engine.calculateSignals(tenantA, correlationId);
    const { recommendations, scores } = await qi.engine.evaluateProviders(
      tenantA,
      correlationId,
    );
    expect(recommendations.length).toBeGreaterThan(0);
    expect(scores.length).toBeGreaterThan(0);

    const reader = createPostgresIntelligenceStore(createDb(process.env.DATABASE_URL));
    expect((await reader.listSignals(tenantA)).length).toBeGreaterThan(0);
    expect((await reader.listRecommendations(tenantA)).length).toBe(
      recommendations.length,
    );
    expect((await reader.listScores(tenantA)).length).toBe(scores.length);
    expect((await reader.listAudits(tenantA)).some((a) => a.action === "created")).toBe(
      true,
    );
    expect((await reader.listExplanations(tenantA)).length).toBeGreaterThan(0);
  });
});
