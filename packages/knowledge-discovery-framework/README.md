# @apzhub/knowledge-discovery-framework

Platform capability package for the **Knowledge & Discovery Framework** — unified knowledge layer across APZHUB.

## Status

`KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS = "service"` (SPR-005 DF-015)

## Canonical layering

```text
Knowledge Sources
        ↓
Knowledge Registry
        ↓
Knowledge Query API
        ↓
Knowledge Service          ← public client boundary (useKnowledgeService)
        ↓
Knowledge Presentation Layer   (@apzhub/workspace)
        ↓
Knowledge Experiences
```

Knowledge Sources **consume** Runtime registries (Action, Workbench, Capability). They never replace them.

See [Knowledge & Discovery architecture](../../docs/architecture/knowledge-discovery-framework.md).

## Exports

| Subpath                                        | Purpose                                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `@apzhub/knowledge-discovery-framework`        | Domain types, registry, orchestrator, ranking, Knowledge Service                                                          |
| `@apzhub/knowledge-discovery-framework/server` | Bootstrap + DTO — `bootstrapKnowledgeRegistry()`, `mapKnowledgeSourceRegistryDto()`, `filterKnowledgeSourceRegistryDto()` |
| `@apzhub/knowledge-discovery-framework/react`  | `KnowledgeDiscoveryProvider`, `useKnowledgeRegistry()`, **`useKnowledgeService()`**                                       |

## Domain model

| Type                                   | Role                                             |
| -------------------------------------- | ------------------------------------------------ |
| `KnowledgeSource`                      | Registered source descriptor                     |
| `KnowledgeDocument`                    | Normalised discoverable item                     |
| `KnowledgeProvider`                    | Source adapter interface                         |
| `KnowledgeRegistry`                    | In-memory source/provider registry               |
| `KnowledgeDiscoveryOrchestrator`       | Multi-provider query orchestration               |
| `RankingEngine`                        | Document ordering — keyword and fuzzy strategies |
| `KnowledgeService`                     | **Public** query + diagnostics boundary          |
| `ActionRegistryKnowledgeProvider`      | Projects Action Registry DTO → documents         |
| `WorkbenchNavigationKnowledgeProvider` | Projects Workbench Registry DTO → documents      |

## Server bootstrap (DF-004)

```typescript
import { bootstrapKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

const { registry, diagnostics } = bootstrapKnowledgeRegistry({ capabilityRecords });
```

## Server DTO (DF-005)

```typescript
import {
  mapKnowledgeSourceRegistryDto,
  filterKnowledgeSourceRegistryDto,
} from "@apzhub/knowledge-discovery-framework/server";

const dto = mapKnowledgeSourceRegistryDto(registry);
const filtered = filterKnowledgeSourceRegistryDto(dto, permissionAdapter);
```

## Client hydration (DF-010)

```typescript
import {
  KnowledgeDiscoveryProvider,
  useKnowledgeRegistry,
} from "@apzhub/knowledge-discovery-framework/react";

<KnowledgeDiscoveryProvider dto={serverDto} service={knowledgeService}>
  <AppShell />
</KnowledgeDiscoveryProvider>

const { sources, isReady, diagnostics } = useKnowledgeRegistry();
```

## Knowledge Service (DF-015) — public API

```typescript
import {
  KnowledgeDiscoveryProvider,
  useKnowledgeService,
  createKnowledgeServiceFromHydration,
} from "@apzhub/knowledge-discovery-framework/react";

const service = createKnowledgeServiceFromHydration({
  knowledgeDto, actionDto, workbenchDto,
});

<KnowledgeDiscoveryProvider dto={knowledgeDto} service={service}>
  <ExperienceSurface />
</KnowledgeDiscoveryProvider>

const { status, documents, query, serviceDiagnostics } = useKnowledgeService();
await query({ text: "theme" });
```

**Deprecated:** `useKnowledgeQuery()`, direct `KnowledgeQueryClient` in experiences.

See [Knowledge Service specification](../../docs/specs/SPR-005-KDF-knowledge-service.md).

## Orchestrator (internal)

```typescript
import { createKnowledgeDiscoveryOrchestrator } from "@apzhub/knowledge-discovery-framework";

const orchestrator = createKnowledgeDiscoveryOrchestrator({
  registry,
  sourcesDto: dto,
});
```

Experiences must use `KnowledgeService` — not the orchestrator directly.

## Out of scope (current milestone)

- Semantic / vector search (ranking scaffolds only)
- Global header search UI (Experience deferred)
- HTTP query endpoint (in-process adapter only)
- Business capability knowledge providers (M9+)
- Operational dashboards

## Authority

- [Knowledge & Discovery architecture](../../docs/architecture/knowledge-discovery-framework.md)
- [Developer onboarding](../../docs/developer/knowledge-discovery-onboarding.md)
- [SPR-005 spec index](../../docs/specs/SPR-005-spec-index.md)
- [ADR-0027](../../docs/adr/ADR-0027-knowledge-discovery-framework-package.md)
- [ADR-0028](../../docs/adr/ADR-0028-knowledge-source-model.md)
- [ADR-0029](../../docs/adr/ADR-0029-knowledge-discovery-execution-routing.md)
