# APZHUB APZ TCMS — GitHub Actions Traceability Guide

**Milestone:** APZTCMS-017

## SoR links (existing)

`TestingPipelinesService` already supports:

- `linkArtifacts` / `linkEvidence` / `linkCertifications` / `linkReleases`
- `getLinks`

These persist references on the SoR `PipelineRun` — they do not call GitHub.

## Release governance consumption

```ts
await gateway.testing.releaseGovernance.consumePipelineSummary(
  ctx,
  releaseId,
  pipelineRunId, // SoR PipelineRun id
);
```

Behaviour (thin, non-decisive):

1. Load SoR run via `domain.pipelines.imports.getRun`
2. `addScope({ kind: "pipeline", refId: pipelineRunId, label: headline })`
3. `attachEvidence({ kind: "pipeline_summary", refId: pipelineRunId, summary: headline })`

Does **not** approve, reject, or auto-transition the release. Advisory evaluate methods remain `isDecision: false`.

## Import from provider → SoR

```ts
await gateway.testing.pipelines.importFromProvider(ctx, {
  owner,
  repo,
  runId,
  pipelineKey?,
  pipelineId?,
});
```

Fetches live run + jobs + artifacts + summary via providers, builds a github_actions-shaped payload, then `domain.importRun` through the registered parse adapter.
