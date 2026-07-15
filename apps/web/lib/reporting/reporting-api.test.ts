import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createMockReportingClient,
  MOCK_REPORT_TEMPLATE,
} from "./mock-reporting-client";
import {
  generateReport,
  getGenerationMetadata,
  getReportingClient,
  getTemplate,
  listGeneratedReports,
  listOutputFormats,
  listReportTypes,
  listTemplates,
  previewReport,
  resetReportingClient,
  setReportingClient,
  validateTemplate,
} from "./reporting-api";

describe("reporting-api accessor", () => {
  beforeEach(() => {
    resetReportingClient();
    setReportingClient(createMockReportingClient());
  });

  afterEach(() => {
    resetReportingClient();
  });

  it("delegates facade methods to the active client", async () => {
    expect(getReportingClient()).toBeTruthy();
    expect(await listOutputFormats()).toContain("html");
    expect((await listReportTypes()).items).toContain("executive");
    expect((await listTemplates("executive")).items[0]?.id).toBe(
      MOCK_REPORT_TEMPLATE.id,
    );
    expect((await getTemplate(MOCK_REPORT_TEMPLATE.id)).id).toBe(
      MOCK_REPORT_TEMPLATE.id,
    );
    expect(
      (
        await validateTemplate({
          reportType: "executive",
          outputFormat: "html",
        })
      ).valid,
    ).toBe(true);
    expect(
      (
        await previewReport({
          reportType: "executive",
          outputFormat: "markdown",
        })
      ).metadata.preview,
    ).toBe(true);
    const generated = await generateReport({
      reportType: "executive",
      outputFormat: "html",
    });
    expect(generated.metadata.preview).toBe(false);
    expect((await listGeneratedReports()).items.length).toBeGreaterThan(0);
    expect(
      (await getGenerationMetadata(generated.metadata.id)).id,
    ).toBe(generated.metadata.id);
  });
});
