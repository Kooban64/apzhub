/**
 * Factory for Cross-Product Search Integration Framework (APZSEARCH-009).
 */

import { SearchEntityMapper } from "./mapper/search-entity-mapper";
import { SearchPublicationErrorTranslator } from "./publication/error-translator";
import { SearchPublicationLogger } from "./publication/logger";
import { SearchPublicationMetrics } from "./publication/metrics";
import { SearchEntityLifecycle } from "./entity/lifecycle";
import { SearchEntityPublisher } from "./publisher/search-entity-publisher";
import { SearchIntegrationPublisher } from "./publisher/search-integration-publisher";
import {
  InMemorySearchPublicationSink,
  NoopSearchPublicationSink,
  type SearchPublicationSink,
} from "./sink/publication-sink";
import { SearchEntityValidator } from "./validator/search-entity-validator";

export type CreateSearchIntegrationOptions = {
  readonly sink?: SearchPublicationSink;
  readonly sinkKind?: "memory" | "noop";
};

export type SearchIntegrationFramework = {
  readonly publisher: SearchIntegrationPublisher;
  readonly entityPublisher: SearchEntityPublisher;
  readonly validator: SearchEntityValidator;
  readonly mapper: SearchEntityMapper;
  readonly lifecycle: SearchEntityLifecycle;
  readonly metrics: SearchPublicationMetrics;
  readonly logger: SearchPublicationLogger;
  readonly errors: SearchPublicationErrorTranslator;
  readonly sink: SearchPublicationSink;
};

export function createSearchIntegration(
  options: CreateSearchIntegrationOptions = {},
): SearchIntegrationFramework {
  const sink =
    options.sink ??
    (options.sinkKind === "noop"
      ? new NoopSearchPublicationSink()
      : new InMemorySearchPublicationSink());

  const validator = new SearchEntityValidator();
  const mapper = new SearchEntityMapper(validator);
  const lifecycle = new SearchEntityLifecycle();
  const metrics = new SearchPublicationMetrics();
  const logger = new SearchPublicationLogger();
  const errors = new SearchPublicationErrorTranslator();

  const entityPublisher = new SearchEntityPublisher({
    sink,
    validator,
    mapper,
    lifecycle,
    metrics,
    logger,
    errors,
  });

  const publisher = new SearchIntegrationPublisher({ entityPublisher });

  return {
    publisher,
    entityPublisher,
    validator,
    mapper,
    lifecycle,
    metrics,
    logger,
    errors,
    sink,
  };
}
