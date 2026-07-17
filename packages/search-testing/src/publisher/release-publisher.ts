/**
 * ReleasePublisher — specialised Testing search publisher (release).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  ReleaseSearchMapper,
  type ReleaseMappableEntity,
} from "../mapper/release";
import type { TestingSearchMappableEntity } from "../mapper/shared";
import {
  DomainSearchPublisherBase,
  type DomainSearchPublisherDeps,
} from "./domain-search-publisher-base";
import { TESTING_SEARCH_DOMAIN_ENTITY_TYPES } from "./publication-contract";

export class ReleasePublisher extends DomainSearchPublisherBase {
  readonly domain = "release" as const;
  readonly entityTypes = TESTING_SEARCH_DOMAIN_ENTITY_TYPES.release;

  private readonly mapper: ReleaseSearchMapper;

  constructor(
    deps: DomainSearchPublisherDeps,
    mapper: ReleaseSearchMapper = new ReleaseSearchMapper(),
  ) {
    super(deps);
    this.mapper = mapper;
  }

  getMapper(): ReleaseSearchMapper {
    return this.mapper;
  }

  protected mapEntity(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchEntityDraft {
    return this.mapper.map(context, input as ReleaseMappableEntity);
  }
}
