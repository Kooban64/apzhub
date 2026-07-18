# APZHUB APZ TCMS — GitHub Actions Provider Guide

**Milestone:** APZTCMS-017

## Registration

```ts
import {
  ProviderRegistry,
  registerGitHubActionsProviders,
  createPlatformServicesWithGitHubActions,
} from "@apzhub/platform-services";
import type { GitHubActionsCoreServices } from "@apzhub/integration-github-actions";

const registry = new ProviderRegistry();
registerGitHubActionsProviders({ registry, githubActionsCore });

// Or convenience factory (also wires testing SoR + live facets by default):
const bundle = createPlatformServicesWithGitHubActions(githubActionsCore);
```

## Provider IDs

| Provider ID                          | Capability            |
| ------------------------------------ | --------------------- |
| `github-actions-pipeline-repository` | `pipeline_repository` |
| `github-actions-pipeline-workflow`   | `pipeline_workflow`   |
| `github-actions-pipeline-run`        | `pipeline_run`        |
| `github-actions-pipeline-artifact`   | `pipeline_artifact`   |
| `github-actions-pipeline-job`        | `pipeline_job`        |
| `github-actions-pipeline-step`       | `pipeline_step`       |
| `github-actions-pipeline-summary`    | `pipeline_summary`    |

Integration id: `github-actions`. Priority: `100`.

## Boundary rules

- Providers call **only** `GitHubActionsCoreServices` (`adapter.core`).
- Never import `@apzhub/integration-github-actions/internal/*` or Octokit from platform-services.
- Errors mapped via `withProviderErrorMapping`; context via `toIntegrationContext`.
- Canonical types exposed as vendor-neutral DTOs (`PipelineRepository`, `PipelineWorkflow`, `PipelineRunView`, …).

## Resolution

```ts
resolver.resolvePipelineRepositoryProvider(ctx).getRepository(ctx, owner, repo);
resolver.resolvePipelineRunProvider(ctx).listRuns(ctx, owner, repo, query);
```
