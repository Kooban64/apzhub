# APZTCMS-017 Completion Report

**Milestone:** APZTCMS-017 — GitHub Actions Platform Service Integration  
**Status:** COMPLETE  
**Date:** 2026-07-12  
**Next:** APZTCMS-018 — GitHub Actions User Experience (**complete** as of 2026-07-12; programme stop now **APZTCMS-019**)

---

## Executive Summary

GitHub Actions is now consumed through APZ TCMS Platform Services using ProviderRegistry / ProviderResolver (Plane/Zammad pattern). Live read facets expose `adapter.core` via `gateway.testing.*` behind RequestPipeline and existing `pipeline.*` permissions. SoR ingestion remains on `gateway.testing.pipelines` with injectable `github_actions` parse adapter. No new adapter features, execution, REST, UI, Event Bus, or OAuth/GitHub App auth.

## Architecture

```text
Gateway facets → RequestPipeline → Authz → Platform Service Impls
  → ProviderResolver → GitHub*Provider → adapter.core → GitHub REST (via adapter)
```

SoR: `gateway.testing.pipelines` → domain.pipelines → persistence (canonical only).

## Platform Services

Live: PipelineRepository, PipelineWorkflow, PipelineRun (live), PipelineArtifact, PipelineJob, PipelineStep, PipelineSummary.  
SoR: TestingPipelinesService (+ `importFromProvider`).  
Release: `consumePipelineSummary` on release governance.

## Provider Layer

`registerGitHubActionsProviders` / `createPlatformServicesWithGitHubActions`. Capabilities: `pipeline_repository|workflow|run|artifact|job|step|summary`. Providers call `adapter.core` only — no GitHub DTO leakage.

## Gateway

`gateway.testing.pipelines`, `pipelineRepositories`, `pipelineWorkflows`, `pipelineRuns`, `pipelineArtifacts`, `pipelineJobs`, `pipelineSteps`, `pipelineSummaries` — all RequestPipeline-wrapped.

## Authorization

Production Authorization only. Reused `pipeline.read` / `pipeline.import` / `pipeline.link` / `pipeline.providers` (+ `release.update` for consumePipelineSummary). No new permission namespaces.

## Traceability

Existing SoR `linkEvidence` / `linkCertifications` / `linkReleases` / `linkArtifacts` / `getLinks` unchanged. Live import → SoR via `importFromProvider`.

## Release Governance Integration

`releaseGovernance.consumePipelineSummary(releaseId, pipelineRunId)` attaches pipeline scope from SoR run summary. No deployment / auto-release.

## Testing

| Suite | Result |
| ----- | ------ |
| GitHub providers | green |
| Live gateway facets + importFromProvider | green |
| github_actions SoR import | green |
| Release consumePipelineSummary | green |
| Architecture boundary | green |
| Combined focused | **11+** tests |

No live GitHub / network.

## Coverage

New provider + live service modules: **100%** statements/lines/functions (branches **~94.9%**).

## Quality Gates

| Gate | Result |
| ---- | ------ |
| typecheck (contracts / testing-services) | PASS |
| lint (017 modules) | PASS |
| tests (017 suites) | PASS |
| coverage ≥95% (new modules) | PASS |
| architecture / boundary | PASS |
| authorization mappings | PASS |

Pre-existing `@apzhub/platform-services` full-package typecheck noise (Plane/Zammad harness + older tests) unchanged; no errors in new 017 files.

## Technical Debt

- Live facets without resolver return `PROVIDER_CAPABILITY_UNSUPPORTED` stubs  
- Declared capability `"pipeline"` unused (specific `pipeline_*` keys used)  
- HTTP/Workbench deferred to **APZTCMS-018**  
- App bootstrap feature-flag wiring for GitHub Actions optional follow-up

## Recommendation

**APZTCMS-018 — GitHub Actions User Experience** was recommended (**now complete**). Programme stop is **APZTCMS-019**.

## Package versions

- platform-service-contracts **0.12.0** · platform-services **0.12.0** · testing-services **0.9.0** · integration-github-actions **0.1.0**

## Documentation

- [GitHub Platform Service Architecture](../architecture/APZHUB-APZ-TCMS-GitHub-Platform-Service-Architecture.md)
- [GitHub Provider Guide](../architecture/APZHUB-APZ-TCMS-GitHub-Provider-Guide.md)
- [Gateway Integration Guide](../architecture/APZHUB-APZ-TCMS-GitHub-Gateway-Integration-Guide.md)
- [Traceability Guide](../architecture/APZHUB-APZ-TCMS-GitHub-Traceability-Guide.md)
- [Developer Guide](../architecture/APZHUB-APZ-TCMS-GitHub-Platform-Developer-Guide.md)

## Stop Condition

APZTCMS-017 complete. APZTCMS-018 subsequently completed — programme stop is now **APZTCMS-019**.
