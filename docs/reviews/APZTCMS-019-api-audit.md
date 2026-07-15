# APZTCMS-019 — API Audit

**Date:** 2026-07-12  
**Verdict:** **PASS**

---

## Surface

| Item | Evidence |
| ---- | -------- |
| Routes | **18** `route.ts` under `apps/web/app/api/v1/testing/pipelines` |
| Handlers | `apps/web/lib/api/v1/handlers/testing-pipelines.ts` — gateway only |
| Auth | `withPlatformApiAuth` on all routes |
| Authz | RequestPipeline + `pipeline.*` mappings (`testingPipelines` + live facet keys) |
| Schemas | Zod path/query validation in `schemas/testing.ts` |
| Envelopes | `jsonDataResponse` / `jsonCollectionResponse` |
| OpenAPI | Tag **Testing Pipelines**; `pnpm openapi:validate:platform` → **valid** |
| Pagination / filtering | Live runs query (`page`, `perPage`, `status`, `branch`); collection envelopes |
| Error mapping | Platform API envelope; client maps unauthorized / not_found / rate_limited / timeout / provider_unavailable |

## Live vs SoR

| Kind | Paths |
| ---- | ----- |
| Live | `repositories/{owner}/{repo}` … workflows, runs, jobs, steps, artifacts, summary |
| SoR | list/get pipelines, runs, links, jobs, stages, providers; POST importFromProvider |

## Typed client

`createHttpPipelineClient()` covers repositories, workflows, runs, jobs, steps, artifacts, summaries, SoR ops, abort signal, errors, mock parity (`createMockPipelineClient`).

## Exclusions verified

No dispatch/rerun/cancel endpoints. No binary download routes.
