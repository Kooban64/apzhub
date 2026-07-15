# APZHUB APZ TCMS — Pipeline HTTP API Guide (APZTCMS-018)

## Boundary

```
Client → /api/v1/testing/pipelines/* → withPlatformApiAuth → handlers
  → getPlatformServiceGateway().testing.* → Platform Services → connectors
```

Handlers never import `@apzhub/testing-services`, persistence, or `integration-github-actions`.

## Live routes (owner/repo)

| Method | Path | Gateway |
|---|---|---|
| GET | `/repositories/{owner}/{repo}` | `pipelineRepositories.getRepository` |
| GET | `.../workflows` | `pipelineWorkflows.listWorkflows` |
| GET | `.../workflows/{workflowId}` | `pipelineWorkflows.getWorkflow` |
| GET | `.../runs` | `pipelineRuns.listRuns` (query: page, perPage, status, branch) |
| GET | `.../runs/{runId}` | `pipelineRuns.getRun` |
| GET | `.../runs/{runId}/jobs` | `pipelineJobs.listJobs` |
| GET | `.../runs/{runId}/jobs/{jobId}` | `pipelineJobs.getJob` |
| GET | `.../jobs/{jobId}/steps` | `pipelineSteps.listSteps` |
| GET | `.../artifacts` | `pipelineArtifacts.listArtifacts` |
| GET | `.../summary` | `pipelineSummaries.retrieveSummary` |

## SoR routes

| Method | Path | Gateway |
|---|---|---|
| GET | `/pipelines` | `pipelines.listPipelines` |
| POST | `/pipelines` | `pipelines.importFromProvider` (`pipeline.import`) |
| GET | `/pipelines/{pipelineId}` | `pipelines.getPipeline` |
| GET | `/pipelines/{pipelineId}/runs` | `pipelines.listRuns` |
| GET | `/pipelines/runs/{runId}` | `pipelines.getRun` |
| GET | `/pipelines/runs/{runId}/links` | `pipelines.getLinks` |
| GET | `/pipelines/runs/{runId}/jobs` | `pipelines.listJobs` |
| GET | `/pipelines/runs/{runId}/stages` | `pipelines.listStages` |
| GET | `/pipelines/providers` | `pipelines.listProviders` |

## Envelope

Single: `{ data, meta }` · Collection: `{ data, page, meta }`

OpenAPI tag: **Testing Pipelines** in `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`.
