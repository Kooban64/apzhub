# APZHUB Programme — Milestone Completion Report

| Field | Value |
| --- | --- |
| **Document ID** | APZSEARCH-003-CR |
| **Milestone** | APZSEARCH-003 — Search Platform Services, Gateway & Authorization Integration |
| **Programme** | APZHUB Platform Search |
| **Status** | **COMPLETE** |
| **Classification** | Management-plane integration (no execution) |
| **Date** | 2026-07-14 |
| **Authority** | Knowledge Foundation · owner-approved milestone scope |
| **Predecessor** | APZSEARCH-002 (Complete) |
| **Successor** | APZSEARCH-004 — Search Provider Selection & Reference Engine Adapter (**not started; requires owner approval**) |

---

## 1. Executive summary

APZSEARCH-003 integrates the Search Platform **management plane** into the APZHUB Platform Services architecture.

Search provider management, configuration, metadata, diagnostics, health, and validation are now reachable exclusively through:

```text
PlatformServiceGateway
  → RequestPipeline
    → production policies and authorisation
      → Search platform-service implementations
        → Search persistence services and provider registry
          → PostgreSQL metadata repositories
```

**Verdict:** COMPLETE. Stop condition met.

**Not delivered (by design and exclusion):** search execution, indexing, search engines, HTTP routes, OpenAPI Search paths, Workbench UI, product search adapters, OCR, AI, semantic/vector search, ranking, workers, schedulers, or Event Bus integration.

---

## 2. Milestone scope delivered

| Requirement area | Outcome |
| --- | --- |
| Platform service contracts | Delivered — 14 gateway facets |
| Canonical model reuse | Delivered — no domain duplication |
| Thin platform-service implementations | Delivered |
| Provider management | Delivered |
| Provider lifecycle | Delivered (no search execution) |
| Configuration service | Delivered (secret refs only) |
| Collections / sources / scopes / profiles | Delivered (metadata only) |
| Capabilities / health / diagnostics | Delivered |
| Statistics / audit / validation | Delivered |
| PlatformServiceGateway integration | Delivered |
| RequestPipeline integration | Delivered |
| Permission catalogue | Delivered (62 keys; coarse + granular) |
| Explicit operation→permission map | Delivered (`searchPlatformOps`, 74 mappings) |
| Production authorisation | Delivered |
| Tenant / organisation isolation | Delivered |
| Provider ownership | Delivered (`platform` \| `tenant` \| `organisation`) |
| Impersonation controls | Applied via existing platform pipeline |
| Error translation | Delivered → `PlatformServiceError` |
| Logging / metrics | Via RequestPipeline abstractions |
| Production / test factories | Delivered |
| Platform bootstrap (`SEARCH_SERVICE_ENABLED`) | Delivered |
| Health / readiness integration | Delivered |
| Backward compatibility | Maintained |
| Architecture boundary checks | Audit PASS (0 violations) |
| Tests + coverage ≥95% (scoped) | PASS |
| Documentation + foundation stop-point updates | Delivered |

---

## 3. Package versions

| Package | Prior | Delivered | Change |
| --- | --- | --- | --- |
| `@apzhub/search-contracts` | 0.2.0 | **0.3.0** | Additive contracts, permissions, errors, gateway surface |
| `@apzhub/search-persistence` | 0.1.0 | **0.2.0** | Full management thin services; migration 0043 |
| `@apzhub/platform-services` | 0.16.0 | **0.17.0** | Search factories, gateway facets, authz map, bootstrap |

Unrelated packages were not version-bumped for this milestone.

---

## 4. Architecture overview

### 4.1 Permitted dependency path

```text
PlatformServiceGateway
  → Search platform services
    → Search persistence services / provider registry
      → repositories (PostgreSQL production; in-memory test-only)
```

### 4.2 Management plane vs execution plane

| Plane | Status in APZSEARCH-003 |
| --- | --- |
| Management plane (providers, config, metadata, diagnostics, validation) | **Operational** |
| Provider lifecycle readiness | Supported for stub/managed providers |
| Search-execution readiness | **Unavailable / false** |
| Indexing / engine binding | **Not implemented** |

### 4.3 Legacy coexistence

| Surface | Role |
| --- | --- |
| `gateway.searchPlatform` / `gateway.searchProviders` … | APZSEARCH-003 management plane |
| `gateway.search` | Legacy Plane/product search scaffold — **not** APZSEARCH execution |

These surfaces are deliberately not collapsed.

---

## 5. Platform service contracts

Contracts live in `@apzhub/search-contracts` (`SearchPlatformGateway` and facet interfaces).

