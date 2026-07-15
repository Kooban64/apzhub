import { describe, expect, it } from "vitest";

import {
  asCertificationRecordId,
  asEvidenceId,
  asReleaseId,
  createDefaultApzTcmsConfiguration,
} from "@apzhub/testing-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createGenericCiAdapter,
  createPipelineAdapterRegistry,
  createPipelineIngestionServices,
  createPipelineNormalizationService,
  fingerprintPipelinePayload,
} from "./index";

function ctx(
  overrides?: Partial<ServiceRequestContext>,
): ServiceRequestContext {
  return {
    tenantId: "tenant-a",
    organisationId: "org-a",
    userId: "user-1",
    correlationId: "corr-pipe-1",
    permissions: ["pipeline.*", "pipeline.import", "pipeline.read", "pipeline.admin"],
    locale: "en",
    timezone: "UTC",
    ...overrides,
  };
}

function samplePayload(overrides?: Record<string, unknown>) {
  return {
    provider: "generic_ci",
    externalRunRef: "run-100",
    pipelineKey: "build-main",
    pipelineName: "Build Main",
    status: "passed",
    stages: [
      {
        key: "build",
        name: "Build",
        status: "passed",
        jobs: [
          {
            key: "compile",
            name: "Compile",
            status: "passed",
            steps: [{ name: "tsc", status: "passed", durationMs: 12 }],
          },
        ],
      },
    ],
    jobs: [
      {
        key: "compile",
        name: "Compile",
        status: "passed",
        stageKey: "build",
      },
    ],
    artifacts: [{ name: "dist.zip", sizeBytes: 100, type: "zip" }],
    environment: { branch: "main", commit: "abc" },
    approvals: [{ kind: "qa", status: "approved" }],
    events: [{ kind: "completed", occurredAt: "2026-07-12T12:00:00.000Z" }],
    summary: { overallStatus: "passed", passed: 1 },
    variables: [{ name: "NODE_ENV" }],
    secretRefs: [{ name: "TOKEN", reference: "vault://token" }],
    ...overrides,
  };
}

