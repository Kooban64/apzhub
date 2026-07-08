# SPR-005 — Ranking Strategy Extensions

> **Story:** DF-014  
> **Package:** `@apzhub/knowledge-discovery-framework`  
> **Status:** Scaffold only — no semantic, AI, or behavioural changes  
> **Authority:** [Ranking Engine](./SPR-005-KDF-ranking-engine.md) · [Ranking strategies](./SPR-005-KDF-ranking-strategies.md)

---

## Purpose

Extend the Ranking Engine with **planned ranking strategy scaffolding** — exported classes, registry, and diagnostics for future milestones. `DefaultRankingEngine` behaviour is unchanged from DF-009.

---

## Planned strategies

| ID                | Class                            | Deferred to                               |
| ----------------- | -------------------------------- | ----------------------------------------- |
| `semantic`        | `SemanticRankingStrategy`        | Future semantic index milestone           |
| `recency`         | `RecencyRankingStrategy`         | Session signals / preferences             |
| `frequency`       | `FrequencyRankingStrategy`       | Session signals / preferences             |
| `personalisation` | `PersonalisationRankingStrategy` | User preferences framework (Document 023) |
| `ai-rerank`       | `AIRerankingStrategy`            | Future AI-assisted discovery milestone    |

### Scaffold behaviour

When a planned strategy's `rank()` is invoked directly:

1. Documents pass through in input order (no reordering, no filtering).
2. Diagnostics report `implementationStatus: "not_implemented"`.
3. `plannedStrategyId` identifies the scaffold.
4. `strategyId` remains `"passthrough"` — no change to active strategy identifiers.
5. A descriptive `message` is included — **no throw**.

Planned strategies are **not** selected by `DefaultRankingEngine` in auto, passthrough, keyword, or fuzzy modes.

---

## Strategy diagnostics

### Ranking result diagnostics (extended)

```typescript
interface RankingDiagnostics {
  readonly strategyId: ActiveRankingStrategyId;
  readonly queryText: string;
  readonly inputCount: number;
  readonly outputCount: number;
  readonly filteredCount: number;
  readonly durationMs: number;
  readonly plannedStrategyId?: PlannedRankingStrategyId;
  readonly implementationStatus?: "active" | "not_implemented";
  readonly message?: string;
}
```

Active strategies (`passthrough`, `keyword`, `fuzzy`) set `implementationStatus: "active"`.

### Registry diagnostics

```typescript
interface RankingStrategyRegistryDiagnostics {
  readonly activeStrategyIds: readonly ActiveRankingStrategyId[];
  readonly plannedStrategyIds: readonly PlannedRankingStrategyId[];
  readonly plannedStrategyCount: number;
  readonly registeredPlannedCount: number;
  readonly strategies: readonly RankingStrategyRegistrationDiagnostic[];
}
```

---

## Registry and dependency injection

```typescript
import {
  createDefaultRankingStrategyRegistry,
  createKnowledgeDiscoveryContext,
} from "@apzhub/knowledge-discovery-framework";

const { rankingEngine, rankingStrategyRegistry } = createKnowledgeDiscoveryContext();

rankingStrategyRegistry.listActive(); // passthrough · keyword · fuzzy
rankingStrategyRegistry.listPlanned(); // 5 scaffold strategies
rankingStrategyRegistry.getDiagnostics();

rankingStrategyRegistry.registerPlanned(customPlannedStrategy);
```

| Export                                   | Role                                              |
| ---------------------------------------- | ------------------------------------------------- |
| `RankingStrategyRegistry`                | Planned strategy catalogue + registration         |
| `createDefaultRankingStrategyRegistry()` | Default registry with five scaffolds              |
| `createPlannedRankingStrategy()`         | Factory for custom planned strategies             |
| `createKnowledgeDiscoveryContext()`      | DI root — adds `rankingStrategyRegistry` (DF-014) |

`rankingEngine` defaults remain `createDefaultRankingEngine()` — orchestrator query behaviour unchanged.

---

## Out of scope (DF-014)

- Semantic search implementation
- AI ranking implementation
- Recommendations
- Persistence
- Provider changes
- Query behaviour changes
- DefaultRankingEngine strategy selection changes

---

## Tests

| Suite                     | Location                                                        |
| ------------------------- | --------------------------------------------------------------- |
| Planned strategies        | `ranking/planned-ranking-strategies.test.ts`                    |
| Registry + DI             | `di/knowledge-discovery-context-ranking.test.ts`                |
| Default engine regression | `ranking/default-ranking-engine.test.ts`                        |
| Orchestrator integration  | `orchestrator/knowledge-discovery-orchestrator-ranking.test.ts` |

---

_SPR-005 Ranking Strategy Extensions — DF-014._
