import { createPlannedRankingStrategy } from "./planned-ranking-strategy";
import type { PlannedRankingStrategy } from "./planned-ranking-strategy";

export class SemanticRankingStrategy implements PlannedRankingStrategy {
  readonly id = "semantic" as const;
  readonly label = "Semantic ranking";
  readonly deferredTo = "future semantic index milestone";
  private readonly delegate = createPlannedRankingStrategy({
    id: this.id,
    label: this.label,
    deferredTo: this.deferredTo,
  });

  rank = this.delegate.rank.bind(this.delegate);
}

export class RecencyRankingStrategy implements PlannedRankingStrategy {
  readonly id = "recency" as const;
  readonly label = "Recency ranking";
  readonly deferredTo = "session signals / preferences (DF-009+ extension)";
  private readonly delegate = createPlannedRankingStrategy({
    id: this.id,
    label: this.label,
    deferredTo: this.deferredTo,
  });

  rank = this.delegate.rank.bind(this.delegate);
}

export class FrequencyRankingStrategy implements PlannedRankingStrategy {
  readonly id = "frequency" as const;
  readonly label = "Frequency ranking";
  readonly deferredTo = "session signals / preferences (DF-009+ extension)";
  private readonly delegate = createPlannedRankingStrategy({
    id: this.id,
    label: this.label,
    deferredTo: this.deferredTo,
  });

  rank = this.delegate.rank.bind(this.delegate);
}

export class PersonalisationRankingStrategy implements PlannedRankingStrategy {
  readonly id = "personalisation" as const;
  readonly label = "Personalisation ranking";
  readonly deferredTo = "user preferences framework (Document 023)";
  private readonly delegate = createPlannedRankingStrategy({
    id: this.id,
    label: this.label,
    deferredTo: this.deferredTo,
  });

  rank = this.delegate.rank.bind(this.delegate);
}

export class AIRerankingStrategy implements PlannedRankingStrategy {
  readonly id = "ai-rerank" as const;
  readonly label = "AI re-ranking";
  readonly deferredTo = "future AI-assisted discovery milestone";
  private readonly delegate = createPlannedRankingStrategy({
    id: this.id,
    label: this.label,
    deferredTo: this.deferredTo,
  });

  rank = this.delegate.rank.bind(this.delegate);
}

export const semanticRankingStrategy = new SemanticRankingStrategy();
export const recencyRankingStrategy = new RecencyRankingStrategy();
export const frequencyRankingStrategy = new FrequencyRankingStrategy();
export const personalisationRankingStrategy = new PersonalisationRankingStrategy();
export const aiRerankingStrategy = new AIRerankingStrategy();

export const defaultPlannedRankingStrategies: readonly PlannedRankingStrategy[] = [
  semanticRankingStrategy,
  recencyRankingStrategy,
  frequencyRankingStrategy,
  personalisationRankingStrategy,
  aiRerankingStrategy,
];
