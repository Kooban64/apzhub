import { describe, expect, it } from "vitest";

import { createGitLabCiPipelineResultAdapter } from "@apzhub/integration-gitlab-ci";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { createGenericCiAdapter } from "@apzhub/testing-services";

import { createTestingPlatformServicesForTest } from "./create-testing-platform-services";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant-a",
    organisationId: "org-a",
    userId: "user-1",
    correlationId: "corr-gitlab-import",
    permissions: ["pipeline.*", "testing.admin"],
    locale: "en",
    timezone: "UTC",
  };
}

describe("testing pipelines gitlab_ci SoR adapter", () => {
  it("registers gitlab_ci adapter when injected via pipelineAdapters", async () => {
    const bundle = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
      pipelineAdapters: [
        createGenericCiAdapter(),
        createGitLabCiPipelineResultAdapter(),
      ],
    });

    const providers = await bundle.gatewaySurface.pipelines.listProviders(ctx());
    expect(providers.map((p) => p.kind).sort()).toEqual(["generic_ci", "gitlab_ci"]);

    const registered = await bundle.gatewaySurface.pipelines.registerPipeline(ctx(), {
      key: "gitlab-ci",
      name: "GitLab CI",
      providerKind: "gitlab_ci",
    });

    const outcome = await bundle.gatewaySurface.pipelines.importRun(ctx(), {
      providerKind: "gitlab_ci",
      pipelineId: registered.id,
      payload: {
        provider: "gitlab_ci",
        id: 9001,
        name: "CI",
        status: "success",
        ref: "main",
        sha: "deadbeef",
        project_id: 55,
        jobs: [{ id: 1, name: "build", status: "success" }],
      },
    });

    expect(outcome.run?.providerKind).toBe("gitlab_ci");
    expect(outcome.run?.status).toBe("passed");
    expect(outcome.importRecord.providerKind).toBe("gitlab_ci");
  });
});
