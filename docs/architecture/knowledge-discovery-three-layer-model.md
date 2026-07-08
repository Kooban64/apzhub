# Knowledge & Discovery — Three-Layer Architecture

> **Story:** DF-002  
> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Status:** Historical conceptual model — see [Knowledge Views model](./knowledge-views-model.md) and [Knowledge & Discovery Framework](./knowledge-discovery-framework.md) for canonical layering (DF-017).
> **Authority:** [Document 020](../020-unified-search-knowledge-discovery-framework.md) · [ADR-0027](../adr/ADR-0027-knowledge-discovery-framework-package.md) · [Knowledge Source Spec](../specs/SPR-005-KDF-knowledge-sources.md)

---

## Overview

The Knowledge & Discovery Framework is organised as three layers. Each layer has a distinct responsibility. Layers compose vertically — they do not introduce parallel execution pipelines.

```text
┌─────────────────────────────────────────────────────────────┐
│  Knowledge Experience                                       │
│  Presentation layer · overlay · palette · search · ranking UI │
│  Package: @apzhub/workspace · @apzhub/ui                    │
│  Stories: DF-010 – DF-013 · DF-015                          │
└───────────────────────────────┬─────────────────────────────┘
                                │ query · render · route selection
┌───────────────────────────────▼─────────────────────────────┐
│  Knowledge Index                                            │
│  Derived metadata · event-driven reindex · session signals  │
│  Engines: PostgreSQL FTS · event workers (future)           │
│  Stories: T1/T2/T3 — deferred M8/M9; session scaffold DF-009│
└───────────────────────────────┬─────────────────────────────┘
                                │ indexed lookup · ranking boost
┌───────────────────────────────▼─────────────────────────────┐
│  Knowledge Sources                                          │
│  Registry-projection adapters · provider registration        │
│  Package: @apzhub/knowledge-discovery-framework             │
│  Stories: DF-002 – DF-009                                   │
└───────────────────────────────┬─────────────────────────────┘
                                │ consume snapshots
┌───────────────────────────────▼─────────────────────────────┐
│  Platform Runtime Registries (Platform 2.0 — authoritative) │
│  Action · Workbench · Capability                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1 — Knowledge Sources (DF-002+)

**Responsibility:** Register knowledge sources and providers; project discoverable documents from authoritative Runtime registries.

| Property         | Value                                            |
| ---------------- | ------------------------------------------------ |
| Package          | `@apzhub/knowledge-discovery-framework`          |
| Active in DF-002 | Types, registry, provider interface, DI scaffold |
| Constraint       | Consume registries — never duplicate or replace  |

### Source tiers (from DF-001)

| Tier | Scope                        | DF-002                        |
| ---- | ---------------------------- | ----------------------------- |
| T0   | Platform registry projection | Interface + registry scaffold |
| T1   | Platform metadata index      | Documented only               |
| T2   | Session signals              | Documented only               |
| T3   | Business knowledge           | Documented only               |
| T4   | Semantic / AI                | Documented only               |

Code constants: `KNOWLEDGE_ARCHITECTURE_LAYERS.sources`, `KNOWLEDGE_ACTIVE_LAYER`.

---

## Layer 2 — Knowledge Index (future)

**Responsibility:** Derived, permission-aware indexes for metadata and business entities; asynchronous updates via platform events.

| Property       | Value                                          |
| -------------- | ---------------------------------------------- |
| Implementation | Not present in DF-002                          |
| Initial engine | PostgreSQL FTS (Document 011)                  |
| Constraint     | Index is derived data — never System of Record |

DF-002 establishes no index workers, no persistence, no vector storage.

Code constant: `KNOWLEDGE_ARCHITECTURE_LAYERS.index` (identifier only).

---

## Layer 3 — Knowledge Experience (future)

**Responsibility:** Shell surfaces that present unified knowledge results and route selections through existing Action Framework and Workbench navigation. Experiences consume the **Knowledge Presentation Layer** (grouping, mapping, delegation) — the overlay modal is one experience, not the only path.

| Property       | Value                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| UI packages    | `@apzhub/workspace`, `@apzhub/ui`                                                                                  |
| Execution      | Existing `execute()` and Workbench API only ([ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)) |
| Implementation | Not present in DF-002                                                                                              |

Code constant: `KNOWLEDGE_ARCHITECTURE_LAYERS.experience` (identifier only).

---

## Data flow (target state)

```text
Knowledge Sources
        ↓
Knowledge Registry
        ↓
Knowledge Query API (orchestrator)
        ↓
Knowledge Presentation Layer
  grouping · mapping · selection delegation · view models · diagnostics
        ↓
Knowledge Experiences
  Overlay (DF-012) · Command Palette knowledge mode (DF-013) · Search · Help · …
        ↓
KnowledgeDocument[] → route via actionRef / navigation
```

User input enters a Knowledge Experience; the experience consumes Query API results through the **Knowledge Presentation Layer**. Selection routes through existing Action Framework and Workbench navigation ([ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)).

DF-002 implements the **Sources layer foundation** only — registry, types, provider interface, DI.

---

## Anti-patterns

| Anti-pattern                          | Why rejected                     |
| ------------------------------------- | -------------------------------- |
| Index replaces Action Registry        | Permission drift                 |
| Experience executes handlers directly | Bypasses CommandExecutor         |
| Sources layer stores business records | Violates Platform 2.0 boundaries |
| Vector DB in DF-002                   | Out of scope                     |

---

_Knowledge & Discovery Three-Layer Architecture — DF-002._
