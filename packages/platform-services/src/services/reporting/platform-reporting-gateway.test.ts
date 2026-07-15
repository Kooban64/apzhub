import { describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import { createPlatformServices } from "../create-platform-services";
import { createTestingPlatformServicesForTest } from "../testing/create-testing-platform-services";

const ctx: ServiceRequestContext = {
  tenantId: "tenant_report_plat",
  userId: "user_report_plat",
  correlationId: "corr_report_plat",
  permissions: ["*", "report.*", "reporting.*"],
  organisationId: "org_report_plat",
};

describe("PlatformServiceGateway.reporting (APZREPORT-002)", () => {
  it("exposes platform reporting through the gateway pipeline", async () => {
    const testing = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const services = createPlatformServices({
      testing,
      authorizationMode: "allow-all",
    });

    const types = await services.gateway.reporting.listAvailableReports(ctx);
    expect(types.length).toBeGreaterThan(0);

    const templates = await services.gateway.reporting.listTemplates(ctx);
    expect(templates.length).toBeGreaterThan(0);
    const first = templates[0]!;
    expect((await services.gateway.reporting.getTemplate(ctx, first.id)).id).toBe(
      first.id,
    );

    const parameters = {
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
    };

    expect(
      (
        await services.gateway.reporting.validateReport(ctx, {
          reportType: "executive",
          outputFormat: "html",
          parameters,
        })
      ).valid,
    ).toBe(true);

    const preview = await services.gateway.reporting.previewReport(ctx, {
      reportType: "executive",
      outputFormat: "markdown",
      parameters,
    });
    expect(preview.metadata.preview).toBe(true);

    const generated = await services.gateway.reporting.generateReport(ctx, {
      reportType: "executive",
      outputFormat: "html",
      parameters,
    });
    expect(generated.output.format).toBe("html");
    expect(generated.metadata.checksumSha256).toHaveLength(64);

    const rendered = await services.gateway.reporting.renderReport(ctx, {
      document: generated.document,
      outputFormat: "json",
    });
    expect(rendered.format).toBe("json");

    const listed = await services.gateway.reporting.listReportMetadata(ctx);
    expect(listed.length).toBeGreaterThan(0);
    const meta = await services.gateway.reporting.getReportMetadata(
      ctx,
      generated.metadata.id,
    );
    expect(meta.id).toBe(generated.metadata.id);

    const archived = await services.gateway.reporting.archiveReportMetadata(
      ctx,
      generated.metadata.id,
    );
    expect(archived.archivedAt).toBeTruthy();

    const custom = await services.gateway.reporting.registerTemplate(ctx, {
      template: {
        reportType: "qa",
        name: "Custom",
        version: "1.0.0",
        revision: 1,
        title: "Custom QA",
        sections: [
          {
            id: "s1",
            title: "S",
            blocks: [{ kind: "summary", summaryKey: "qa" }],
          },
        ],
      },
    });
    expect(custom.builtin).toBe(false);
  });
});
