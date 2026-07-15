import { describe, expect, it } from "vitest";

import { createGitHubActionsPipelineResultAdapter } from "@apzhub/integration-github-actions";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { createGenericCiAdapter } from "@apzhub/testing-services";

import { createTestingPlatformServicesForTest } from "./create-testing-platform-services";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant-a",
    organisationId: "org-a",
    userId: "user-1",
    correlationId: "corr-gha-import",
    permissions: ["pipeline.*", "testing.admin"],
    locale: "en",
    timezone: "UTC",
  };
}

describe("testing pipelines github_actions SoR adapter", () => {
  it("registers github_actions adapter when injected via pipelineAdapters", async () => {
    const bundle = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
      pipelineAdapters: [
        createGenericCiAdapter(),
        createGitHubActionsPipelineResultAdapter(),
      ],
    });

    const providers = await bundle.gatewaySurface.pipelines.listProviders(ctx());
    expect(providers.map((p) => p.kind).sort()).toEqual([
      "generic_ci",
      "github_actions",
    ]);

    const registered = await bundle.gatewaySurface.pipelines.registerPipeline(ctx(), {
      key: "gha-ci",
      name: "GitHub CI",
      providerKind: "github_actions",
    });

    const outcome = await bundle.gatewaySurface.pipelines.importRun(ctx(), {
      providerKind: "github_actions",
      pipelineId: registered.id,
      payload: {
        provider: "github_actions",
        id: 501,
        name: "CI",
        status: "completed",
        conclusion: "success",
        workflow_id: 55,
        run_number: 12,
        head_branch: "main",
        head_sha: "deadbeef",
        jobs: [{ id: 1, name: "build", status: "completed", conclusion: "success" }],
      },
    });

    expect(outcome.run?.providerKind).toBe("github_actions");
    expect(outcome.run?.status).toBe("passed");
    expect(outcome.importRecord.providerKind).toBe("github_actions");
  });
});
