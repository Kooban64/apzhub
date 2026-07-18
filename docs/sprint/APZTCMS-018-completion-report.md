# APZTCMS-018 Completion Report

**Milestone:** APZTCMS-018 — GitHub Actions User Experience  
**Status:** COMPLETE  
**Date:** 2026-07-12  
**Next:** APZTCMS-019 — GitHub Actions Vertical Certification (**complete** as of 2026-07-12 — **PRODUCTION_READY_WITH_LIMITATIONS**; programme stop now **APZTCMS-020**)

---

## Executive Summary

Presentation-only milestone exposing existing GitHub Actions / CI/CD platform capability through HTTP under `/api/v1/testing/pipelines`, OpenAPI documentation, `createHttpPipelineClient()`, and Testing workbench Pipelines views/commands. No adapter, platform service, domain, or execution changes. Handlers call PlatformServiceGateway only.

## HTTP API

18 thin routes under `/api/v1/testing/pipelines` for live repository/workflows/runs/jobs/steps/artifacts/summary and SoR pipelines/runs/links/providers (+ POST importFromProvider for Refresh). Auth via `withPlatformApiAuth`; authz remains in RequestPipeline.

## OpenAPI

Extended `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` with tag **Testing Pipelines**. `pnpm openapi:validate:platform` → **valid**.

## Typed Client

`createHttpPipelineClient()` + `PipelineClient` + mock client + `pipeline-api` workbench facade. Strong typing; envelope mapping; user-safe errors (unauthorized, not_found, rate_limited, timeout, provider_unavailable).

## Workbench

Pipelines section: home, repository, workflows, runs, run detail (jobs/steps/artifacts/summary + evidence/coverage/certification/release link panels). Read-only commands. Manifest nav/commands updated. UI gated by `pipeline.read` / `pipeline.import`; server authoritative.

## Accessibility

ARIA headings/labels on tables and forms; keyboard-accessible controls; status badges; loading/empty/error/forbidden states; responsive layout via existing shell tokens.

## Testing

| Suite                                               | Result                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| Vitest handlers / OpenAPI / client / view           | green (**34+** focused)                                                |
| OpenAPI validate                                    | PASS                                                                   |
| Boundary (no domain/adapter imports in UI/handlers) | PASS                                                                   |
| Playwright `apztcms-018-pipeline-workbench.spec.ts` | Spec added; **env limitation** — no baseURL/app server in this session |

No live GitHub.

## Coverage

New presentation modules aggregate **~96.6%** lines (handlers **100%**; client/api **≥97%**; view **~92.7%** lines). Functions strong on client/handlers; view callback functions lower but meaningful paths covered.

## Quality Gates

| Gate                                        | Result                                          |
| ------------------------------------------- | ----------------------------------------------- |
| OpenAPI validate                            | PASS                                            |
| Vitest (018 focused)                        | PASS                                            |
| coverage ≥95% lines (new modules aggregate) | PASS                                            |
| boundary audit                              | PASS                                            |
| Playwright live                             | LIMITED (spec present; runner needs app server) |

## Technical Debt

- Playwright E2E needs CI/app server with baseURL to run green
- View function coverage below client/handler levels
- SoR register/update/archive UI not exposed (read + import refresh only)
- Default owner/repo still form-driven (no prefs store)

## Recommendation

**APZTCMS-019 — GitHub Actions Vertical Certification** was recommended (**now complete** — **PRODUCTION_READY_WITH_LIMITATIONS**). Programme stop is **APZTCMS-020**.

## Documentation

- [GitHub User Guide](../architecture/APZHUB-APZ-TCMS-GitHub-User-Guide.md)
- [Pipeline Workbench Guide](../architecture/APZHUB-APZ-TCMS-Pipeline-Workbench-Guide.md)
- [Pipeline HTTP API Guide](../architecture/APZHUB-APZ-TCMS-Pipeline-HTTP-API-Guide.md)
- [Pipeline Typed Client Guide](../architecture/APZHUB-APZ-TCMS-Pipeline-Typed-Client-Guide.md)
- [Pipeline Workbench Architecture](../architecture/APZHUB-APZ-TCMS-Pipeline-Workbench-Architecture.md)

## Stop Condition

APZTCMS-018 complete. APZTCMS-019 subsequently completed — programme stop is now **APZTCMS-020**.
