/**
 * Synchronous publication hooks for Reporting lifecycle events (APZSEARCH-014).
 * No listeners, webhooks, polling, Event Bus, or report rendering — call sites invoke explicitly.
 */

import type {
  ReportGenerationMetadata,
  ReportTemplate,
} from "@apzhub/reporting-contracts";
import type { SearchPublicationResult } from "@apzhub/search-integration";

import type { ReportingSearchPublicationContext } from "../context/reporting-search-publication-context";
import type {
  ReportingCategorySearchInput,
  ReportingConsumerSearchInput,
  ReportingDefinitionSearchInput,
  ReportingPlaceholderCatalogueSearchInput,
  ReportingProfileSearchInput,
  ReportingSearchMappingExtras,
  ReportingTypeSearchInput,
  ReportingUsageSummarySearchInput,
} from "../mapper/reporting-search-entity-mapper";
import type { ReportingSearchPublisher } from "../publisher/reporting-search-publisher";

export type ReportingSearchLifecycleHooks = {
  onReportTemplateUpserted(
    context: ReportingSearchPublicationContext,
    template: ReportTemplate,
    extras?: ReportingSearchMappingExtras & { readonly tenantId?: string },
  ): SearchPublicationResult;
  onReportTemplateRemoved(
    context: ReportingSearchPublicationContext,
    templateId: string,
  ): SearchPublicationResult;

  onReportCategoryUpserted(
    context: ReportingSearchPublicationContext,
    category: ReportingCategorySearchInput,
    extras?: ReportingSearchMappingExtras,
  ): SearchPublicationResult;
  onReportCategoryRemoved(
    context: ReportingSearchPublicationContext,
    categoryId: string,
  ): SearchPublicationResult;

  onReportDefinitionUpserted(
    context: ReportingSearchPublicationContext,
    definition: ReportingDefinitionSearchInput | ReportTemplate,
    extras?: ReportingSearchMappingExtras & { readonly tenantId?: string },
  ): SearchPublicationResult;
  onReportDefinitionRemoved(
    context: ReportingSearchPublicationContext,
    definitionId: string,
  ): SearchPublicationResult;

  onReportTypeUpserted(
    context: ReportingSearchPublicationContext,
    reportType: ReportingTypeSearchInput,
    extras?: ReportingSearchMappingExtras,
  ): SearchPublicationResult;
  onReportTypeRemoved(
    context: ReportingSearchPublicationContext,
    typeId: string,
  ): SearchPublicationResult;

  onReportProfileUpserted(
    context: ReportingSearchPublicationContext,
    profile: ReportingProfileSearchInput,
    extras?: ReportingSearchMappingExtras,
  ): SearchPublicationResult;
  onReportProfileRemoved(
    context: ReportingSearchPublicationContext,
    profileId: string,
  ): SearchPublicationResult;

  onReportGenerationRecorded(
    context: ReportingSearchPublicationContext,
    metadata: ReportGenerationMetadata,
    extras?: ReportingSearchMappingExtras,
  ): SearchPublicationResult;
  onReportGenerationArchived(
    context: ReportingSearchPublicationContext,
    metadata: ReportGenerationMetadata,
    extras?: ReportingSearchMappingExtras,
  ): SearchPublicationResult;
  onReportGenerationRemoved(
    context: ReportingSearchPublicationContext,
    generationId: string,
  ): SearchPublicationResult;

  onReportOutputMetadataPublished(
    context: ReportingSearchPublicationContext,
    metadata: ReportGenerationMetadata,
    extras?: ReportingSearchMappingExtras,
  ): SearchPublicationResult;

  onReportConsumerUpserted(
    context: ReportingSearchPublicationContext,
    consumer: ReportingConsumerSearchInput,
    extras?: ReportingSearchMappingExtras,
  ): SearchPublicationResult;
  onReportConsumerRemoved(
    context: ReportingSearchPublicationContext,
    consumerId: string,
  ): SearchPublicationResult;

  onReportUsageSummaryUpserted(
    context: ReportingSearchPublicationContext,
    summary: ReportingUsageSummarySearchInput,
    extras?: ReportingSearchMappingExtras,
  ): SearchPublicationResult;

  onPlaceholderCatalogueUpserted(
    context: ReportingSearchPublicationContext,
    catalogue: ReportingPlaceholderCatalogueSearchInput,
    extras?: ReportingSearchMappingExtras,
  ): SearchPublicationResult;
};

