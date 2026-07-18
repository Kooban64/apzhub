# APZHUB APZ TCMS — GitHub Actions Platform Developer Guide

**Milestone:** APZTCMS-017

## Packages

| Package                              | Version | Role                                                    |
| ------------------------------------ | ------- | ------------------------------------------------------- |
| `@apzhub/platform-service-contracts` | 0.12.0  | Vendor-neutral service interfaces + gateway slots       |
| `@apzhub/platform-services`          | 0.12.0  | Providers, service impls, gateway wrap, authz           |
| `@apzhub/testing-services`           | 0.9.0   | Optional `pipelineAdapters` injection into SoR registry |
| `@apzhub/integration-github-actions` | 0.1.0   | Adapter core (read-only)                                |

## Factory entry points

```ts
createPlatformServicesWithGitHubActions(core, {
  mappingStore?,
  testing?,                // optional prebuilt testing bundle
  createTestingBundle?,    // default true when testing omitted
});

registerGitHubActionsProviders({ registry, githubActionsCore });
```

## Adding another CI provider later

1. Add capability providers implementing the same `Pipeline*Provider` aliases.
2. Register with a distinct `integrationId` / `providerId`.
3. Inject a matching `PipelineResultAdapter` via `pipelineAdapters` at composition time.
4. Do not put vendor packages into `testing-services` dependencies.

## Tests

Focused suites (mocked, no network):

- `providers/github-actions/github-actions-providers.test.ts`
- `services/testing/testing-pipeline-live.test.ts`
- `services/testing/testing-pipelines-github.test.ts`
- Release governance `consumePipelineSummary` in `testing-release-governance.test.ts`

## Non-goals

No workflow mutation, no REST routes, no UI, no Event Bus, no OAuth implementation in this milestone.
