import { describe, expect, it } from "vitest";

import {
  createGitHubActionsAdapter,
  disposeGitHubActionsAdapter,
} from "./github-actions-factory";
import { GITHUB_ACTIONS_INTEGRATION_ID } from "./github-actions-error-mapper";
import {
  createMockGitHubActionsFetch,
  DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-github-actions-api";

const fixedClock = {
  now: () => "2026-07-12T14:00:00.000Z",
  nowMs: () => 1_720_788_000_000,
};

describe("createGitHubActionsAdapter factory", () => {
  it("constructs an initialised adapter with capability registration", async () => {
    const fetchFn = createMockGitHubActionsFetch();
    const { adapter, configuration, factory } = await createGitHubActionsAdapter({
      githubActions: DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "ghp_test_token",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });

    expect(adapter.isInitialised).toBe(true);
    expect(configuration.manifest.integrationId).toBe(GITHUB_ACTIONS_INTEGRATION_ID);
    expect(factory.validateRegistration(configuration.manifest).ok).toBe(true);
    expect(adapter.core.version.getApiVersion()).toBe("2022-11-28");

    await disposeGitHubActionsAdapter(adapter, factory);
    expect(adapter.isDisposed).toBe(true);
  });

  it("can skip auto-initialise", async () => {
    const { adapter } = await createGitHubActionsAdapter({
      githubActions: DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "ghp_test_token",
      autoInitialise: false,
      adapterOptions: { fetchFn: createMockGitHubActionsFetch() },
    });

    expect(adapter.isInitialised).toBe(false);
  });

  it("connects with PAT and rejects github_app live connect", async () => {
    const fetchFn = createMockGitHubActionsFetch();
    const { adapter } = await createGitHubActionsAdapter({
      githubActions: DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "ghp_test_token",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });

    const ok = await adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(ok.ok).toBe(true);

    const { adapter: appAdapter } = await createGitHubActionsAdapter({
      githubActions: {
        authMode: "github_app",
        githubApp: {
          appIdRef: "app/id",
          installationIdRef: "app/install",
          privateKeyRef: "app/key",
        },
        owner: "acme",
        repo: "portal",
      },
      tenantId: TEST_TENANT_ID,
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });

    const rejected = await appAdapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(rejected.ok).toBe(false);
    expect(rejected.message).toMatch(/not implemented/i);
  });
});
