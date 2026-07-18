/**
 * Typed Platform Reporting HTTP client — calls ONLY `/api/v1/reporting/*`.
 */

import { ReportingClientError } from "./reporting-errors";
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

const API_BASE = "/api/v1";

type JsonRecord = Record<string, unknown>;
type ApiErrorEnvelope = {
  readonly error?: { readonly message?: string; readonly code?: string };
  readonly meta?: { readonly correlationId?: string; readonly requestId?: string };
};
type ApiSuccessEnvelope<T> = { readonly data: T; readonly meta?: JsonRecord };
type ApiCollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: { readonly limit?: number; readonly total?: number };
  readonly meta?: JsonRecord;
};

export interface ReportingClient {
  listOutputFormats(
    options?: ReportingClientRequestOptions,
  ): Promise<readonly ReportOutputFormatViewModel[]>;
  listReportTypes(
    options?: ReportingClientRequestOptions,
  ): Promise<ReportingCollectionResult<ReportTypeViewModel>>;
  listTemplates(
    reportType?: string,
    options?: ReportingClientRequestOptions,
  ): Promise<ReportingCollectionResult<ReportTemplateViewModel>>;
  getTemplate(
    templateId: string,
    options?: ReportingClientRequestOptions,
  ): Promise<ReportTemplateViewModel>;
  validateTemplate(
    input: ValidateReportClientInput,
    options?: ReportingClientRequestOptions,
  ): Promise<ReportValidationViewModel>;
  previewReport(
    input: GenerateReportClientInput,
    options?: ReportingClientRequestOptions,
  ): Promise<ReportGenerationResultViewModel>;
  generateReport(
    input: GenerateReportClientInput,
    options?: ReportingClientRequestOptions,
  ): Promise<ReportGenerationResultViewModel>;
  listGeneratedReports(
    options?: ReportingClientRequestOptions,
  ): Promise<ReportingCollectionResult<ReportGenerationMetadataViewModel>>;
  getGenerationMetadata(
    metadataId: string,
    options?: ReportingClientRequestOptions,
  ): Promise<ReportGenerationMetadataViewModel>;
}

function asRecord(value: unknown): JsonRecord {
  return value !== null && typeof value === "object" ? (value as JsonRecord) : {};
}

function mapTemplate(raw: unknown): ReportTemplateViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    reportType: String(r.reportType ?? ""),
    name: String(r.name ?? ""),
    description: r.description !== undefined ? String(r.description) : undefined,
    version: String(r.version ?? ""),
    revision: Number(r.revision ?? 0),
    title: String(r.title ?? ""),
    subtitle: r.subtitle !== undefined ? String(r.subtitle) : undefined,
    builtin: Boolean(r.builtin),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapValidation(raw: unknown): ReportValidationViewModel {
  const r = asRecord(raw);
  return {
    valid: Boolean(r.valid),
    errors: Array.isArray(r.errors) ? r.errors.map(String) : [],
    warnings: Array.isArray(r.warnings) ? r.warnings.map(String) : [],
  };
}

