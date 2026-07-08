# SPR-005 — Knowledge Query API

> **Story:** DF-011  
> **Status:** Implemented  
> **Authority:** [Client hydration spec](./SPR-005-KDF-client-hydration.md) · [Knowledge Views model](../architecture/knowledge-views-model.md) · [ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)

---

## Purpose

Define the **client-side Knowledge Query API** — the orchestrator boundary consumed by the **Knowledge Service** (DF-015). Experience surfaces use `useKnowledgeService()`; `KnowledgeQueryClient` is an internal implementation detail.

DF-011 implements **query state and orchestrator boundary integration only**. Search UI, header integration, palette wiring, and application delivery are deferred.

---

## Architecture

```text
KnowledgeSourceRegistryDto
        ↓ createKnowledgeRegistryFromDto()
ClientKnowledgeRegistry (read-only)
        ↓ KnowledgeDiscoveryProvider
useKnowledgeRegistry()          useKnowledgeService() [public]
        │                               │
        └──────── registry metadata ────┘
                                        ↓
                              Knowledge Service
                                        ↓ (internal)
                              KnowledgeQueryClient → Orchestrator
                                        ↓
                              Ranked KnowledgeDocument[]
```

The hook **consumes** the hydrated registry for readiness and metadata. It **does not** duplicate registry data or register sources on the client.

### Relationship to Knowledge Presentation Layer

```text
Knowledge Query API (useKnowledgeService())
        ↓ ranked KnowledgeDocument[]
Knowledge Presentation Layer
  grouping · mapping · selection delegation · view models · diagnostics
        ↓
Knowledge Experiences
  Overlay · Command Palette (knowledge mode) · Search · Help · …
```

The Query API returns data and lifecycle state only. Grouping, surface mapping, and selection delegation belong to the Knowledge Presentation Layer ([Knowledge Views model](../architecture/knowledge-views-model.md)).

---

## Public API

| Export                                         | Subpath        | Role                                                   |
| ---------------------------------------------- | -------------- | ------------------------------------------------------ |
| `useKnowledgeService()`                        | `/react`       | **Public** query hook for Experience surfaces (DF-015) |
| `useKnowledgeQuery()`                          | `/react`       | Deprecated — wraps `useKnowledgeService()`             |
| `KnowledgeDiscoveryProvider`                   | `/react`       | Registry hydration + Knowledge Service DI              |
| `KnowledgeService`                             | `.` · `/react` | Public client boundary                                 |
| `createKnowledgeService()`                     | `.` · `/react` | Service factory                                        |
| `createKnowledgeServiceFromHydration()`        | `.` · `/react` | App wiring factory                                     |
| `KnowledgeQueryClient`                         | `.` · `/react` | **Internal** orchestrator adapter                      |
| `createKnowledgeQueryClientFromOrchestrator()` | `.` · `/react` | Internal — used by service factory                     |
| `createPlaceholderKnowledgeQueryClient()`      | `.` · `/react` | Internal default until app wiring                      |
| `executeKnowledgeQuery()`                      | `.`            | Pure query executor (tests + hook)                     |
| `ClientKnowledgeQueryDiagnostics`              | `.` · `/react` | Registry + lifecycle + query observability             |

---

## Query lifecycle

| Status    | Meaning                                                     |
| --------- | ----------------------------------------------------------- |
| `idle`    | No query executed; initial or after `reset()`               |
| `loading` | Query in flight                                             |
| `success` | Query completed (including zero results)                    |
| `error`   | Registry not ready, client not configured, or query failure |

Empty result sets are **`success`**, not `error`.

---

## `useKnowledgeQuery()` contract

```typescript
import {
  KnowledgeDiscoveryProvider,
  useKnowledgeQuery,
  createKnowledgeQueryClientFromOrchestrator,
} from "@apzhub/knowledge-discovery-framework/react";

<KnowledgeDiscoveryProvider
  dto={filteredDto}
  queryClient={createKnowledgeQueryClientFromOrchestrator(orchestrator)}
>
  <ExperienceSurface />
</KnowledgeDiscoveryProvider>

const {
  status,          // idle | loading | success | error
  text,            // last query text
  documents,       // ranked results
  isRegistryReady,
  isLoading,
  diagnostics,
  error,
  query,           // (input) => Promise<void>
  reset,
} = useKnowledgeQuery();
```

