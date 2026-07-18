# APZHUB Cross-Product Search Integration Framework Architecture

**Milestone:** APZSEARCH-009  
**Package:** `@apzhub/search-integration` **0.1.0**  
**Date:** 2026-07-14

---

## Purpose

Defines how APZHUB products publish **canonical searchable entities** into the Search Platform publication path.

Products never:

- call Meilisearch
- construct provider indexes
- construct provider search documents
- depend on provider-specific contracts

The Search Platform remains the System of Record for indexing and execution (frozen at APZSEARCH-007 / certified APZSEARCH-008).

---

## Flow

```text
Product Domain
      ↓
Search Integration Publisher   (@apzhub/search-integration)
      ↓
Canonical Search Entity
      ↓
Search Integration Framework (validate / preview / journal)
      ↓
Search Platform (future bridge — not wired in APZSEARCH-009)
      ↓
Provider Resolver → Meilisearch Adapter → Meilisearch
```

APZSEARCH-009 delivers the **product → canonical entity** framework and an in-memory publication journal (test/default sink). It does **not** change platform-services, HTTP, Workbench, or the Meilisearch adapter.

---

## Components

| Component                    | Role                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `SearchIntegrationPublisher` | Product-facing facade                                                                 |
| `SearchEntityPublisher`      | publish / update / remove / validate / preview / lifecycle / diagnostics / statistics |
| `SearchIntegrationContext`   | Tenant / org / product / actor context                                                |
| `SearchEntityMapper`         | Draft → `CanonicalSearchEntity` (+ preview `SearchMetadata`)                          |
| `SearchEntityValidator`      | Fail-closed validation; rejects provider metadata leakage                             |
| `SearchEntityLifecycle`      | Explicit lifecycle transitions (no scheduling)                                        |
| `SearchPublication*`         | Result, diagnostics, metrics, logger, error translator                                |
| `SearchPublicationSink`      | Journal port (`memory` default, `noop` for dry-run)                                   |
| Product contracts            | Projects / Support / Documents / Testing / Reporting — **declarations only**          |

---

## Canonical entity

Required fields: id, entityType, productId, tenantId, title, classification, permissions, timestamps, version, lifecycleState. Optional: organisation, summary, metadata (string map), keywords, navigationTarget, sourceId, ownerUserId.

Forbidden: Meilisearch documents, engine primary keys, provider-specific metadata keys.

---

## Operations (synchronous only)

publish · update · remove · validate · preview · diagnostics · lifecycle · statistics

Excluded: query execution, scheduling, retries, background workers, Event Bus, OCR, AI, semantic/vector.

---

## Boundaries

| May depend on              | Must not depend on                |
| -------------------------- | --------------------------------- |
| `@apzhub/search-contracts` | `@apzhub/platform-services`       |
|                            | `@apzhub/integration-meilisearch` |
|                            | `@apzhub/integration-search-sdk`  |
|                            | Product domain packages           |
|                            | HTTP / Workbench                  |

---

## Next (not authorised)

Product-specific publication adapters / indexers that implement the contracts and bridge into the Search Platform indexing services — **without changing the Search Platform itself**.
