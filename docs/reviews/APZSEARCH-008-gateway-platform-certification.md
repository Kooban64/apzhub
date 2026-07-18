# APZSEARCH-008 — Gateway & Platform Service Certification

**Date:** 2026-07-14  
**Verdict:** **PASS** (no behavioural redesign)  
**Packages:** `@apzhub/platform-services` **0.18.0** · `@apzhub/search-contracts` **0.4.0** · `@apzhub/search-persistence` **0.2.0**

---

## Gateway

| Facet family                                                                                           | Result                                                                                        |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `gateway.searchExecution*`                                                                             | **PASS** — query, validate, suggest, capabilities, health, readiness, diagnostics, statistics |
| Management Search facets (providers, configurations, collections, sources, scopes, profiles, audit, …) | **PASS**                                                                                      |
| RequestPipeline + production authorisation                                                             | **PASS**                                                                                      |
| Context propagation (actor, tenant, org, correlation)                                                  | **PASS**                                                                                      |
| Error mapping / safe translation                                                                       | **PASS**                                                                                      |
| Legacy `gateway.search` not used on APZSEARCH path                                                     | **PASS**                                                                                      |

## Platform services

| Concern                                               | Result   |
| ----------------------------------------------------- | -------- |
| Provider resolver (ADR-0063)                          | **PASS** |
| Mandatory tenant filtering (ADR-0061)                 | **PASS** |
| Permission enforcement before provider IO             | **PASS** |
| Canonical models only                                 | **PASS** |
| Management plane isolated from Meilisearch adapter    | **PASS** |
| Execution plane owns engine IO via public adapter API | **PASS** |
| Persistence behind management thin services           | **PASS** |

## Evidence

- `pnpm audit:search-platform-services` / `pnpm audit:search-execution` — 0 violations
- APZSEARCH-003 / 006 coverage baselines (scoped ≥95% lines where targeted)
- Vertical audit management≠execution rule

No gateway or platform-service behavioural changes in APZSEARCH-008.
