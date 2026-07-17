/**
 * PipelinePublisher — specialised Testing search publisher (pipeline).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  PipelineSearchMapper,
  type PipelineMappableEntity,
} from "../mapper/pipeline";
import type { TestingSearchMappableEntity } from "../mapper/shared";
import {
  DomainSearchPublisherBase,
  type DomainSearchPublisherDeps,
} from "./domain-search-publisher-base";
import { TESTING_SEARCH_DOMAIN_ENTITY_TYPES } from "./publication-contract";

export class PipelinePublisher extends DomainSearchPublisherBase {
  readonly domain = "pipeline" as const;
  readonly entityTypes = TESTING_SEARCH_DOMAIN_ENTITY_TYPES.pipeline;

  private readonly mapper: PipelineSearchMapper;

  constructor(
    deps: DomainSearchPublisherDeps,
    mapper: PipelineSearchMapper = new PipelineSearchMapper(),
  ) {
    super(deps);
    this.mapper = mapper;
  }

  getMapper(): PipelineSearchMapper {
    return this.mapper;
  }

  protected mapEntity(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchEntityDraft {
    return this.mapper.map(context, input as PipelineMappableEntity);
  }
}
