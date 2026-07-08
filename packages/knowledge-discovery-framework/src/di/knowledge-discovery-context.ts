import type { KnowledgeRegistry } from "../registry";
import {
  createDefaultKnowledgeRegistry,
  createPlaceholderKnowledgeRegistry,
} from "../registry";
import type { RankingEngine, RankingStrategyRegistry } from "../ranking";
import {
  createDefaultRankingEngine,
  createDefaultRankingStrategyRegistry,
} from "../ranking";
import type { KnowledgeDiscoveryFrameworkStatus } from "../status";
import { KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS } from "../status";

/** Dependency injection root for Knowledge & Discovery Framework consumers. */
export interface KnowledgeDiscoveryContext {
  readonly status: KnowledgeDiscoveryFrameworkStatus;
  readonly registry: KnowledgeRegistry;
  readonly rankingEngine: RankingEngine;
  readonly rankingStrategyRegistry: RankingStrategyRegistry;
}

export interface CreateKnowledgeDiscoveryContextOptions {
  readonly registry?: KnowledgeRegistry;
  readonly rankingEngine?: RankingEngine;
  readonly rankingStrategyRegistry?: RankingStrategyRegistry;
}

/**
 * Composition root — inject custom registry in tests and future app wiring (DF-015).
 * Defaults to DefaultKnowledgeRegistry until server bootstrap hydrates providers.
 */
export function createKnowledgeDiscoveryContext(
  options: CreateKnowledgeDiscoveryContextOptions = {},
): KnowledgeDiscoveryContext {
  return {
    status: KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS,
    registry: options.registry ?? createDefaultKnowledgeRegistry(),
    rankingEngine: options.rankingEngine ?? createDefaultRankingEngine(),
    rankingStrategyRegistry:
      options.rankingStrategyRegistry ?? createDefaultRankingStrategyRegistry(),
  };
}

export { createPlaceholderKnowledgeRegistry };
