import { describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { resolveOperationAuthorization } from "../../authorization/operation-authorization-map";
import { createTestingPlatformServicesForTest } from "./create-testing-platform-services";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant-a",
    organisationId: "org-a",
    userId: "user-1",
    correlationId: "corr-pipelines",
    permissions: ["pipeline.*", "testing.admin"],
    locale: "en",
    timezone: "UTC",
  };
}

describe("testing pipelines platform facet", () => {
  it("exposes pipelines via createTestingPlatformServicesForTest", async () => {
    const bundle = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    expect(bundle.gatewaySurface.pipelines).toBeDefined();

    const registered = await bundle.gatewaySurface.pipelines.registerPipeline(ctx(), {
      key: "gw-build",
      name: "Gateway Build",
      providerKind: "generic_ci",
    });
    expect(registered.key).toBe("gw-build");

    const outcome = await bundle.gatewaySurface.pipelines.importRun(ctx(), {
      payload: {
        provider: "generic_ci",
        externalRunRef: "gw-run-1",
        pipelineKey: "gw-build",
        status: "passed",
        stages: [{ name: "build", status: "passed" }],
        jobs: [{ name: "compile", status: "passed" }],
        summary: { overallStatus: "passed" },
      },
      pipelineId: registered.id,
    });
    expect(outcome.run?.status).toBe("passed");

    const listed = await bundle.gatewaySurface.pipelines.listPipelines(ctx());
    expect(listed.some((p) => p.id === registered.id)).toBe(true);

    const providers = await bundle.gatewaySurface.pipelines.listProviders(ctx());
    expect(providers.map((p) => p.kind)).toEqual(["generic_ci"]);
  });

  it("registers testingPipelines authz operations", () => {
    expect(
      resolveOperationAuthorization("testingPipelines", "importRun")
        ?.requiredPermission,
    ).toBe("pipeline.import");
    expect(
      resolveOperationAuthorization("testingPipelines", "listProviders")
        ?.requiredPermission,
    ).toBe("pipeline.providers");
    expect(
      resolveOperationAuthorization("testingPipelines", "linkEvidence")
        ?.requiredPermission,
    ).toBe("pipeline.link");
  });
});
