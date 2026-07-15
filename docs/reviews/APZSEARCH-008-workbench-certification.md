# APZSEARCH-008 — Workbench Certification

**Date:** 2026-07-14  
**Verdict:** **PASS** (unit/component); Playwright **LIMITED** (external Next slug conflict)  
**Certification:** APZSEARCH-008  
**Route:** `/workspace/search`

---

## Certified surfaces

| Item | Result |
| ---- | ------ |
| Parent manifest `platform-search` | **PASS** (`/workspace/search`, `search.query.execute`) |
| Child manifests (overview, query, providers, configurations, collections, sources, scopes, profiles, audit, diagnostics) | **PASS** |
| `SearchWorkspaceRouter` mounted from `workbench-page` | **PASS** |
| `platform-search-view` consumes `@/lib/search/search-api` only | **PASS** |
| No direct `fetch` / platform-services / Meilisearch | **PASS** |
| Permission-gated sidebar entries | **PASS** |
| Query flow (filters, sort, facets, pagination mapping) | **PASS** (component tests) |
| Management / diagnostics / health views | **PASS** (component tests) |
| Loading / empty / error / unauthorized / degraded | **PASS** |
| Accessibility (labels, alerts, keyboard controls) | **PASS** (component-level) |

## Playwright

Spec: `testing/playwright/e2e/apzsearch-007-platform-search-workbench.spec.ts` (mocked HTTP).

**LIMITED** when Next `webServer` / production `build` cannot start due to pre-existing dynamic-route slug conflict under Testing:

- `apps/web/app/api/v1/testing/traceability/[relationshipId]`
- `apps/web/app/api/v1/testing/traceability/[resourceType]/[resourceId]`

This conflict **predates Search**, is **not** introduced by APZSEARCH-007/008, and is **not** a Search defect. Vitest Workbench coverage remains the authoritative UI gate for this certification.

## Evidence

- `pnpm audit:search-workbench` — 0 violations  
- APZSEARCH-007 Workbench coverage **100%** view/router (scoped)  
- Vertical harness manifests + component presence  

No UI redesign in APZSEARCH-008.
