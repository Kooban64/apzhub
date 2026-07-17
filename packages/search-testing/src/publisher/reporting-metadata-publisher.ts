/**
 * ReportingMetadataPublisher — specialised Testing search publisher (reporting_metadata).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  ReportingMetadataSearchMapper,
  type ReportingMetadataMappableEntity,
} from "../mapper/reporting-metadata";
import type { TestingSearchMappableEntity } from "../mapper/shared";
import {
  DomainSearchPublisherBase,
  type DomainSearchPublisherDeps,
} from "./domain-search-publisher-base";
import { TESTING_SEARCH_DOMAIN_ENTITY_TYPES } from "./publication-contract";

export class ReportingMetadataPublisher extends DomainSearchPublisherBase {
  readonly domain = "reporting_metadata" as const;
  readonly entityTypes = TESTING_SEARCH_DOMAIN_ENTITY_TYPES.reporting_metadata;

  private readonly mapper: ReportingMetadataSearchMapper;

  constructor(
    deps: DomainSearchPublisherDeps,
    mapper: ReportingMetadataSearchMapper = new ReportingMetadataSearchMapper(),
  ) {
    super(deps);
    this.mapper = mapper;
  }

  getMapper(): ReportingMetadataSearchMapper {
    return this.mapper;
  }

  protected mapEntity(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchEntityDraft {
    return this.mapper.map(context, input as ReportingMetadataMappableEntity);
  }
}