| Facet | Interface role |
| --- | --- |
| `searchQuery` | `validateQuery` only; reserved `query` throws `search_execution_unavailable` |
| `searchProviders` | Provider registration, lifecycle, activation, validation |
| `searchConfigurations` | Configuration CRUD, versioning, activate, validate, archive |
| `searchCapabilities` | Capability inspection |
| `searchHealth` | Health + management/execution readiness differentiation |
| `searchDiagnostics` | Safe diagnostics (redacted) |
| `searchCollections` | Collection metadata lifecycle |
| `searchSources` | Source metadata + provider/collection assignment |
| `searchScopes` | Scope metadata |
| `searchProfiles` | Profile metadata |
| `searchMetadata` | Declared entity metadata projections (not an index) |
| `searchAudit` | Immutable audit retrieval |
| `searchStatistics` | Metadata counts only (no invented query volumes) |
| `searchValidation` | Deterministic validation — no business search execution |

No search-execution service was introduced.

---

## 6. Canonical models

All domain DTOs are reused from `@apzhub/search-contracts` (providers, configurations, capabilities, health, diagnostics, collections, sources, scopes, profiles, metadata, audits, statistics, validation results).

Platform wrappers are limited to:

- `ServiceRequestContext` ↔ `SearchRequestContext` mapping (`userId` → `actorUserId`)
- controlled `PlatformServiceError` translation
- standard gateway composition patterns

---

## 7. Search platform-service implementations

Thin implementations:

1. Persistence package thin services over repositories + registry  
2. Platform-services adapters that remap context, invoke the Search gateway surface, and translate domain errors  

They may validate context, invoke persistence/registry, translate controlled errors, and emit pipeline logging/metrics.  
They must not (and do not) execute searches, index content, call engine SDKs, rank results, generate embeddings, or load plugins from user input.

---

## 8. Provider management

Supported operations include:

list · get · register · update · enable · disable · set active · clear active · unregister · capabilities · status · validate registration/configuration

Duplicate prevention and tenant/organisation scoping are enforced. Registration manages canonical metadata and trusted managed provider instances only.

---

## 9. Provider lifecycle

Managed lifecycle operations from APZSEARCH-002 are exposed through gateway provider facet methods:

initialise · validate configuration · health · capabilities · diagnostics · dispose · enable · disable

Lifecycle uses registered instances from trusted bootstrap. Callers cannot supply executable implementations through API inputs. No filesystem/URL plugin loading.

---

## 10. Configuration management

Operations: create · get · list · update · version (create/list/get) · activate · validate · archive.

- Persist **secret references only**
- Never return resolved secrets
- Redact sensitive endpoint material where governed
- Configuration validation does not probe engines or execute queries

---

## 11. Collections

Metadata operations: create · get · list · update · enable · disable · archive · restore.

Collections are governed search metadata/scope configuration. They are **not** provider indexes and are never sent to an engine in this milestone.

---

## 12. Sources

Metadata operations: create · get · list · update · enable · disable · archive · restore · assign provider · assign collection · capability-requirement retrieval.

Sources may *represent* future domains (Projects, Support, Documents, Testing, Reporting, etc.). Product adapters are not implemented and business data is not read.

---

## 13. Scopes

Operations: create · get · list · update · archive · restore · source/collection assignment · tenant/organisation restrictions · classification/permission metadata.

Scopes remain configuration metadata and do not execute queries.

---

## 14. Profiles

Operations: create · get · list · update · archive · restore · default scopes · filter/sort/facet/highlight metadata · validate.

Profiles contain no executable scripts and no product business logic.

---

## 15. Capabilities

Capability inspection supports lifecycle, configuration validation, health, diagnostics, and declared query-related capability placeholders (keyword, phrase, filters, sorting, facets, highlighting, suggestions, pagination, indexing mode, tenant/classification filters, semantic/vector placeholders).

Capability states may be implemented / available / enabled / unsupported / unknown / degraded. Search-execution capabilities are **not** marked operational without a real provider implementation.

---

## 16. Health

Canonical states: `AVAILABLE` · `DEGRADED` · `UNAVAILABLE` · `UNKNOWN`.

Health evaluation considers persistence readiness, registration, active provider, configuration validity, lifecycle state, declared capabilities, and provider-supplied health results.

Differentiation is explicit:

- management-plane readiness
- provider lifecycle readiness
- search-execution readiness (**unavailable** until a real engine adapter exists)

Stub metadata providers are not treated as execution-AVAILABLE.

---

## 17. Diagnostics

