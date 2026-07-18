# APZTCMS-015 Completion Report

**Milestone:** APZTCMS-015 — External CI/CD Integration Framework  
**Status:** COMPLETE  
**Date:** 2026-07-12  
**Next:** APZTCMS-016 — GitHub Actions Reference Adapter (**complete** as of 2026-07-12; programme stop now **APZTCMS-017**)

---

## Executive Summary

APZ TCMS now includes a vendor-neutral **External CI/CD Integration Framework**: canonical pipeline models, parse-only adapter contracts, Generic CI adapter, import/link services (no pollers), Postgres persistence (migrations **0031/0032**), permissions (`pipeline.*`), and `gateway.testing.pipelines` via RequestPipeline. External systems are information providers; APZ TCMS remains System of Record. No live provider APIs, runners, execution, deployment, HTTP, UI, Event Bus, AI, or binary artifact handling.

## Architecture

Workbench/HTTP deferred. Path:

`gateway.testing.pipelines` → RequestPipeline → Authz → Platform impl → Domain (`pipelines`) → Persistence → PostgreSQL

## Canonical Models

Pipeline, PipelineRun, PipelineStage, PipelineJob, PipelineStep, ArtifactReference, PipelineEnvironment, PipelineApproval, PipelineResult, PipelineSummary, PipelineLogReference, PipelineVariable, PipelineSecretReference, PipelineTrigger, PipelineSource, PipelineEventRecord, PipelineStatus, PipelineMetrics, PipelineDuration, PipelineQueue, PipelineFailure, PipelineWarning, PipelineRetry — plus PipelineImport / PipelineImportHistory / PipelineLinks.

## Gateway

`TestingPlatformGateway.pipelines` (`TestingPipelinesService`) on platform packages **0.11.0**.

## Persistence

`@apzhub/testing-persistence` **0.9.0**; SQL **0031** / **0032** (RLS). Production Postgres only; in-memory for tests.

## Permissions

`pipeline.read`, `pipeline.import`, `pipeline.archive`, `pipeline.audit`, `pipeline.providers`, plus `pipeline.link` / `pipeline.admin` / `pipeline.*`. No administration UI.

## Testing

| Suite                      | Result       |
| -------------------------- | ------------ |
| Domain pipelines           | green        |
| Persistence pipelines      | green        |
| Platform testing-pipelines | green        |
| Combined focused           | **24** tests |

## Coverage

Domain `pipelines/` folder: **98.28%** statements/lines, **100%** functions, **82.74%** branches (lines ≥95% gate).

## Quality Gates

| Gate                                                                        | Result                           |
| --------------------------------------------------------------------------- | -------------------------------- |
| typecheck (contracts / persistence / services / platform-service-contracts) | PASS                             |
| lint (`testing-services` pipelines)                                         | PASS                             |
| tests (015 suites)                                                          | PASS                             |
| coverage                                                                    | PASS ≥95% lines                  |
| architecture / boundary                                                     | PASS (no HTTP/UI/live providers) |
| dependency / boundary intent                                                | PASS — no provider SDKs          |

Pre-existing `@apzhub/platform-services` typecheck noise (Plane/Zammad harness + older testing tests) unchanged and out of 015 scope.

## Technical Debt

- Provider-specific adapters deferred (GitHub Actions = APZTCMS-016)
- HTTP/OpenAPI/Workbench for pipelines deferred
- Branch coverage below statement coverage; acceptable for this milestone
- Prior `platform-quality` code remains unrelated cleanup

## Recommendation

**APZTCMS-016 — GitHub Actions Reference Adapter** was the recommended next milestone (**now complete**). Programme stop is **APZTCMS-017**.

## Package versions

- contracts **0.9.0** · persistence **0.9.0** · services **0.8.0** · platform **0.11.0**

## Documentation

- [CI/CD Integration Architecture](../architecture/APZHUB-APZ-TCMS-CICD-Integration-Architecture.md)
- [Canonical Pipeline Model](../architecture/APZHUB-APZ-TCMS-Canonical-Pipeline-Model.md)
- [Provider Contract Guide](../architecture/APZHUB-APZ-TCMS-Provider-Contract-Guide.md)
- [Pipeline Import Guide](../architecture/APZHUB-APZ-TCMS-Pipeline-Import-Guide.md)
- [Artifact Metadata Guide](../architecture/APZHUB-APZ-TCMS-Artifact-Metadata-Guide.md)
- [Developer Guide](../architecture/APZHUB-APZ-TCMS-CICD-Developer-Guide.md)

## Stop Condition

APZTCMS-015 complete. APZTCMS-016 subsequently completed — programme stop is now **APZTCMS-017**.
