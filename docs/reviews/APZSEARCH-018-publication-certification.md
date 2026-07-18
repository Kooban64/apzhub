# APZSEARCH-018 — Publication Ecosystem Certification

**Date:** 2026-07-18  
**Command:** `pnpm certify:search-publication`  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**

---

## Scope certified

| Surface                                              | Status    |
| ---------------------------------------------------- | --------- |
| Publication Framework (`search-integration` 0.2.0)   | Certified |
| Product Publishers (010–014)                         | Certified |
| Orchestrator / Journal / Retry / DLQ (016)           | Certified |
| Administration APIs / Typed Client / Workbench (017) | Certified |
| Bootstrap (`APZHUB_SEARCH_ORCHESTRATION_ENABLED`)    | Certified |
| Diagnostics / Authorization / Documentation          | Certified |
| Frozen Search Platform (001–008)                     | Unchanged |

No new runtime features in APZSEARCH-018.

---

## Version pins

| Package                            | Version |
| ---------------------------------- | ------- |
| `@apzhub/search-integration`       | 0.2.0   |
| `@apzhub/search-orchestrator`      | 0.1.0   |
| `@apzhub/search-publication-admin` | 0.1.0   |
| `@apzhub/search-projects`          | 0.1.0   |
| `@apzhub/search-support`           | 0.1.0   |
| `@apzhub/search-documents`         | 0.1.0   |
| `@apzhub/search-testing`           | 0.1.1   |
| `@apzhub/search-reporting`         | 0.1.0   |
| `@apzhub/search-contracts`         | 0.4.0   |
| `@apzhub/search-persistence`       | 0.2.0   |
| `@apzhub/integration-search-sdk`   | 0.1.0   |
| `@apzhub/integration-meilisearch`  | 0.1.0   |
| `@apzhub/platform-services`        | 0.25.0  |

---

## HTTP / client / workbench

- `/api/v1/search/publication/*` — validation, authz, canonical responses
- `createHttpSearchPublicationAdminClient()` — no orchestrator / provider imports
- Workbench Publication Ops — permission-aware, presentation-only

---

## Rationale for classification

**PRODUCTION_READY_WITH_LIMITATIONS** retained because:

1. Admin markers/audit default to in-memory (not durable PG overlay)
2. Journal admin aggregates via `listByStatus` (scale limitation)
3. Playwright Publication Ops LIMITED (mocked / webServer conflict history)
4. Composition hooks at composition root (platform-services unmodified by design)

Feature completeness of the publication ecosystem is otherwise certified.

---

## Successor (not authorised)

**APZSEARCH-019 — Search Publication Wave Certification & Architecture Freeze**
