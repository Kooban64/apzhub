# KnowledgeDocument → KnowledgeResource Evolution Note

> **Story:** DF-003 — documentation only  
> **Status:** Future evolution guidance — **no code rename in SPR-005**  
> **Authority:** [Domain Model](./knowledge-discovery-domain-model.md) · [Document 020](../020-unified-search-knowledge-discovery-framework.md)

---

## Context

SPR-005 introduces **`KnowledgeDocument`** as the normalised discoverable item projected from Knowledge Sources. This type maps to the DF-001 **Knowledge Entity** concept — optimised for search and discovery results in the Desktop Shell.

As the Knowledge & Discovery Framework matures, the platform will expose knowledge beyond searchable documents:

- Business entities (projects, tickets, people)
- Structural resources (workspaces, panels, routes)
- Relational graph nodes (Document 020 §20)
- Session and preference artefacts

These items share discovery metadata but are not always "documents" in the user-facing sense.

---

## Proposed evolution

**`KnowledgeResource`** is the proposed generic abstraction for any discoverable or referenceable knowledge item.

| Aspect      | `KnowledgeDocument` (current) | `KnowledgeResource` (future)       |
| ----------- | ----------------------------- | ---------------------------------- |
| Scope       | Search/discovery result items | Any knowledge layer item           |
| Identity    | `documentId`                  | `resourceId`                       |
| Kind        | `KnowledgeDocumentKind`       | `KnowledgeResourceKind` (superset) |
| Relations   | Not modelled                  | Optional relationship edges        |
| Index layer | Projected at query time (T0)  | Indexed metadata (T1/T3)           |

---

## Compatibility strategy

1. **No rename in DF-003** — `KnowledgeDocument` remains the implemented type.
2. **Future alias** — `type KnowledgeDocument = KnowledgeResource` when resource model stabilises.
3. **Orchestrator merge** — DF-006+ may accept both shapes internally before public rename.
4. **Index layer** — T1/T3 indexes store resource records; T0 registry projection continues to emit documents.
5. **Experience layer** — Shell UI may rename "results" to "resources" without package breaking change if ids remain stable.

---

## Migration criteria (future milestone)

Rename or generalise when **all** of the following are true:

- Business knowledge sources (M9) register non-document kinds in production
- Index layer stores relationship metadata
- Server DTO version bump is planned (DF-005+ major version)
- Owner approves terminology alignment with Document 020

Until then, **`KnowledgeDocument` is the canonical discoverable item type**.

---

## Implementation impact today

None. This note is planning guidance only. DF-003 registry metadata uses **`declaredCapabilities`** (document kinds) — compatible with future resource kind superset.

---

_KnowledgeDocument → KnowledgeResource Evolution Note — DF-003 documentation only._
