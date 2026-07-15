# GitHub Actions Developer Guide

**Milestone:** APZTCMS-016  
**Package:** `@apzhub/integration-github-actions`

## Create adapter

```ts
import {
  createGitHubActionsAdapter,
  disposeGitHubActionsAdapter,
  createMockGitHubActionsFetch,
} from "@apzhub/integration-github-actions";

const { adapter, factory } = await createGitHubActionsAdapter({
  githubActions: {
    authMode: "personal_access_token",
    personalAccessTokenRef: "github/pat",
    owner: "acme",
    repo: "portal",
  },
  tenantId: "tenant-1",
  personalAccessToken: "ghp_test",
  adapterOptions: { fetchFn: createMockGitHubActionsFetch() },
});

await adapter.testConnection({
  correlationId: "corr-1",
  tenantId: "tenant-1",
});

const runs = await adapter.core.pipelineRuns.listRuns({
  correlationId: "corr-1",
  tenantId: "tenant-1",
});

await disposeGitHubActionsAdapter(adapter, factory);
```

## Parse-only TCMS import

```ts
import { createGitHubActionsPipelineResultAdapter } from "@apzhub/integration-github-actions";

const parser = createGitHubActionsPipelineResultAdapter();
if (parser.canParse(payload)) {
  const canonical = parser.parse(payload);
}
```

## Scripts

```bash
pnpm --filter @apzhub/integration-github-actions typecheck
pnpm --filter @apzhub/integration-github-actions lint
pnpm --filter @apzhub/integration-github-actions test
```

## Boundaries

- Do not import `internal/*` from outside this package
- Do not call live GitHub from Platform Services — use this adapter’s public `core` APIs or the parse-only `PipelineResultAdapter`
- Do not implement APZTCMS-017 features here
