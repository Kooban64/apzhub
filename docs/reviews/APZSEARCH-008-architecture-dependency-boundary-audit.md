# APZSEARCH-008 — Architecture / Dependency / Boundary Audit

**Date:** 2026-07-14  
**Verdict:** **PASS** — 0 violations  
**Script:** `scripts/apzsearch-008-search-vertical-audit.mjs` (`pnpm audit:search-vertical`)  
**Layered scripts:** APZSEARCH-001 through APZSEARCH-007 audits — all **PASS**

---

## Architecture

Certified path verified end-to-end. No layer bypass detected in scanned sources.

```text
Workbench → Typed Client → HTTP (/api/v1/search)
  → PlatformServiceGateway → RequestPipeline → Production Authorization
    → Search Platform Services (management | execution)
      → Provider Resolver → MeilisearchSearchProvider
        → @apzhub/integration-meilisearch → Search Integration SDK → Meilisearch
```

## Dependency direction

| From | May depend on | Must not |
| ---- | ------------- | -------- |
| Workbench | Typed client / search-api facades | platform-services, Meilisearch, SDK, persistence, gateway, handlers |
| Typed client | `/api/v1/search` only | platform-services, Meilisearch, SDK, persistence, gateway |
| HTTP handlers | `getPlatformServiceGateway()` | Meilisearch, persistence, SDK, legacy `gateway.search` |
| Management services | contracts + persistence | Meilisearch adapter, apps/web |
| Execution services | contracts + Meilisearch public API | apps/web, persistence (except via controlled resolver path) |
| Meilisearch adapter | Search Integration SDK + contracts | platform-services, apps/web, persistence |
| Contracts | nothing Search-layer | platform-services, persistence, Meilisearch, apps |

No reverse dependencies found in scanned trees.

## Boundary

| Rule | Result |
| ---- | ------ |
| Handlers → gateway only | **PASS** |
| UI → typed client only | **PASS** |
| No Meilisearch in `apps/web` | **PASS** |
| Adapter no platform-services | **PASS** |
| Management ≠ execution | **PASS** |
| No public internal index HTTP | **PASS** (omitted by ADR-0064) |
| No OCR / AI / semantic / vector / workers / Event Bus | **PASS** |

## Observations (not violations)

1. Public `/api/v1/search/internal/indexes` and `/internal/documents` (and `/indexes`, `/documents`) remain deliberately absent — gateway-only.
2. Playwright against live Next `webServer` may be **LIMITED** by a pre-existing Testing route slug conflict (`[relationshipId]` vs `[resourceType]/[resourceId]`) — external to Search.
3. Live Meilisearch is not required in unit CI; adapter/provider suites use mock REST.
4. APZSEARCH-003 audit version pins updated to accept subsequent certified bumps (`search-contracts` **0.4.0**, `platform-services` **0.18.0**).
