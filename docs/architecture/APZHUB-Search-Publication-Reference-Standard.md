# APZHUB Search Publication Reference Standard

**Status:** Official APZHUB Search Publication Reference Standard  
**Declared:** APZSEARCH-019 (2026-07-18)  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS  
**Architecture:** **Frozen** ([Freeze Notice](./APZHUB-Search-Publication-Architecture-Freeze-Notice.md))

---

## Purpose

This document is the authoritative engineering reference for the certified Search Publication ecosystem. It defines how product domains publish metadata into the frozen Search Platform through durable orchestration — without modules calling providers, connectors, or Search Platform internals directly.

Publication owns **enqueue → journal → retry → integrate → index** for product metadata. It does **not** own query execution, semantic/vector search, Event Bus delivery, or provider credential management (those remain Search Platform / Integration boundaries).

---

## Publication architecture

```text
Product Services → Composition Hooks → Publication Journal
  → Search Orchestrator → Retry Engine → Search Integration Framework
  → Frozen Search Platform → Meilisearch Adapter
```

Administration (ops only):

```text
Workbench → Typed Client → HTTP → Admin Gateway → Authz → Admin Service
  → Orchestrator public APIs → Journal
```

---

## Package catalogue

| Package                            | Version   | Owns                                              |
| ---------------------------------- | --------- | ------------------------------------------------- |
| `@apzhub/search-integration`       | **0.2.0** | Cross-product publication contracts & sink API    |
| `@apzhub/search-projects`          | **0.1.0** | Projects metadata publisher                       |
| `@apzhub/search-support`           | **0.1.0** | Support metadata publisher                        |
| `@apzhub/search-documents`         | **0.1.0** | Documents metadata publisher                      |
| `@apzhub/search-testing`           | **0.1.1** | APZ TCMS metadata publisher                       |
| `@apzhub/search-reporting`         | **0.1.0** | Reporting metadata publisher                      |
| `@apzhub/search-orchestrator`      | **0.1.0** | Journal, lifecycle, retry, batch, diagnostics     |
| `@apzhub/search-publication-admin` | **0.1.0** | Ops gateway, service, permissions, audit markers  |
| `@apzhub/search-contracts`         | **0.4.0** | Frozen Search Platform contracts (downstream)     |
| `@apzhub/search-persistence`       | **0.2.0** | Frozen Search Platform persistence (downstream)   |
| `@apzhub/integration-search-sdk`   | **0.1.0** | Frozen Search Integration SDK (downstream)        |
| `@apzhub/integration-meilisearch`  | **0.1.0** | Frozen Meilisearch Reference Adapter (downstream) |

---

## Dependency rules

- Publishers depend on `@apzhub/search-integration` only for publication sinks
- Orchestrator depends on `@apzhub/search-integration` — never Meilisearch / search-persistence / search-contracts
- Admin depends on `@apzhub/search-orchestrator` public APIs only
- HTTP / typed client / Workbench never import orchestrator internals, platform-services, or provider SDKs
- No product ↔ product publisher coupling
- No reverse dependency from framework to product adapters

---

## Orchestration model

- Deny-by-default bootstrap: `APZHUB_SEARCH_ORCHESTRATION_ENABLED`
- Production journal: PostgreSQL (`platform_search_publication_journal`, migrations **0058** / **0059**, RLS)
- Lifecycle statuses with transition guards
- Batch drain via orchestrator `processBatch`
- Safe enqueue helpers must not fail product SoR mutations when publication is disabled or transiently unavailable

---

## Journal model

- Durable row per publication intent
- Payload hash for deduplication (`hashPublicationPayload`)
- Status progression: pending → processing → succeeded / retry / dead-letter
- Rows are never hard-deleted by administration UI

---

## Retry model

- `DEFAULT_RETRY_POLICY` with exponential backoff
- Transient failures schedule `nextAttempt`
- Permanent failure messages → dead-letter
- Admin retry / drain require `search.publication.retry` or `search.publication.admin`
- DLQ re-enqueue creates a **new** journal row; original dead-letter retained

---

## Composition hook conventions

- Wrap product services at composition root (platform-services source unmodified by design)
- Hooks: create / update / archive / restore / delete → safe enqueue
- Metadata-only drafts — no binaries, report bodies, provider secrets, engine role names
- Product isolation — each publisher owns its entity catalogue

---

## Administration conventions

- Package-owned permissions (not frozen search-contracts)
- Gateway deny-by-default
- Mutating ops audited
- Markers for DLQ acknowledge/archive (default in-memory store unless durable store composed)
- Presentation-only Workbench at `/workspace/search/publication`

---

## Diagnostics conventions

- Expose orchestrator / journal / retry / bootstrap / backlog health metadata
- Never expose Meilisearch credentials, provider tokens, or raw engine errors
- Requires `search.publication.diagnostics`

---

## Authorization model

| Permission                       | Purpose                                  |
| -------------------------------- | ---------------------------------------- |
| `search.publication.read`        | List/inspect journal & summaries         |
| `search.publication.retry`       | Retry / drain operations                 |
| `search.publication.deadletter`  | DLQ inspect / re-enqueue / ack / archive |
| `search.publication.admin`       | Elevated admin operations                |
| `search.publication.diagnostics` | Diagnostics surfaces                     |

Server-side enforcement on every HTTP operation. UI filtering is non-authoritative.

---

## Security model

- Zero Trust: auth → authz → validation → execution → audit
- No credential or provider secret leakage in diagnostics, errors, or Workbench
- Secrets remain in integration/connection boundaries
- TLS and platform API auth assumed for HTTP
- Audit trail for mutating admin operations

---

## Naming conventions

- User-facing: **Search**, **Publication Ops** — never Meilisearch branding for standard users
- Packages: `@apzhub/search-*` for publication; `@apzhub/integration-meilisearch` internal only
- Permissions: `search.publication.*` only

---

## Explicit non-goals (frozen absence)

- Semantic / vector / AI search
- Event Bus–driven publication
- Query engine changes
- Provider federation beyond certified Meilisearch path
- Distributed multi-node scheduler (future)

---

## See also

- [Architecture Freeze Notice](./APZHUB-Search-Publication-Architecture-Freeze-Notice.md)
- [Operational Readiness Guide](../guides/APZHUB-Search-Publication-Operational-Readiness-Guide.md)
- [Future Search Publication Guide](../developer/APZHUB-Future-Search-Publication-Guide.md)
