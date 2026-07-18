# APZHUB APZ TCMS — Pipeline Typed Client Guide (APZTCMS-018)

## Entry points

- `createHttpPipelineClient()` — production HTTP transport
- `createMockPipelineClient()` — Vitest / component tests (`NODE_ENV=test`)
- `pipeline-api.ts` / re-exports from `testing-api.ts` — workbench accessors

## Contract

`PipelineClient` methods:

- Live: `getRepository`, `listWorkflows`, `getWorkflow`, `listLiveRuns`, `getLiveRun`, `listLiveJobs`, `getLiveJob`, `listLiveSteps`, `listLiveArtifacts`, `getLiveSummary`
- SoR: `listPipelines`, `getPipeline`, `listSorRuns`, `getSorRun`, `getLinks`, `listSorJobs`, `listSorStages`, `listProviders`
- Optional: `importFromProvider` (refresh)

## Rules

- Paths must start with `/testing/pipelines`
- `credentials: "include"`
- Optional `x-correlation-id`
- Map success envelopes → view models
- Map failures → `PipelineClientError` (`unauthorized`, `not_found`, `rate_limited`, `timeout`, `provider_unavailable`)
- No live GitHub network in unit tests

## Files

| File                      | Role                     |
| ------------------------- | ------------------------ |
| `pipeline-types.ts`       | View models              |
| `pipeline-client.ts`      | Interface + HTTP factory |
| `pipeline-errors.ts`      | Error types              |
| `mock-pipeline-client.ts` | Fixtures                 |
| `pipeline-api.ts`         | Module singleton         |
