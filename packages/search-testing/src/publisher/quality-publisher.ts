/**
 * QualityPublisher — specialised Testing search publisher (quality).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  QualitySearchMapper,
  type QualityMappableEntity,
} from "../mapper/quality";
import type { TestingSearchMappableEntity } from "../mapper/shared";
import {
  DomainSearchPublisherBase,
  type DomainSearchPublisherDeps,
} from "./domain-search-publisher-base";
import { TESTING_SEARCH_DOMAIN_ENTITY_TYPES } from "./publication-contract";

export class QualityPublisher extends DomainSearchPublisherBase {
  readonly domain = "quality" as const;
  readonly entityTypes = TESTING_SEARCH_DOMAIN_ENTITY_TYPES.quality;

  private readonly mapper: QualitySearchMapper;

  constructor(
    deps: DomainSearchPublisherDeps,
    mapper: QualitySearchMapper = new QualitySearchMapper(),
  ) {
    super(deps);
    this.mapper = mapper;
  }

  getMapper(): QualitySearchMapper {
    return this.mapper;
  }

  protected mapEntity(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchEntityDraft {
    return this.mapper.map(context, input as QualityMappableEntity);
  }
}
