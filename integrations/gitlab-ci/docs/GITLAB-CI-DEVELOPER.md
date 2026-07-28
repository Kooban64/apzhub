# GitLab CI Developer Guide

**Milestone:** R12-TCMS-01  
**Package:** `@apzhub/integration-gitlab-ci`

## Create adapter

```ts
import {
  createGitLabCiAdapter,
  disposeGitLabCiAdapter,
  createMockGitLabCiFetch,
} from "@apzhub/integration-gitlab-ci";

const { adapter, factory } = await createGitLabCiAdapter({
  gitlabCi: {
    authMode: "personal_access_token",
    personalAccessTokenRef: "gitlab-ci/pat",
    projectPath: "acme/portal",
  },
  tenantId: "tenant-1",
  personalAccessToken: "glpat_test",
  adapterOptions: { fetchFn: createMockGitLabCiFetch() },
});

await adapter.testConnection({
  correlationId: "corr-1",
  tenantId: "tenant-1",
});

const runs = await adapter.core.pipelineRuns.listRuns({
  correlationId: "corr-1",
  tenantId: "tenant-1",
});

await disposeGitLabCiAdapter(adapter, factory);
```

## Parse-only TCMS import

```ts
import { createGitLabCiPipelineResultAdapter } from "@apzhub/integration-gitlab-ci";

const parser = createGitLabCiPipelineResultAdapter();
if (parser.canParse(payload)) {
  const canonical = parser.parse(payload);
}
```

## Scripts

```bash
pnpm --filter @apzhub/integration-gitlab-ci typecheck
pnpm --filter @apzhub/integration-gitlab-ci lint
pnpm --filter @apzhub/integration-gitlab-ci test
```

## Boundaries

- Do not import `internal/*` from outside this package
- Do not call live GitLab from Platform Services — use this adapter’s public `core` APIs or the parse-only `PipelineResultAdapter`
- Do not implement dispatch/rerun/cancel/download here
