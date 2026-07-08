# Knowledge Views Model

> **Story:** DF-005 — documentation only  
> **Status:** Canonical conceptual model  
> **Authority:** [Three-layer architecture](./knowledge-discovery-three-layer-model.md) · [Registry relationship](./knowledge-registry-relationship.md) · [DTO specification](../specs/SPR-005-KDF-knowledge-source-registry-dto.md)

---

## Purpose

Introduce the **Knowledge Views** concept — the layer between the authoritative Knowledge Registry and the user-facing Knowledge Experience.

DF-005 implements the first Knowledge View: the **server-facing Knowledge Registry DTO**. Future views (search results, recency lists, recommendations) build on this model without duplicating registry truth.

**This document is conceptual only.** No additional implementation beyond the DTO in DF-005.

---

## Three-layer progression

```text
Knowledge Registry          ← authoritative registration (DF-003, DF-004)
        ↓
Knowledge Views             ← read-only projections (DF-005+)
        ↓
Knowledge Experience        ← shell UI and interaction (DF-010+)
```

| Layer                    | Role                                                                        | Mutability                |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------- |
| **Knowledge Registry**   | Registers sources and providers; validates; diagnostics                     | Server write at bootstrap |
| **Knowledge Views**      | Serialisable, permission-filtered projections for consumers                 | Read-only                 |
| **Knowledge Experience** | Knowledge Presentation Layer + shell surfaces (overlay, palette, search, …) | Client interaction        |

---

## Knowledge Registry

The in-memory **Knowledge Registry** is the source of truth for registered Knowledge Sources:

- Populated by `bootstrapKnowledgeRegistry()` (DF-004).
- Holds full descriptor metadata including `origin`, `capabilityId`, health.
- Never serialised directly to clients.

---

## Knowledge Views

A **Knowledge View** is a read-only projection of registry data shaped for a specific consumer:

| View                     | Story  | Description                                                   |
| ------------------------ | ------ | ------------------------------------------------------------- |
| **Registry DTO**         | DF-005 | `KnowledgeSourceRegistryDto` — source catalogue for hydration |
| Search results view      | DF-006 | Ranked `KnowledgeDocument[]` from orchestrator query          |
| Recency / frequency view | DF-009 | Session-scoped usage projections                              |
| Filtered client registry | DF-010 | Client-side read model via `createKnowledgeRegistryFromDto()` |

### Registry DTO view (DF-005)

```text
Knowledge Registry
        ↓ mapKnowledgeSourceRegistryDto()
KnowledgeSourceRegistryDto (unfiltered)
        ↓ filterKnowledgeSourceRegistryDto()
KnowledgeSourceRegistryDto (permission-filtered)
        ↓ validateKnowledgeSourceRegistryDto()  [client boundary]
        ↓ createKnowledgeRegistryFromDto()
ClientKnowledgeRegistry (read-only)
        ↓ KnowledgeRegistryProvider
useKnowledgeRegistry()
```

Properties of Knowledge Views:

- **Read-only** — views do not mutate the registry.
- **Server authoritative** — produced server-side before client delivery.
- **Versioned** — `schemaVersion` + `frameworkVersion` on DTO payloads.
- **Permission-aware** — filtering applied at the view boundary.

Views **must not**:

- Execute `provider.query()`
- Persist state
- Duplicate Action, Navigation, or Capability manifest definitions

---

## Knowledge Presentation Layer and Knowledge Experiences

The **Knowledge Experience** stack presents discovery to users. All surfaces consume the **hydrated read-only Knowledge Registry** from DF-010 — they do not read the raw server registry or re-register sources.

### Canonical architecture

```text
Knowledge Sources
        │
        ▼
Knowledge Registry
        │
        ▼
Knowledge Query API
        │
        ▼
Knowledge Presentation Layer
        │
        ▼
Knowledge Experiences
```

### Knowledge Presentation Layer

The **Knowledge Presentation Layer** contains reusable presentation logic between the Query API and shell UI. It is **not** itself a UI surface.

