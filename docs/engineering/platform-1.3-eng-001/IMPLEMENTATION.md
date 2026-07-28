# Implementation — Platform-1.3-ENG-001

> **Date:** 2026-07-22

---

## Implemented components

| Component                        | Location                                                 |
| -------------------------------- | -------------------------------------------------------- |
| Shared publication runtime       | `apps/web/lib/search/publication-runtime.ts`             |
| Time composition wrapper         | `apps/web/lib/search/wiring/time-publication.ts`         |
| Gateway bootstrap Time wire      | `apps/web/lib/api/v1/gateway/bootstrap.ts`               |
| Publication admin shared runtime | `apps/web/lib/search/publication-admin-bootstrap.ts`     |
| Law publication runtime          | `apps/law-platform/lib/search/publication-runtime.ts`    |
| Law workflow wiring              | `apps/law-platform/lib/search/law-publication-wiring.ts` |
| Law executor composition         | `apps/law-platform/lib/create-app-action-executor.ts`    |
| Env documentation                | `.env.example` · `.env.production.example`               |
| Unit tests                       | `time-publication.test.ts` · `law-publication.test.ts`   |

---

## Repository impact

| Area                      | Change                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `apps/web`                | deps: `search-time`, `search-integration`; composition wiring                       |
| `apps/law-platform`       | deps: `search-orchestrator`, `search-law`, `search-integration`; composition wiring |
| `packages/*`              | **None** (frozen packages untouched)                                                |
| Integration SDK           | **None**                                                                            |
| Platform Services sources | **None**                                                                            |

---

## Behaviour

1. After successful Time create/update/stop/archive (domain entities), enqueue journal publication with drafts from `TimeSearchEntityMapper`.
2. After successful Law client/matter/document/task create/update(/archive matter), enqueue with `LawSearchEntityMapper`.
3. When orchestration enabled, schedule `processBatch()` (non-blocking).
4. When `SEARCH_MEILISEARCH_ENDPOINT` is set, Search Integration uses a custom sink that mirrors upserts/deletes to Meilisearch index `{prefix}publication`.

---

## Configuration

| Variable                              | Role                                              |
| ------------------------------------- | ------------------------------------------------- |
| `APZHUB_SEARCH_ORCHESTRATION_ENABLED` | Deny-by-default journal accept + drain            |
| `SEARCH_MEILISEARCH_ENDPOINT`         | Optional live Meilisearch mirror                  |
| `SEARCH_MEILISEARCH_API_KEY`          | Optional bearer for mirror                        |
| `SEARCH_MEILISEARCH_INDEX_PREFIX`     | Default `apzhub_`                                 |
| `DATABASE_URL`                        | Required for production journal                   |
| `LAW_SEARCH_TENANT_ID`                | Optional Law tenant override (default `platform`) |
