/**
 * ManualTestingPublisher — specialised Testing search publisher (manual).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  ManualTestingSearchMapper,
  type ManualTestingMappableEntity,
} from "../mapper/manual";
import type { TestingSearchMappableEntity } from "../mapper/shared";
import {
  DomainSearchPublisherBase,
  type DomainSearchPublisherDeps,
} from "./domain-search-publisher-base";
import { TESTING_SEARCH_DOMAIN_ENTITY_TYPES } from "./publication-contract";

export class ManualTestingPublisher extends DomainSearchPublisherBase {
  readonly domain = "manual" as const;
  readonly entityTypes = TESTING_SEARCH_DOMAIN_ENTITY_TYPES.manual;

  private readonly mapper: ManualTestingSearchMapper;

  constructor(
    deps: DomainSearchPublisherDeps,
    mapper: ManualTestingSearchMapper = new ManualTestingSearchMapper(),
  ) {
    super(deps);
    this.mapper = mapper;
  }

  getMapper(): ManualTestingSearchMapper {
    return this.mapper;
  }

  protected mapEntity(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchEntityDraft {
    return this.mapper.map(context, input as ManualTestingMappableEntity);
  }
}
