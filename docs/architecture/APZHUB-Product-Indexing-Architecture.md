# APZHUB Product Indexing Architecture

> **Milestone:** APZSEARCH-016 — Product Indexing Orchestration Framework  
> **Status:** Complete  
> **Authority:** Search Platform freeze (001–008) · Publication certification (009–015) · ADR-0060 · ADR-0064

---

## Purpose

Close the gap between product publication and the frozen Search platform with durable orchestration:

```
Product Services
  → Publication Hooks (composition)
  → Publication Journal (PostgreSQL)
  → Index Orchestrator
  → Retry Scheduler
  → Publication Sink (via Search Integration)
  → Search Integration Framework
  → Frozen Search Platform
  → Meilisearch Adapter
```

The Search platform itself is **not** modified.

---

## Ownership

| Layer                         | Owns                                                                       | Does not own                                            |
| ----------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| `@apzhub/search-orchestrator` | Durable journal, retry, batching, ordering, dedupe, lifecycle, diagnostics | Search execution, query, provider SDKs, HTTP, Workbench |
| `@apzhub/search-integration`  | Canonical entity publish/update/remove/lifecycle                           | Durability, retries, product SoR                        |
| Frozen Search Platform        | Index/query contracts & services                                           | Product publication scheduling                          |

---

## Bootstrap

`APZHUB_SEARCH_ORCHESTRATION_ENABLED` — deny-by-default.

When disabled, enqueue fails safely (`SEARCH_ORCHESTRATION_DISABLED`) and product hooks no-op without affecting product transactions.

---

## Production journal

Table: `platform_search_publication_journal` (migrations **0058** / **0059** RLS).

In-memory journal is **test-only**. Production factory requires PostgreSQL.

---

## Package

- `@apzhub/search-orchestrator` **0.1.0**
- Consumes `@apzhub/search-integration` **0.2.0**

---

## See also

- [Publication Journal Guide](../guides/APZHUB-Publication-Journal-Guide.md)
- [Retry Guide](../guides/APZHUB-Search-Publication-Retry-Guide.md)
- [Lifecycle Guide](../guides/APZHUB-Search-Publication-Lifecycle-Guide.md)
- [Failure Recovery Guide](../guides/APZHUB-Search-Publication-Failure-Recovery-Guide.md)
- [Developer Guide](../developer/APZHUB-Search-Orchestrator-Developer-Guide.md)
- [APZSEARCH-016 Completion Report](../sprint/APZSEARCH-016-completion-report.md)