describe("pipeline ingestion domain", () => {
  it("registers only generic_ci by default", () => {
    const registry = createPipelineAdapterRegistry();
    expect(registry.list()).toHaveLength(1);
    expect(registry.get("generic_ci")?.kind).toBe("generic_ci");
    expect(registry.get("github_actions")).toBeUndefined();
  });

  it("parses generic CI JSON via adapter", () => {
    const adapter = createGenericCiAdapter();
    expect(adapter.canParse(samplePayload())).toBe(true);
    expect(adapter.canParse({ provider: "github_actions" })).toBe(false);
    const parsed = adapter.parse(samplePayload());
    expect(parsed.providerKind).toBe("generic_ci");
    expect(parsed.stages).toHaveLength(1);
    expect(parsed.jobs[0]?.name).toBe("Compile");
    expect(parsed.status).toBe("passed");
  });

  it("normalizes status aliases", () => {
    const norm = createPipelineNormalizationService();
    expect(norm.normalizeStatus("success")).toBe("passed");
    expect(norm.normalizeStatus("canceled")).toBe("cancelled");
    expect(norm.normalizeStatus("bogus")).toBe("unknown");
    const result = norm.normalizeResult({
      providerKind: "generic_ci",
      externalRunRef: "r1",
      status: "success" as never,
      stages: [{ name: "s", status: "success" as never }],
      jobs: [{ name: "j", status: "fail" as never }],
      artifacts: [],
      environment: {},
      approvals: [],
      events: [],
      logs: [],
      variables: [],
      secretRefs: [],
      summary: { overallStatus: "success" as never },
    });
    expect(result.status).toBe("passed");
    expect(result.jobs[0]?.status).toBe("failed");
  });

  it("fingerprints payloads stably", () => {
    const a = fingerprintPipelinePayload({ a: 1 });
    const b = fingerprintPipelinePayload({ a: 1 });
    const c = fingerprintPipelinePayload({ a: 2 });
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(fingerprintPipelinePayload("raw")).toHaveLength(64);
  });

  it("imports a run end-to-end and lists nested metadata", async () => {
    const persistence = createInMemoryTestingPersistence();
    const services = createPipelineIngestionServices({
      persistence,
      configuration: createDefaultApzTcmsConfiguration(),
    });
    const c = ctx();

    const registered = await services.imports.registerPipeline(c, {
      key: "build-main",
      name: "Build Main",
      providerKind: "generic_ci",
    });
    expect(registered.key).toBe("build-main");

    const outcome = await services.imports.importRun(c, {
      payload: samplePayload(),
      pipelineId: registered.id,
    });
    expect(outcome.importRecord.status).toBe("completed");
    expect(outcome.run?.status).toBe("passed");
    expect(outcome.pipeline?.id).toBe(registered.id);

    const stages = await services.imports.listStages(c, outcome.run!.id);
    const jobs = await services.imports.listJobs(c, outcome.run!.id);
    expect(stages).toHaveLength(1);
    expect(jobs).toHaveLength(1);

    const history = await services.imports.listHistory(c, outcome.importRecord.id);
    expect(history.some((h) => h.eventType === "import_completed")).toBe(true);

    const providers = await services.imports.listProviders(c);
    expect(providers.map((p) => p.kind)).toEqual(["generic_ci"]);
  });

  it("detects duplicate imports by externalRunRef", async () => {
    const persistence = createInMemoryTestingPersistence();
    const services = createPipelineIngestionServices({ persistence });
    const c = ctx();

    await services.imports.importRun(c, { payload: samplePayload() });
    const dup = await services.imports.importRun(c, {
      payload: samplePayload({ status: "failed" }),
    });
    expect(dup.importRecord.status).toBe("duplicate");
    expect(dup.duplicateOf).toBeDefined();
  });

  it("links artifacts, evidence, certifications, and releases", async () => {
    const persistence = createInMemoryTestingPersistence();
    const services = createPipelineIngestionServices({ persistence });
    const c = ctx();
    const outcome = await services.imports.importRun(c, {
      payload: samplePayload({ externalRunRef: "run-link" }),
    });
    const runId = outcome.run!.id;

    const withArtifacts = await services.imports.linkArtifacts(c, runId, [
      { name: "junit.xml", sizeBytes: 20, type: "xml" },
    ]);
    expect(withArtifacts.artifacts.length).toBeGreaterThanOrEqual(2);

    const withEvidence = await services.imports.linkEvidence(c, runId, [
      asEvidenceId("ev_abc123"),
    ]);
    expect(withEvidence.links.evidenceIds).toContain("ev_abc123");

    const withCert = await services.imports.linkCertifications(
      c,
      runId,
      asCertificationRecordId("cert_abc123"),
    );
    expect(withCert.links.certificationRecordId).toBe("cert_abc123");

    const withRelease = await services.imports.linkReleases(
      c,
      runId,
      asReleaseId("rel_abc123"),
    );
    expect(withRelease.links.releaseId).toBe("rel_abc123");

    const links = await services.imports.getLinks(c, runId);
    expect(links.releaseId).toBe("rel_abc123");
  });

  it("updates, synchronises, archives, and lists pipelines", async () => {
    const persistence = createInMemoryTestingPersistence();
    const services = createPipelineIngestionServices({ persistence });
    const c = ctx();

    const pipeline = await services.imports.registerPipeline(c, {
      key: "deploy",
      name: "Deploy",
      providerKind: "generic_ci",
    });
    const updated = await services.imports.updatePipeline(c, pipeline.id, {
      name: "Deploy Prod",
      description: "Production deploy",
    });
    expect(updated.name).toBe("Deploy Prod");

    const synced = await services.imports.synchroniseMetadata(c, {
      pipelineId: pipeline.id,
      externalPipelineRef: "ext-99",
      defaultBranch: "main",
    });
    expect(synced.externalPipelineRef).toBe("ext-99");

    const archived = await services.imports.archivePipeline(c, pipeline.id);
    expect(archived.status).toBe("archived");

    const listed = await services.imports.listPipelines(c);
    // Archived pipelines are soft-deleted from default list views.
    expect(listed.every((p) => p.id !== pipeline.id || p.status === "archived")).toBe(
      true,
    );
  });

  it("imports execution summaries without full payloads", async () => {
    const persistence = createInMemoryTestingPersistence();
    const services = createPipelineIngestionServices({ persistence });
    const c = ctx();
    const pipeline = await services.imports.registerPipeline(c, {
      key: "summary-pipe",
      name: "Summary",
      providerKind: "generic_ci",
    });
    const outcome = await services.imports.importExecutionSummary(c, {
      pipelineId: pipeline.id,
      externalRunRef: "summary-run-1",
      status: "failed",
      summary: { overallStatus: "failed", failed: 1 },
      durationMs: 42,
    });
    expect(outcome.run?.status).toBe("failed");
    expect(outcome.importRecord.status).toBe("completed");
  });

  it("rejects unauthorized imports and invalid payloads", async () => {
    const persistence = createInMemoryTestingPersistence();
    const services = createPipelineIngestionServices({ persistence });
    await expect(
      services.imports.importRun(ctx({ permissions: [] }), {
        payload: samplePayload(),
      }),
    ).rejects.toThrow(/pipeline\.import/);

    await expect(
      services.imports.importRun(ctx(), { payload: { not: "valid-enough" } }),
    ).rejects.toThrow();

    expect(() =>
      services.validation.validateCanonical({
        providerKind: "generic_ci",
        externalRunRef: "",
        status: "passed",
        stages: [],
        jobs: [],
        artifacts: [],
        environment: {},
        approvals: [],
        events: [],
        summary: { overallStatus: "passed" },
        logs: [],
        variables: [],
        secretRefs: [],
      }),
    ).toThrow(/externalRunRef/);
  });

  it("resolves adapter for input and rejects unknown providers", async () => {
    const registry = createPipelineAdapterRegistry();
    expect(registry.resolveForInput(samplePayload()).kind).toBe("generic_ci");
    expect(() => registry.resolveForInput({ foo: 1 })).toThrow(/No pipeline adapter/);
  });

  it("lists imports and gets run/import by id", async () => {
    const persistence = createInMemoryTestingPersistence();
    const services = createPipelineIngestionServices({ persistence });
    const c = ctx();
    const outcome = await services.imports.importRun(c, {
      payload: samplePayload({ externalRunRef: "run-get" }),
    });
    const imports = await services.imports.listImports(c);
    expect(imports.length).toBeGreaterThan(0);
    const gotImport = await services.imports.getImport(c, outcome.importRecord.id);
    expect(gotImport.externalRunRef).toBe("run-get");
    const gotRun = await services.imports.getRun(c, outcome.run!.id);
    expect(gotRun.externalRunRef).toBe("run-get");
    const runs = await services.imports.listRuns(c, outcome.pipeline!.id);
    expect(runs.some((r) => r.id === outcome.run!.id)).toBe(true);
    const pipeline = await services.imports.getPipeline(c, outcome.pipeline!.id);
    expect(pipeline.key).toBe("build-main");
  });

  it("auto-registers pipeline from payload key when not provided", async () => {
    const persistence = createInMemoryTestingPersistence();
    const services = createPipelineIngestionServices({ persistence });
    const outcome = await services.imports.importRun(ctx(), {
      payload: samplePayload({
        externalRunRef: "auto-1",
        pipelineKey: "auto-key",
      }),
    });
    expect(outcome.pipeline?.key).toBe("auto-key");
  });

  it("parses string JSON payloads and status aliases in adapter", () => {
    const adapter = createGenericCiAdapter();
    const parsed = adapter.parse(
      JSON.stringify({
        externalRunRef: "s1",
        status: "success",
        jobs: [{ name: "j", status: "failure" }],
      }),
    );
    expect(parsed.status).toBe("passed");
    expect(parsed.jobs[0]?.status).toBe("failed");
    expect(parsed.stages.length).toBeGreaterThan(0);
  });

  it("exercises registry and link façades", async () => {
    const persistence = createInMemoryTestingPersistence();
    const services = createPipelineIngestionServices({ persistence });
    const c = ctx();
    const pipeline = await services.pipelineRegistry.registerPipeline(c, {
      key: "facade",
      name: "Facade",
      providerKind: "generic_ci",
    });
    await services.pipelineRegistry.updatePipeline(c, pipeline.id, {
      name: "Facade Updated",
    });
    await services.pipelineRegistry.synchroniseMetadata(c, {
      pipelineId: pipeline.id,
      repositoryRef: "git://repo",
    });
    expect((await services.pipelineRegistry.getPipeline(c, pipeline.id)).name).toBe(
      "Facade Updated",
    );
    const outcome = await services.imports.importRun(c, {
      payload: samplePayload({ externalRunRef: "facade-run", pipelineKey: "facade" }),
      pipelineId: pipeline.id,
    });
    const linked = await services.links.linkArtifacts(c, outcome.run!.id, [
      { name: "extra.bin", sizeBytes: 1 },
    ]);
    expect(linked.artifacts.some((a) => a.name === "extra.bin")).toBe(true);
    await services.links.linkEvidence(c, outcome.run!.id, [asEvidenceId("ev_facade1")]);
    await services.links.linkCertifications(
      c,
      outcome.run!.id,
      asCertificationRecordId("cert_facade1"),
    );
    await services.links.linkReleases(c, outcome.run!.id, asReleaseId("rel_facade1"));
    const links = await services.links.getLinks(c, outcome.run!.id);
    expect(links.releaseId).toBe("rel_facade1");
    expect((await services.pipelineRegistry.listPipelines(c)).length).toBeGreaterThan(0);
    await services.pipelineRegistry.archivePipeline(c, pipeline.id);
  });

  it("detects duplicates by fingerprint and validates secrets/variables", async () => {
    const persistence = createInMemoryTestingPersistence();
    const services = createPipelineIngestionServices({ persistence });
    const c = ctx();
    await persistence.pipelineImports.create(
      {
        tenantId: c.tenantId,
        organisationId: c.organisationId,
        actorUserId: c.userId,
        correlationId: c.correlationId,
        permissions: c.permissions ?? [],
      },
      {
        providerKind: "generic_ci",
        adapterVersion: "1.0.0",
        externalRunRef: "seed-run",
        status: "completed",
        payloadFingerprint: "fixed-fingerprint",
      },
    );
    const byFp = await services.validation.detectDuplicate(c, {
      providerKind: "generic_ci",
      externalRunRef: "other-run",
      payloadFingerprint: "fixed-fingerprint",
    });
    expect(byFp?.externalRunRef).toBe("seed-run");

    expect(() =>
      services.validation.validateCanonical({
        providerKind: "generic_ci",
        externalRunRef: "x",
        status: "passed",
        stages: [{ name: "" } as never],
        jobs: [],
        artifacts: [],
        environment: {},
        approvals: [],
        events: [],
        summary: { overallStatus: "passed" },
        logs: [],
        variables: [{ name: "" }],
        secretRefs: [],
      }),
    ).toThrow(/Stage name/);

    expect(() =>
      services.validation.validateCanonical({
        providerKind: "generic_ci",
        externalRunRef: "x",
        status: "passed",
        stages: [],
        jobs: [{ name: "" } as never],
        artifacts: [],
        environment: {},
        approvals: [],
        events: [],
        summary: { overallStatus: "passed" },
        logs: [],
        variables: [],
        secretRefs: [],
      }),
    ).toThrow(/Job name/);

    expect(() =>
      services.validation.validateCanonical({
        providerKind: "generic_ci",
        externalRunRef: "x",
        status: "passed",
        stages: [],
        jobs: [],
        artifacts: [],
        environment: {},
        approvals: [],
        events: [],
        summary: { overallStatus: "passed" },
        logs: [],
        variables: [{ name: "" }],
        secretRefs: [],
      }),
    ).toThrow(/Variable name/);

    expect(() =>
      services.validation.validateCanonical({
        providerKind: "generic_ci",
        externalRunRef: "x",
        status: "passed",
        stages: [],
        jobs: [],
        artifacts: [],
        environment: {},
        approvals: [],
        events: [],
        summary: { overallStatus: "passed" },
        logs: [],
        variables: [],
        secretRefs: [{ name: "S", reference: "" }],
      }),
    ).toThrow(/Secret reference/);

    expect(() =>
      services.validation.validateCanonical({
        providerKind: "not_a_provider" as never,
        externalRunRef: "x",
        status: "passed",
        stages: [],
        jobs: [],
        artifacts: [],
        environment: {},
        approvals: [],
        events: [],
        summary: { overallStatus: "passed" },
        logs: [],
        variables: [],
        secretRefs: [],
      }),
    ).toThrow(/providerKind/);
  });

  it("covers adapter edge cases for environment, metrics, and empty jobs", () => {
    const adapter = createGenericCiAdapter();
    expect(adapter.canParse("not-json")).toBe(false);
    expect(adapter.canParse([])).toBe(false);
    const parsed = adapter.parse({
      externalRunRef: "edge-1",
      status: "in_progress",
      stages: [{ name: "s1", status: "running", jobs: [{ name: "j1", status: "running" }] }],
      environment: {
        name: "prod",
        url: "https://ci",
        extra: { k: "v" },
      },
      metrics: { jobCount: 1 },
      logs: [{ name: "log.txt" }],
      trigger: { kind: "push" },
      source: { repository: "r", branch: "main" },
      metadata: { a: 1 },
      approvals: [{ kind: "security", status: "pending" }],
      events: [{ kind: "running", occurredAt: "2026-07-12T00:00:00.000Z" }],
      artifacts: [{ name: "a.bin" }],
      variables: [{ name: "V" }],
      secretRefs: [{ name: "S", reference: "ref" }],
    });
    expect(parsed.status).toBe("running");
    expect(parsed.environment.name).toBe("prod");
    expect(parsed.metrics?.jobCount).toBe(1);

    const fromBranch = adapter.parse({
      externalRunRef: "edge-2",
      status: "timeout",
      branch: "develop",
      commit: "deadbeef",
      jobs: [{ name: "only", status: "timed_out" }],
    });
    expect(fromBranch.status).toBe("timed_out");
    expect(fromBranch.environment.branch).toBe("develop");

    expect(() => adapter.parse({ provider: "generic_ci" })).toThrow(/requires/);
  });

  it("throws when duplicate return is disallowed", async () => {
    const persistence = createInMemoryTestingPersistence();
    const services = createPipelineIngestionServices({ persistence });
    const c = ctx();
    await services.imports.importRun(c, {
      payload: samplePayload({ externalRunRef: "nodup" }),
    });
    await expect(
      services.imports.importRun(c, {
        payload: samplePayload({ externalRunRef: "nodup" }),
        allowDuplicateReturn: false,
      }),
    ).rejects.toThrow(/Duplicate/);
  });

  it("fingerprints binary payloads", () => {
    const bytes = new TextEncoder().encode('{"a":1}');
    expect(fingerprintPipelinePayload(bytes)).toHaveLength(64);
  });
});
