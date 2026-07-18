# APZSEARCH-018 — Quality Evidence

**Date:** 2026-07-18  
**Command:** `pnpm certify:search-publication`

---

## Architecture evidence

- `pnpm audit:search-publication-reliability` → **PASS** (0 violations)
- Architecture chain documented in [APZSEARCH-018-architecture-review.md](./APZSEARCH-018-architecture-review.md)

## Boundary evidence

- Orchestrator / admin / product adapter scans: no Meilisearch SDK, no search-persistence from publishers, no platform-services from publication packages
- `testing/search-publication`, `testing/search-orchestrator`, `testing/search-publication-admin`, `testing/search-publication-reliability` harnesses

## Authorization evidence

- Catalogue keys: `search.publication.read|retry|deadletter|admin|diagnostics`
- Gateway deny-by-default; HTTP server-side enforcement
- [Security Confirmation](./APZSEARCH-018-security-confirmation.md)

## Reliability evidence

- Durable journal migrations **0058** / **0059**
- Retry policy / backoff / DLQ / hash dedupe exports present
- Bootstrap gate `APZHUB_SEARCH_ORCHESTRATION_ENABLED`
- [Reliability Guide](../guides/APZHUB-Search-Publication-Reliability-Guide.md)

## HTTP / Workbench / Typed Client evidence

- Routes under `apps/web/app/api/v1/search/publication/`
- `apps/web/lib/search/publication-admin-client.ts` → `createHttpSearchPublicationAdminClient`
- Manifest `platform-search-publication`
- Playwright: `testing/playwright/e2e/apzsearch-017-publication-operations.spec.ts` (**LIMITED** list gate)

## Coverage (scoped publication packages)

Captured by `pnpm certify:search-publication` (include: search-integration, product publishers, search-orchestrator, search-publication-admin):

| Metric    | Result     |
| --------- | ---------- |
| Lines     | **97.43%** |
| Functions | **99.59%** |
| Branches  | **85.76%** |

## Trend (APZSEARCH-009 → 018)

| Milestone | Focus                          | Quality posture                             |
| --------- | ------------------------------ | ------------------------------------------- |
| 009–014   | Framework + publishers         | Feature delivery + package audits           |
| 015       | Publication certification      | **PRODUCTION_READY_WITH_LIMITATIONS**       |
| 016       | Orchestrator / journal / retry | Durable reliability                         |
| 017       | Ops admin HTTP/Workbench       | Admin coverage ~95% lines / 100% functions  |
| 018       | Reliability certification      | Ecosystem certify command; no runtime delta |

## Regression

Publication regression suite (015–018 harnesses + package tests) must pass with **zero** regressions under `certify:search-publication`.
