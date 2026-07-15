# APZHUB Programme — Milestone Completion Report

| Field | Value |
| --- | --- |
| **Document ID** | APZSEARCH-006-CR |
| **Milestone** | APZSEARCH-006 — Meilisearch Platform Integration & Search Execution Gateway |
| **Programme** | APZHUB Platform Search |
| **Status** | **COMPLETE** |
| **Classification** | Execution-plane integration (internal gateway; no HTTP) |
| **Date** | 2026-07-14 |
| **Authority** | Knowledge Foundation · owner-approved milestone scope |
| **Predecessor** | APZSEARCH-005 — Meilisearch Reference Adapter (Complete) |
| **Successor** | APZSEARCH-007 — Search HTTP API, Typed Client & Workbench (**recommended; not started; requires owner approval**) |

---

## 1. Executive summary

APZSEARCH-006 connects the Meilisearch Reference Adapter to the APZHUB Search **execution plane** through `PlatformServiceGateway`, `RequestPipeline`, production authorisation, and vendor-neutral Search execution platform services.

The Search Platform remains vendor-neutral: no caller imports Meilisearch-specific types. The management plane (APZSEARCH-003) is preserved and separate. Legacy Plane `gateway.search` is unchanged.

**This is not an HTTP milestone.** Earlier programme text that labelled APZSEARCH-006 as “Search HTTP API Surface” is superseded by this owner-approved scope; HTTP is deferred to **APZSEARCH-007**.

**Verdict:** COMPLETE. Stop condition met.

**Not delivered (by design):** HTTP routes, OpenAPI Search paths, Workbench UI, product indexing adapters, background workers, OCR, AI, semantic/vector search, Event Bus, live Meilisearch in CI.

---

## 2. Programme context

| Milestone | Status |
| --- | --- |
| APZSEARCH-001 — Platform Search Foundation | Complete |
| APZSEARCH-002 — Search Persistence & Provider Framework | Complete |
| APZSEARCH-003 — Search Platform Services, Gateway & Authorization | Complete (management plane) |
| APZSEARCH-004 — Search Integration SDK | Complete |
| APZSEARCH-005 — Meilisearch Reference Adapter | Complete |
| **APZSEARCH-006 — Meilisearch Platform Integration & Search Execution Gateway** | **Complete** |
| APZSEARCH-007 — Search HTTP API, Typed Client & Workbench | Recommended next (not authorised) |

---

## 3. Package versions

| Package | Prior | Delivered | Change |
| --- | --- | --- | --- |
| `@apzhub/search-contracts` | 0.3.0 | **0.4.0** | Execution contracts + granular permissions |
| `@apzhub/platform-services` | 0.17.0 | **0.18.0** | Execution services, gateway facets, resolver, authz |
| `@apzhub/integration-meilisearch` | 0.1.0 | **0.1.0** | Unchanged (consumed via public API) |
| `@apzhub/integration-search-sdk` | 0.1.0 | **0.1.0** | Unchanged |
| `@apzhub/search-persistence` | 0.2.0 | **0.2.0** | Unchanged |

---

## 4. Architecture overview

```text
Internal platform consumer
  → PlatformServiceGateway.searchExecution*  (and indexes/documents/health/diagnostics)
    → RequestPipeline
      → production authorization
        → Search execution platform services
          → SearchExecutionProviderResolver
            → PlatformSearchExecutionProvider (MeilisearchSearchProvider)
              → @apzhub/integration-meilisearch (public API only)
                → Search Integration SDK
                  → Meilisearch REST API (mock fetch in tests)
```

### Management versus execution plane

| Plane | Milestone | Surface |
| --- | --- | --- |
| Management | APZSEARCH-003 | `gateway.searchProviders`, configurations, collections, sources, scopes, profiles, capabilities, health, diagnostics, statistics, audit, validation |
| Execution | APZSEARCH-006 | `gateway.searchExecution`, `searchIndexes`, `searchDocuments`, `searchExecutionHealth`, `searchExecutionDiagnostics` |
| Legacy Plane | Pre-APZSEARCH | `gateway.search` scaffold — **not** APZSEARCH execution |

These concerns are deliberately not collapsed into one implementation class.

### Naming (collision avoidance)

| Legacy | Execution (this milestone) |
| --- | --- |
| Capability `"search"` / `SearchProvider` = Plane `SearchService` | Capability `platform_search_execution` |
| — | Interface `PlatformSearchExecutionProvider` |
| — | Class `MeilisearchSearchProvider` |

---

## 5. Execution contracts

`@apzhub/search-contracts` **0.4.0** provides application-facing execution contracts including:

- `SearchExecutionService` (execute / validate query; facets / highlights where governed)
- `SearchIndexService` (list/get/create/update/delete/statistics/health)
- `SearchDocumentIndexingService` (add/update/delete/get/list/validate/status)
- `SearchExecutionHealthService` / `SearchExecutionDiagnosticsService`

Canonical models reused: `SearchQuery`, `SearchRequest`, `SearchResponse`, `SearchHit`, `SearchResultPage`, `SearchFilter`, `SearchSort`, `SearchFacet`, `SearchHighlight`, and related types. Meilisearch request/response DTOs are not exposed.

