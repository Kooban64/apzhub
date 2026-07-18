# APZSEARCH-008 — HTTP Certification

**Date:** 2026-07-14  
**Verdict:** **PASS**  
**Certification:** APZSEARCH-008  
**OpenAPI:** `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` info **1.1.0** · tag **Platform Search**

---

## Surface certified

### Query / execution plane

| Method | Path                            |
| ------ | ------------------------------- |
| `POST` | `/api/v1/search/query`          |
| `POST` | `/api/v1/search/query/validate` |
| `POST` | `/api/v1/search/suggestions`    |
| `GET`  | `/api/v1/search/capabilities`   |
| `GET`  | `/api/v1/search/health`         |
| `GET`  | `/api/v1/search/readiness`      |
| `GET`  | `/api/v1/search/diagnostics`    |
| `GET`  | `/api/v1/search/statistics`     |

### Management plane (`/api/v1/search/management/**`)

providers · configurations · collections · sources · scopes · profiles · capabilities · health · diagnostics · statistics · audit · validation (query + configuration)

## Certified properties

| Property                                                    | Result                    |
| ----------------------------------------------------------- | ------------------------- |
| OpenAPI parity with implemented routes                      | **PASS**                  |
| `withPlatformApiAuth` on all routes                         | **PASS**                  |
| Handlers → `getPlatformServiceGateway()` only               | **PASS**                  |
| Canonical request/response envelopes                        | **PASS**                  |
| Pagination / filters / sort / facets / highlights contracts | **PASS** (execution path) |
| Permission mapping via production authz                     | **PASS**                  |
| Structured safe errors                                      | **PASS**                  |
| Internal index/document routes absent                       | **PASS** (by design)      |

## Validation evidence

- `pnpm audit:search-http` — 0 violations
- `pnpm openapi:validate:platform` — PASS
- Handler unit suite (`apps/web/lib/api/v1/handlers/search.test.ts`) — covered under APZSEARCH-007 baseline
- Vertical harness asserts route files + OpenAPI paths exist

## Deliberate omissions

| Path                                | Status             |
| ----------------------------------- | ------------------ |
| `/api/v1/search/internal/indexes`   | Omitted (ADR-0064) |
| `/api/v1/search/internal/documents` | Omitted            |
| `/api/v1/search/indexes`            | Omitted            |
| `/api/v1/search/documents`          | Omitted            |

No new endpoints in APZSEARCH-008.