function mapMetadata(raw: unknown): ReportGenerationMetadataViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId:
      r.organisationId !== undefined ? String(r.organisationId) : undefined,
    requestId: String(r.requestId ?? ""),
    templateId: String(r.templateId ?? ""),
    reportType: String(r.reportType ?? ""),
    outputFormat: String(r.outputFormat ?? "json") as ReportOutputFormatViewModel,
    generatedAt: String(r.generatedAt ?? ""),
    generatedBy: String(r.generatedBy ?? ""),
    version: String(r.version ?? ""),
    revision: Number(r.revision ?? 0),
    checksumSha256: String(r.checksumSha256 ?? ""),
    byteLength: Number(r.byteLength ?? 0),
    preview: Boolean(r.preview),
    archivedAt: r.archivedAt !== undefined ? String(r.archivedAt) : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapGenerationResult(raw: unknown): ReportGenerationResultViewModel {
  const r = asRecord(raw);
  const document = asRecord(r.document);
  const output = asRecord(r.output);
  return {
    document: {
      id: String(document.id ?? ""),
      reportType: String(document.reportType ?? ""),
      templateId: String(document.templateId ?? ""),
      title: String(document.title ?? ""),
      subtitle: document.subtitle !== undefined ? String(document.subtitle) : undefined,
      generatedAt: String(document.generatedAt ?? ""),
      generatedBy: String(document.generatedBy ?? ""),
      tenantId: String(document.tenantId ?? ""),
      version: String(document.version ?? ""),
      revision: Number(document.revision ?? 0),
      sections: Array.isArray(document.sections)
        ? (document.sections as ReportGenerationResultViewModel["document"]["sections"])
        : [],
    },
    output: {
      format: String(output.format ?? "json") as ReportOutputFormatViewModel,
      contentType: String(output.contentType ?? "application/json"),
      encoding: output.encoding === "binary" ? "binary" : "utf-8",
      body: String(output.body ?? ""),
      byteLength: Number(output.byteLength ?? 0),
      checksumSha256: String(output.checksumSha256 ?? ""),
    },
    metadata: mapMetadata(r.metadata),
  };
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options?: ReportingClientRequestOptions,
): Promise<T> {
  if (!path.startsWith("/reporting")) {
    throw new ReportingClientError({
      message: `Invalid Reporting API path: ${path}`,
      code: "REPORTING_CLIENT_ROUTE_VIOLATION",
      status: 500,
    });
  }

  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (options?.correlationId) {
    headers.set("x-correlation-id", options.correlationId);
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    signal: options?.signal,
    headers,
  });
  const payload = (await response.json().catch(() => ({}))) as ApiErrorEnvelope &
    ApiSuccessEnvelope<unknown> &
    ApiCollectionEnvelope<unknown>;
  if (!response.ok) {
    const code = payload.error?.code;
    throw new ReportingClientError({
      message: payload.error?.message ?? `Request failed (${response.status})`,
      code:
        response.status === 401
          ? "unauthorized"
          : response.status === 403
            ? "forbidden"
            : code,
      correlationId: payload.meta?.correlationId,
      status: response.status,
    });
  }
  return payload as T;
}

export function createHttpReportingClient(): ReportingClient {
  return {
    async listOutputFormats(options) {
      const res = await requestJson<
        ApiSuccessEnvelope<{ readonly formats?: readonly string[] }>
      >("/reporting/formats", { method: "GET" }, options);
      const formats = res.data?.formats ?? [];
      return formats.map((f) => f as ReportOutputFormatViewModel);
    },
    async listReportTypes(options) {
      const res = await requestJson<ApiCollectionEnvelope<unknown>>(
        "/reporting/types",
        { method: "GET" },
        options,
      );
      const items = (Array.isArray(res.data) ? res.data : []).map(String);
      return { items, total: items.length };
    },
    async listTemplates(reportType, options) {
      const qs =
        reportType && reportType.length > 0
          ? `?reportType=${encodeURIComponent(reportType)}`
          : "";
      const res = await requestJson<ApiCollectionEnvelope<unknown>>(
        `/reporting/templates${qs}`,
        { method: "GET" },
        options,
      );
      const items = (Array.isArray(res.data) ? res.data : []).map(mapTemplate);
      return { items, total: items.length };
    },
    async getTemplate(templateId, options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        `/reporting/templates/${encodeURIComponent(templateId)}`,
        { method: "GET" },
        options,
      );
      return mapTemplate(res.data);
    },
    async validateTemplate(input, options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        "/reporting/validate",
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapValidation(res.data);
    },
    async previewReport(input, options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        "/reporting/preview",
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapGenerationResult(res.data);
    },
    async generateReport(input, options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        "/reporting/generate",
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapGenerationResult(res.data);
    },
    async listGeneratedReports(options) {
      const res = await requestJson<ApiCollectionEnvelope<unknown>>(
        "/reporting/generations",
        { method: "GET" },
        options,
      );
      const items = (Array.isArray(res.data) ? res.data : []).map(mapMetadata);
      return { items, total: items.length };
    },
    async getGenerationMetadata(metadataId, options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        `/reporting/generations/${encodeURIComponent(metadataId)}`,
        { method: "GET" },
        options,
      );
      return mapMetadata(res.data);
    },
  };
}
