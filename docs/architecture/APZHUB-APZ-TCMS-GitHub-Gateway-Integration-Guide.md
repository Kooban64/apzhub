# APZHUB APZ TCMS — GitHub Actions Gateway Integration Guide

**Milestone:** APZTCMS-017

## Gateway surface

```ts
gateway.testing.pipelines; // SoR register/import/link
gateway.testing.pipelineRepositories; // live getRepository
gateway.testing.pipelineWorkflows; // live list/get workflows
gateway.testing.pipelineRuns; // live list/get runs
gateway.testing.pipelineArtifacts; // live listArtifacts
gateway.testing.pipelineJobs; // live list/get jobs
gateway.testing.pipelineSteps; // live listSteps
gateway.testing.pipelineSummaries; // live retrieveSummary
```

All facets are wrapped by `wrapTestingPlatformGatewayWithPipeline` with service keys:

- `testingPipelines`
- `testingPipelineRepositories`
- `testingPipelineWorkflows`
- `testingPipelineRuns`
- `testingPipelineArtifacts`
- `testingPipelineJobs`
- `testingPipelineSteps`
- `testingPipelineSummaries`

## Authorization

Live reads require `pipeline.read`.  
`importFromProvider` / `importRun` require `pipeline.import`.  
Link operations require `pipeline.link`.

## Composition

```ts
const bundle = createPlatformServicesWithGitHubActions(core);
const api = bundle.gateway.testing;

await api.pipelineWorkflows.listWorkflows(ctx, "acme", "portal");
await api.pipelines.importFromProvider(ctx, {
  owner: "acme",
  repo: "portal",
  runId: 42,
  pipelineKey: "ci",
});
```

When creating testing services manually:

```ts
createTestingPlatformServicesForTest({
  allowInMemoryPersistence: true,
  providerResolver,
  pipelineAdapters: [
    createGenericCiAdapter(),
    createGitHubActionsPipelineResultAdapter(),
  ],
});
```

Inject adapters from platform composition — do **not** add `@apzhub/integration-github-actions` as a dependency of `@apzhub/testing-services`.
