# APZHUB Search Publication Administration Architecture

> **Milestone:** APZSEARCH-017  
> **Package:** `@apzhub/search-publication-admin` **0.1.0**  
> **Status:** Complete

## Purpose

Operational administration over the publication journal delivered by APZSEARCH-016. Visibility, controlled retry/dead-letter ops, and diagnostics — **not** Search platform changes.

## Path

```
Search Workbench (Publication Ops)
  → Publication Typed Client
  → Publication HTTP API (/api/v1/search/publication/*)
  → Publication Admin Gateway
  → Deny-by-default authorization
  → Publication Admin Service
  → Search Orchestrator (public APIs)
  → Publication Journal
  → Frozen Search Platform
```

## Boundaries

| May use                                  | Must not use                   |
| ---------------------------------------- | ------------------------------ |
| `@apzhub/search-orchestrator` public API | Search contracts / persistence |
| Local permission catalogue               | Meilisearch / provider SDKs    |
| Admin markers + audit overlay            | platform-services mutation     |
| Search Workbench / HTTP / typed client   | Index/query/execution HTTP     |

## Permissions

- `search.publication.read`
- `search.publication.retry`
- `search.publication.deadletter`
- `search.publication.admin`
- `search.publication.diagnostics`

Owned by `@apzhub/search-publication-admin` (Search Platform contracts remain frozen).

## Dead-letter policy

Journal rows are never deleted. Acknowledge / archive are admin markers. Retry creates a **new** enqueue (orchestrator lifecycle keeps dead-letter terminal).
