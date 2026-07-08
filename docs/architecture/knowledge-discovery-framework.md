# Knowledge & Discovery Framework

> **Package:** `@apzhub/knowledge-discovery-framework`  
> **Milestone:** 5 — Knowledge & Discovery Framework (`v0.5.0-knowledge-discovery-framework` — proposed)  
> **Authority:** [Document 020](../020-unified-search-knowledge-discovery-framework.md) · [ADR-0027](../adr/ADR-0027-knowledge-discovery-framework-package.md) · [ADR-0028](../adr/ADR-0028-knowledge-source-model.md) · [ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)  
> **Status:** Active — implemented and integrated in `apps/web` (DF-015, DF-016)

---

## Purpose

The Knowledge & Discovery Framework is the **unified knowledge layer** for APZHUB. It registers Knowledge Sources, projects platform registries into normalised `KnowledgeDocument` items, orchestrates multi-provider queries, ranks results, and exposes a stable **Knowledge Service** API for Knowledge Experiences.

Discovery **does not execute business behaviour**. Selection from Knowledge Experiences routes through the existing Action Framework (`execute()`) and Workbench navigation paths ([ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)).

---

## Canonical layering

```text
Knowledge Sources
        ↓
Knowledge Registry
        ↓
Knowledge Query API
        ↓
Knowledge Presentation Layer
        ↓
Knowledge Experiences
```

| Layer                            | Package / location                                  | Role                                                   |
| -------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| **Knowledge Sources**            | Manifests + T0 catalogue                            | Declarative origin of discoverable content             |
| **Knowledge Registry**           | `@apzhub/knowledge-discovery-framework`             | Authoritative in-memory source + provider index        |
| **Knowledge Query API**          | Orchestrator + internal `KnowledgeQueryClient`      | Multi-provider query, merge, dedupe, rank              |
| **Knowledge Service**            | `createKnowledgeService()`, `useKnowledgeService()` | **Public client boundary** (DF-015)                    |
| **Knowledge Presentation Layer** | `@apzhub/workspace`                                 | Grouping, mapping, selection delegation — not UI       |
| **Knowledge Experiences**        | `@apzhub/workspace` + future surfaces               | Overlay, palette knowledge mode, future search/help/AI |

Deep dive: [Knowledge Views model](./knowledge-views-model.md).

---

## Architectural position

```text
Platform Manifest
        │ knowledge.sources (optional)
        ▼
Platform Runtime ──► Capability Registry
        │
        ├── Action Registry DTO ──────► ActionRegistryKnowledgeProvider
        ├── Workbench Registry DTO ───► WorkbenchNavigationKnowledgeProvider
        └── Manifest knowledge sources ► ManifestKnowledgeProvider (scaffold)
        │
        ▼
bootstrapKnowledgeRegistry()
        ↓
Knowledge Registry + registered providers
        ↓
mapKnowledgeSourceRegistryDto() + filterKnowledgeSourceRegistryDto()
        ↓
KnowledgeSourceRegistryDto → RSC props
        ↓
KnowledgeDiscoveryProvider [client]
        │
        ├── useKnowledgeRegistry() ── source catalogue
        └── useKnowledgeService() ── public query boundary
                    │
                    ▼ (internal)
            Knowledge Query Client → Orchestrator
                    │
                    ▼
        Knowledge Presentation Layer (workspace)
                    │
                    ▼
        Knowledge Experiences
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
Action execute()        Workbench navigation
```

**Rules:**

- Knowledge Experiences must **not** depend on the orchestrator or `KnowledgeQueryClient` directly.
- Providers **project** registry DTOs — they do not duplicate Action or Navigation definitions.
- No new execution pipeline for knowledge selection.

---

## Component relationships