Safe diagnostics include provider counts, active/enabled/disabled providers, invalid configuration indicators, collection/source/scope/profile counts, health/capability summaries, persistence readiness, audit/statistics metadata summaries, and **search execution status = not implemented**.

Diagnostics must not (and do not) expose resolved secrets, credentials, secret-bearing URLs, raw provider error payloads, database internals, product content, indexed content, query text, or PII beyond governed actor identifiers.

---

## 18. Statistics

Exposed metadata statistics only (provider/collection/source/scope/profile/configuration counts, health distribution, validation/audit operation counts where stored).

No invented query volumes, latency, or hit counts.

---

## 19. Audit

Immutable, tenant- and organisation-scoped audit retrieval covers provider registration/enable/disable/activation, configuration create/activate/validate, collection/source/scope/profile changes, lifecycle operations, health checks, and governed diagnostics access.

Secrets and provider internals are not exposed in audit detail.

---

## 20. Validation

Deterministic validation for provider registrations, configurations, collections, sources, scopes, profiles, capability requirements, and active-provider eligibility.

Validation does not execute business search. Health probes, where used, go only through the governed lifecycle contract.

---

## 21. Gateway integration

Search facade accessors on `PlatformServiceGateway`:

`searchQuery` · `searchProviders` · `searchConfigurations` · `searchCapabilities` · `searchHealth` · `searchDiagnostics` · `searchCollections` · `searchSources` · `searchScopes` · `searchProfiles` · `searchMetadata` · `searchAudit` · `searchStatistics` · `searchValidation` · `searchPlatform`

`gateway.search.query` / operational hit-returning execution is **not** exposed. Missing/disabled Search platform returns controlled `PROVIDER_CAPABILITY_UNSUPPORTED`.

---

## 22. RequestPipeline integration

Every Search platform facet method executes through the existing RequestPipeline:

context validation · correlation ID · request ID · middleware · policies · production authorisation · timing · logging · metrics · controlled errors

No Search-specific execution pipeline was created.

---

## 23. Permission catalogue

`PLATFORM_SEARCH_PERMISSIONS` (**62** entries) includes:

- coarse/legacy: `search.*`, `search.query`, `search.provider`, `search.configuration`, `search.diagnostics`, `search.audit`, `search.execute`, `search.list`, `search.read`
- granular provider/configuration/collection/source/scope/profile/metadata keys
- cross-cutting: `search.capabilities.read`, `search.health.read`, `search.diagnostics.read`, `search.statistics.read`, `search.validation.execute`

`search.query` remains reserved for future execution and is not attached to a working hit-returning query operation.

---

## 24. Operation-to-permission map

Explicit `searchPlatformOps` mappings (**74**) cover every public Search platform gateway method.

- Permissions are not derived dynamically from method names
- No future query-execution operation is mapped as operational
- Tests prove public-operation mapping completeness

Authoritative source: `packages/platform-services/src/authorization/operation-authorization-map.ts`.

---

## 25. Production authorisation

Integrated with `ProductionAuthorizationProvider`. Authorisation considers authenticated/active actor, tenant membership, organisation membership, required permission, provider ownership where applicable, configuration scope, impersonation restrictions, and deny-by-default behaviour.

Production does not use allow-all. Client-supplied roles/permissions are not trusted for grants.

---

## 26. Tenant and organisation isolation

Enforced at platform-service inputs, repository operations, provider registration, configuration, collections, sources, scopes, profiles, diagnostics, health, audit, and statistics.

A provider registered for one tenant is not visible to another tenant. Global activation is not permitted for tenant-owned providers outside governed platform/system context.

---

## 27. Provider ownership and visibility

Ownership metadata supports `platform` · `tenant` · `organisation`. Visibility and activation respect ownership. Tenant-owned providers cannot become globally active. Errors do not reveal hidden provider existence across tenants.

---

## 28. Impersonation

Existing platform impersonation controls apply. Original and effective actors are retained on the request path for audited management operations. Privilege escalation via impersonation is prevented by production authz. No impersonation UI was added.

---

## 29. Error translation

Search domain errors translate to `PlatformServiceError` via `mapSearchDomainError`, covering classifications such as:

provider not found / already registered / duplicate · unavailable · disabled · configuration invalid · capability missing · active provider conflict · configuration not found / invalid / revision conflict · collection/source/scope/profile not found · validation failed · tenant/organisation mismatch · persistence unavailable · capability unsupported · **search execution unavailable**

SQL, table names, resolved credentials, stack traces, and provider implementation internals are not leaked.

---

## 30. Logging and metrics

Structured fields may include operation, facet, provider/config/collection/source/scope/profile ids, tenant/organisation/actor/effective actor, duration, result, error classification, correlation ID, and request ID.

