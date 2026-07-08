# SPR-005 — Client Knowledge Registry Hydration

> **Story:** DF-010  
> **Status:** Implemented  
> **Authority:** [Knowledge Source Registry DTO](./SPR-005-KDF-knowledge-source-registry-dto.md) · [Knowledge Views model](../architecture/knowledge-views-model.md) · [ADR-0027](../adr/ADR-0027-knowledge-discovery-framework-package.md)

---

## Purpose

Define client-side hydration of a **read-only Knowledge Registry** from the server-authoritative `KnowledgeSourceRegistryDto`. This mirrors the Action Framework (`createCommandRegistryFromDto`) and Workbench registry hydration patterns.

DF-010 implements **registry hydration only**. Query orchestration, providers, search UI, and application wiring are deferred to later stories.

---

## Hydration pipeline

```text
Server bootstrap
        ↓
KnowledgeSourceRegistryDto (unfiltered)
        ↓ filterKnowledgeSourceRegistryDto()
KnowledgeSourceRegistryDto (permission-filtered)
        ↓ validateKnowledgeSourceRegistryDto()   [client boundary]
        ↓ createKnowledgeRegistryFromDto()
ClientKnowledgeRegistry (read-only)
        ↓ KnowledgeRegistryProvider
useKnowledgeRegistry()
```

---

## Public API

| Export                                 | Subpath        | Role                                        |
| -------------------------------------- | -------------- | ------------------------------------------- |
| `createKnowledgeRegistryFromDto()`     | `.` · `/react` | Hydrate read-only registry from unknown DTO |
| `validateKnowledgeSourceRegistryDto()` | `.` · `/react` | Validate before hydration                   |
| `ReadOnlyKnowledgeRegistry`            | `.` · `/react` | Read-only index interface                   |
| `ClientKnowledgeRegistry`              | `.`            | Default implementation                      |
| `ClientKnowledgeRegistryDiagnostics`   | `.` · `/react` | Client observability                        |
| `KnowledgeRegistryProvider`            | `/react`       | React context provider                      |
| `useKnowledgeRegistry()`               | `/react`       | Hook for hydrated registry access           |
| `CLIENT_REGISTRY_HYDRATION_SYNC_STATE` | `.` · `/react` | Sync mode metadata                          |

---

## Validation rules

Client hydration **must** validate the DTO before constructing the registry:

1. Payload is an object
2. `schemaVersion === 1` (see `KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION`)
3. `sources` is an array
4. Each descriptor passes `validateKnowledgeSource` rules
5. No duplicate source ids
6. `frameworkVersion`, when present, is a non-empty string

On validation failure:

- `ok: false`
- `registry` is an invalid read-only shell (`status: "invalid"`)
- `errors` contains structured `KnowledgeRegistrationIssue[]`
- No partial hydration of invalid descriptors

---

## Read-only semantics

The client registry **must not**:

- Call `registerSource()` or `registerProvider()`
- Invoke `provider.query()`
- Mutate hydrated descriptors
- Persist state

`ClientKnowledgeRegistry` exposes only:

- `has(sourceId)`
- `get(sourceId)`
- `list()` — sorted by `priority`, then `id`
- `getDiagnostics()`

Hydrated sources are deep-frozen via `freezeKnowledgeSource()`.

---

## Version preservation

`createKnowledgeRegistryFromDto()` preserves:

| Field              | Location                    |
| ------------------ | --------------------------- |
| `schemaVersion`    | Returned `dto`, diagnostics |
| `frameworkVersion` | Returned `dto`, diagnostics |

These fields are server-authoritative and must not be rewritten on the client.

---

## Client diagnostics

`ClientKnowledgeRegistryDiagnostics` reports:

| Field                                        | Description                      |
| -------------------------------------------- | -------------------------------- |
| `status`                                     | `empty` · `hydrated` · `invalid` |
| `schemaVersion`                              | DTO schema version               |
| `frameworkVersion`                           | Framework version from DTO       |
| `sourceCount`                                | Hydrated source count            |
| `activeSourceCount`                          | Sources with `status: "active"`  |
| `sourceIds`                                  | Sorted source ids                |
| `builtinSourceCount` / `manifestSourceCount` | Origin breakdown                 |
| `hydratedAt`                                 | ISO timestamp                    |
| `source`                                     | Always `"server-dto"`            |
| `synchronisation.mode`                       | `"hydration"` (DF-010)           |

---

## React integration

```typescript
import {
  KnowledgeRegistryProvider,
  useKnowledgeRegistry,
} from "@apzhub/knowledge-discovery-framework/react";

<KnowledgeRegistryProvider dto={filteredDto}>
  <KnowledgeExperienceSurfaces />
</KnowledgeRegistryProvider>

const { sources, isReady, diagnostics, schemaVersion, frameworkVersion } =
  useKnowledgeRegistry();
```

`useKnowledgeRegistry()` returns:

- `isReady` — validation succeeded
- `sources` / `list()` / `get()` / `has()` — read-only access
- `schemaVersion` / `frameworkVersion` — from validated DTO
- `diagnostics` — client registry diagnostics
- `importErrors` — validation issues when `isReady === false`

---

## Dependency injection

| Layer            | DI entry                                                                           |
| ---------------- | ---------------------------------------------------------------------------------- |
| Non-React        | `createKnowledgeRegistryFromDto(dto)`                                              |
| React            | `KnowledgeRegistryProvider` + `useKnowledgeRegistryContext()`                      |
| Composition root | `createKnowledgeDiscoveryContext()` — server registry + ranking engine (unchanged) |

Future Knowledge Experience surfaces inject query orchestration in DF-011+ without changing the read-only registry contract.

---

## Synchronisation model

See `src/client/synchronisation.ts`. Only `mode: "hydration"` is implemented. Revision/etag delta sync is reserved for DF-015+.

---

## Out of scope (DF-010)

- Client source registration
- Client provider registration
- `KnowledgeDiscoveryOrchestrator.query()`
- Search UI and overlay
- Application wiring (`apps/web`)
- `useKnowledgeDiscovery()` query hooks (DF-011+)

---

## Test coverage

| Area                  | Test file                                           |
| --------------------- | --------------------------------------------------- |
| DTO validation        | `client/create-knowledge-registry-from-dto.test.ts` |
| Hydration             | `client/create-knowledge-registry-from-dto.test.ts` |
| Read-only registry    | `client/create-knowledge-registry-from-dto.test.ts` |
| Diagnostics           | `client/create-knowledge-registry-from-dto.test.ts` |
| React provider + hook | `react/use-knowledge-registry.test.tsx`             |
| React subpath exports | `react/index.test.ts`                               |

---

_SPR-005 Client Knowledge Registry Hydration — DF-010._
