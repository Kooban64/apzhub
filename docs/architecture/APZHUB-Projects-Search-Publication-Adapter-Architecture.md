# APZHUB Projects Search Publication Adapter Architecture

**Milestone:** APZSEARCH-010  
**Package:** `@apzhub/search-projects` **0.1.0**  
**Date:** 2026-07-14

---

## Purpose

Enable Projects platform services to publish searchable **canonical** entities into the Search Integration Framework (`@apzhub/search-integration`).

Projects never:

- call Meilisearch
- construct provider documents
- call Search Platform internals / platform-services search execution
- expose Plane provisional identifiers

---

## Flow

```text
Projects Platform Services (canonical contracts)
        ↓
Projects Search Publication Adapter  (@apzhub/search-projects)
        ↓
Search Integration Framework         (@apzhub/search-integration)
        ↓
(future) Search Platform → Provider Resolver → Meilisearch Adapter → Meilisearch
```

APZSEARCH-010 wires only to `SearchIntegrationPublisher` / sink. Search Platform, Search SDK, Meilisearch adapter, HTTP, and Workbench remain frozen/unmodified.

---

## Components

| Component | Role |
| --------- | ---- |
| `ProjectsSearchPublisher` | publish / update / remove / validate / preview / lifecycle / diagnostics / statistics |
| `ProjectsSearchEntityMapper` | Canonical Platform models → `SearchEntityDraft` |
| `ProjectsSearchEntityValidator` | Projects-specific checks + Plane ID rejection |
| `ProjectsSearchPublicationContext` | Tenant / org / actor / permissions |
| `ProjectsSearchLifecycle` | Lifecycle helpers + domain-status suggestions |
| `ProjectsSearchDiagnostics` / Metrics / Logger / ErrorTranslator | Safe observability |
| `createProjectsSearchLifecycleHooks` | Synchronous explicit hooks (no listeners) |

---

## Entity types

`workspace` · `project` · `task` · `sprint` · `milestone` · `module` · `team`

Source product: **`projects`**.

Types reused from `@apzhub/platform-service-contracts` — DTOs are not duplicated.

---

## Security

- Tenant on Workspace / Project / Team must match publication context.
- Plane / provisional IDs (`*_plane_*`, `::` composite refs) rejected on ids and metadata.
- Provider metadata keys rejected.
- Classification + permissions propagated onto drafts.
- No cross-tenant remove/update (enforced by Search Integration Framework sink + context).

---

## Trigger points

Hooks such as `onProjectUpserted` / `onTaskRemoved` are **callable APIs** for service call sites. No Event Bus, webhooks, polling, or workers.
