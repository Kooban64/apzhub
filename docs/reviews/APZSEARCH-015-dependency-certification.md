# APZSEARCH-015 — Dependency Certification

**Date:** 2026-07-15  
**Status:** **PASS**

---

## Dependency graph

```mermaid
flowchart TB
  subgraph adapters [Product publication adapters]
    P["@apzhub/search-projects 0.1.0"]
    S["@apzhub/search-support 0.1.0"]
    D["@apzhub/search-documents 0.1.0"]
    T["@apzhub/search-testing 0.1.1"]
    R["@apzhub/search-reporting 0.1.0"]
  end
  FI["@apzhub/search-integration 0.1.0"]
  SC["@apzhub/search-contracts 0.4.0"]
  FUTURE["Future: Search Platform indexing bridge APZSEARCH-016"]
  PLAT["Frozen platform: persistence 0.2.0 · SDK 0.1.0 · Meilisearch 0.1.0 · platform-services 0.18.0"]

  P --> FI
  S --> FI
  D --> FI
  T --> FI
  R --> FI
  FI --> SC
  FI -.-> FUTURE
  FUTURE -.-> PLAT
```

ASCII:

```text
search-projects ──┐
search-support ───┤
search-documents ─┼──► search-integration ──► search-contracts
search-testing ───┤         │
search-reporting ─┘         └── (future) platform indexing / Meilisearch
```

## Allowed product contract deps

| Adapter            | Extra domain deps (allowed)                                         |
| ------------------ | ------------------------------------------------------------------- |
| Projects / Support | `platform-service-contracts`                                        |
| Documents          | `document-contracts`                                                |
| Testing            | `testing-contracts` only (not testing-services/persistence)         |
| Reporting          | `reporting-contracts` · `reporting-core` (version/diagnostics only) |

## Forbidden (all adapters + framework)

- Sibling `@apzhub/search-*` adapters
- `meilisearch` / `@apzhub/integration-meilisearch`
- `@apzhub/search-persistence`
- `@apzhub/platform-services`
- `apps/web` / `NextRequest` / EventBus / OCR

## Isolation assertions

| Rule                                                                         | Result          |
| ---------------------------------------------------------------------------- | --------------- |
| `search-reporting` must NOT depend on `testing-contracts`                    | **PASS**        |
| `search-testing` must NOT depend on `reporting-contracts` / `reporting-core` | **PASS**        |
| `search-testing` may depend on `testing-contracts`                           | **PASS** (does) |
| Adapters never depend on each other                                          | **PASS**        |

## Evidence

- `pnpm audit:search-publication`
- `testing/search-publication/apzsearch-015-boundary.test.ts`
