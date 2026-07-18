/**
 * Module-level Platform Reporting client accessor (APZREPORT-002).
 */

import { createHttpReportingClient, type ReportingClient } from "./reporting-client";
import { createMockReportingClient } from "./mock-reporting-client";
import type {
  GenerateReportClientInput,
  ReportGenerationMetadataViewModel,
  ReportGenerationResultViewModel,
  ReportOutputFormatViewModel,
  ReportTemplateViewModel,
  ReportTypeViewModel,
  ReportValidationViewModel,
  ReportingClientRequestOptions,
  ReportingCollectionResult,
  ValidateReportClientInput,
} from "./reporting-types";

let reportingClient: ReportingClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockReportingClient()
    : createHttpReportingClient();

export function setReportingClient(client: ReportingClient): void {
  reportingClient = client;
}

export function getReportingClient(): ReportingClient {
  return reportingClient;
}

export function resetReportingClient(): void {
  reportingClient = createMockReportingClient();
}

export function listOutputFormats(
  options?: ReportingClientRequestOptions,
): Promise<readonly ReportOutputFormatViewModel[]> {
  return getReportingClient().listOutputFormats(options);
}

export function listReportTypes(
  options?: ReportingClientRequestOptions,
): Promise<ReportingCollectionResult<ReportTypeViewModel>> {
  return getReportingClient().listReportTypes(options);
}

export function listTemplates(
  reportType?: string,
  options?: ReportingClientRequestOptions,
): Promise<ReportingCollectionResult<ReportTemplateViewModel>> {
  return getReportingClient().listTemplates(reportType, options);
}

export function getTemplate(
  templateId: string,
  options?: ReportingClientRequestOptions,
): Promise<ReportTemplateViewModel> {
  return getReportingClient().getTemplate(templateId, options);
}

export function validateTemplate(
  input: ValidateReportClientInput,
  options?: ReportingClientRequestOptions,
): Promise<ReportValidationViewModel> {
  return getReportingClient().validateTemplate(input, options);
}

export function previewReport(
  input: GenerateReportClientInput,
  options?: ReportingClientRequestOptions,
): Promise<ReportGenerationResultViewModel> {
  return getReportingClient().previewReport(input, options);
}

export function generateReport(
  input: GenerateReportClientInput,
  options?: ReportingClientRequestOptions,
): Promise<ReportGenerationResultViewModel> {
  return getReportingClient().generateReport(input, options);
}

export function listGeneratedReports(
  options?: ReportingClientRequestOptions,
): Promise<ReportingCollectionResult<ReportGenerationMetadataViewModel>> {
  return getReportingClient().listGeneratedReports(options);
}

export function getGenerationMetadata(
  metadataId: string,
  options?: ReportingClientRequestOptions,
): Promise<ReportGenerationMetadataViewModel> {
  return getReportingClient().getGenerationMetadata(metadataId, options);
}