---

## 6. Meilisearch provider

`MeilisearchSearchProvider` (in `@apzhub/platform-services`) consumes **only** the public `@apzhub/integration-meilisearch` surface.

It delegates query / index / document / health / diagnostics operations, translates platform context, applies mandatory isolation filters, maps controlled errors, and exposes accurate capabilities.

It does **not** import RestClient internals, instantiate its own HTTP client, duplicate Meilisearch error handling, implement ranking logic, or access PostgreSQL business tables.

---

## 7. Provider registry and resolution

Trusted bootstrap registers the Meilisearch execution provider. Resolution precedence ([ADR-0063](../adr/ADR-0063-search-execution-provider-resolution.md)):

1. Explicit authorised provider  
2. Profile provider  
3. Collection provider  
4. Source provider  
5. Tenant-active provider  
6. Platform-active provider  
7. Configured priority  

Resolution verifies enabled state, sufficient health, active configuration, capability support, tenant/organisation visibility, and caller authorisation. No silent fallback to an unrelated provider.

---

## 8. Canonical ID boundary

Public consumers use canonical IDs only ([ADR-0062](../adr/ADR-0062-search-canonical-id-mapping.md)). Provider index names and document keys are generated behind the provider boundary. Index prefixes and provider-native names are not exposed publicly.

---

## 9. Tenant isolation

[ADR-0061](../adr/ADR-0061-search-tenant-isolation-strategy.md): **shared indexes with mandatory platform-generated tenant filters** (fail-closed). Organisation filters applied where applicable. Client-supplied tenant filters are not trusted and cannot remove mandatory isolation. Tests prove callers cannot strip mandatory filters.

---

## 10. Classification and permission filtering

Canonical classification / permission / source / collection restrictions are translated into provider filters where supported. Provider filtering **supplements** production authorisation and does not replace it. If a secure restriction cannot be applied, the query fails rather than returning potentially unauthorised results.

---

## 11. Profiles, scopes, and validation

Governed profiles may contribute default scopes, filters, sorting, facets, highlighting, provider selection metadata, and pagination bounds. Client refinements cannot weaken mandatory security restrictions. Profiles contain no executable scripts.

Two validation layers: canonical structure validation and provider-compatibility validation (capabilities, filter/sort/facet translation readiness). Validation does not leak provider internals.

---

## 12. Query execution

Supported through the execution gateway (capabilities available via Meilisearch reference adapter):

keyword · phrase · pagination · filtering · sorting · facets · highlighting · tenant/organisation scope · collection/source/profile · classification/permission restrictions where represented

Unsupported semantic/vector/AI features return controlled canonical errors (`NOT_SUPPORTED` / capability unsupported).

Responses contain only safe vendor-neutral fields (no raw engine payloads, `_rankingScoreDetails`, API keys, or unrestricted indexed content).

---

## 13. Index lifecycle and document indexing

Internal gateway operations for governed index management and document indexing are available under separate permissions from query execution. No automatic index creation during ordinary query execution unless explicitly governed.

This milestone provides **callable execution contracts only**. Product adapters that source Projects/Support/Documents/Testing/Reporting data are not implemented. Tests use canonical fixtures. Indexing rejects secrets, tokens, binary content, and other forbidden fields.

---

## 14. Gateway and RequestPipeline

New facets: `searchExecution` · `searchIndexes` · `searchDocuments` · `searchExecutionHealth` · `searchExecutionDiagnostics` · `searchExecutionPlatform`.

Every operation runs through the existing RequestPipeline (context, correlation/request IDs, middleware, policies, production authorisation, timing, logging, metrics, controlled errors). No competing Search-specific pipeline.

---

## 15. Permissions and operation map

Granular execution permissions added for query execute/validate/facets/highlights/select-provider, index mutation/read, document mutation/read/validate/status, and execution health/diagnostics/statistics. Coarse aliases retained for compatibility.

Explicit `searchExecutionOps` mappings cover **100%** of public execution gateway methods. Query permission is distinct from index/document mutation. Completeness is asserted by tests.

---

## 16. Production authorisation

`ProductionAuthorizationProvider` evaluates actor, effective actor, tenant, organisation, operation permission, provider ownership, collection/source/scope/profile/classification, and impersonation restrictions. Client-supplied roles/permissions/tenant filters/provider IDs are not authoritative. Provider is not invoked after authorisation denial.

---

## 17. Readiness, diagnostics, metrics, logging

Readiness differentiates management-plane ready, provider registered/enabled/configured/healthy, query execution ready, index management ready, and document indexing ready. Registration alone does not imply execution ready.

Safe diagnostics include selected provider ID/type/version, capabilities, readiness, collection/source counts, index health summaries, operation/latency summaries, and error classifications — without secrets, raw queries, full payloads, or PII.

Metrics cover query counts/success/failure/duration, result counts, resolution failures, index/document ops, provider latency, timeouts. Logs use safe structured fields; raw query text and document content are not logged by default.

---

## 18. Error translation

