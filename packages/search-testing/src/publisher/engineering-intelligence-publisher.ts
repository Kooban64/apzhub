/**
 * EngineeringIntelligencePublisher — specialised Testing search publisher (engineering_intelligence).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  EngineeringIntelligenceSearchMapper,
  type EngineeringIntelligenceMappableEntity,
} from "../mapper/engineering-intelligence";
import type { TestingSearchMappableEntity } from "../mapper/shared";
import {
  DomainSearchPublisherBase,
  type DomainSearchPublisherDeps,
} from "./domain-search-publisher-base";
import { TESTING_SEARCH_DOMAIN_ENTITY_TYPES } from "./publication-contract";

export class EngineeringIntelligencePublisher extends DomainSearchPublisherBase {
  readonly domain = "engineering_intelligence" as const;
  readonly entityTypes = TESTING_SEARCH_DOMAIN_ENTITY_TYPES.engineering_intelligence;

  private readonly mapper: EngineeringIntelligenceSearchMapper;

  constructor(
    deps: DomainSearchPublisherDeps,
    mapper: EngineeringIntelligenceSearchMapper = new EngineeringIntelligenceSearchMapper(),
  ) {
    super(deps);
    this.mapper = mapper;
  }

  getMapper(): EngineeringIntelligenceSearchMapper {
    return this.mapper;
  }

  protected mapEntity(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchEntityDraft {
    return this.mapper.map(context, input as EngineeringIntelligenceMappableEntity);
  }
}
