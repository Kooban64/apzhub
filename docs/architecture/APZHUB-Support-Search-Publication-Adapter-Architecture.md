# APZHUB Support Search Publication Adapter Architecture

**Milestone:** APZSEARCH-011  
**Package:** `@apzhub/search-support` **0.1.0**  
**Date:** 2026-07-14

---

## Purpose

Enable Support platform services to publish searchable **canonical** entities into the Search Integration Framework.

Support never calls Meilisearch, never builds provider documents, never calls Search Platform internals, and never exposes Zammad identifiers.

Canonical separation preserved:

- **Support Request** (`SupportTicket`) ≠ Project Task  
- **Support Article** ≠ Project Comment  

---

## Flow

```text
Support Platform Services (canonical contracts)
        ↓
Support Search Publication Adapter  (@apzhub/search-support)
        ↓
Search Integration Framework        (@apzhub/search-integration)
        ↓
(future) Search Platform → Provider Resolver → Meilisearch Adapter → Meilisearch
```

Search Platform, Search Integration Framework, Search SDK, Meilisearch adapter, HTTP, Workbench, and Projects Search Adapter remain frozen/unmodified.

---

## Entity types

| Search entity type | Canonical model |
| ------------------ | --------------- |
| `support_request` | `SupportTicket` |
| `support_article` | `SupportArticle` |
| `support_organisation` | `SupportOrganization` |
| `support_group` | `SupportGroup` |
| `support_user` | `SupportUser` |

Source product: **`support`**.

---

## Components

`SupportSearchPublisher` · `SupportSearchEntityMapper` · `SupportSearchEntityValidator` · `SupportSearchPublicationContext` · `SupportSearchLifecycle` · diagnostics / metrics / logger / error translator · explicit lifecycle hooks.

Operations: publish · update · remove · validate · preview · diagnostics · lifecycle · statistics.

---

## Security

Tenant isolation; Zammad provisional IDs (`*_zammad_*`) rejected; provider metadata keys rejected; classification/permissions propagated; `originMetadata` never indexed.
