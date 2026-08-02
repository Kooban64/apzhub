/**
 * Compose Quality Knowledge Index with platform processing.
 */

import type { ProcessorRegistry } from "@apzhub/platform-processing";

import { createProjectionEngine, type ProjectionEngine } from "./projection/engine";
import {
  createProjectionRegistry,
  DEFECT_PROJECTION_DEFINITION,
  EVIDENCE_PROJECTION_DEFINITION,
  EXECUTION_PLAN_PROJECTION_DEFINITION,
  EXECUTION_SESSION_PROJECTION_DEFINITION,
  SUITE_PROJECTION_DEFINITION,
} from "./projection/registry";
import {
  createInMemoryProjectionRepository,
  type ProjectionRepository,
} from "./projection/repository";
import { createKnowledgeIndexProcessorBundle } from "./processors/registry";
import {
  createKnowledgeSearchService,
  type KnowledgeSearchService,
} from "./search/query-service";

export type QualityKnowledgeIndex = {
  readonly engine: ProjectionEngine;
  readonly repository: ProjectionRepository;
  readonly search: KnowledgeSearchService;
  registerProcessors(platformRegistry: ProcessorRegistry): void;
};

export function createQualityKnowledgeIndex(
  options: {
    readonly repository?: ProjectionRepository;
  } = {},
): QualityKnowledgeIndex {
  const repository = options.repository ?? createInMemoryProjectionRepository();
  const registry = createProjectionRegistry([
    EVIDENCE_PROJECTION_DEFINITION,
    SUITE_PROJECTION_DEFINITION,
    EXECUTION_PLAN_PROJECTION_DEFINITION,
    EXECUTION_SESSION_PROJECTION_DEFINITION,
    DEFECT_PROJECTION_DEFINITION,
  ]);
  const engine = createProjectionEngine({ repository, registry });
  const search = createKnowledgeSearchService(repository);
  const bundle = createKnowledgeIndexProcessorBundle(engine);

  return {
    engine,
    repository,
    search,
    registerProcessors(platformRegistry) {
      bundle.registerOnto(platformRegistry);
    },
  };
}
