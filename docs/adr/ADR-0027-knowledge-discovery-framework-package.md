# ADR-0027 — Knowledge & Discovery Framework Package

> **Status:** Accepted  
> **Date:** 2026-06-28  
> **Sprint:** SPR-005 — DF-001  
> **Decided by:** Project owner (Sprint 005 authorisation)  
> **Related:** [Document 020](../020-unified-search-knowledge-discovery-framework.md) · [ADR-0024](./ADR-0024-command-framework-package.md) · [ADR-0019](./ADR-0019-workbench-framework-package.md) · [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md)

## Problem

Sprint 005 delivers the **Knowledge & Discovery Framework** — a unified knowledge layer extending APZHUB beyond keyword search. Document 020 defines Unified Search, Knowledge & Discovery as a platform capability spanning registry projection, metadata indexing, session signals, semantic search, and AI-assisted discovery.

Two packaging options exist:

1. **Option A** — Rename and repurpose the existing empty `@apzhub/search` shell to `@apzhub/knowledge-discovery-framework`.
2. **Option B** — Create a new `@apzhub/knowledge-discovery-framework` package alongside `@apzhub/search`.
3. **Option C** — Implement within `@apzhub/command-framework` (palette search overlap).

Option C blurs Action Framework (execution) with Knowledge & Discovery (query/orchestration). Option B leaves two packages where one shell is empty. Option A aligns npm identity with Document 020 scope.

## Decision

**Option A — Repurpose `@apzhub/search` as `@apzhub/knowledge-discovery-framework`.**

| Item           | Value                                                                                   |
| -------------- | --------------------------------------------------------------------------------------- |
| Package path   | `packages/search/` → renamed to `packages/knowledge-discovery-framework/` in **DF-002** |
| npm name       | `@apzhub/knowledge-discovery-framework`                                                 |
| Primary export | `@apzhub/knowledge-discovery-framework`                                                 |
| Server export  | `@apzhub/knowledge-discovery-framework/server`                                          |
| React export   | `@apzhub/knowledge-discovery-framework/react` (DF-010)                                  |

The `@apzhub/search` name is **retired**. No re-export alias is required — the package has no consumers (empty shell only).

### Package responsibilities

`@apzhub/knowledge-discovery-framework` owns:

- **KnowledgeSourceRegistry** — source descriptor index; register, list, get, diagnostics
- **KnowledgeDiscoveryOrchestrator** — query dispatch, merge, deduplication, ranking hooks
- **Registry-projection adapters** — Action, Workbench, Capability registry readers
- **KnowledgeEntity** types — normalised discoverable item envelope
- **Server filter** — `filterKnowledgeSourceRegistryDto()` mirroring command-framework pattern
- **Client hydration** — `createKnowledgeDiscoveryFromDto()`, React hooks (DF-010)
- **Extension interfaces** — SemanticKnowledgeSource, AiKnowledgeSource (stubs)
- **Session ranking scaffold** — recency/frequency hooks (DF-009)

### Package does **not** own

- Action Registry or CommandExecutor (`@apzhub/command-framework`)
- Workbench Manager or engines (`@apzhub/workbench-framework`)
- Platform Runtime orchestration (`@apzhub/platform-runtime`)
- Header search, overlay, palette **UI** (`@apzhub/workspace`, `@apzhub/ui`)
- PostgreSQL index workers or Event Bus consumers (deferred M8/M9)
- Business entity storage or connector APIs (M9+)
- AI model hosting (future — interface only)

### Dependency direction

```text
apps/web
    ↓
@apzhub/workspace · @apzhub/ui              (presentation — search input, overlay)
    ↓
@apzhub/knowledge-discovery-framework/react (hooks)
    ↓
@apzhub/knowledge-discovery-framework       (orchestrator, registry, adapters)
    ↓
@apzhub/command-framework                   (Action Registry snapshot read)
@apzhub/workbench-framework                 (navigation registry read)
@apzhub/platform-runtime/server             (capability registry read — extraction input)
@apzhub/types                               (shared DTO types where applicable)

react (react export only)
```

**Rules:**

1. `@apzhub/knowledge-discovery-framework` **must not** import Workbench Manager, CommandExecutor, or Runtime orchestrator internals.
2. Registry-projection adapters read **snapshots** — they do not mutate source registries.
3. UI packages **must not** depend on server subpath in client bundles.

### Status constant

Export `KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS = "scaffold"` from DF-002 — mirror command-framework pattern.

## Alternatives

| Alternative                        | Why rejected                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| Keep `@apzhub/search` name         | Understates Document 020 scope (knowledge layer, not search-only)             |
| New package alongside search shell | Two packages; empty shell adds confusion                                      |
| Extend command-framework           | Mixes execution policy with knowledge query; violates Platform 2.0 boundaries |
| Extend workbench-framework         | Same boundary violation as command-framework extension                        |

## Consequences

- DF-002 renames `packages/search/` directory and updates workspace references
- `pnpm-workspace.yaml` glob continues to match `packages/*`
- `apps/web/next.config.ts` `transpilePackages` updated in DF-015
- Document 020 "Platform Search Service" maps to `KnowledgeDiscoveryOrchestrator` — terminology aligned in architecture docs
- Future semantic/AI engines plug in via source interfaces without package split

---

_ADR-0027 — Knowledge & Discovery Framework Package — Accepted at DF-001._
