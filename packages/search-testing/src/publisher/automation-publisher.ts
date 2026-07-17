/**
 * AutomationPublisher — specialised Testing search publisher (automation).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  AutomationSearchMapper,
  type AutomationMappableEntity,
} from "../mapper/automation";
import type { TestingSearchMappableEntity } from "../mapper/shared";
import {
  DomainSearchPublisherBase,
  type DomainSearchPublisherDeps,
} from "./domain-search-publisher-base";
import { TESTING_SEARCH_DOMAIN_ENTITY_TYPES } from "./publication-contract";

export class AutomationPublisher extends DomainSearchPublisherBase {
  readonly domain = "automation" as const;
  readonly entityTypes = TESTING_SEARCH_DOMAIN_ENTITY_TYPES.automation;

  private readonly mapper: AutomationSearchMapper;

  constructor(
    deps: DomainSearchPublisherDeps,
    mapper: AutomationSearchMapper = new AutomationSearchMapper(),
  ) {
    super(deps);
    this.mapper = mapper;
  }

  getMapper(): AutomationSearchMapper {
    return this.mapper;
  }

  protected mapEntity(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchEntityDraft {
    return this.mapper.map(context, input as AutomationMappableEntity);
  }
}
