/**
 * ReportingSearchEntityMapper — Reporting models → SearchEntityDraft (APZSEARCH-014).
 *
 * Metadata-only — omit sections/header/footer/branding, parametersJson values,
 * checksum hex, rendered bodies (PDF/DOCX/HTML/MD/CSV/JSON content).
 */

import type {
  ReportGenerationMetadata,
  ReportTemplate,
} from "@apzhub/reporting-contracts";
import type { SearchClassification } from "@apzhub/search-contracts";
import { isSearchClassification } from "@apzhub/search-contracts";
import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { ReportingSearchPublicationContext } from "../context/reporting-search-publication-context";
import { filterSafeCustomMetadata } from "../security/safe-fields";
import {
  assertPlatformEntityId,
  type ReportingSearchEntityType,
} from "../types/entity-types";

/** Classification severity for never-downgrade checks (higher = stricter). */
const CLASSIFICATION_RANK: Readonly<Record<SearchClassification, number>> = {
  public: 0,
  internal: 1,
  confidential: 2,
  restricted: 3,
};

export type ReportingSearchMappingExtras = {
  readonly classification?: SearchClassification;
  readonly neverDowngrade?: boolean;
  readonly title?: string;
  readonly keywords?: readonly string[];
};

/** Thin catalogue inputs — local expansions beyond ReportTemplate / ReportGenerationMetadata. */
export type ReportingCategorySearchInput = {
  readonly id: string;
  readonly tenantId?: string;
  readonly name?: string;
  readonly title?: string;
  readonly description?: string;
  readonly parentId?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
};

