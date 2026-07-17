/**
 * CertificationPublisher — specialised Testing search publisher (certification).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  CertificationSearchMapper,
  type CertificationMappableEntity,
} from "../mapper/certification";
import type { TestingSearchMappableEntity } from "../mapper/shared";
import {
  DomainSearchPublisherBase,
  type DomainSearchPublisherDeps,
} from "./domain-search-publisher-base";
import { TESTING_SEARCH_DOMAIN_ENTITY_TYPES } from "./publication-contract";

export class CertificationPublisher extends DomainSearchPublisherBase {
  readonly domain = "certification" as const;
  readonly entityTypes = TESTING_SEARCH_DOMAIN_ENTITY_TYPES.certification;

  private readonly mapper: CertificationSearchMapper;

  constructor(
    deps: DomainSearchPublisherDeps,
    mapper: CertificationSearchMapper = new CertificationSearchMapper(),
  ) {
    super(deps);
    this.mapper = mapper;
  }

  getMapper(): CertificationSearchMapper {
    return this.mapper;
  }

  protected mapEntity(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchEntityDraft {
    return this.mapper.map(context, input as CertificationMappableEntity);
  }
}
