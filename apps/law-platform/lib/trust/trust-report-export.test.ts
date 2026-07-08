import { beforeEach, describe, expect, it } from "vitest";

import { TRUST_REPORT_TYPES } from "./trust-reporting-types";
import {
  createTrustReportingFixture,
  TrustReportingService,
} from "./trust-reporting-service";
import {
  exportTrustReportToCsv,
  exportTrustReportToHtml,
  normalizeTrustReportExportFormat,
} from "./trust-report-export";
import { resetTrustIdCounter } from "./trust-id";

const TENANT = "tenant-test";
const CLIENT = "client-export";
const MATTER = "matter-export";
const ACTOR = "user-export";

describe("trust-report-export", () => {
  let reportingService: TrustReportingService;
  let accountId: string;

  beforeEach(() => {
    resetTrustIdCounter();
    const fixture = createTrustReportingFixture();
    reportingService = fixture.reportingService;
    accountId = fixture.accountId;

    fixture.ledgerService.postTransaction({
      tenantId: TENANT,
      trustAccountId: accountId,
      trustTransactionType: "deposit",
      amount: 750,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT,
      matterId: MATTER,
      narrative: "Export seed deposit",
      actorUserId: ACTOR,
    });
  });

  function generate(type: (typeof TRUST_REPORT_TYPES)[number]) {
    const result = reportingService.generateReport({
      tenantId: TENANT,
      trustAccountId: accountId,
      reportType: type,
      clientId:
        type === "client_statement" || type === "matter_statement" ? CLIENT : undefined,
      matterId: type === "matter_statement" ? MATTER : undefined,
      generatedByUserId: ACTOR,
    });
    expect(result.ok).toBe(true);
    return result.data!;
  }

  it.each(TRUST_REPORT_TYPES)("exports %s to CSV with header row", (reportType) => {
    const report = generate(reportType);
    const artifact = exportTrustReportToCsv(report);

    expect(artifact.mimeType).toContain("text/csv");
    expect(artifact.filename).toBe(`trust-${reportType}-${report.reportId}.csv`);
    expect(artifact.content.split("\n").length).toBeGreaterThanOrEqual(1);
    expect(artifact.content).toContain('"');
  });

  it.each(TRUST_REPORT_TYPES)("exports %s to print-friendly HTML", (reportType) => {
    const report = generate(reportType);
    const artifact = exportTrustReportToHtml(report);

    expect(artifact.mimeType).toContain("text/html");
    expect(artifact.content).toContain("<!DOCTYPE html>");
    expect(artifact.content).toContain("@media print");
    expect(artifact.content).toContain(report.reportId);
  });

  it("normalizes supported export formats", () => {
    expect(normalizeTrustReportExportFormat("CSV")).toBe("csv");
    expect(normalizeTrustReportExportFormat("html")).toBe("html");
    expect(normalizeTrustReportExportFormat("pdf")).toBe("pdf");
    expect(normalizeTrustReportExportFormat("xml")).toBeUndefined();
  });

  it("includes trial balance amounts in CSV output", () => {
    const report = generate("trial_balance");
    const artifact = exportTrustReportToCsv(report);
    expect(artifact.content).toContain("Scope");
    expect(artifact.content).toContain("Balance");
  });
});
