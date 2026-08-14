import { describe, expect, it, beforeEach } from "vitest";

import {
  appendAlmProduceRecord,
  listAlmProduceRecords,
  resetAlmProduceStoreForTests,
} from "./alm-produce-store";
import {
  produceAlmWorkItemsFromDefect,
  resolveAlmProduceConfig,
} from "./alm-produce-from-defect";
import { getDefectRuntime } from "./defect-runtime";

const actor = {
  userId: "user-f16",
  tenantId: "tenant-f16",
  permissions: [
    "qep.defects.read",
    "qep.defects.create",
    "qep.defects.update",
    "qep.*",
  ],
};

describe("F16 alm-produce", () => {
  beforeEach(() => {
    resetAlmProduceStoreForTests();
  });

  it("resolves record_only by default", () => {
    expect(resolveAlmProduceConfig({}).mode).toBe("record_only");
    expect(resolveAlmProduceConfig({ APZHUB_ALM_PRODUCE_MODE: "live" }).mode).toBe(
      "live",
    );
    expect(
      resolveAlmProduceConfig({
        APZHUB_ALM_PRODUCE_CHANNELS: "projects,support",
      }).channels,
    ).toEqual(["projects", "support"]);
  });

  it("record_only produces ledger rows for projects + support", async () => {
    const defect = await getDefectRuntime().service.create(actor, {
      title: "F16 sample defect",
      description: "from QA Gate",
      severity: "major",
      priority: "p1",
    });

    const result = await produceAlmWorkItemsFromDefect({
      tenantId: actor.tenantId,
      userId: actor.userId,
      permissions: actor.permissions,
      serviceContext: {
        tenantId: actor.tenantId,
        userId: actor.userId,
        correlationId: "corr-f16",
        permissions: actor.permissions,
      } as never,
      defectId: defect.defectId,
      changeEventId: "chg-f16-1",
      channels: ["projects", "support"],
      env: {
        APZHUB_ALM_PRODUCE_MODE: "record_only",
        APZHUB_ALM_PRODUCE_CHANNELS: "projects,support",
      },
      deps: {},
    });

    expect(result.autoCertified).toBe(false);
    expect(result.records).toHaveLength(2);
    expect(result.records.every((r) => r.status === "recorded")).toBe(true);
    expect(result.records.some((r) => r.channel === "projects")).toBe(true);
    expect(result.records.some((r) => r.channel === "support")).toBe(true);
    expect(
      listAlmProduceRecords({ changeEventId: "chg-f16-1" }).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("live soft-fails projects create and records failed status", async () => {
    const defect = await getDefectRuntime().service.create(actor, {
      title: "F16 live fail",
      severity: "minor",
      priority: "p3",
    });

    const result = await produceAlmWorkItemsFromDefect({
      tenantId: actor.tenantId,
      userId: actor.userId,
      permissions: actor.permissions,
      serviceContext: {
        tenantId: actor.tenantId,
        userId: actor.userId,
        correlationId: "corr-f16b",
        permissions: actor.permissions,
      } as never,
      defectId: defect.defectId,
      channels: ["projects"],
      env: {
        APZHUB_ALM_PRODUCE_MODE: "live",
        APZHUB_ALM_PROJECTS_PROJECT_ID: "proj_demo",
      },
      deps: {
        createProjectTask: async () => {
          throw new Error("plane_unavailable");
        },
      },
    });

    expect(result.records).toHaveLength(1);
    expect(result.records[0]?.status).toBe("failed");
    expect(result.records[0]?.detail).toMatch(/plane_unavailable/);
  });

  it("source policy: never certifies; uses TaskService/SupportService path names", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const source = await fs.readFile(
      path.join(process.cwd(), "apps/web/lib/qep/alm-produce-from-defect.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/recordHumanCertificationDecision/);
    expect(source).toMatch(/autoCertified: false/);
    expect(source).toMatch(/createProjectTask/);
    expect(source).toMatch(/createSupportRequest/);
    expect(source).not.toMatch(/PlaneClient|ZammadClient/);
  });

  it("store appends records", () => {
    appendAlmProduceRecord({
      produceId: "alm-1",
      tenantId: "t1",
      defectId: "def-1",
      channel: "projects",
      status: "recorded",
      mode: "record_only",
      correlationId: "c1",
      createdAt: "2026-08-10T00:00:00.000Z",
      title: "x",
    });
    expect(listAlmProduceRecords({ defectId: "def-1" })).toHaveLength(1);
  });
});