| Component                        | Depends on                          | Consumed by                      |
| -------------------------------- | ----------------------------------- | -------------------------------- |
| `KnowledgeRegistry`              | Source validation, bootstrap        | Orchestrator, server DTO mapping |
| `KnowledgeProvider`              | Registry source id                  | Orchestrator query dispatch      |
| `KnowledgeDiscoveryOrchestrator` | Registry, providers, ranking engine | Internal query client            |
| `RankingEngine`                  | Ranking strategies                  | Orchestrator post-merge          |
| `KnowledgeService`               | Internal query client               | React hook, app hydration        |
| `ClientKnowledgeRegistry`        | Server DTO                          | `useKnowledgeRegistry()`         |
| Presentation layer helpers       | Query results, registry labels      | Overlay, palette knowledge mode  |

---

## Execution flow

### Server bootstrap (authenticated shell)

```text
Runtime.bootstrap()
        ↓
bootstrapKnowledgeRegistry({ capabilityRecords })
        ↓
registerActionRegistryKnowledgeProvider(registry, actionDto)
registerWorkbenchNavigationKnowledgeProvider(registry, workbenchDto)
        ↓
mapKnowledgeSourceRegistryDto(registry)
        ↓
filterKnowledgeSourceRegistryDto(dto, permissionAdapter)
        ↓
KnowledgeSourceRegistryDto → ActionWorkbenchShellProvider
```

Implementation: `apps/web/lib/knowledge-hydration.ts`.

### Client query (Experience surface)

```text
useKnowledgeService().query({ text })
        ↓
executeKnowledgeQuery({ service, registryReady, … })
        ↓
KnowledgeService.query() → KnowledgeQueryClient.query()
        ↓
KnowledgeDiscoveryOrchestrator.query()
        ↓
For each active source (by priority):
  provider.query(input) → KnowledgeResult
        ↓
Merge documents → dedupe → RankingEngine.rank()
        ↓
KnowledgeDocument[] → Experience / Presentation Layer
```

### Selection (Experience → execution)

```text
User selects KnowledgeDocument
        ↓
delegateKnowledgeOverlaySelection(document, handlers)
        ↓
resolveKnowledgeOverlaySelection(document)
        │
        ├── command → handlers.onSelectAction(actionId)
        │                  ↓
        │           useCommandRegistry().execute(actionId)
        │
        └── navigation → handlers.onSelectNavigation(target)
                              ↓
                       activateViewForRoute(target.target)
```

---

## Public APIs

| Export                                                                              | Subpath                                        | Role                    |
| ----------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Domain types, registry, orchestrator, ranking                                       | `@apzhub/knowledge-discovery-framework`        | Server + DI composition |
| Bootstrap, DTO map/filter                                                           | `@apzhub/knowledge-discovery-framework/server` | Server hydration        |
| `KnowledgeDiscoveryProvider`, `useKnowledgeRegistry()`, **`useKnowledgeService()`** | `@apzhub/knowledge-discovery-framework/react`  | Client boundary         |

### Deprecated (internal)

| Export                                       | Replacement             |
| -------------------------------------------- | ----------------------- |
| `useKnowledgeQuery()`                        | `useKnowledgeService()` |
| Direct `KnowledgeQueryClient` in experiences | `KnowledgeService`      |
| `queryClient` prop on provider               | `service` prop          |

Status constant: `KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS = "service"`.

See [Knowledge Service specification](../specs/SPR-005-KDF-knowledge-service.md).

---

## Registry model

The **Knowledge Registry** is the authoritative in-memory index of Knowledge Sources and their providers.

```text
Knowledge Source (descriptor)
        │ 1:1 or 1:0
        ▼
Knowledge Provider (adapter)
```

| Concern            | Implementation                                                    |
| ------------------ | ----------------------------------------------------------------- |
| Registration       | `registerSource()`, batch registration at bootstrap               |
| Validation         | `validateKnowledgeSource()` — tier, kind, provides                |
| Metadata           | `getMetadata()`, `getDiagnostics()`                               |
| Platform catalogue | T0 builtin sources (`platform.actions`, `platform.navigation`, …) |
| Manifest sources   | `knowledge.sources` block extraction (DF-004)                     |
| Client projection  | `KnowledgeSourceRegistryDto` — never raw registry to client       |

