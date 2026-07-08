# SPR-005 — Knowledge Overlay

> **Story:** DF-012  
> **Status:** Implemented  
> **Authority:** [Knowledge Query API](./SPR-005-KDF-knowledge-query-api.md) · [Knowledge Views model](../architecture/knowledge-views-model.md) · [ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)

---

## Purpose

Define the **Knowledge Overlay** — the first **Knowledge Experience** surface: a modal UI that consumes `useKnowledgeService()` and presents ranked `KnowledgeDocument` results grouped by knowledge source.

The overlay is **not** the Knowledge Presentation Layer itself. It is one consumer of that layer alongside Command Palette knowledge mode and future experiences (Global Search, Help, AI Assistant, Recommendations, Related Items).

DF-012 implements **presentation and selection delegation only**. No provider querying, registry mutation, action execution, or navigation occurs inside the overlay component.

---

## Architecture

```text
Knowledge Sources
        ↓
Knowledge Registry
        ↓
Knowledge Query API                    useKnowledgeService()
        ↓
Knowledge Presentation Layer           grouping · delegation · view models
        ↓
Knowledge Overlay (Knowledge Experience) modal UI
        ↓ onSelectDocument
Action execute() · Workbench navigation     ← existing paths
```

Within the overlay implementation:

```text
KnowledgeDiscoveryProvider
        ↓
useKnowledgeService() ──→ ranked KnowledgeDocument[]
        ↓
Knowledge Presentation Layer
  groupKnowledgeDocuments()
        ↓
KnowledgeOverlay (modal presentation)
        ↓ onSelectDocument
  delegateKnowledgeOverlaySelection()
        ↓
Action execute() · Workbench navigation
```

---

## Knowledge Presentation Layer (shared)

These exports live in `@apzhub/workspace` and are reused by multiple Knowledge Experiences — not only the overlay modal:

| Export                                | Role                                     |
| ------------------------------------- | ---------------------------------------- |
| `groupKnowledgeDocuments()`           | Group by `sourceId` with registry labels |
| `delegateKnowledgeOverlaySelection()` | Classify and delegate — no execution     |
| `buildSourceLabelLookup()`            | Registry label helper for grouping       |
| `KnowledgeOverlayGroup` / item types  | View models for grouped results          |
| `buildKnowledgeOverlayDiagnostics()`  | Presentation-layer diagnostics           |

Command Palette knowledge mode (DF-013) consumes the same presentation layer without rendering `KnowledgeOverlay`.

---

## Overlay components (Knowledge Experience)

| Component                    | Package             | Role                                                      |
| ---------------------------- | ------------------- | --------------------------------------------------------- |
| `KnowledgeOverlay`           | `@apzhub/workspace` | Presentational modal — groups, states, selection callback |
| `WorkbenchKnowledgeOverlay`  | `@apzhub/workspace` | Wires query hook, registry labels, selection DI           |
| `useKnowledgeOverlayState()` | `@apzhub/workspace` | Open/close overlay state                                  |

---

## Grouping

Results are grouped by **Knowledge Source** (`document.sourceId`):

| Source id               | Default heading                          |
| ----------------------- | ---------------------------------------- |
| `platform.actions`      | Actions                                  |
| `platform.navigation`   | Navigation                               |
| `platform.capabilities` | Capabilities                             |
| Custom / manifest       | Registry `source.label` or document kind |

Each row displays:

- Group heading
- Icon (single-char glyph or title initial)
- Title
- Description (when present)
- Provider label

---

## Overlay states

| State   | Trigger                                                                     |
| ------- | --------------------------------------------------------------------------- |
| Loading | Registry not ready, `queryStatus === "loading"`, or pending debounced query |
| Empty   | No documents after successful/idle query                                    |
| Error   | `queryStatus === "error"`                                                   |
| Results | Grouped document list                                                       |

---

## Selection delegation

The overlay calls `onSelectDocument(document)` only. Execution is delegated via the Knowledge Presentation Layer:

| Document field       | Delegate                                                  |
| -------------------- | --------------------------------------------------------- |
| `actionRef.actionId` | `onSelectAction` → Action Framework `execute()`           |
| `navigation`         | `onSelectNavigation` → Workbench `activateViewForRoute()` |

`WorkbenchKnowledgeOverlay` provides default handlers via DI. Tests and alternate experiences may inject custom `selectionHandlers`.

---

## Diagnostics

`KnowledgeOverlaySurfaceDiagnostics` reports:

- `surface: "knowledge-overlay"`
- `open`, `queryText`, `queryStatus`
- `groupCount`, `visibleDocumentCount`
- `registryReady`
- `queryDiagnostics` (from `useKnowledgeService()`)
- `lastSelectedDocumentId`

---

## Other Knowledge Experiences

The Knowledge Presentation Layer is shared across experiences. The overlay modal is one implementation — not a mandatory gate:

| Experience                       | Integration                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| Command Palette (knowledge mode) | `groupKnowledgeDocuments()` + `delegateKnowledgeOverlaySelection()` via palette mapping (DF-013) |
| Global Search                    | Debounced query + results surface (future)                                                       |
| Help                             | Static or contextual query (future)                                                              |
| AI Assistant                     | Render ranked documents from assistant retrieval (future)                                        |
| Recommendations                  | Display recommendation documents grouped by source (future)                                      |
| Related Items                    | Subset query results in contextual panel (future)                                                |

Experiences consume the **Knowledge Presentation Layer** directly. They do not reimplement grouping, mapping, or selection delegation.

---

## Rules

| Rule                            | Enforcement                                                             |
| ------------------------------- | ----------------------------------------------------------------------- |
| Knowledge Experience            | Consumes `useKnowledgeService()` + presentation layer                   |
| No provider query               | Workbench surface calls hook, not orchestrator directly                 |
| No registry mutation            | Read-only registry via context                                          |
| No execution in overlay         | `KnowledgeOverlay` has no `execute()` or `navigate()`                   |
| Overlay is not the only path    | Other experiences may skip the modal and use presentation layer exports |
| Presentation-agnostic query API | Query input lives in overlay modal for DF-012; global header deferred   |

---

## Out of scope (DF-012)

- Global header search integration
- Keyboard shortcut activation
- AI response rendering
- Application wiring (`apps/web`)
- Command palette integration (DF-013)

---

_SPR-005 Knowledge Overlay — DF-012._