Credentials, resolved secrets, credential-bearing URLs, business search queries, product data, and sensitive provider payloads are not logged. Query/indexing metrics are not emitted (capabilities absent).

---

## 31. Production bootstrap

Factories:

| Factory | Behaviour |
| --- | --- |
| `createSearchPlatformServices` | Compose from foundation/persistence |
| `createSearchPlatformServicesForProduction` | Requires PostgreSQL — **no** silent in-memory fallback |
| `createSearchPlatformServicesForTest` | Explicit in-memory opt-in permitted |
| `wrapSearchPlatformGatewayWithPipeline` | RequestPipeline facet wrapping |

Production requires PostgreSQL Search persistence, ProductionAuthorizationProvider (via platform composition), RequestPipeline, logger/metrics abstractions, and validated Search configuration. Production must not silently use in-memory persistence, allow-all authorisation, mock providers, or test secret providers.

---

## 32. Platform bootstrap integration

Feature switch: `SEARCH_SERVICE_ENABLED=true` (requires `DATABASE_URL`).

| State | Behaviour |
| --- | --- |
| Disabled | Existing platform unchanged; Search facets unavailable (controlled error) |
| Enabled + misconfigured | Clear readiness failure — no silent fallback |
| Enabled + healthy | Search management facets registered |

No HTTP routes were added.

---

## 33. Platform readiness

Safe indicators include: Search service enabled, persistence ready, provider registry ready, provider-management services registered, active-provider status, configuration validity, management-plane readiness, search-execution readiness false/unavailable, authorisation ready, gateway facets registered.

Database credentials, resolved secrets, provider credentials, product content, and hidden provider details are not exposed.

---

## 34. Backward compatibility

Maintained with:

- `@apzhub/search-contracts` additive **0.3.0**
- `@apzhub/search-persistence` additive **0.2.0**
- legacy Search permission aliases
- existing `PlatformServiceGateway` consumers (Projects, Support, Testing, Documents, Reporting)
- current API v1 routes (no Search HTTP added)
- existing platform readiness behaviour for other capabilities

Legacy Plane `gateway.search` remains unsupported for APZSEARCH execution and was not activated as a query surface.

---

## 35. Files created (principal)

### Code

- `packages/platform-services/src/services/search/*`
- `packages/config/drizzle/0043_apz_platform_search_management.sql`
- expanded Search contracts / persistence services / permissions / errors
- `scripts/apzsearch-003-platform-services-audit.mjs`
- `testing/search-foundation/apzsearch-003-foundation.test.ts`

### Documentation

- `docs/architecture/APZHUB-Search-Platform-Service-Architecture.md`
- `docs/architecture/APZHUB-Search-Platform-Service-Contracts-Reference.md`
- `docs/architecture/APZHUB-Search-Gateway-Reference.md`
- `docs/architecture/APZHUB-Search-Operation-to-Permission-Map.md`
- `docs/architecture/APZHUB-Platform-Search-Permission-Catalogue.md` (updated)
- `docs/guides/search-*.md` (provider, configuration, collection/source/scope/profile, health, diagnostics, security, error, bootstrap, boundary)
- `docs/developer/APZHUB-Platform-Search-Platform-Services-Developer-Guide.md`
- `docs/reviews/APZSEARCH-003-coverage-baseline.md`
- `docs/sprint/APZSEARCH-003-completion-report.md` (this document)

### Foundation / catalogue updates

`AI-CONTEXT` · `CURRENT-STATE` · `CURRENT-MILESTONE` · `ACTIVE-BACKLOG` · `SESSION-START` · `ENGINEERING-HANDBOOK` · `ARCHITECTURE-HANDBOOK` · `PACKAGE-CATALOGUE` · `PRODUCT-CATALOGUE` · `docs/README.md` · root `README.md` · `CHANGELOG.md`

---

## 36. Files modified (principal)

- `packages/platform-services` gateway, create-platform-services, permission catalogue, operation-authorization-map, package exports/deps
- `packages/search-contracts` services, permissions, domain, errors, version
- `packages/search-persistence` services, factories, repos (in-memory + postgres), records, authorization, version
- `packages/config` platform-search schema + drizzle journal
- `apps/web/lib/api/v1/gateway/bootstrap.ts`
- `.env.example` (`SEARCH_SERVICE_ENABLED`)

---

## 37. Tests added / totals

| Suite | Tests |
| --- | --- |
| `@apzhub/search-contracts` | 11 |
| `@apzhub/search-persistence` | 20 |
| platform-services Search (`apzsearch-003-platform-services.test.ts`) | 13 |
| foundation harness (`apzsearch-003-foundation.test.ts`) | 3 |
| **Milestone-relevant total** | **47** |

