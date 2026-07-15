# APZSEARCH-008 — Typed Client Certification

**Date:** 2026-07-14  
**Verdict:** **PASS**  
**Certification:** APZSEARCH-008  
**Surface:** `apps/web/lib/search/` — `createHttpSearchClient()` + mock parity

---

## Operations certified

| Operation | Present |
| --------- | ------- |
| `executeQuery` | ✅ |
| `validateQuery` | ✅ |
| `suggest` | ✅ |
| `getCapabilities` / `getHealth` / `getReadiness` / `getDiagnostics` / `getStatistics` | ✅ |
| Management list/get (providers, configurations, collections, sources, scopes, profiles) | ✅ |
| `getManagementHealth` / `getManagementDiagnostics` / `listAudit` | ✅ |
| `createHttpSearchClient` | ✅ |
| `mock-search-client.ts` parity | ✅ |

## Certified properties

| Property | Result |
| -------- | ------ |
| Calls `/api/v1/search` only | **PASS** |
| No platform-services / Meilisearch / SDK / persistence imports | **PASS** |
| Envelope parsing + paging | **PASS** |
| Abort / error translation | **PASS** |
| Highlight sanitisation | **PASS** |
| Mock parity for Workbench tests | **PASS** |

## Evidence

- APZSEARCH-007 coverage baseline: typed client lines **≥95%** (scoped suite)  
- `pnpm audit:search-http` client rules  
- Vertical harness method export assertions  

No new client features in APZSEARCH-008.
