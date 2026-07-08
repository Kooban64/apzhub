# SPR-005 — Command Palette Knowledge Mode

> **Story:** DF-013  
> **Status:** Complete

## Purpose

Integrate Knowledge Discovery with the Command Palette so users can search ranked knowledge documents without maintaining a duplicate action list in the palette UI.

Knowledge mode is a **Knowledge Experience** that consumes the **Knowledge Presentation Layer** directly — it does not render the Knowledge Overlay modal.

## Modes

| Mode                 | Data source                                            | Selection                                                   |
| -------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| `commands` (default) | `useCommandRegistry()` + `searchActionDescriptors()`   | `execute(actionId)` via Action Framework                    |
| `knowledge`          | `useKnowledgeService()` + Knowledge Presentation Layer | `delegateKnowledgeOverlaySelection()` via injected handlers |

## Architectural rules

- Do **not** duplicate Action Registry lists in knowledge mode — `searchActionDescriptors()` is skipped.
- Do **not** create a second command registry.
- Do **not** call `execute()` or Workbench navigation directly inside palette knowledge selection — inject `knowledgeSelectionHandlers`.
- Reuse the **Knowledge Presentation Layer** from DF-012 (`groupKnowledgeDocuments()`, `delegateKnowledgeOverlaySelection()`, presentation mapping).

## Components

| Export                                         | Role                                                        |
| ---------------------------------------------- | ----------------------------------------------------------- |
| `WorkbenchCommandPalette` (`mode="knowledge"`) | Knowledge Experience surface                                |
| `useCommandPaletteKnowledgeQuery()`            | Wraps `useKnowledgeService()` + presentation-layer grouping |
| `mapKnowledgeGroupsToPaletteItems()`           | Maps presentation-layer groups → palette rows               |
| `buildCommandPaletteDiagnostics()`             | Adds `mode`, knowledge query fields                         |

## Out of scope (DF-013)

- AI answers, semantic search, recommendations
- Pinned/recent items in knowledge mode
- Header integration
- New execution pipeline

## Related

- [Knowledge Views model](../architecture/knowledge-views-model.md) — Knowledge Presentation Layer and Knowledge Experiences
- [Knowledge Overlay](./SPR-005-KDF-knowledge-overlay.md) — sibling Knowledge Experience (modal)
- [Knowledge Query API](./SPR-005-KDF-knowledge-query-api.md)
- [ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)

_SPR-005 Command Palette Knowledge Mode — DF-013._
