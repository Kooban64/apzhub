/**
 * SearchIntegrationPublisher — product-facing facade (APZSEARCH-009).
 */

import type { SearchIntegrationContext } from "../context/search-integration-context";
import type { CanonicalSearchEntityInput } from "../entity/canonical-search-entity";
import type { SearchEntityLifecycleState } from "../entity/lifecycle";
import type { SearchEntityDraft } from "../mapper/search-entity-mapper";
import type { SearchPublicationDiagnostics } from "../publication/diagnostics";
import { createSearchPublicationDiagnostics } from "../publication/diagnostics";
import type { SearchPublicationStatistics } from "../publication/metrics";
import type { SearchPublicationResult } from "../publication/result";
import type { SearchPublicationSink } from "../sink/publication-sink";
import { SEARCH_INTEGRATION_VERSION } from "../version";
import { SearchEntityPublisher } from "./search-entity-publisher";

export type SearchIntegrationPublisherDeps = {
  readonly entityPublisher: SearchEntityPublisher;
};

export class SearchIntegrationPublisher {
  constructor(private readonly deps: SearchIntegrationPublisherDeps) {}

  publish(
    context: SearchIntegrationContext,
    input: CanonicalSearchEntityInput | SearchEntityDraft,
  ): SearchPublicationResult {
    return this.deps.entityPublisher.publish(context, input);
  }

  update(
    context: SearchIntegrationContext,
    input: CanonicalSearchEntityInput | SearchEntityDraft,
  ): SearchPublicationResult {
    return this.deps.entityPublisher.update(context, input);
  }

  remove(
    context: SearchIntegrationContext,
    entityId: string,
  ): SearchPublicationResult {
    return this.deps.entityPublisher.remove(context, entityId);
  }

  validate(
    context: SearchIntegrationContext,
    input: CanonicalSearchEntityInput | SearchEntityDraft,
  ): SearchPublicationResult {
    return this.deps.entityPublisher.validate(context, input);
  }

  preview(
    context: SearchIntegrationContext,
    input: CanonicalSearchEntityInput | SearchEntityDraft,
  ): SearchPublicationResult {
    return this.deps.entityPublisher.preview(context, input);
  }

  diagnostics(context: SearchIntegrationContext): SearchPublicationDiagnostics {
    const sink = this.deps.entityPublisher.getSink();
    const raw = this.deps.entityPublisher.diagnostics(context);
    if (raw.message) {
      try {
        return JSON.parse(raw.message) as SearchPublicationDiagnostics;
      } catch {
        /* fall through */
      }
    }
    return createSearchPublicationDiagnostics({
      frameworkVersion: SEARCH_INTEGRATION_VERSION,
      sinkKind: sink.kind,
      entityCount: sink.count(),
    });
  }

  lifecycle(
    context: SearchIntegrationContext,
    entityId: string,
    state: SearchEntityLifecycleState,
    reason?: string,
  ): SearchPublicationResult {
    return this.deps.entityPublisher.lifecycle(
      context,
      entityId,
      state,
      reason,
    );
  }

  statistics(context: SearchIntegrationContext): SearchPublicationStatistics {
    const raw = this.deps.entityPublisher.statistics(context);
    if (raw.message) {
      try {
        return JSON.parse(raw.message) as SearchPublicationStatistics;
      } catch {
        /* fall through */
      }
    }
    return this.deps.entityPublisher
      .getMetrics()
      .snapshot(this.deps.entityPublisher.getSink().count());
  }

  getSink(): SearchPublicationSink {
    return this.deps.entityPublisher.getSink();
  }

  getEntityPublisher(): SearchEntityPublisher {
    return this.deps.entityPublisher;
  }
}
