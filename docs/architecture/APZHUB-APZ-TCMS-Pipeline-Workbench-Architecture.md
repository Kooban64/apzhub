# APZHUB APZ TCMS — Pipeline Workbench Architecture (APZTCMS-018)

## Layering

```
Shell / Testing workspace
  → TestingPipelinesView (presentation)
  → PipelineClient / testing-api wrappers
  → /api/v1/testing/pipelines/* handlers
  → PlatformServiceGateway.testing.{pipelines|pipeline*}
  → Platform Services → Integration adapters → engines
```

Presentation must not call adapters, testing-services, or persistence.

## Live vs SoR

| Concern            | Gateway facet                                                                                                                          | HTTP namespace                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Live CI reads      | `pipelineRepositories`, `pipelineWorkflows`, `pipelineRuns`, `pipelineJobs`, `pipelineSteps`, `pipelineArtifacts`, `pipelineSummaries` | `/pipelines/repositories/{owner}/{repo}/…`              |
| Persisted metadata | `pipelines`                                                                                                                            | `/pipelines`, `/pipelines/{id}`, `/pipelines/runs/{id}` |

Naming keeps live `pipelineRuns.getRun` distinct from SoR `pipelines.getRun`.

## Module contract

`services/testing/manifests/testing/module.yaml` (APZTCMS-018):

- Sidebar: Pipelines (`pipeline.read`)
- Commands: read-only pipeline catalogue
- Permissions: reference existing `pipeline.*` platform keys (no new namespaces)

## Quality

- Vitest: handlers, OpenAPI path presence, client, view, boundary
- Playwright: mocked `/api/v1/testing/**` smoke + a11y landmarks
- OpenAPI: `pnpm openapi:validate:platform`
