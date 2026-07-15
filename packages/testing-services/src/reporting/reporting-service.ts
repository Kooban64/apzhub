import type {
  ReportBranding,
  ReportGenerationMetadata,
  ReportOutputFormat,
  ReportTemplate,
  ReportType,
  ReportingService,
  TemplateSectionDefinition,
} from "@apzhub/testing-contracts";
import { REPORT_TYPES } from "@apzhub/testing-contracts";
import type {
  ReportGenerationMetadataRecord,
  ReportTemplateRecord,
  RepositoryContext,
} from "@apzhub/testing-persistence";
import type { ReportingRequestContext } from "@apzhub/reporting-contracts";
import {
  createPlatformReportingService,
  ReportingDomainError,
  requireFound,
  type BuiltinTemplateCatalogue,
  type ReportMetadataRepositoryPort,
  type ReportTemplateRepositoryPort,
} from "@apzhub/reporting-core";

import type { ServiceRuntime } from "../services/types";
import {
  defaultTemplateIdFor,
  getBuiltinTemplate,
  listBuiltinTemplates,
} from "./templates/builtin-templates";

function toRepoCtx(ctx: ReportingRequestContext): RepositoryContext {
  return {
    tenantId: ctx.tenantId,
    actorUserId: ctx.userId,
    organisationId: ctx.organisationId,
    correlationId: ctx.correlationId ?? "reporting",
    permissions: [...(ctx.permissions ?? [])],
  };
}

function asStringRecord(
  value: Readonly<Record<string, unknown>> | undefined,
): Readonly<Record<string, string>> | undefined {
  if (!value) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "string") out[k] = v;
    else if (v !== undefined && v !== null) out[k] = String(v);
  }
  return out;
}

function asBranding(
  value: Readonly<Record<string, unknown>> | undefined,
): ReportBranding | undefined {
  if (!value || Object.keys(value).length === 0) return undefined;
  return {
    ...(typeof value.productName === "string"
      ? { productName: value.productName }
      : {}),
    ...(typeof value.organisationName === "string"
      ? { organisationName: value.organisationName }
      : {}),
    ...(typeof value.footerText === "string"
      ? { footerText: value.footerText }
      : {}),
  };
}

function asMetricKeys(
  value: readonly unknown[] | undefined,
): readonly string[] | undefined {
  if (!value || value.length === 0) return undefined;
  return value.filter((v): v is string => typeof v === "string");
}

function asSections(
  value: readonly unknown[] | undefined,
): readonly TemplateSectionDefinition[] {
  if (!value) return [];
  return value as readonly TemplateSectionDefinition[];
}

