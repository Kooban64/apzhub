/**
 * ReportingMetadataSearchMapper — report metadata only (never bodies).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";
import type {
  ReportGenerationMetadata,
  ReportTemplate,
} from "@apzhub/testing-contracts";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  assertPlatformEntityId,
  assertTenant,
  navigationTarget,
  permissionTokens,
  resolveTestingClassification,
  type TestingSearchMappableEntity,
  type TestingSearchMappingExtras,
} from "./shared";

export type ReportingMetadataMappableEntity = Extract<
  TestingSearchMappableEntity,
  { readonly entityType: "report_metadata" | "report_template" }
>;

export class ReportingMetadataSearchMapper {
  map(
    context: TestingSearchPublicationContext,
    input: ReportingMetadataMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "report_metadata":
        return this.mapReportMetadata(context, input.entity, input.extras);
      case "report_template":
        return this.mapReportTemplate(context, input.entity, input.extras);
    }
  }

  mapReportMetadata(
    context: TestingSearchPublicationContext,
    meta: ReportGenerationMetadata,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(meta.id, "report_metadata.id");
    assertTenant(meta.tenantId, context);
    // NEVER body; NEVER checksumSha256 hex — presence only
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      extras?.title ?? `${meta.reportType} report (${meta.outputFormat})`;
    return {
      entityId: meta.id,
      entityType: "report_metadata",
      title,
      organisationId:
        meta.organisationId ?? extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        reportType: String(meta.reportType),
        outputFormat: meta.outputFormat,
        templateId: meta.templateId,
        requestId: meta.requestId,
        preview: meta.preview ? "true" : "false",
        revision: String(meta.revision),
        versionNumber: meta.version,
        generatedAt: meta.generatedAt,
        generatedBy: meta.generatedBy,
        checksumPresent: meta.checksumSha256 ? "true" : "false",
        byteLength: String(meta.byteLength),
      },
      keywords: [title, String(meta.reportType), meta.outputFormat],
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
      navigationTarget: navigationTarget("report_metadata", meta.id),
      sourceId: "testing:report_metadata",
      ownerUserId: meta.generatedBy ?? meta.createdBy ?? context.actorUserId,
      version: meta.version,
    };
  }

  mapReportTemplate(
    context: TestingSearchPublicationContext,
    template: ReportTemplate,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(template.id, "report_template.id");
    const tenantId = extras?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required via extras when mapping report_template",
      );
    }
    assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    return {
      entityId: template.id,
      entityType: "report_template",
      title: template.title || template.name,
      summary: template.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        reportType: String(template.reportType),
        name: template.name,
        revision: String(template.revision),
        versionNumber: template.version,
      },
      keywords: [template.name, template.title, String(template.reportType)],
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      navigationTarget: navigationTarget("report_template", template.id),
      sourceId: "testing:report_template",
      ownerUserId: context.actorUserId,
      version: template.version,
    };
  }
}
