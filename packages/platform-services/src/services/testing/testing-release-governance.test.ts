import { describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import { resolveOperationAuthorization } from "../../authorization/operation-authorization-map";
import { createTestingPlatformServicesForTest } from "./create-testing-platform-services";

const ctx: ServiceRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_rg_1",
  permissions: ["*", "release.*", "testing.*", "certification.*"],
  organisationId: "org_1",
};

describe("testing release governance gateway facet", () => {
  it("exposes releaseGovernance via createTestingPlatformServicesForTest", async () => {
    const bundle = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    expect(bundle.gatewaySurface.releaseGovernance).toBeDefined();

    const created = await bundle.gatewaySurface.releaseGovernance.createRelease(ctx, {
      key: "REL-GW-1",
      name: "Gateway release",
    });
    expect(created.key).toBe("REL-GW-1");
    expect(created.status).toBe("draft");

    const listed = await bundle.gatewaySurface.releaseGovernance.listReleases(ctx);
    expect(listed.some((r) => r.id === created.id)).toBe(true);

    const readiness = await bundle.gatewaySurface.releaseGovernance.evaluateReadiness(
      ctx,
      created.id,
    );
    expect(readiness.isDecision).toBe(false);
  });

  it("maps authz for release governance operations", () => {
    const mapping = resolveOperationAuthorization(
      "testingReleaseGovernance",
      "createRelease",
    );
    expect(mapping?.requiredPermission).toBe("release.create");
    expect(mapping?.resourceType).toBe("testing_release_governance");
  });

  it("consumes a persisted pipeline summary into release scope/evidence", async () => {
    const bundle = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const release = await bundle.gatewaySurface.releaseGovernance.createRelease(ctx, {
      key: "REL-PIPE-1",
      name: "Pipeline-linked release",
    });

    const pipeline = await bundle.gatewaySurface.pipelines.registerPipeline(ctx, {
      key: "ci-main",
      name: "Main CI",
      providerKind: "generic_ci",
    });
    const imported = await bundle.gatewaySurface.pipelines.importRun(ctx, {
      pipelineId: pipeline.id,
      payload: {
        provider: "generic_ci",
        externalRunRef: "run-pipe-1",
        pipelineKey: "ci-main",
        status: "passed",
        stages: [{ name: "build", status: "passed" }],
        jobs: [{ name: "compile", status: "passed" }],
        summary: { overallStatus: "passed", headline: "Main CI passed" },
      },
    });
    expect(imported.run).toBeDefined();

    const consumed =
      await bundle.gatewaySurface.releaseGovernance.consumePipelineSummary(
        ctx,
        release.id,
        imported.run!.id,
      );
    expect(consumed.scope.kind).toBe("pipeline");
    expect(consumed.scope.refId).toBe(imported.run!.id);
    expect(consumed.evidence.kind).toBe("pipeline_summary");
    expect(consumed.evidence.refId).toBe(imported.run!.id);
  });
});