Deep dive: [Registry relationship](./knowledge-registry-relationship.md) · [DTO spec](../specs/SPR-005-KDF-knowledge-source-registry-dto.md).

---

## Provider model

A **Knowledge Provider** adapts a registered source to the orchestrator query contract:

```typescript
interface KnowledgeProvider {
  query(input: KnowledgeQueryInput): Promise<KnowledgeResult>;
}
```

| Provider                               | Source id             | Projects                                      |
| -------------------------------------- | --------------------- | --------------------------------------------- |
| `ActionRegistryKnowledgeProvider`      | `platform.actions`    | Action Registry DTO → command documents       |
| `WorkbenchNavigationKnowledgeProvider` | `platform.navigation` | Workbench Registry DTO → navigation documents |
| Scaffold providers                     | Future tiers          | Stub / not-implemented responses              |

Providers return **references** (`actionRef`, `navigation`) — not executable handlers. Execution remains in Action Framework and Workbench.

See [Knowledge sources spec](../specs/SPR-005-KDF-knowledge-sources.md).

---

## Ranking model

Post-merge document ordering uses the **Ranking Engine** with pluggable strategies:

| Strategy                         | Status      | Role                        |
| -------------------------------- | ----------- | --------------------------- |
| `KeywordRankingStrategy`         | Implemented | Default lexical match       |
| `FuzzyRankingStrategy`           | Implemented | Fuzzy title/keyword scoring |
| `SemanticRankingStrategy`        | Scaffold    | Future vector/semantic      |
| `RecencyRankingStrategy`         | Scaffold    | Session recency             |
| `FrequencyRankingStrategy`       | Scaffold    | Usage frequency             |
| `PersonalisationRankingStrategy` | Scaffold    | User preferences            |
| `AIRerankingStrategy`            | Scaffold    | LLM reranking               |

`DefaultRankingEngine` composes registered strategies. Planned scaffolds register via `RankingStrategyRegistry` without changing default behaviour.

Deep dive: [Retrieval & ranking model](./knowledge-retrieval-ranking-model.md) · [Ranking engine spec](../specs/SPR-005-KDF-ranking-engine.md).

---

## Knowledge Service

The **Knowledge Service** is the stable public client boundary (DF-015):

```typescript
interface KnowledgeService {
  query(input: KnowledgeQueryInput): Promise<KnowledgeQueryClientResult>;
  getDiagnostics(): KnowledgeServiceDiagnostics;
}
```

| Factory                                 | Use                                      |
| --------------------------------------- | ---------------------------------------- |
| `createKnowledgeService()`              | Wrap internal query client               |
| `createKnowledgeServiceFromHydration()` | App wiring — orchestrator behind service |

React: `useKnowledgeService()` — lifecycle state, documents, diagnostics, `serviceDiagnostics`.

Health: `buildKnowledgeServiceHealthSummary()` → `/api/health` `knowledge` field.

---

## Knowledge Presentation Layer

Reusable presentation logic in `@apzhub/workspace` — **not** a UI surface:

| Helper                                | Role                           |
| ------------------------------------- | ------------------------------ |
| `groupKnowledgeDocuments()`           | Group by source with labels    |
| `mapKnowledgeGroupsToPaletteItems()`  | Palette row mapping            |
| `delegateKnowledgeOverlaySelection()` | Route selection — no execution |
| `buildKnowledgeOverlayDiagnostics()`  | Overlay observability          |
| `useCommandPaletteKnowledgeQuery()`   | Palette knowledge mode hook    |

Multiple Knowledge Experiences share this layer without rendering the Knowledge Overlay modal.

---

## Knowledge Experiences