Regression focus: Search contracts, Search persistence, platform-services Search wiring, production-authorization map presence, readiness/bootstrap enablement patterns, architecture audit. No live search engine required.

---

## 38. Coverage

Scoped Vitest coverage (see [APZSEARCH-003 coverage baseline](../reviews/APZSEARCH-003-coverage-baseline.md)):

| Scope | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| `search-persistence` (excl. postgres drivers / ports / records / types) | **98.23%** | **89.16%** | **98.96%** | **98.23%** |
| `platform-services/src/services/search` | **100%** | **98.03%** | **100%** | **100%** |

Operation-to-permission map: **100%** of public Search platform methods mapped (asserted by test).

---

## 39. Architecture-boundary / authorization audit

Command: `pnpm audit:search-platform-services`

| Check | Result |
| --- | --- |
| search-contracts / search-persistence do not depend on platform-services / HTTP / engines | PASS |
| Search platform services do not execute queries or call engines | PASS |
| Gateway exposes Search platform facets without collapsing into legacy `search` | PASS |
| Catalogue + operation map include Search permissions | PASS |
| **Violations** | **0** |

---

## 40. Security and redaction results

| Control | Result |
| --- | --- |
| Secret references only in configuration | PASS |
| No resolved secrets in diagnostics/config responses | PASS |
| Tenant/organisation isolation | PASS |
| Provider ownership visibility | PASS |
| Deny-by-default production authz map | PASS |
| No query-execution surface | PASS |

---

## 41. Quality-gate results

| Gate | Result |
| --- | --- |
| Typecheck (`search-contracts`, `search-persistence`, `platform-services`) | **PASS** |
| Milestone unit/foundation tests (47) | **PASS** |
| Coverage thresholds (≥95% lines/statements scoped) | **PASS** |
| Architecture audit | **PASS** (0 violations) |

Unrelated repository suites outside this milestone scope were not claimed as complete by this report.

---

## 42. Known limitations

1. Postgres repository drivers are production-wired and typechecked but not live-exercised in unit CI (in-memory parity path carries unit coverage).
2. Search-execution readiness remains unavailable until a real engine adapter exists.
3. Legacy Plane `gateway.search` scaffold remains present and is unsupported for APZSEARCH execution.
4. No HTTP / OpenAPI / Workbench / product adapters (explicit exclusions).

---

## 43. Technical debt

| Item | Notes |
| --- | --- |
| Live DB integration tests for Search repositories | Deferred; current CI uses in-memory |
| Engine provider selection | Deferred to APZSEARCH-004 |
| Full OpenAPI/HTTP exposure | Future HTTP milestone (not authorised) |
| Workbench Search module | Future UI milestone (not authorised) |

---

## 44. Risks

| Risk | Mitigation |
| --- | --- |
| Premature engine binding | Stop line before APZSEARCH-004; no engine SDKs in shared packages |
| Accidental query API activation | Reserved `query` throws; audit forbids execution; no HTTP routes |
| Silent fallbacks in production | Factories refuse in-memory / allow-all silent fallback |
| Confusion with legacy `gateway.search` | Documented dual-surface coexistence; facets kept distinct |

---

## 45. Recommendation for APZSEARCH-004

**Recommended next milestone:**  
**APZSEARCH-004 — Search Provider Selection & Reference Engine Adapter**

That milestone should:

1. Evaluate governed provider options  
2. Select the first production search engine  
3. Implement it as an isolated Integration SDK adapter  
4. Support canonical keyword-query execution and index-management contracts  
5. Avoid HTTP API and Workbench changes  
6. Retain engine-specific logic inside the adapter  
7. Provide mocked certification evidence  

**Do not begin APZSEARCH-004 without explicit owner approval.**

---

## 46. Stop condition

APZSEARCH-003 is **COMPLETE**.

Development stops here. Do not begin provider selection, search execution, indexing, HTTP routes, Workbench UI, OCR, AI, workers, Event Bus, or any later milestone without explicit owner approval.

---

## Document control

| Item | Value |
| --- | --- |
| Report location | `docs/sprint/APZSEARCH-003-completion-report.md` |
| Coverage baseline | `docs/reviews/APZSEARCH-003-coverage-baseline.md` |
| Architecture entry | `docs/architecture/APZHUB-Search-Platform-Service-Architecture.md` |
| Programme stop point | `docs/foundation/CURRENT-MILESTONE.md` |
| Prepared for | Owner filing / programme archive |

**End of report.**
