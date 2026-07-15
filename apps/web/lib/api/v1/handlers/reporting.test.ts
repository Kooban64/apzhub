/**
 * Platform Reporting HTTP handler coverage (APZREPORT-002).
 */
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  handleGenerateReport,
  handleGetReportGeneration,
  handleGetReportTemplate,
  handleListAvailableReports,
  handleListReportGenerations,
  handleListReportOutputFormats,
  handleListReportTemplates,
  handlePreviewReport,
  handleRenderReport,
  handleValidateReport,
} from "./reporting";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { resetPlatformApiGatewayBootstrap } from "../gateway/bootstrap";
import {
  buildMockSession,
  buildTestServiceContext,
  installMockGateway,
} from "../testing/fixtures";

function makeRequest(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }
  return new NextRequest(new URL(url, "http://localhost"), {
    ...init,
    headers,
  } as ConstructorParameters<typeof NextRequest>[1]);
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-reporting",
      correlationId: "corr-test-reporting",
      timestamp: "2026-07-12T00:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

const sampleBody = {
  reportType: "executive",
  templateId: "tmpl-executive-dashboard",
  outputFormat: "html",
};

describe("platform reporting handlers", () => {
  beforeEach(() => {
    installMockGateway();
  });

  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
    vi.clearAllMocks();
  });

  it("lists formats, types, and templates", async () => {
    const formats = await handleListReportOutputFormats(
      makeRequest("/api/v1/reporting/formats"),
      makeContext(),
    );
    expect(formats.status).toBe(200);
    expect((await formats.json()).data.formats).toContain("html");

    const types = await handleListAvailableReports(
      makeRequest("/api/v1/reporting/types"),
      makeContext(),
    );
    expect(types.status).toBe(200);
    expect((await types.json()).data).toContain("executive");

    const templates = await handleListReportTemplates(
      makeRequest("/api/v1/reporting/templates?reportType=executive"),
      makeContext(),
    );
    expect(templates.status).toBe(200);
    expect((await templates.json()).data[0].id).toBe("tmpl-executive-dashboard");

    const one = await handleGetReportTemplate(
      makeRequest("/api/v1/reporting/templates/tmpl-executive-dashboard"),
      makeContext(),
      { params: Promise.resolve({ templateId: "tmpl-executive-dashboard" }) },
    );
    expect(one.status).toBe(200);
  });

  it("validates, previews, generates, and lists metadata", async () => {
    const validated = await handleValidateReport(
      makeRequest("/api/v1/reporting/validate", {
        method: "POST",
        body: JSON.stringify(sampleBody),
      }),
      makeContext(),
    );
    expect(validated.status).toBe(200);
    expect((await validated.json()).data.valid).toBe(true);

    const preview = await handlePreviewReport(
      makeRequest("/api/v1/reporting/preview", {
        method: "POST",
        body: JSON.stringify(sampleBody),
      }),
      makeContext(),
    );
    expect(preview.status).toBe(200);
    expect((await preview.json()).data.metadata.preview).toBe(true);

    const generated = await handleGenerateReport(
      makeRequest("/api/v1/reporting/generate", {
        method: "POST",
        body: JSON.stringify(sampleBody),
      }),
      makeContext(),
    );
    expect(generated.status).toBe(200);
    const generatedPayload = await generated.json();
    expect(generatedPayload.data.output.format).toBe("html");

    const generations = await handleListReportGenerations(
      makeRequest("/api/v1/reporting/generations"),
      makeContext(),
    );
    expect(generations.status).toBe(200);
    expect((await generations.json()).data[0].id).toBe("rmeta_apzreport_002");

    const one = await handleGetReportGeneration(
      makeRequest("/api/v1/reporting/generations/rmeta_apzreport_002"),
      makeContext(),
      { params: Promise.resolve({ metadataId: "rmeta_apzreport_002" }) },
    );
    expect(one.status).toBe(200);

    const rendered = await handleRenderReport(
      makeRequest("/api/v1/reporting/render", {
        method: "POST",
        body: JSON.stringify({
          document: generatedPayload.data.document,
          outputFormat: "html",
        }),
      }),
      makeContext(),
    );
    expect(rendered.status).toBe(200);
    expect((await rendered.json()).data.format).toBe("html");
  });
});
