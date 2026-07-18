# APZSEARCH-018 — Architecture Review

**Date:** 2026-07-18  
**Verdict:** **PASS** — no architectural violations  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS

---

## Certified chain

```text
Product Services
        ↓
Composition Hooks
        ↓
Publication Journal
        ↓
Search Orchestrator
        ↓
Retry Engine
        ↓
Search Integration Framework
        ↓
Frozen Search Platform
        ↓
Meilisearch Adapter
```

Operations overlay (017):

```text
Workbench → Typed Client → HTTP `/api/v1/search/publication/*`
  → Admin Gateway → Authz → Admin Service → Orchestrator public APIs → Journal
```

---

## Boundary audit

| Rule                                                                 | Result |
| -------------------------------------------------------------------- | ------ |
| Product services communicate only through composition hooks          | PASS   |
| Publication uses only `@apzhub/search-integration` from orchestrator | PASS   |
| Search platform unchanged (001–008 freeze)                           | PASS   |
| No direct provider access from products                              | PASS   |
| No bypass of the orchestrator for durable publish                    | PASS   |
| No reverse dependencies (framework ↛ product adapters)               | PASS   |
| Admin package does not import persistence / contracts / Meilisearch  | PASS   |

---

## Layer ownership

| Layer                           | Owner package                                           |
| ------------------------------- | ------------------------------------------------------- |
| Product metadata mapping        | `search-{projects,support,documents,testing,reporting}` |
| Cross-product publish API       | `search-integration` **0.2.0**                          |
| Durable enqueue / retry / batch | `search-orchestrator` **0.1.0**                         |
| Ops administration              | `search-publication-admin` **0.1.0**                    |
| Query / index execution         | Frozen Search Platform (unchanged)                      |

---

## Violations

None. Certification audits report **0** violations across reliability, publication, orchestrator, and admin scripts.

---

## Limitations (non-violations)

- Composition hooks wrap at composition root; platform-services source files not patched
- In-memory admin markers/audit by default
- Admin journal listing aggregates from status lists (scale limit)
