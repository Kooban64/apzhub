# SPR-005 — Ranking Engine Specification

> **Story:** DF-009 — Ranking scaffold (recency + frequency)  
> **Package:** `@apzhub/knowledge-discovery-framework`  
> **Status:** Implemented — active strategies (DF-009) · planned scaffolds (DF-014)  
> **Authority:** [Knowledge retrieval model](../architecture/knowledge-retrieval-ranking-model.md) · [Ranking strategies](./SPR-005-KDF-ranking-strategies.md)

---

## Purpose

Introduce the **Ranking Engine** as a distinct framework component. The Knowledge Discovery Orchestrator retrieves documents from providers; the Ranking Engine orders them.

DF-009 implements deterministic keyword and fuzzy strategies only. DF-014 adds planned strategy scaffolds and registry extension points. Semantic ranking, AI ranking, recommendations, and persistence remain deferred.

---

## Separation of concerns

```text
KnowledgeDiscoveryOrchestrator
        │
        ├─► Provider dispatch (retrieval)
        ├─► Merge + deduplicate
        └─► RankingEngine.rank()  ← ordering only
```

The orchestrator **must not** embed ranking logic after DF-009. Ranking behaviour is delegated to `RankingEngine`.

---

## Interfaces

```typescript
interface RankingEngine {
  rank(input: RankingInput): RankingResult;
}

interface RankingStrategy {
  readonly id: RankingStrategyId;
  rank(input: RankingInput): RankingResult;
}

interface RankingInput {
  readonly documents: readonly KnowledgeDocument[];
  readonly queryText: string;
  readonly mode?: "auto" | "passthrough" | "keyword" | "fuzzy";
}

interface RankingResult {
  readonly documents: readonly KnowledgeDocument[];
  readonly diagnostics: RankingDiagnostics;
}
```

---

## Default implementation

| Component                    | Role                                                 |
| ---------------------------- | ---------------------------------------------------- |
| `DefaultRankingEngine`       | Selects strategy and delegates                       |
| `PassthroughRankingStrategy` | Empty query — preserve merge order                   |
| `KeywordRankingStrategy`     | Exact, prefix, substring, word-prefix                |
| `FuzzyRankingStrategy`       | Keyword tiers + subsequence fuzzy (DF-006 behaviour) |

### Auto mode (orchestrator default)

| Query              | Strategy      |
| ------------------ | ------------- |
| Empty / whitespace | `passthrough` |
| Non-empty          | `fuzzy`       |

Explicit `mode` overrides auto selection for tests and future callers.

---

## Diagnostics

```typescript
interface RankingDiagnostics {
  readonly strategyId: "passthrough" | "keyword" | "fuzzy";
  readonly queryText: string;
  readonly inputCount: number;
  readonly outputCount: number;
  readonly filteredCount: number;
  readonly durationMs: number;
  readonly plannedStrategyId?:
    "semantic" | "recency" | "frequency" | "personalisation" | "ai-rerank";
  readonly implementationStatus?: "active" | "not_implemented";
  readonly message?: string;
}
```

Orchestrator query diagnostics include:

- `rankingStrategyId`
- `rankingDurationMs`
- `rankingInputCount`
- `rankingOutputCount`
- `rankingFilteredCount`

---

## Dependency injection

```typescript
const { registry, rankingEngine, rankingStrategyRegistry } =
  createKnowledgeDiscoveryContext();

const orchestrator = createKnowledgeDiscoveryOrchestrator({
  registry,
  sourcesDto: filteredDto,
  rankingEngine,
});
```

`createKnowledgeDiscoveryContext()` defaults:

- `rankingEngine` → `createDefaultRankingEngine()` (unchanged)
- `rankingStrategyRegistry` → `createDefaultRankingStrategyRegistry()` (DF-014)

See [Ranking strategy extensions](./SPR-005-KDF-ranking-strategy-extensions.md) for planned strategy scaffolds.

---

## Non-goals (DF-009)

| Out of scope              | Deferred to                                  |
| ------------------------- | -------------------------------------------- |
| Recency / frequency boost | DF-014 scaffold · preferences implementation |
| Semantic ranking          | DF-014 scaffold · future index milestone     |
| AI ranking                | DF-014 scaffold · future AI milestone        |
| Personalisation ranking   | DF-014 scaffold · Document 023               |
| Recommendations           | Future milestone                             |
| Persistence               | M8/M9                                        |

---

## Tests

| Suite                    | Location                                                        |
| ------------------------ | --------------------------------------------------------------- |
| Scoring + strategies     | `ranking/ranking.test.ts`                                       |
| Planned strategies       | `ranking/planned-ranking-strategies.test.ts`                    |
| Strategy registry + DI   | `di/knowledge-discovery-context-ranking.test.ts`                |
| Default engine           | `ranking/default-ranking-engine.test.ts`                        |
| Orchestrator integration | `orchestrator/knowledge-discovery-orchestrator-ranking.test.ts` |

---

_SPR-005 Ranking Engine Specification — DF-009._