| Concern              | Role                                        | Examples (`@apzhub/workspace`)                                 |
| -------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| Grouping             | Organise documents by source                | `groupKnowledgeDocuments()`                                    |
| Mapping              | Adapt grouped results to a surface          | `mapKnowledgeGroupsToPaletteItems()`                           |
| Selection delegation | Classify and route selection — no execution | `delegateKnowledgeOverlaySelection()`                          |
| View models          | Typed presentation structures               | `KnowledgeOverlayGroup`, overlay item types                    |
| Presentation helpers | Labels, counts, state resolution            | `buildSourceLabelLookup()`, overlay state hooks                |
| Diagnostics          | Surface observability                       | `buildKnowledgeOverlayDiagnostics()`, palette knowledge fields |

Multiple Knowledge Experiences consume this layer directly. They do **not** need to render the Knowledge Overlay modal.

### Knowledge Experiences

**Knowledge Experiences** are user-facing shell surfaces that consume the Query API and Knowledge Presentation Layer:

| Experience                       | Story  | Consumption                                                     |
| -------------------------------- | ------ | --------------------------------------------------------------- |
| Knowledge Overlay                | DF-012 | Modal UI — first experience; uses presentation layer internally |
| Command Palette (knowledge mode) | DF-013 | Palette rows; consumes presentation layer without overlay modal |
| Global Search                    | Future | Debounced query + results surface                               |
| Help                             | Future | Registry + query context                                        |
| AI Assistant                     | Future | Ranked documents as retrieval context                           |
| Recommendations                  | Future | Ranking projections                                             |
| Related Items                    | Future | Subset query results in contextual panel                        |

The **Knowledge Overlay** is one Knowledge Experience implementation. It is **not** the mandatory rendering path for all Knowledge Experiences.

**Command Palette commands mode** (`mode="commands"`, default) remains on the Action Registry path and is outside this stack.

Selection from any knowledge experience still routes through existing Action Framework `execute()` or Workbench navigation ([ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)).

### Supporting APIs (below experiences)

| API                      | Story  | Role                                              |
| ------------------------ | ------ | ------------------------------------------------- |
| `useKnowledgeRegistry()` | DF-010 | Source catalogue, diagnostics, version metadata   |
| `useKnowledgeService()`  | DF-015 | Public query boundary for Experience surfaces     |
| `useKnowledgeQuery()`    | DF-011 | Deprecated — delegates to `useKnowledgeService()` |

### Client hydration and query path

```text
KnowledgeSourceRegistryDto
        ↓ createKnowledgeRegistryFromDto()
ClientKnowledgeRegistry
        ↓ KnowledgeDiscoveryProvider
useKnowledgeRegistry() ── source labels for grouping
useKnowledgeService() ─── public query boundary (DF-015)
        ↓ internal Knowledge Query Client → Orchestrator
        ↓
Knowledge Presentation Layer
  (grouping · mapping · selection delegation · diagnostics)
        ↓
Knowledge Experiences
  Knowledge Overlay · Command Palette (knowledge mode) · future surfaces
        ↓
Action execute() · Workbench navigation
```

The Experience stack consumes **Knowledge Views** (DTO and query results) — it does not read the raw registry.

---

## Relationship to Platform 2.0

```text
Platform Manifest
        ↓
Platform Registry
        ↓
Knowledge Source (registry entry)
        ↓
Knowledge Registry
        ↓
Knowledge View (DTO, search results, …)
        ↓
Knowledge Experience (UI)
```

Platform registries remain authoritative for platform metadata. Knowledge Views project that truth for discovery — they do not replace platform registries.

---

## Story traceability

| Layer                   | Stories                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Knowledge Registry      | DF-003, DF-004                                                                                                                 |
| Knowledge Views         | DF-005 (DTO), DF-006 (search), DF-009 (ranking), DF-010 (client hydration)                                                     |
| Knowledge Experience    | DF-010 (registry) · DF-011 (query API) · DF-015 (service) · DF-012 (presentation layer + overlay) · DF-013 (palette) · DF-014+ |
| Application integration | DF-015                                                                                                                         |

---

_Knowledge Views Model — conceptual documentation for SPR-005._
