# ADR-0064: Search HTTP API and Workbench Surface

| Field         | Value                |
| ------------- | -------------------- |
| **Status**    | Accepted             |
| **Date**      | 2026-07-14           |
| **Milestone** | APZSEARCH-007        |
| **Deciders**  | Owner / Architecture |

---

## Context

APZSEARCH-006 delivered the Search execution plane through `PlatformServiceGateway` (`searchExecution*`, indexes, documents) without public HTTP. Consumers (Workbench, future modules) need a versioned Platform HTTP surface and typed client that preserve architectural boundaries: presentation → gateway → Platform Services → connector → engine.

Index and document mutation APIs are powerful, easy to misuse from browsers, and already correctly owned as gateway-only administration. Exposing them publicly would expand the attack surface and invite engine-shaped payloads.

## Decision

1. **Public query plane** under `/api/v1/search`:
   - `POST /query` → `gateway.searchExecution.execute`
   - `POST /query/validate` → `gateway.searchExecution.validateQuery`
   - `POST /suggestions` → `gateway.searchExecution.suggest`
   - `GET /capabilities|health|readiness|diagnostics|statistics` → execution health/diagnostics facets
2. **Management plane** under `/api/v1/search/management/...` for existing management facets (providers, configurations, collections, sources, scopes, profiles, capabilities, health, diagnostics, statistics, audit, validation). Prefer list/get; allow create/update only where gateway ops already exist and Permissions gate them (Documents precedent).
3. **Omit public index/document HTTP** — `searchIndexes` / `searchDocuments` remain gateway-only. Deliberately absent: `/api/v1/search/internal/indexes`, `/internal/documents`, and any public `/indexes` or `/documents` under Search. Proven by audits and tests.
4. Handlers call **only** `getPlatformServiceGateway()`; never Meilisearch, persistence, workers, OCR/AI, Event Bus, or legacy `gateway.search` / `searchQuery.query`.
5. Typed client (`createHttpSearchClient`) and Workbench (`/workspace/search`) consume **only** `/api/v1/search/*` via facades — no platform-services SDK in UI.
6. Zod rejects isolation-stripping filters, raw engine filter expressions, unbounded pages, and semantic/vector fields. Trusted `ServiceRequestContext` is authoritative for tenant/org/roles.

## Consequences

- OpenAPI tag **Platform Search** documents the public contract (spec version **1.1.0**).
- Index administration for operators remains available through Platform Services / future admin tooling — not the browser HTTP surface in this milestone.
- APZSEARCH-008 can certify vertical production readiness without expanding HTTP to indexes/documents unless separately decided.

## See also

- [ADR-0061](./ADR-0061-search-tenant-isolation-strategy.md)
- [ADR-0062](./ADR-0062-search-canonical-id-mapping.md)
- [ADR-0063](./ADR-0063-search-execution-provider-resolution.md)
- [APZSEARCH-007 Completion Report](../sprint/APZSEARCH-007-completion-report.md)
