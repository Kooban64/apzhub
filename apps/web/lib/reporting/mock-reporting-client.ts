/** In-process mock Platform Reporting client (APZREPORT-002). */

import type { ReportingClient } from "./reporting-client";
import type {
  ReportGenerationMetadataViewModel,
  ReportGenerationResultViewModel,
  ReportOutputFormatViewModel,
  ReportTemplateViewModel,
  ReportValidationViewModel,
} from "./reporting-types";

export const MOCK_REPORT_FORMATS: readonly ReportOutputFormatViewModel[] = [
  "html",
  "markdown",
  "pdf",
  "docx",
  "json",
  "csv",
];

export const MOCK_REPORT_TEMPLATE: ReportTemplateViewModel = {
  id: "tmpl-executive-dashboard",
  reportType: "executive",
  name: "Executive Dashboard",
  description: "High-level quality and readiness overview.",
  version: "1.0.0",
  revision: 1,
  title: "Executive Dashboard",
  subtitle: "Period summary",
  builtin: true,
  createdAt: "2026-07-12T12:00:00.000Z",
  updatedAt: "2026-07-12T12:00:00.000Z",
};

export const MOCK_REPORT_METADATA: ReportGenerationMetadataViewModel = {
  id: "rmeta_mock",
  tenantId: "tenant_1",
  requestId: "req_mock",
  templateId: MOCK_REPORT_TEMPLATE.id,
  reportType: "executive",
  outputFormat: "html",
  generatedAt: "2026-07-12T12:00:00.000Z",
  generatedBy: "user_mock",
  version: "1.0.0",
  revision: 1,
  checksumSha256: "abc123",
  byteLength: 128,
  preview: false,
  createdAt: "2026-07-12T12:00:00.000Z",
  updatedAt: "2026-07-12T12:00:00.000Z",
};

export const MOCK_REPORT_VALIDATION: ReportValidationViewModel = {
  valid: true,
  errors: [],
  warnings: [],
};

export const MOCK_REPORT_GENERATION: ReportGenerationResultViewModel = {
  document: {
    id: "rdoc_mock",
    reportType: "executive",
    templateId: MOCK_REPORT_TEMPLATE.id,
    title: "Executive Dashboard",
    generatedAt: "2026-07-12T12:00:00.000Z",
    generatedBy: "user_mock",
    tenantId: "tenant_1",
    version: "1.0.0",
    revision: 1,
    sections: [
      {
        id: "overview",
        title: "Overview",
        blocks: [{ kind: "paragraph", text: "Mock preview content." }],
      },
    ],
  },
  output: {
    format: "html",
    contentType: "text/html",
    encoding: "utf-8",
    body: "<p>Mock preview content.</p>",
    byteLength: 28,
    checksumSha256: "abc123",
  },
  metadata: MOCK_REPORT_METADATA,
};

export function createMockReportingClient(
  overrides?: Partial<ReportingClient>,
): ReportingClient {
  const base: ReportingClient = {
    async listOutputFormats() {
      return MOCK_REPORT_FORMATS;
    },
    async listReportTypes() {
      return { items: ["executive", "coverage"], total: 2 };
    },
    async listTemplates() {
      return { items: [MOCK_REPORT_TEMPLATE], total: 1 };
    },
    async getTemplate(templateId) {
      if (templateId !== MOCK_REPORT_TEMPLATE.id) {
        return { ...MOCK_REPORT_TEMPLATE, id: templateId };
      }
      return MOCK_REPORT_TEMPLATE;
    },
    async validateTemplate() {
      return MOCK_REPORT_VALIDATION;
    },
    async previewReport() {
      return {
        ...MOCK_REPORT_GENERATION,
        metadata: { ...MOCK_REPORT_METADATA, preview: true },
      };
    },
    async generateReport() {
      return MOCK_REPORT_GENERATION;
    },
    async listGeneratedReports() {
      return { items: [MOCK_REPORT_METADATA], total: 1 };
    },
    async getGenerationMetadata(metadataId) {
      return { ...MOCK_REPORT_METADATA, id: metadataId };
    },
  };
  return { ...base, ...overrides };
}
