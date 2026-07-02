# ADR-0028 — Knowledge Source Model and Taxonomy

> **Status:** Accepted  
> **Date:** 2026-06-28  
> **Sprint:** SPR-005 — DF-001  
> **Decided by:** Project owner (Sprint 005 authorisation)  
> **Related:** [Document 020](../020-unified-search-knowledge-discovery-framework.md) · [ADR-0015](./ADR-0015-registry-boundaries-and-discovery-scope.md) · [ADR-0027](./ADR-0027-knowledge-discovery-framework-package.md) · [Knowledge Source Specification](../specs/SPR-005-KDF-knowledge-sources.md)

## Problem

Document 020 defines unified search across platform modules. Platform 2.0 delivers Action and Workbench registries with established Registry Pattern hydration. Sprint 005 must model **all knowledge sources** — registry projections, metadata indexes, session signals, business connectors, and semantic/AI layers — without duplicating registry storage or conflating manifest discovery (ADR-0015) with user-facing knowledge discovery.

Early backlog drafts used "Discovery Provider" terminology focused on search. The approved initiative name is **Knowledge & Discovery Framework** — requiring a formal **Knowledge Source** model and tier taxonomy.

## Decision

### Terminology

| Term                              | Meaning                                                          |
| --------------------------------- | ---------------------------------------------------------------- |
| **Knowledge Source**              | Registered contributor exposing discoverable entities            |
| **Knowledge Entity**              | Normalised discoverable item with navigation or action reference |
| **Knowledge Source Registry**     | Platform registry of source **descriptors** (not entity storage) |
| **Registry projection**           | T0 source kind — reads existing registry snapshot at query time  |
| **Manifest discovery** (ADR-0015) | Runtime bootstrap scanning YAML manifests — **unchanged**        |

"Discovery Provider" in early SPR-005 drafts is superseded by **Knowledge Source** in specifications and ADRs. Story IDs (DF-*) remain unchanged.

### Tier taxonomy

| Tier | Name               | Indexing                                    |
| ---- | ------------------ | ------------------------------------------- |
| T0   | Platform Registry  | Live projection — no persistent index       |
| T1   | Platform Metadata  | Derived platform index (deferred M8)        |
| T2   | Session Signals    | Client session store (recency, frequency)   |
| T3   | Business Knowledge | Event-driven connector index (deferred M9)  |
| T4   | Semantic / AI      | Embedding / AI interfaces (stub in SPR-005) |

SPR-005 implements **T0 registry projection** and **T2 session scaffold** only. T1, T3 indexing is documented — not implemented.

### Entity kind catalogue

Initial kinds: `command`, `navigation`, `workspace`, `capability`, `preference`, `notification`, `activity`, `document`, `project`, `person`, `custom`.

SPR-005 foundation: `command`, `navigation`, `workspace`, `capability`.

### Manifest registration

Canonical manifest block:

```yaml
knowledge:
  sources:
    - id: module.example
      label: Example Source
      kind: registry-projection
      tier: T0
      priority: 50
      permission: example.read
      provides: [custom]
```

Field path **`knowledge.sources`** is canonical. Extraction occurs at bootstrap (DF-004) — extends Manifest Engine via ADR, does not modify Runtime orchestrator pipeline.

### Distinction from ADR-0015 registry discovery

| ADR-0015 registry discovery | Knowledge Source (this ADR)      |
| --------------------------- | -------------------------------- |
| Bootstrap-time YAML scan    | Query-time user discovery        |
| Validates manifest metadata | Returns user-facing entities     |
| All manifest kinds indexed  | User-selected searchable kinds   |
| Server-only bootstrap       | Server filter + client hydration |

Knowledge Sources **consume** bootstrap output (registry snapshots). They do not replace ADR-0015 discovery scope.

### Registry integration rules

1. **No duplication** — Action Registry remains sole action storage; Workbench Registry remains sole navigation storage.
2. **Adapter pattern** — `ActionRegistryKnowledgeSource` maps actions → `KnowledgeEntity` with `actionRef`.
3. **Server authority** — `filterKnowledgeSourceRegistryDto()` before client hydration.
4. **Registration, not execution** — Knowledge Source Registry stores descriptors; orchestrator queries sources; shell routes results.

## Alternatives

| Alternative                                 | Why rejected                                      |
| ------------------------------------------- | ------------------------------------------------- |
| Single flat "search provider" list          | No tier model; cannot defer indexing decisions    |
| Duplicate Action Registry into search index | Permission drift; violates Platform 2.0           |
| Extend ADR-0015 discovery to include search | Conflates bootstrap validation with user query    |
| `discovery.providers` manifest field        | Superseded by `knowledge.sources` — broader scope |

## Consequences

- [SPR-005-KDF-knowledge-sources.md](../specs/SPR-005-KDF-knowledge-sources.md) is authoritative for entity and source types
- DF-003 implements KnowledgeSourceRegistry (not DiscoveryProviderRegistry)
- DF-004 validates `knowledge.sources` manifest block
- Architecture docs use "Knowledge & Discovery Framework" consistently
- Registry Pattern document future entry: SearchFusionRegistry → KnowledgeSourceRegistry

---

_ADR-0028 — Knowledge Source Model and Taxonomy — Accepted at DF-001._
