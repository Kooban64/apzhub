# SPR-005 — Ranking Strategy Reference

> **Story:** DF-009  
> **Package:** `@apzhub/knowledge-discovery-framework`  
> **Status:** Active strategies implemented (DF-009) · planned scaffolds (DF-014)

---

## Strategy catalogue

| ID            | Class                        | When used                               | Behaviour                                                                                      |
| ------------- | ---------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `passthrough` | `PassthroughRankingStrategy` | Empty query (auto) or explicit mode     | Returns documents in provider merge order; assigns no scores                                   |
| `keyword`     | `KeywordRankingStrategy`     | Explicit mode                           | Ranks by exact, prefix, substring, and word-prefix matches on title, description, keywords     |
| `fuzzy`       | `FuzzyRankingStrategy`       | Non-empty query (auto) or explicit mode | Keyword tiers **plus** subsequence fuzzy matches — **preserves DF-006 orchestrator behaviour** |

---

## Scoring tiers (keyword)

Higher scores rank earlier. Applied per field (title, description, keywords); best field wins.

| Match type               | Score |
| ------------------------ | ----- |
| Title equals query       | 1000  |
| Document id equals query | 950   |
| Title prefix             | 800   |
| Id prefix                | 750   |
| Title substring          | 500   |
| Id substring             | 450   |
| Word prefix in title     | 400   |
| No match                 | 0     |

---

## Fuzzy extension

`FuzzyRankingStrategy` adds subsequence scoring on top of keyword tiers:

| Match type           | Score              |
| -------------------- | ------------------ |
| Subsequence in title | 200 + query length |
| Subsequence in id    | 150 + query length |

Documents with score `0` are filtered out for non-empty queries.

---

## Deterministic ordering

1. Score descending
2. Original merge index ascending (stable tie-break)

Empty query passthrough preserves provider merge order without filtering.

---

## Planned strategies (DF-014 scaffold)

Not selected by `DefaultRankingEngine`. Invoked via `RankingStrategyRegistry` or direct export for extension and diagnostics only.

| ID                | Class                            | Scaffold behaviour                          |
| ----------------- | -------------------------------- | ------------------------------------------- |
| `semantic`        | `SemanticRankingStrategy`        | Passthrough + `not_implemented` diagnostics |
| `recency`         | `RecencyRankingStrategy`         | Passthrough + `not_implemented` diagnostics |
| `frequency`       | `FrequencyRankingStrategy`       | Passthrough + `not_implemented` diagnostics |
| `personalisation` | `PersonalisationRankingStrategy` | Passthrough + `not_implemented` diagnostics |
| `ai-rerank`       | `AIRerankingStrategy`            | Passthrough + `not_implemented` diagnostics |

See [Ranking strategy extensions](./SPR-005-KDF-ranking-strategy-extensions.md).

---

## Selection API

```typescript
import {
  createDefaultRankingEngine,
  selectRankingMode,
} from "@apzhub/knowledge-discovery-framework";

const engine = createDefaultRankingEngine();

selectRankingMode("theme"); // "fuzzy"
selectRankingMode("   "); // "passthrough"

engine.resolveStrategy({ documents, queryText: "theme" }); // fuzzy strategy
engine.rank({ documents, queryText: "theme", mode: "keyword" }); // keyword only
```

---

## Exports

| Export          | Path                                                                |
| --------------- | ------------------------------------------------------------------- |
| Strategies      | `@apzhub/knowledge-discovery-framework`                             |
| Scoring helpers | `scoreKnowledgeDocumentMatch`, `scoreKnowledgeDocumentKeywordMatch` |
| Legacy alias    | `rankKnowledgeDocuments` → fuzzy strategy                           |

---

_SPR-005 Ranking Strategy Reference — DF-009._