Adapter/provider errors map to canonical `PlatformServiceError` classifications (query invalid/unsupported, provider not found/disabled/unavailable/unhealthy, configuration invalid, capability unsupported, index/document errors, tenant/classification filter unavailable, authorisation denied, rate limited, timeout, response invalid, search execution unavailable, …). Meilisearch error bodies and implementation details do not leak.

---

## 19. Bootstrap

Factories: `createSearchExecutionServices` · `createSearchExecutionServicesWithMeilisearch` · `createSearchExecutionServicesForProduction` · `createSearchExecutionServicesForTest`.

Production requires management-plane persistence, trusted Meilisearch provider registration, validated configuration, secret provider, RequestPipeline, ProductionAuthorizationProvider, logging, and metrics. No silent mock / allow-all / execution-disabled stub fallback.

When Search management is enabled but the execution provider is not configured: management remains available; execution readiness stays unavailable; queries return a controlled unavailable error.

---

## 20. Backward compatibility

Maintained with APZSEARCH-001–005, management gateway facets, legacy permission aliases, legacy Plane `gateway.search`, existing platform readiness, and Projects/Support/Testing/Documents/Reporting behaviour. No existing HTTP APIs changed. Execution is not exposed publicly through API v1.

---

## 21. Files created / modified (principal)

**Created:** `packages/platform-services/src/services/search-execution/*`, execution contracts/permissions in search-contracts, ADRs 0061–0063, architecture/guides, audit script, coverage baseline, this report.

**Modified:** platform-services gateway / create-platform-services / permission catalogue / operation map / package exports/deps/version; search-contracts version; apps/web gateway bootstrap; foundation stop-point documents; CHANGELOG / catalogues / READMEs.

---

## 22. Testing and coverage

| Suite | Result |
| --- | --- |
| Search execution unit tests (`apzsearch-006-*.test.ts`) | **26 PASS** |
| Management plane regression (`apzsearch-003` suite co-run) | **13 PASS** |
| Typecheck (contracts / platform-services / meilisearch) | **PASS** |
| Architecture audit `pnpm audit:search-execution` | **PASS (0 violations)** |

Coverage (execution folder; see [baseline](../reviews/APZSEARCH-006-coverage-baseline.md)):

| Metric | Coverage |
| --- | --- |
| Statements | **97.75%** |
| Lines | **97.75%** |
| Branches | **88.42%** |
| Functions | **100%** |

Module highlights: Meilisearch provider **95.41%** · resolver **95.09%** · service impls **99.07%** · factories **99.26%** · security filters **100%**.

No live Meilisearch server required.

---

## 23. Architecture-boundary / security results

| Check | Result |
| --- | --- |
| Gateway does not import Meilisearch | PASS |
| platform-services does not import RestClient internals | PASS |
| Provider uses public adapter surface only | PASS |
| Adapter does not import platform-services | PASS |
| Management ≠ execution | PASS |
| No HTTP / Workbench / product workers / OCR / AI | PASS |
| Mandatory tenant filters cannot be removed by caller | PASS (tests) |
| No raw API-key / Meilisearch payload leakage | PASS |

---

## 24. Known limitations / technical debt

1. Execution is internal-only (no HTTP/Workbench yet — APZSEARCH-007).  
2. Product data indexing adapters not implemented (fixtures only).  
3. Live Meilisearch integration tests deferred (mock REST).  
4. Shared-index + filter isolation is the certified strategy; dedicated per-tenant index mode remains a future option if governance changes.

---

## 25. Risks

| Risk | Mitigation |
| --- | --- |
| Engine lock-in perception | Vendor-neutral contracts; only public adapter consumed |
| Tenant isolation bypass | Mandatory platform filters + fail-closed + tests |
| Premature public HTTP | Stop before APZSEARCH-007 |
| Confusion with legacy `gateway.search` | Distinct facet names and documentation |

---

## 26. Recommendation for APZSEARCH-007

**APZSEARCH-007 — Search HTTP API, Typed Client & Workbench**

1. Expose canonical query execution through `/api/v1/search` (or governed equivalent) via API Gateway.  
2. Expose only safe internal index-administration routes where separately authorised.  
3. Add OpenAPI and a production typed client.  
4. Add a permission-driven platform Search Workbench.  
5. Retain all provider/engine details behind Platform Services.  
6. Add **no** product indexing workers or AI in that milestone unless separately scoped.

**Do not begin APZSEARCH-007 without explicit owner approval.**

---

## 27. Stop condition

**APZSEARCH-006 is COMPLETE.**

Await explicit owner approval before APZSEARCH-007 or any HTTP routes, Workbench UI, product indexing adapters, workers, Event Bus, OCR, AI, semantic search, vector search, or later milestone work.

---

## Document control

| Item | Value |
| --- | --- |
| Report location | `docs/sprint/APZSEARCH-006-completion-report.md` |
| Coverage baseline | `docs/reviews/APZSEARCH-006-coverage-baseline.md` |
| ADRs | ADR-0061 · ADR-0062 · ADR-0063 |
| Programme stop point | `docs/foundation/CURRENT-MILESTONE.md` |
| Prepared for | Owner filing / programme archive |

**End of report.**