/**
 * Creates explicit hooks that call publish-or-update based on existence in the sink.
 * No background subscription. Metadata-only — never triggers report generation.
 */
export function createReportingSearchLifecycleHooks(
  publisher: ReportingSearchPublisher,
): ReportingSearchLifecycleHooks {
  const upsert = (
    context: ReportingSearchPublicationContext,
    input: Parameters<ReportingSearchPublisher["publish"]>[1],
    entityId: string,
  ): SearchPublicationResult => {
    const prior = publisher.getIntegrationPublisher().getSink().get(entityId);
    if (prior && prior.lifecycleState !== "removed") {
      return publisher.update(context, input);
    }
    return publisher.publish(context, input);
  };

  return {
    onReportTemplateUpserted: (c, template, extras) =>
      upsert(
        c,
        { entityType: "report_template", entity: template, extras },
        template.id,
      ),
    onReportTemplateRemoved: (c, id) =>
      publisher.remove(c, "report_template", id),

    onReportCategoryUpserted: (c, category, extras) =>
      upsert(
        c,
        { entityType: "report_category", entity: category, extras },
        category.id,
      ),
    onReportCategoryRemoved: (c, id) =>
      publisher.remove(c, "report_category", id),

    onReportDefinitionUpserted: (c, definition, extras) =>
      upsert(
        c,
        { entityType: "report_definition", entity: definition, extras },
        definition.id,
      ),
    onReportDefinitionRemoved: (c, id) =>
      publisher.remove(c, "report_definition", id),

    onReportTypeUpserted: (c, reportType, extras) =>
      upsert(
        c,
        { entityType: "report_type", entity: reportType, extras },
        reportType.id,
      ),
    onReportTypeRemoved: (c, id) => publisher.remove(c, "report_type", id),

    onReportProfileUpserted: (c, profile, extras) =>
      upsert(
        c,
        { entityType: "report_profile", entity: profile, extras },
        profile.id,
      ),
    onReportProfileRemoved: (c, id) =>
      publisher.remove(c, "report_profile", id),

    onReportGenerationRecorded: (c, metadata, extras) => {
      // Primary: report_generation_metadata (report_generation is an alias type for the same model).
      const gen = upsert(
        c,
        {
          entityType: "report_generation_metadata",
          entity: metadata,
          extras,
        },
        metadata.id,
      );
      // Companion: output metadata derives format/size/checksumPresent only.
      const output = upsert(
        c,
        { entityType: "report_output_metadata", entity: metadata, extras },
        `output:${metadata.id}`,
      );
      return gen.ok ? gen : output;
    },
    onReportGenerationArchived: (c, metadata, extras) =>
      upsert(
        c,
        {
          entityType: "report_generation_metadata",
          entity: { ...metadata, archivedAt: metadata.archivedAt ?? new Date().toISOString() },
          extras,
        },
        metadata.id,
      ),
    onReportGenerationRemoved: (c, id) =>
      publisher.remove(c, "report_generation_metadata", id),

    onReportOutputMetadataPublished: (c, metadata, extras) =>
      upsert(
        c,
        { entityType: "report_output_metadata", entity: metadata, extras },
        `output:${metadata.id}`,
      ),

    onReportConsumerUpserted: (c, consumer, extras) =>
      upsert(
        c,
        { entityType: "report_consumer", entity: consumer, extras },
        consumer.id,
      ),
    onReportConsumerRemoved: (c, id) =>
      publisher.remove(c, "report_consumer", id),

    onReportUsageSummaryUpserted: (c, summary, extras) =>
      upsert(
        c,
        { entityType: "report_usage_summary", entity: summary, extras },
        summary.id,
      ),

    onPlaceholderCatalogueUpserted: (c, catalogue, extras) =>
      upsert(
        c,
        {
          entityType: "report_placeholder_catalogue",
          entity: catalogue,
          extras,
        },
        catalogue.id,
      ),
  };
}