| Experience                       | Story    | Entry                                                     |
| -------------------------------- | -------- | --------------------------------------------------------- |
| Knowledge Overlay                | DF-012   | `KnowledgeOverlayExperience`, `WorkbenchKnowledgeOverlay` |
| Command Palette (knowledge mode) | DF-013   | `WorkbenchCommandPalette mode="knowledge"`                |
| Global header search             | Deferred | Future                                                    |
| Help / AI / Recommendations      | Deferred | Future                                                    |

**Command Palette commands mode** (default) remains on the Action Registry path — outside the Knowledge Experience stack.

Default selection handlers: `useWorkbenchKnowledgeSelectionHandlers()` wires Action `execute()` and Workbench `activateViewForRoute()`.

---

## Application integration

```text
(platform)/layout [RSC]
  loadKnowledgeSourceRegistryDto() + parallel command/workbench DTOs

ActionWorkbenchShellProvider [client]
  KnowledgeDiscoveryProvider(dto, service=useAppKnowledgeService(...))
  KnowledgeDiscoveryDiagnostics [dev/test only]
  DesktopShell(enableCommandPalette, commandPaletteMode)
```

E2E verification: `?paletteMode=knowledge` enables palette knowledge mode for tests only.

Implementation references:

- `apps/web/lib/knowledge-hydration.ts`
- `apps/web/lib/use-app-knowledge-service.ts`
- `testing/playwright/e2e/spr-005-knowledge-discovery-framework.spec.ts`

---

## Package structure

```text
packages/knowledge-discovery-framework/src/
├── registry/           KnowledgeRegistry, validation, metadata
├── extraction/         Manifest → sources
├── catalogue/          T0 platform source catalogue
├── provider/           Action, Workbench, scaffold providers
├── orchestrator/       Multi-provider query, merge, diagnostics
├── ranking/            Engine, strategies, strategy registry
├── client/             DTO hydration, query client, Knowledge Service
├── react/              KnowledgeDiscoveryProvider, hooks
├── server/             Bootstrap, DTO map/filter, hydration diagnostics
└── types/              KnowledgeSource, KnowledgeDocument, …
```

---

## Story traceability (SPR-005)

| Story         | Deliverable                                           |
| ------------- | ----------------------------------------------------- |
| DF-001–DF-005 | Sources, registry, metadata, manifest, DTO            |
| DF-006–DF-009 | Orchestrator, providers, ranking engine               |
| DF-010        | Client hydration + `useKnowledgeRegistry()`           |
| DF-011        | Query API + internal client                           |
| DF-012–DF-013 | Presentation layer + overlay + palette knowledge mode |
| DF-014        | Ranking strategy scaffolds                            |
| DF-015        | Knowledge Service + `apps/web` wiring                 |
| DF-016        | E2E verification                                      |
| DF-017        | Documentation (this document)                         |

Spec index: [SPR-005-spec-index.md](../specs/SPR-005-spec-index.md).

---

## Related documents

| Document                                                                                                   | Topic                               |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [knowledge-views-model.md](./knowledge-views-model.md)                                                     | Registry → Views → Experience model |
| [knowledge-discovery-domain-model.md](./knowledge-discovery-domain-model.md)                               | Domain types                        |
| [knowledge-registry-relationship.md](./knowledge-registry-relationship.md)                                 | Manifest → registry chain           |
| [knowledge-retrieval-ranking-model.md](./knowledge-retrieval-ranking-model.md)                             | Retrieval and ranking               |
| [Knowledge discovery onboarding](../developer/knowledge-discovery-onboarding.md)                           | Developer guide                     |
| [SPR-005 architecture review](../reviews/SPR-005-architecture-review.md)                                   | Formal review                       |
| [MILESTONE-005 production readiness](../reviews/MILESTONE-005-knowledge-discovery-production-readiness.md) | Readiness review                    |

---

_Knowledge & Discovery Framework — subsystem architecture for Milestone 5._
