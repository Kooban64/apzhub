import { describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { REPORT_OUTPUT_FORMATS, REPORT_TYPES } from "@apzhub/testing-contracts";

import { createPlatformServices } from "../create-platform-services";
import { createTestingPlatformServicesForTest } from "./create-testing-platform-services";
import { resolveOperationAuthorization } from "../../authorization/operation-authorization-map";

const ctx: ServiceRequestContext = {
  tenantId: "tenant_report",
  userId: "user_report",
  correlationId: "corr_report",
  permissions: ["*", "report.*", "reporting.*"],
  organisationId: "org_report",
};

function createHarness() {
  const testing = createTestingPlatformServicesForTest({
    allowInMemoryPersistence: true,
  });
  const services = createPlatformServices({
    testing,
    authorizationMode: "allow-all",
  });
  return { services, testing };
}

describe("APZTCMS-024 reporting gateway facet", () => {
  it("lists templates and available report types via gateway", async () => {
    const { services } = createHarness();
    const types = await services.gateway.testing.reporting.listAvailableReports(ctx);
    expect(types).toEqual([...REPORT_TYPES]);

    const templates = await services.gateway.testing.reporting.listTemplates(ctx);
    expect(templates.length).toBeGreaterThanOrEqual(REPORT_TYPES.length);

    const first = templates[0]!;
    const loaded = await services.gateway.testing.reporting.getTemplate(ctx, first.id);
    expect(loaded.id).toBe(first.id);
  });

  it("validates, previews, generates, and archives report metadata", async () => {
    const { services } = createHarness();
    const parameters = {
      text: {
        productName: "APZHUB",
        organisationName: "Acme",
        periodLabel: "Q2 2026",
        executiveSummary: "Quality is stable.",
      },
      metadata: { product: "APZHUB" },
      metrics: {
        passRate: "92",
        coveragePercent: "88",
        openRisks: "3",
        releaseReadiness: "90",
      },
      tables: {
        keyIndicators: {
          columns: ["Metric", "Value"],
          rows: [["Quality", "92"]],
        },
      },
      lists: { highlights: ["Latency regression"] },
      summaries: { executiveSummary: "Quality is stable." },
    };

    const validation = await services.gateway.testing.reporting.validateReport(ctx, {
      reportType: "executive",
      outputFormat: "html",
      parameters,
    });
    expect(validation.valid).toBe(true);

    const preview = await services.gateway.testing.reporting.previewReport(ctx, {
      reportType: "executive",
      outputFormat: "markdown",
      parameters,
    });
    expect(preview.metadata.preview).toBe(true);
    expect(preview.output.body.length).toBeGreaterThan(0);

    for (const format of REPORT_OUTPUT_FORMATS) {
      const generated = await services.gateway.testing.reporting.generateReport(ctx, {
        reportType: "executive",
        outputFormat: format,
        parameters,
      });
      expect(generated.output.format).toBe(format);
      expect(generated.output.checksumSha256).toHaveLength(64);
      expect(generated.metadata.preview).toBe(false);
    }

    const listed = await services.gateway.testing.reporting.listReportMetadata(ctx);
    expect(listed.length).toBeGreaterThan(0);
    const target = listed[0]!;
    const fetched = await services.gateway.testing.reporting.getReportMetadata(
      ctx,
      target.id,
    );
    expect(fetched.id).toBe(target.id);

    const archived = await services.gateway.testing.reporting.archiveReportMetadata(
      ctx,
      target.id,
    );
    expect(archived.archivedAt).toEqual(expect.any(String));
  });

  it("maps every reporting operation to an authorization entry", () => {
    const ops = [
      "listReportPlaceholders",
      "listAvailableReports",
      "listTemplates",
      "getTemplate",
      "registerTemplate",
      "validateReport",
      "previewReport",
      "generateReport",
      "renderReport",
      "archiveReportMetadata",
      "listReportMetadata",
      "getReportMetadata",
    ] as const;

    for (const operation of ops) {
      const mapping = resolveOperationAuthorization("testingReporting", operation);
      expect(mapping?.requiredPermission).toMatch(/^report\.|^reporting\./);
    }
  });

  it("lists placeholders and renders via gateway", async () => {
    const { services } = createHarness();
    const placeholders =
      await services.gateway.testing.reporting.listReportPlaceholders(ctx);
    expect(placeholders.some((p) => p.reason === "available")).toBe(true);

    const generated = await services.gateway.testing.reporting.generateReport(ctx, {
      reportType: "executive",
      outputFormat: "html",
      parameters: {
        text: {
          productName: "APZHUB",
          organisationName: "Acme",
          periodLabel: "Q2",
          executiveSummary: "Ok",
        },
        metrics: {
          passRate: 1,
          coveragePercent: 2,
          openRisks: 3,
          releaseReadiness: 4,
        },
        tables: { keyIndicators: { columns: ["A"], rows: [["1"]] } },
        lists: { highlights: ["h"] },
        summaries: { executiveSummary: "Ok" },
      },
    });
    const rendered = await services.gateway.testing.reporting.renderReport(ctx, {
      document: generated.document,
      outputFormat: "docx",
    });
    expect(rendered.format).toBe("docx");
    expect(rendered.encoding).toBe("binary");
  });

  it("registers a custom template through the gateway", async () => {
    const { services } = createHarness();
    const registered = await services.gateway.testing.reporting.registerTemplate(ctx, {
      template: {
        reportType: "qa",
        name: "Custom QA",
        version: "1.0.0",
        revision: 1,
        title: "Custom QA Report",
        sections: [
          {
            id: "s1",
            title: "Summary",
            blocks: [{ kind: "summary", summaryKey: "qa" }],
          },
        ],
      },
    });
    expect(registered.builtin).toBe(false);
    const loaded = await services.gateway.testing.reporting.getTemplate(ctx, registered.id);
    expect(loaded.title).toBe("Custom QA Report");
  });
});
