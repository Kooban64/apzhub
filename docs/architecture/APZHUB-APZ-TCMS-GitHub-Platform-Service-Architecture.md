# APZHUB APZ TCMS — GitHub Actions Platform Service Architecture

**Milestone:** APZTCMS-017 — GitHub Actions Platform Service Integration  
**Status:** Implemented (platform services + gateway facets; no REST/UI/dispatch)  
**Packages:** `@apzhub/platform-service-contracts` **0.12.0** · `@apzhub/platform-services` **0.12.0** · `@apzhub/testing-services` **0.9.0**  
**Adapter:** `@apzhub/integration-github-actions` **0.1.0** (APZTCMS-016)

---

## Purpose

Wire the read-only GitHub Actions adapter into Platform Services via ProviderRegistry / ProviderResolver (same pattern as Plane / Zammad), expose vendor-neutral gateway facets under `gateway.testing.*`, and keep SoR pipeline ingestion on `gateway.testing.pipelines`.

---

## Request path

```text
gateway.testing.{pipelineRepositories|pipelineWorkflows|pipelineRuns|
                 pipelineArtifacts|pipelineJobs|pipelineSteps|pipelineSummaries}
        ↓
RequestPipeline (auth → authz → …)
        ↓
Platform Service Impl (Pipeline*ServiceImpl)
        ↓
ProviderResolver (capability)
        ↓
GitHubActions*Provider (adapter.core only)
        ↓
GitHubActionsCoreServices
```

SoR path (unchanged ownership):

```text
gateway.testing.pipelines
        ↓
TestingPipelinesServiceImpl
        ↓
domain.pipelines (register / import / link)
        ↓
PipelineAdapterRegistry (generic_ci + github_actions when injected)
```

---

## Capabilities

| Capability            | Gateway facet          | Permission              |
| --------------------- | ---------------------- | ----------------------- |
| `pipeline_repository` | `pipelineRepositories` | `pipeline.read`         |
| `pipeline_workflow`   | `pipelineWorkflows`    | `pipeline.read`         |
| `pipeline_run`        | `pipelineRuns`         | `pipeline.read`         |
| `pipeline_artifact`   | `pipelineArtifacts`    | `pipeline.read`         |
| `pipeline_job`        | `pipelineJobs`         | `pipeline.read`         |
| `pipeline_step`       | `pipelineSteps`        | `pipeline.read`         |
| `pipeline_summary`    | `pipelineSummaries`    | `pipeline.read`         |
| SoR pipelines         | `pipelines`            | `pipeline.*` (existing) |

---

## Explicit exclusions

Workflow dispatch / rerun / cancel · REST API · UI · Event Bus · OAuth / GitHub App auth · deployment · issues / PRs · binary artifact download · Octokit.

---

## Related

[Provider Guide](./APZHUB-APZ-TCMS-GitHub-Provider-Guide.md) · [Gateway Integration](./APZHUB-APZ-TCMS-GitHub-Gateway-Integration-Guide.md) · [Traceability](./APZHUB-APZ-TCMS-GitHub-Traceability-Guide.md) · [Developer Guide](./APZHUB-APZ-TCMS-GitHub-Platform-Developer-Guide.md) · [Adapter](./APZHUB-APZ-TCMS-GitHub-Actions-Adapter.md)