export type ReportingPlaceholderCatalogueSearchInput = {
  readonly id: string;
  readonly tenantId?: string;
  readonly title?: string;
  readonly name?: string;
  /** Placeholder labels only — never values. */
  readonly placeholders?: readonly string[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
};

export type ReportingDefinitionSearchInput = {
  readonly id: string;
  readonly tenantId?: string;
  readonly title?: string;
  readonly name?: string;
  readonly description?: string;
  readonly templateId?: string;
  readonly reportType?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
};

export type ReportingTypeSearchInput = {
  readonly id: string;
  readonly tenantId?: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
};

export type ReportingProfileSearchInput = {
  readonly id: string;
  readonly tenantId?: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
};

export type ReportingConsumerSearchInput = {
  readonly id: string;
  readonly tenantId?: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
};

export type ReportingUsageSummarySearchInput = {
  readonly id: string;
  readonly tenantId?: string;
  readonly title: string;
  readonly generationCount?: number;
  readonly lastGeneratedAt?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
};

export type ReportingSearchMappableEntity =
  | {
      readonly entityType: "report_template";
      readonly entity: ReportTemplate;
      readonly extras?: ReportingSearchMappingExtras & {
        readonly tenantId?: string;
      };
    }
  | {
      readonly entityType: "report_category";
      readonly entity: ReportingCategorySearchInput;
      readonly extras?: ReportingSearchMappingExtras;
    }
  | {
      readonly entityType: "report_placeholder_catalogue";
      readonly entity: ReportingPlaceholderCatalogueSearchInput;
      readonly extras?: ReportingSearchMappingExtras;
    }
  | {
      readonly entityType: "report_definition";
      readonly entity: ReportingDefinitionSearchInput | ReportTemplate;
      readonly extras?: ReportingSearchMappingExtras & {
        readonly tenantId?: string;
      };
    }
  | {
      readonly entityType: "report_type";
      readonly entity: ReportingTypeSearchInput;
      readonly extras?: ReportingSearchMappingExtras;
    }
  | {
      readonly entityType: "report_profile";
      readonly entity: ReportingProfileSearchInput;
      readonly extras?: ReportingSearchMappingExtras;
    }
  | {
      readonly entityType: "report_generation";
      readonly entity: ReportGenerationMetadata;
      readonly extras?: ReportingSearchMappingExtras;
    }
  | {
      readonly entityType: "report_generation_metadata";
      readonly entity: ReportGenerationMetadata;
      readonly extras?: ReportingSearchMappingExtras;
    }
  | {
      readonly entityType: "report_output_metadata";
      readonly entity: ReportGenerationMetadata;
      readonly extras?: ReportingSearchMappingExtras;
    }
  | {
      readonly entityType: "report_consumer";
      readonly entity: ReportingConsumerSearchInput;
      readonly extras?: ReportingSearchMappingExtras;
    }
  | {
      readonly entityType: "report_usage_summary";
      readonly entity: ReportingUsageSummarySearchInput;
      readonly extras?: ReportingSearchMappingExtras;
    };

export function resolveReportingClassification(
  context: ReportingSearchPublicationContext,
  extras?: ReportingSearchMappingExtras,
): SearchClassification {
  const candidate = extras?.classification ?? context.classification;
  if (!candidate || !isSearchClassification(candidate)) {
    return "confidential";
  }
  const neverDowngrade = extras?.neverDowngrade !== false;
  if (!neverDowngrade) return candidate;

  const contextRank = CLASSIFICATION_RANK[context.classification ?? "confidential"];
  const candidateRank = CLASSIFICATION_RANK[candidate];
  if (candidateRank < contextRank) {
    // Never downgrade — keep the stricter context classification.
    return context.classification ?? "confidential";
  }
  return candidate;
}

function navigationTarget(
  entityType: ReportingSearchEntityType,
  id: string,
): string {
  switch (entityType) {
    case "report_template":
      return `/workspace/reporting/templates/${id}`;
    case "report_category":
      return `/workspace/reporting/categories/${id}`;
    case "report_placeholder_catalogue":
      return `/workspace/reporting/placeholders/${id}`;
    case "report_definition":
      return `/workspace/reporting/definitions/${id}`;
    case "report_type":
      return `/workspace/reporting/types/${id}`;
    case "report_profile":
      return `/workspace/reporting/profiles/${id}`;
    case "report_generation":
    case "report_generation_metadata":
      return `/workspace/reporting/generations/${id}`;
    case "report_output_metadata":
      return `/workspace/reporting/outputs/${id}`;
    case "report_consumer":
      return `/workspace/reporting/consumers/${id}`;
    case "report_usage_summary":
      return `/workspace/reporting/usage/${id}`;
  }
}

function synthesizeGenerationTitle(
  meta: ReportGenerationMetadata,
  extras?: ReportingSearchMappingExtras,
): string {
  if (extras?.title?.trim()) return extras.title.trim();
  return `${meta.reportType} report (${meta.outputFormat})`;
}

function isReportTemplate(
  entity: ReportingDefinitionSearchInput | ReportTemplate,
): entity is ReportTemplate {
  return (
    "sections" in entity &&
    Array.isArray((entity as ReportTemplate).sections) &&
    typeof (entity as ReportTemplate).reportType === "string" &&
    typeof (entity as ReportTemplate).version === "string"
  );
}

export class ReportingSearchEntityMapper {
  map(
    context: ReportingSearchPublicationContext,
    input: ReportingSearchMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "report_template":
        return this.mapReportTemplate(context, input.entity, input.extras);
      case "report_category":
        return this.mapReportCategory(context, input.entity, input.extras);
      case "report_placeholder_catalogue":
        return this.mapPlaceholderCatalogue(
          context,
          input.entity,
          input.extras,
        );
      case "report_definition":
        return this.mapReportDefinition(context, input.entity, input.extras);
      case "report_type":
        return this.mapReportType(context, input.entity, input.extras);
      case "report_profile":
        return this.mapReportProfile(context, input.entity, input.extras);
      case "report_generation":
        return this.mapReportGeneration(
          context,
          input.entity,
          "report_generation",
          input.extras,
        );
      case "report_generation_metadata":
        return this.mapReportGeneration(
          context,
          input.entity,
          "report_generation_metadata",
          input.extras,
        );
      case "report_output_metadata":
        return this.mapReportOutputMetadata(
          context,
          input.entity,
          input.extras,
        );
      case "report_consumer":
        return this.mapReportConsumer(context, input.entity, input.extras);
      case "report_usage_summary":
        return this.mapReportUsageSummary(context, input.entity, input.extras);
    }
  }

  mapReportTemplate(
    context: ReportingSearchPublicationContext,
    template: ReportTemplate,
    extras?: ReportingSearchMappingExtras & { readonly tenantId?: string },
  ): SearchEntityDraft {
    assertPlatformEntityId(template.id, "report_template.id");
    const tenantId = extras?.tenantId ?? context.tenantId;
    this.assertTenant(tenantId, context);
    const classification = resolveReportingClassification(context, extras);
    // NEVER publish sections, header, footer, branding content.
    const metadata: Record<string, string> = {
      reportType: template.reportType,
      version: template.version,
      revision: String(template.revision),
      builtin: template.builtin ? "true" : "false",
      ...filterSafeCustomMetadata(template.metadata),
    };

    return {
      entityId: template.id,
      entityType: "report_template",
      title: extras?.title?.trim() || template.title || template.name,
      summary: template.description,
      organisationId: context.organisationId,
      classification,
      permissions: [...context.permissions],
      metadata,
      keywords: [
        template.title,
        template.name,
        template.reportType,
        ...(extras?.keywords ?? []),
      ],
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      navigationTarget: navigationTarget("report_template", template.id),
      sourceId: "reporting:report_template",
      ownerUserId: context.actorUserId,
      version: template.version,
    };
  }

  mapReportCategory(
    context: ReportingSearchPublicationContext,
    entity: ReportingCategorySearchInput,
    extras?: ReportingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(entity.id, "report_category.id");
    this.assertOptionalTenant(entity.tenantId, context);
    const title =
      extras?.title?.trim() ||
      entity.title?.trim() ||
      entity.name?.trim() ||
      "";
    if (!title) {
      throw new Error("report_category title/name is required");
    }
    return {
      entityId: entity.id,
      entityType: "report_category",
      title,
      summary: entity.description,
      organisationId: context.organisationId,
      classification: resolveReportingClassification(context, extras),
      permissions: [...context.permissions],
      metadata: {
        ...(entity.parentId ? { parentId: entity.parentId } : {}),
      },
      keywords: [title, ...(extras?.keywords ?? [])],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
      navigationTarget: navigationTarget("report_category", entity.id),
      sourceId: "reporting:report_category",
      ownerUserId: context.actorUserId,
    };
  }

  mapPlaceholderCatalogue(
    context: ReportingSearchPublicationContext,
    entity: ReportingPlaceholderCatalogueSearchInput,
    extras?: ReportingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(entity.id, "report_placeholder_catalogue.id");
    this.assertOptionalTenant(entity.tenantId, context);
    const title =
      extras?.title?.trim() ||
      entity.title?.trim() ||
      entity.name?.trim() ||
      "";
    if (!title) {
      throw new Error("report_placeholder_catalogue title/name is required");
    }
    // Labels only — never placeholder values.
    const labels = (entity.placeholders ?? []).map((l) => l.trim()).filter(Boolean);
    return {
      entityId: entity.id,
      entityType: "report_placeholder_catalogue",
      title,
      organisationId: context.organisationId,
      classification: resolveReportingClassification(context, extras),
      permissions: [...context.permissions],
      metadata: {
        placeholderCount: String(labels.length),
      },
      keywords: [title, ...labels, ...(extras?.keywords ?? [])],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
      navigationTarget: navigationTarget(
        "report_placeholder_catalogue",
        entity.id,
      ),
      sourceId: "reporting:report_placeholder_catalogue",
      ownerUserId: context.actorUserId,
    };
  }

  mapReportDefinition(
    context: ReportingSearchPublicationContext,
    entity: ReportingDefinitionSearchInput | ReportTemplate,
    extras?: ReportingSearchMappingExtras & { readonly tenantId?: string },
  ): SearchEntityDraft {
    if (isReportTemplate(entity)) {
      const draft = this.mapReportTemplate(context, entity, extras);
      return {
        ...draft,
        entityType: "report_definition",
        metadata: {
          ...draft.metadata,
          templateId: entity.id,
          definitionId: entity.id,
        },
        navigationTarget: navigationTarget("report_definition", entity.id),
        sourceId: "reporting:report_definition",
      };
    }
    assertPlatformEntityId(entity.id, "report_definition.id");
    this.assertOptionalTenant(entity.tenantId ?? extras?.tenantId, context);
    const title =
      extras?.title?.trim() ||
      entity.title?.trim() ||
      entity.name?.trim() ||
      "";
    if (!title) {
      throw new Error("report_definition title/name is required");
    }
    return {
      entityId: entity.id,
      entityType: "report_definition",
      title,
      summary: entity.description,
      organisationId: context.organisationId,
      classification: resolveReportingClassification(context, extras),
      permissions: [...context.permissions],
      metadata: {
        ...(entity.templateId ? { templateId: entity.templateId } : {}),
        ...(entity.reportType ? { reportType: entity.reportType } : {}),
        definitionId: entity.id,
      },
      keywords: [
        title,
        ...(entity.reportType ? [entity.reportType] : []),
        ...(extras?.keywords ?? []),
      ],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
      navigationTarget: navigationTarget("report_definition", entity.id),
      sourceId: "reporting:report_definition",
      ownerUserId: context.actorUserId,
    };
  }

  mapReportType(
    context: ReportingSearchPublicationContext,
    entity: ReportingTypeSearchInput,
    extras?: ReportingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(entity.id, "report_type.id");
    this.assertOptionalTenant(entity.tenantId, context);
    return {
      entityId: entity.id,
      entityType: "report_type",
      title: extras?.title?.trim() || entity.name,
      summary: entity.description,
      organisationId: context.organisationId,
      classification: resolveReportingClassification(context, extras),
      permissions: [...context.permissions],
      metadata: {},
      keywords: [entity.name, ...(extras?.keywords ?? [])],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
      navigationTarget: navigationTarget("report_type", entity.id),
      sourceId: "reporting:report_type",
      ownerUserId: context.actorUserId,
    };
  }

  mapReportProfile(
    context: ReportingSearchPublicationContext,
    entity: ReportingProfileSearchInput,
    extras?: ReportingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(entity.id, "report_profile.id");
    this.assertOptionalTenant(entity.tenantId, context);
    return {
      entityId: entity.id,
      entityType: "report_profile",
      title: extras?.title?.trim() || entity.name,
      summary: entity.description,
      organisationId: context.organisationId,
      classification: resolveReportingClassification(context, extras),
      permissions: [...context.permissions],
      metadata: {
        profileId: entity.id,
      },
      keywords: [entity.name, ...(extras?.keywords ?? [])],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
      navigationTarget: navigationTarget("report_profile", entity.id),
      sourceId: "reporting:report_profile",
      ownerUserId: context.actorUserId,
    };
  }

  mapReportGeneration(
    context: ReportingSearchPublicationContext,
    meta: ReportGenerationMetadata,
    entityType: "report_generation" | "report_generation_metadata",
    extras?: ReportingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(meta.id, `${entityType}.id`);
    this.assertTenant(meta.tenantId, context);
    // NEVER parametersJson values, NEVER checksum hex — presence only.
    const metadata: Record<string, string> = {
      reportType: meta.reportType,
      outputFormat: meta.outputFormat,
      templateId: meta.templateId,
      requestId: meta.requestId,
      byteLength: String(meta.byteLength),
      checksumPresent: meta.checksumSha256 ? "true" : "false",
      preview: meta.preview ? "true" : "false",
      version: meta.version,
      revision: String(meta.revision),
      generatedAt: meta.generatedAt,
      generatedBy: meta.generatedBy,
      ...(meta.archivedAt ? { archivedAt: meta.archivedAt } : {}),
      ...(meta.organisationId
        ? { organisationId: meta.organisationId }
        : {}),
    };

    return {
      entityId: meta.id,
      entityType,
      title: synthesizeGenerationTitle(meta, extras),
      organisationId: meta.organisationId ?? context.organisationId,
      classification: resolveReportingClassification(context, extras),
      permissions: [...context.permissions],
      metadata,
      keywords: [
        meta.reportType,
        meta.outputFormat,
        meta.templateId,
        ...(extras?.keywords ?? []),
      ],
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
      navigationTarget: navigationTarget(entityType, meta.id),
      sourceId: `reporting:${entityType}`,
      ownerUserId: meta.generatedBy ?? meta.createdBy ?? context.actorUserId,
      version: meta.version,
    };
  }

  mapReportOutputMetadata(
    context: ReportingSearchPublicationContext,
    meta: ReportGenerationMetadata,
    extras?: ReportingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(meta.id, "report_output_metadata.id");
    this.assertTenant(meta.tenantId, context);
    // Derived from generation metadata — outputFormat, byteLength, checksumPresent only.
    // NEVER body / checksum hex / parametersJson.
    return {
      entityId: `output:${meta.id}`,
      entityType: "report_output_metadata",
      title:
        extras?.title?.trim() ||
        `${meta.reportType} output (${meta.outputFormat})`,
      organisationId: meta.organisationId ?? context.organisationId,
      classification: resolveReportingClassification(context, extras),
      permissions: [...context.permissions],
      metadata: {
        reportType: meta.reportType,
        outputFormat: meta.outputFormat,
        byteLength: String(meta.byteLength),
        checksumPresent: meta.checksumSha256 ? "true" : "false",
        templateId: meta.templateId,
        requestId: meta.requestId,
      },
      keywords: [meta.reportType, meta.outputFormat, ...(extras?.keywords ?? [])],
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
      navigationTarget: navigationTarget("report_output_metadata", meta.id),
      sourceId: "reporting:report_output_metadata",
      ownerUserId: meta.generatedBy ?? context.actorUserId,
    };
  }

  mapReportConsumer(
    context: ReportingSearchPublicationContext,
    entity: ReportingConsumerSearchInput,
    extras?: ReportingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(entity.id, "report_consumer.id");
    this.assertOptionalTenant(entity.tenantId, context);
    return {
      entityId: entity.id,
      entityType: "report_consumer",
      title: extras?.title?.trim() || entity.name,
      summary: entity.description,
      organisationId: context.organisationId,
      classification: resolveReportingClassification(context, extras),
      permissions: [...context.permissions],
      metadata: {
        consumerId: entity.id,
      },
      keywords: [entity.name, ...(extras?.keywords ?? [])],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
      navigationTarget: navigationTarget("report_consumer", entity.id),
      sourceId: "reporting:report_consumer",
      ownerUserId: context.actorUserId,
    };
  }

  mapReportUsageSummary(
    context: ReportingSearchPublicationContext,
    entity: ReportingUsageSummarySearchInput,
    extras?: ReportingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(entity.id, "report_usage_summary.id");
    this.assertOptionalTenant(entity.tenantId, context);
    return {
      entityId: entity.id,
      entityType: "report_usage_summary",
      title: extras?.title?.trim() || entity.title,
      organisationId: context.organisationId,
      classification: resolveReportingClassification(context, extras),
      permissions: [...context.permissions],
      metadata: {
        ...(entity.generationCount !== undefined
          ? { generationCount: String(entity.generationCount) }
          : {}),
        ...(entity.lastGeneratedAt
          ? { lastGeneratedAt: entity.lastGeneratedAt }
          : {}),
      },
      keywords: [entity.title, ...(extras?.keywords ?? [])],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
      navigationTarget: navigationTarget("report_usage_summary", entity.id),
      sourceId: "reporting:report_usage_summary",
      ownerUserId: context.actorUserId,
    };
  }

  private assertTenant(
    entityTenantId: string,
    context: ReportingSearchPublicationContext,
  ): void {
    if (entityTenantId !== context.tenantId) {
      throw new Error(
        "tenant mismatch between Reporting entity and publication context",
      );
    }
  }

  private assertOptionalTenant(
    entityTenantId: string | undefined,
    context: ReportingSearchPublicationContext,
  ): void {
    if (entityTenantId !== undefined && entityTenantId !== context.tenantId) {
      throw new Error(
        "tenant mismatch between Reporting entity and publication context",
      );
    }
  }
}
