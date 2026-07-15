import {
  testingReportGenerationMetadata,
  testingReportTemplate,
  type DatabaseExecutor,
} from "@apzhub/config";

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
  dateFromIso,
  isoFromDate,
  metaFromRow,
} from "../mappers/row-mappers";
import { baseMeta } from "../in-memory/generic-crud";
import {
  createPostgresCrudRepository,
  type PostgresCrudTable,
} from "../postgres/generic-crud";

function asTable(table: unknown): PostgresCrudTable {
  return table as PostgresCrudTable;
}

function assertReportGenerationMetadataImmutable(): never {
  throw new Error("Report generation metadata is immutable");
}

function metaFields(record: {
  id: string;
  tenantId: string;
  organisationId?: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  archivedAt?: string;
}) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    revision: record.revision,
    createdAt: dateFromIso(record.createdAt) ?? new Date(),
    updatedAt: dateFromIso(record.updatedAt) ?? new Date(),
    createdBy: record.createdBy ?? null,
    updatedBy: record.updatedBy ?? null,
    archivedAt: dateFromIso(record.archivedAt),
  };
}

function reportTemplateToRow(record: ReportTemplateRecord) {
  return {
    ...metaFields(record),
    reportType: record.reportType,
    name: record.name,
    description: record.description ?? null,
    version: record.version,
    title: record.title,
    subtitle: record.subtitle ?? null,
    header: record.header ?? null,
    footer: record.footer ?? null,
    brandingJson: { ...record.brandingJson },
    metadataJson: { ...record.metadataJson },
    metricKeysJson: [...record.metricKeysJson],
    sectionsJson: [...record.sectionsJson],
    builtin: record.builtin,
  };
}

function rowToReportTemplate(row: Record<string, unknown>): ReportTemplateRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    reportType: String(row.reportType ?? ""),
    name: String(row.name ?? ""),
    description: (row.description as string | null) ?? undefined,
    version: String(row.version ?? ""),
    title: String(row.title ?? ""),
    subtitle: (row.subtitle as string | null) ?? undefined,
    header: (row.header as string | null) ?? undefined,
    footer: (row.footer as string | null) ?? undefined,
    brandingJson: (row.brandingJson as Record<string, unknown> | null) ?? {},
    metadataJson: (row.metadataJson as Record<string, unknown> | null) ?? {},
    metricKeysJson: Array.isArray(row.metricKeysJson)
      ? (row.metricKeysJson as unknown[])
      : [],
    sectionsJson: Array.isArray(row.sectionsJson)
      ? (row.sectionsJson as unknown[])
      : [],
    builtin: Boolean(row.builtin ?? false),
  };
}

function reportGenerationMetadataToRow(record: ReportGenerationMetadataRecord) {
  return {
    ...metaFields(record),
    requestId: record.requestId,
    templateId: record.templateId,
    reportType: record.reportType,
    outputFormat: record.outputFormat,
    parametersJson: record.parametersJson,
    generatedAt: dateFromIso(record.generatedAt) ?? new Date(),
    generatedBy: record.generatedBy,
    version: record.version,
    checksumSha256: record.checksumSha256,
    byteLength: record.byteLength,
    preview: record.preview,
  };
}

function rowToReportGenerationMetadata(
  row: Record<string, unknown>,
): ReportGenerationMetadataRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    requestId: String(row.requestId ?? ""),
    templateId: String(row.templateId ?? ""),
    reportType: String(row.reportType ?? ""),
    outputFormat: String(row.outputFormat ?? ""),
    parametersJson: String(row.parametersJson ?? "{}"),
    generatedAt: isoFromDate(row.generatedAt as Date)!,
    generatedBy: String(row.generatedBy ?? ""),
    version: String(row.version ?? ""),
    checksumSha256: String(row.checksumSha256 ?? ""),
    byteLength: Number(row.byteLength ?? 0),
    preview: Boolean(row.preview ?? false),
  };
}

export function createPostgresReportingRepos(db: DatabaseExecutor): {
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
    reportTemplates: createPostgresCrudRepository<
      ReportTemplateCreate,
      ReportTemplateUpdate,
      ReportTemplateRecord
    >({
      kind: "report_template",
      db,
      table: asTable(testingReportTemplate),
      searchFields: ["name", "title", "reportType", "description"],
      validateCreate: (input) => {
        assertRequiredString(String(input.reportType ?? ""), "reportType");
        assertRequiredString(String(input.name ?? ""), "name");
        assertRequiredString(String(input.version ?? ""), "version");
        assertRequiredString(String(input.title ?? ""), "title");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(
          ctx,
          input as { id?: string; organisationId?: string },
          existing,
        );
        const data = input as Partial<ReportTemplateRecord>;
        return {
          ...meta,
          reportType: String(data.reportType ?? existing?.reportType ?? ""),
          name: String(data.name ?? existing?.name ?? ""),
          description: data.description ?? existing?.description,
          version: String(data.version ?? existing?.version ?? "1"),
          title: String(data.title ?? existing?.title ?? ""),
          subtitle: data.subtitle ?? existing?.subtitle,
          header: data.header ?? existing?.header,
          footer: data.footer ?? existing?.footer,
          brandingJson: data.brandingJson ?? existing?.brandingJson ?? {},
          metadataJson: data.metadataJson ?? existing?.metadataJson ?? {},
          metricKeysJson: data.metricKeysJson ?? existing?.metricKeysJson ?? [],
          sectionsJson: data.sectionsJson ?? existing?.sectionsJson ?? [],
          builtin: Boolean(data.builtin ?? existing?.builtin ?? false),
        };
      },
      toRow: (record) => reportTemplateToRow(record),
      rowToRecord: (row) => rowToReportTemplate(row as never),
    }),

    reportGenerationMetadata: createPostgresCrudRepository<
      ReportGenerationMetadataCreate,
      ReportGenerationMetadataUpdate,
      ReportGenerationMetadataRecord
    >({
      kind: "report_generation_metadata",
      db,
      table: asTable(testingReportGenerationMetadata),
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
        const meta = baseMeta(
          ctx,
          input as { id?: string; organisationId?: string },
          existing,
        );
        const data = input as Partial<ReportGenerationMetadataRecord>;
        return {
          ...meta,
          requestId: String(data.requestId ?? existing?.requestId ?? ""),
          templateId: String(data.templateId ?? existing?.templateId ?? ""),
          reportType: String(data.reportType ?? existing?.reportType ?? ""),
          outputFormat: String(data.outputFormat ?? existing?.outputFormat ?? ""),
          parametersJson: String(
            data.parametersJson ?? existing?.parametersJson ?? "{}",
          ),
          generatedAt: String(
            data.generatedAt ??
              existing?.generatedAt ??
              new Date().toISOString(),
          ),
          generatedBy: String(data.generatedBy ?? existing?.generatedBy ?? ""),
          version: String(data.version ?? existing?.version ?? "1"),
          checksumSha256: String(
            data.checksumSha256 ?? existing?.checksumSha256 ?? "",
          ),
          byteLength: Number(data.byteLength ?? existing?.byteLength ?? 0),
          preview: Boolean(data.preview ?? existing?.preview ?? false),
        };
      },
      toRow: (record) => reportGenerationMetadataToRow(record),
      rowToRecord: (row) => rowToReportGenerationMetadata(row as never),
    }),
  };
}

export {
  reportTemplateToRow,
  rowToReportTemplate,
  reportGenerationMetadataToRow,
  rowToReportGenerationMetadata,
};
