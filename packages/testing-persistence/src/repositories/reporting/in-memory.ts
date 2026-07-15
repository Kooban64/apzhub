import { assertRequiredString } from "../../validation/persistence-validation";
import type {
  CrudRepository,
  ReportGenerationMetadataCreate,
  ReportGenerationMetadataUpdate,
  ReportTemplateCreate,
  ReportTemplateUpdate,
} from "../interfaces";
import type {
  ReportGenerationMetadataRecord,
  ReportTemplateRecord,
} from "../records";
import {
  baseMeta,
  createInMemoryCrudRepository,
} from "../in-memory/generic-crud";

export interface ReportingInMemoryStores {
  reportTemplates: Map<string, ReportTemplateRecord>;
  reportGenerationMetadata: Map<string, ReportGenerationMetadataRecord>;
}

export function createEmptyReportingInMemoryStores(): ReportingInMemoryStores {
  return {
    reportTemplates: new Map(),
    reportGenerationMetadata: new Map(),
  };
}

function assertReportGenerationMetadataImmutable(): never {
  throw new Error("Report generation metadata is immutable");
}

export function createInMemoryReportingRepos(
  stores: ReportingInMemoryStores,
): {
  reportTemplates: CrudRepository<
    ReportTemplateCreate,
    ReportTemplateUpdate,
    ReportTemplateRecord
  >;
  reportGenerationMetadata: CrudRepository<
    ReportGenerationMetadataCreate,
    ReportGenerationMetadataUpdate,
    ReportGenerationMetadataRecord
  >;
} {
  return {
    reportTemplates: createInMemoryCrudRepository<
      ReportTemplateCreate,
      ReportTemplateUpdate,
      ReportTemplateRecord
    >({
      kind: "report_template",
      store: stores.reportTemplates,
      searchFields: ["name", "title", "reportType", "description"],
      validateCreate: (input) => {
        assertRequiredString(String(input.reportType ?? ""), "reportType");
        assertRequiredString(String(input.name ?? ""), "name");
        assertRequiredString(String(input.version ?? ""), "version");
        assertRequiredString(String(input.title ?? ""), "title");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          reportType: String(input.reportType ?? existing?.reportType ?? ""),
          name: String(input.name ?? existing?.name ?? ""),
          description:
            (input.description as string | undefined) ?? existing?.description,
          version: String(input.version ?? existing?.version ?? "1"),
          title: String(input.title ?? existing?.title ?? ""),
          subtitle: (input.subtitle as string | undefined) ?? existing?.subtitle,
          header: (input.header as string | undefined) ?? existing?.header,
          footer: (input.footer as string | undefined) ?? existing?.footer,
          brandingJson:
            (input.brandingJson as Readonly<Record<string, unknown>>) ??
            existing?.brandingJson ??
            {},
          metadataJson:
            (input.metadataJson as Readonly<Record<string, unknown>>) ??
            existing?.metadataJson ??
            {},
          metricKeysJson:
            (input.metricKeysJson as readonly unknown[]) ??
            existing?.metricKeysJson ??
            [],
          sectionsJson:
            (input.sectionsJson as readonly unknown[]) ??
            existing?.sectionsJson ??
            [],
          builtin: Boolean(input.builtin ?? existing?.builtin ?? false),
        };
      },
    }),

    reportGenerationMetadata: createInMemoryCrudRepository<
      ReportGenerationMetadataCreate,
      ReportGenerationMetadataUpdate,
      ReportGenerationMetadataRecord
    >({
      kind: "report_generation_metadata",
      store: stores.reportGenerationMetadata,
      searchFields: ["requestId", "templateId", "reportType", "outputFormat"],
      validateCreate: (input) => {
        assertRequiredString(String(input.requestId ?? ""), "requestId");
        assertRequiredString(String(input.templateId ?? ""), "templateId");
        assertRequiredString(String(input.reportType ?? ""), "reportType");
        assertRequiredString(String(input.outputFormat ?? ""), "outputFormat");
        assertRequiredString(String(input.parametersJson ?? ""), "parametersJson");
        assertRequiredString(String(input.generatedAt ?? ""), "generatedAt");
        assertRequiredString(String(input.generatedBy ?? ""), "generatedBy");
        assertRequiredString(String(input.version ?? ""), "version");
        assertRequiredString(String(input.checksumSha256 ?? ""), "checksumSha256");
      },
      validateUpdate: () => {
        assertReportGenerationMetadataImmutable();
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          requestId: String(input.requestId ?? existing?.requestId ?? ""),
          templateId: String(input.templateId ?? existing?.templateId ?? ""),
          reportType: String(input.reportType ?? existing?.reportType ?? ""),
          outputFormat: String(input.outputFormat ?? existing?.outputFormat ?? ""),
          parametersJson: String(
            input.parametersJson ?? existing?.parametersJson ?? "{}",
          ),
          generatedAt: String(
            input.generatedAt ??
              existing?.generatedAt ??
              new Date().toISOString(),
          ),
          generatedBy: String(input.generatedBy ?? existing?.generatedBy ?? ""),
          version: String(input.version ?? existing?.version ?? "1"),
          checksumSha256: String(
            input.checksumSha256 ?? existing?.checksumSha256 ?? "",
          ),
          byteLength: Number(input.byteLength ?? existing?.byteLength ?? 0),
          preview: Boolean(input.preview ?? existing?.preview ?? false),
        };
      },
    }),
  };
}
