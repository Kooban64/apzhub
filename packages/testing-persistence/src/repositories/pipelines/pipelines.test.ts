import { describe, expect, it } from "vitest";

import { createInMemoryTestingPersistence, type RepositoryContext } from "../../index";

function ctx(overrides?: Partial<RepositoryContext>): RepositoryContext {
  return {
    tenantId: "tenant-a",
    organisationId: "org-a",
    actorUserId: "user-1",
    correlationId: "corr-1",
    permissions: ["pipeline.*", "testing.admin"],
    ...overrides,
  };
}

describe("pipeline repositories (in-memory)", () => {
  it("registers, lists, and archives pipelines", async () => {
    const db = createInMemoryTestingPersistence();
    const c = ctx();

    const pipeline = await db.pipelines.create(c, {
      key: "build-main",
      name: "Build Main",
      providerKind: "generic_ci",
      externalPipelineRef: "ext-pipe-1",
      status: "active",
      variablesJson: [{ name: "NODE_ENV" }],
      secretRefsJson: [{ name: "TOKEN", reference: "vault://token" }],
    });

    expect(pipeline.key).toBe("build-main");
    expect(pipeline.providerKind).toBe("generic_ci");

    const listed = await db.pipelines.list(c);
    expect(listed.items).toHaveLength(1);

    const got = await db.pipelines.get(c, pipeline.id);
    expect(got?.name).toBe("Build Main");

    const archived = await db.pipelines.update(c, pipeline.id, pipeline.revision, {
      status: "archived",
    });
    expect(archived.status).toBe("archived");
  });

  it("imports runs with nested JSON and history", async () => {
    const db = createInMemoryTestingPersistence();
    const c = ctx();

    const pipeline = await db.pipelines.create(c, {
      key: "ci",
      name: "CI",
      providerKind: "generic_ci",
      status: "active",
      variablesJson: [],
      secretRefsJson: [],
    });

    const imp = await db.pipelineImports.create(c, {
      providerKind: "generic_ci",
      adapterVersion: "1.0.0",
      externalRunRef: "run-1",
      pipelineId: pipeline.id,
      status: "completed",
      payloadFingerprint: "abc123",
      summary: { ok: true },
    });

    const run = await db.pipelineRuns.create(c, {
      pipelineId: pipeline.id,
      importId: imp.id,
      providerKind: "generic_ci",
      externalRunRef: "run-1",
      status: "passed",
      stagesJson: [{ name: "build", status: "passed" }],
      jobsJson: [{ name: "compile", status: "passed", stageKey: "build" }],
      artifactsJson: [{ name: "dist.zip", sizeBytes: 10 }],
      approvalsJson: [],
      eventsJson: [{ kind: "completed", occurredAt: new Date().toISOString() }],
      environmentJson: { branch: "main" },
      linksJson: {},
      summaryJson: { overallStatus: "passed" },
      logsJson: [],
      variablesJson: [],
      secretRefsJson: [],
    });

    expect(run.stagesJson).toHaveLength(1);
    expect(run.jobsJson).toHaveLength(1);

    await db.pipelineImportHistory.append(c, {
      id: "hist-1",
      importId: imp.id,
      eventType: "import_completed",
      summary: "Import completed",
      details: { runId: run.id },
    });

    const history = await db.pipelineImportHistory.listByImport(c, imp.id);
    expect(history.items).toHaveLength(1);
    expect(history.items[0]?.eventType).toBe("import_completed");

    const updated = await db.pipelineRuns.update(c, run.id, run.revision, {
      linksJson: { releaseId: "rel-1" },
      artifactsJson: [
        ...(run.artifactsJson as unknown[]),
        { name: "coverage.xml", sizeBytes: 2 },
      ],
    });
    expect(updated.linksJson).toEqual({ releaseId: "rel-1" });
    expect(updated.artifactsJson).toHaveLength(2);
  });

  it("rejects unauthorized pipeline access", async () => {
    const db = createInMemoryTestingPersistence();
    await expect(db.pipelines.list(ctx({ permissions: [] }))).rejects.toThrow();
  });
});
