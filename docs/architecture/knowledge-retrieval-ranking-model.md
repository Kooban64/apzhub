# Knowledge Retrieval and Ranking Model

> **Story:** DF-009 — documentation only (beyond default implementation)  
> **Status:** Canonical conceptual model  
> **Authority:** [Knowledge Views model](./knowledge-views-model.md) · [Ranking Engine spec](../specs/SPR-005-KDF-ranking-engine.md)

---

## Purpose

Document the separation between **Knowledge Retrieval** (orchestrator + providers) and **Ranking** (Ranking Engine) on the path to the Knowledge Experience layer.

---

## Layer progression

```text
Knowledge Retrieval          ← providers return documents (DF-006 – DF-008)
        ↓
Ranking Engine               ← deterministic ordering (DF-009)
        ↓
Knowledge Experience         ← shell UI and interaction (DF-010+)
```

| Layer                    | Responsibility                         | Mutability                 |
| ------------------------ | -------------------------------------- | -------------------------- |
| **Knowledge Retrieval**  | Dispatch providers, merge, deduplicate | Orchestrator at query time |
| **Ranking Engine**       | Order documents by relevance           | Read-only transform        |
| **Knowledge Experience** | Present results, handle selection      | Client interaction         |

---

## Knowledge Retrieval

The **Knowledge Discovery Orchestrator** retrieves documents:

1. Filter sources via `KnowledgeSourceRegistryDto` boundary
2. Dispatch `provider.query()` in priority order
3. Merge and deduplicate by `documentId`

Retrieval does **not** rank, execute actions, or navigate.

```text
Filtered KnowledgeSourceRegistryDto
        ↓
Providers (Action, Navigation, …)
        ↓
Merged KnowledgeDocument[]
```

---

## Ranking Engine

The **Ranking Engine** receives merged documents and returns an ordered list:

```text
RankingEngine.rank({ documents, queryText })
        ↓
Ordered KnowledgeDocument[] + RankingDiagnostics
```

DF-009 implements:

- `PassthroughRankingStrategy` — empty query
- `KeywordRankingStrategy` — keyword tiers
- `FuzzyRankingStrategy` — keyword + subsequence (default for non-empty queries)
- Planned scaffolds (DF-014) — `SemanticRankingStrategy`, `RecencyRankingStrategy`, `FrequencyRankingStrategy`, `PersonalisationRankingStrategy`, `AIRerankingStrategy` — not selected by DefaultRankingEngine

Future extensions (not DF-009):

- Recency boost from session context
- Frequency boost from selection hooks
- Preference-weighted ranking (Document 023)

Ranking remains **deterministic** until semantic/AI strategies are explicitly introduced in later milestones.

---

## Knowledge Experience

Ranked documents flow through the **Knowledge Presentation Layer** into **Knowledge Experiences**:

| Layer / experience                                      | Story                                      |
| ------------------------------------------------------- | ------------------------------------------ |
| Knowledge Presentation Layer                            | DF-012 (grouping, delegation, view models) |
| Knowledge Overlay (experience)                          | DF-012                                     |
| Command Palette knowledge mode                          | DF-013                                     |
| Global Search, Help, AI, Recommendations, Related Items | Future                                     |

Selection routes through existing Action Framework `execute()` or Workbench navigation — no new execution path ([ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)).

---

## End-to-end query flow

```text
User query
        ↓
Orchestrator.query()           ← retrieval
        ↓
RankingEngine.rank()           ← ordering
        ↓
Ranked KnowledgeDocument[]
        ↓
Knowledge Presentation Layer    ← grouping · mapping · delegation (DF-012+)
        ↓
Knowledge Experiences (UI)        ← overlay · palette · search · … (DF-010+)
        ↓
Action execute() · Navigation  ← existing execution paths
```

---

## Relationship to Knowledge Views

From [Knowledge Views model](./knowledge-views-model.md):

```text
Knowledge Registry
        ↓
Knowledge Views (DTO, search results)
        ↓
Knowledge Experience (UI)
```

DF-009 adds **Ranking Engine** between retrieval and experience:

```text
Knowledge View (search results) = Retrieval + Ranking
```

---

## Story traceability

| Layer      | Stories                                              |
| ---------- | ---------------------------------------------------- |
| Retrieval  | DF-006, DF-007, DF-008                               |
| Ranking    | DF-009 (scaffold), DF-009+ (recency/frequency hooks) |
| Experience | DF-010 – DF-013                                      |

---

_Knowledge Retrieval and Ranking Model — conceptual documentation for SPR-005._