function templateFromRecord(row: ReportTemplateRecord): ReportTemplate {
  return {
    id: row.id,
    reportType: row.reportType as ReportType,
    name: row.name,
    ...(row.description !== undefined ? { description: row.description } : {}),
    version: row.version,
    revision: row.revision,
    title: row.title,
    ...(row.subtitle !== undefined ? { subtitle: row.subtitle } : {}),
    ...(row.header !== undefined ? { header: row.header } : {}),
    ...(row.footer !== undefined ? { footer: row.footer } : {}),
    ...(asBranding(row.brandingJson)
      ? { branding: asBranding(row.brandingJson) }
      : {}),
    ...(asStringRecord(row.metadataJson)
      ? { metadata: asStringRecord(row.metadataJson) }
      : {}),
    ...(asMetricKeys(row.metricKeysJson)
      ? { metricKeys: asMetricKeys(row.metricKeysJson) }
      : {}),
    sections: asSections(row.sectionsJson),
    builtin: row.builtin,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function metadataFromRecord(
  row: ReportGenerationMetadataRecord,
): ReportGenerationMetadata {
  return {
    id: row.id,
    tenantId: row.tenantId,
    ...(row.organisationId !== undefined
      ? { organisationId: row.organisationId }
      : {}),
    requestId: row.requestId,
    templateId: row.templateId,
    reportType: row.reportType as ReportType,
    outputFormat: row.outputFormat as ReportOutputFormat,
    parametersJson: row.parametersJson,
    generatedAt: row.generatedAt,
    generatedBy: row.generatedBy,
    version: row.version,
    revision: row.revision,
    checksumSha256: row.checksumSha256,
    byteLength: row.byteLength,
    preview: row.preview,
    ...(row.archivedAt !== undefined ? { archivedAt: row.archivedAt } : {}),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(row.createdBy !== undefined ? { createdBy: row.createdBy } : {}),
    ...(row.updatedBy !== undefined ? { updatedBy: row.updatedBy } : {}),
  };
}

const tcmsCatalogue: BuiltinTemplateCatalogue = {
  list: (reportType) =>
    listBuiltinTemplates(reportType as ReportType | undefined),
  get: getBuiltinTemplate,
  defaultIdFor: (reportType) => defaultTemplateIdFor(reportType as ReportType),
  listReportTypes: () => REPORT_TYPES,
};

function createTemplatePort(rt: ServiceRuntime): ReportTemplateRepositoryPort {
  return {
    async list(ctx) {
      return (
        await rt.persistence.reportTemplates.list(toRepoCtx(ctx))
      ).items.map(templateFromRecord);
    },
    async get(ctx, templateId) {
      const row = await rt.persistence.reportTemplates.get(
        toRepoCtx(ctx),
        templateId,
      );
      return row ? templateFromRecord(row) : null;
    },
    async create(ctx, input) {
      const row = await rt.persistence.reportTemplates.create(
        toRepoCtx(ctx),
        {
          id: input.id,
          reportType: input.reportType,
          name: input.name,
          description: input.description,
          version: input.version,
          title: input.title,
          subtitle: input.subtitle,
          header: input.header,
          footer: input.footer,
          brandingJson: (input.branding ?? {}) as Readonly<
            Record<string, unknown>
          >,
          metadataJson: (input.metadata ?? {}) as Readonly<
            Record<string, unknown>
          >,
          metricKeysJson: input.metricKeys ?? [],
          sectionsJson: input.sections,
          builtin: false,
          organisationId: input.organisationId ?? ctx.organisationId,
        },
      );
      return templateFromRecord(row);
    },
  };
}

function createMetadataPort(rt: ServiceRuntime): ReportMetadataRepositoryPort {
  return {
    async create(ctx, input) {
      const row = await rt.persistence.reportGenerationMetadata.create(
        toRepoCtx(ctx),
        {
          id: input.id,
          requestId: input.requestId,
          templateId: input.templateId,
          reportType: input.reportType,
          outputFormat: input.outputFormat,
          parametersJson: input.parametersJson,
          generatedAt: input.generatedAt,
          generatedBy: input.generatedBy,
          version: input.version,
          checksumSha256: input.checksumSha256,
          byteLength: input.byteLength,
          preview: input.preview,
          organisationId: input.organisationId,
        },
      );
      return metadataFromRecord(row);
    },
    async get(ctx, metadataId) {
      const row = await rt.persistence.reportGenerationMetadata.get(
        toRepoCtx(ctx),
        metadataId,
      );
      return row ? metadataFromRecord(row) : null;
    },
    async list(ctx) {
      return (
        await rt.persistence.reportGenerationMetadata.list(
          toRepoCtx(ctx),
        )
      ).items.map(metadataFromRecord);
    },
    async archive(ctx, metadataId) {
      const existing = requireFound(
        await rt.persistence.reportGenerationMetadata.get(
          toRepoCtx(ctx),
          metadataId,
        ),
        "report_generation_metadata",
        metadataId,
      );
      const archived = await rt.persistence.reportGenerationMetadata.archive(
        toRepoCtx(ctx),
        metadataId,
        existing.revision,
      );
      return metadataFromRecord(archived);
    },
  };
}

/**
 * TCMS reporting service — consumes `@apzhub/reporting-core` with TCMS templates
 * and testing-persistence ports (APZREPORT-001).
 */
export function createReportingService(rt: ServiceRuntime): ReportingService {
  const platform = createPlatformReportingService({
    catalogue: tcmsCatalogue,
    templates: createTemplatePort(rt),
    metadata: createMetadataPort(rt),
    now: rt.now,
    id: rt.id,
  });

  return {
    ...platform,
    async listAvailableReports(ctx) {
      const types = await platform.listAvailableReports(ctx);
      return types as readonly ReportType[];
    },
  } as ReportingService;
}

export { ReportingDomainError };
