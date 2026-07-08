# SPR-005 — Knowledge Service

> **Story:** DF-015  
> **Package:** `@apzhub/knowledge-discovery-framework` · `apps/web`  
> **Status:** Implemented  
> **Authority:** [Knowledge Query API](./SPR-005-KDF-knowledge-query-api.md) · [Knowledge Views model](../architecture/knowledge-views-model.md)

---

## Purpose

Introduce the **Knowledge Service** as the stable public client boundary between Knowledge Experiences and query implementation.

```text
Knowledge Experiences
        ↓
Knowledge Service                 useKnowledgeService()
        ↓
Knowledge Query Client            internal — orchestrator adapter
        ↓
Knowledge Discovery Orchestrator
```

Knowledge Experiences must **not** depend on the orchestrator or `KnowledgeQueryClient` directly.

---

## Public API

| Export                                  | Role                                     |
| --------------------------------------- | ---------------------------------------- |
| `KnowledgeService`                      | Query + diagnostics interface            |
| `DefaultKnowledgeService`               | Default implementation                   |
| `createKnowledgeService()`              | Factory wrapping internal query client   |
| `createKnowledgeServiceFromHydration()` | App wiring — orchestrator behind service |
| `useKnowledgeService()`                 | React hook for Experience surfaces       |
| `KnowledgeDiscoveryProvider`            | Accepts `service` prop (preferred)       |

### Deprecated (internal boundary)

| Export                                           | Replacement             |
| ------------------------------------------------ | ----------------------- |
| `useKnowledgeQuery()`                            | `useKnowledgeService()` |
| `KnowledgeQueryClient` direct use in experiences | `KnowledgeService`      |
| `queryClient` prop on provider                   | `service` prop          |

---

## Application integration (`apps/web`)

| Module                                | Role                                      |
| ------------------------------------- | ----------------------------------------- |
| `lib/knowledge-hydration.ts`          | Server DTO hydration + health summary     |
| `lib/use-app-knowledge-service.ts`    | Client service factory from hydrated DTOs |
| `action-workbench-shell-provider.tsx` | `KnowledgeDiscoveryProvider` wiring       |
| `app/api/health/route.ts`             | Optional `knowledge` health field         |

---

## Health diagnostics

`KnowledgeService.getDiagnostics()` reports:

- `frameworkStatus` — package status constant
- `serviceStatus` — `ready` \| `unavailable`
- `registryStatus` / `registryReady` — client registry hydration
- `queryAvailable` — registry ready + orchestrator client ready
- `queryClient` — internal client kind (orchestrator \| placeholder)

Platform health (`PlatformHealthResponse.knowledge`) adds registered/filtered source counts.

---

## Out of scope (DF-015)

- Semantic / AI search
- Global header search UI (Experience wiring deferred)
- HTTP query endpoint (in-process orchestrator adapter only)
- Operational dashboards

---

_SPR-005 Knowledge Service — DF-015._