### Input

```typescript
interface KnowledgeQueryInput {
  readonly text: string;
  readonly context?: KnowledgeContext;
  readonly limit?: number;
}
```

### Error codes

| Code                 | When                                           |
| -------------------- | ---------------------------------------------- |
| `REGISTRY_NOT_READY` | DTO hydration failed or registry empty/invalid |
| `QUERY_CLIENT_ERROR` | Placeholder client — not wired in app          |
| `QUERY_FAILED`       | Orchestrator/provider threw or rejected        |

---

## Orchestrator client integration

`KnowledgeQueryClient` is the DI boundary. Implementations:

| Implementation                                 | Use case                                              |
| ---------------------------------------------- | ----------------------------------------------------- |
| `createKnowledgeQueryClientFromOrchestrator()` | Tests, in-process server rendering, future app wiring |
| `createPlaceholderKnowledgeQueryClient()`      | Default in `KnowledgeDiscoveryProvider` until DF-015  |
| Custom client (future)                         | HTTP/RPC adapter calling server query endpoint        |

The client adapter delegates to `KnowledgeDiscoveryOrchestrator.query()` without modifying registry state.

---

## Diagnostics

`ClientKnowledgeQueryDiagnostics` combines:

| Layer        | Fields                                                                                |
| ------------ | ------------------------------------------------------------------------------------- |
| Lifecycle    | `status`, `queriedAt`, `error`                                                        |
| Registry     | `registryReady`, `registryStatus`, `schemaVersion`, `frameworkVersion`, `sourceCount` |
| Query client | `queryClient.kind`, `queryClient.ready`                                               |
| Orchestrator | `query.*` (`KnowledgeQueryDiagnostics` from DF-006)                                   |

---

## Dependency injection

```text
KnowledgeDiscoveryProvider
  ├── dto → KnowledgeRegistryProvider (DF-010)
  └── queryClient → KnowledgeQueryProvider (DF-011)
```

| Consumer          | DI source                                                                   |
| ----------------- | --------------------------------------------------------------------------- |
| Registry metadata | `useKnowledgeRegistry()`                                                    |
| Query execution   | `useKnowledgeQuery()` → injected `KnowledgeQueryClient`                     |
| Composition root  | `createKnowledgeDiscoveryContext()` — server registry + ranking (unchanged) |

App wiring (DF-015) must inject a real `KnowledgeQueryClient` — typically wrapping a server-side orchestrator or API route.

---

## Rules

| Rule                          | Enforcement                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------ |
| Server-authoritative registry | Hook reads registry context only; no client registration                       |
| No registry duplication       | Documents come from orchestrator query, not re-built from DTO                  |
| Presentation-agnostic         | No UI components; hook returns data + state only                               |
| No execution routing          | Selection → presentation layer delegation → `execute()` / navigation (DF-012+) |

---

## Future Knowledge Experiences

| Experience                              | Consumption                                                       |
| --------------------------------------- | ----------------------------------------------------------------- |
| Knowledge Overlay (DF-012)              | `query({ text })` + presentation layer grouping in modal          |
| Command Palette knowledge mode (DF-013) | `query({ text })` + presentation layer mapping — no overlay modal |
| Global Search                           | `query({ text })` with debounce (future)                          |
| Help                                    | Registry sources + contextual query (future)                      |
| AI Assistant                            | Query results as retrieval context (future)                       |
| Recommendations                         | Query + ranking diagnostics (future)                              |
| Related Items                           | Subset query results (future)                                     |

---

## Out of scope (DF-011)

- Search UI and header integration
- Command palette integration
- Results overlay
- AI / semantic providers
- Application wiring (`apps/web`)
- Debounce hook (consumers may wrap `query()`)

---

## Test coverage

| Area                 | Test file                                                              |
| -------------------- | ---------------------------------------------------------------------- |
| Query lifecycle      | `client/query/execute-knowledge-query.test.ts`                         |
| Orchestrator adapter | `client/query/create-knowledge-query-client-from-orchestrator.test.ts` |
| Hook behaviour       | `react/use-knowledge-query.test.tsx`                                   |
| Provider integration | `react/use-knowledge-query.test.tsx`                                   |

---

_SPR-005 Knowledge Query API — DF-011._
