"use client";

import { Button } from "@apzhub/ui";
import { useMemo, useState } from "react";

import { LawInformationCard, LawListPageLayout, LawPageHeader } from "../ux";
import { TRUST_REPORT_TYPES } from "../../lib/trust/trust-reporting-types";
import {
  downloadTrustReportCsv,
  openTrustReportPrintView,
} from "../../lib/trust/trust-report-export";
import { useTrustWorkflow } from "../../lib/trust/trust-workflow-context";
import { formatTrustAmount } from "../../lib/trust/trust-format";
import { TrustSubNav } from "./trust-sub-nav";

/** Trust reports view — generate in-memory read models (LAW-015-09). */
export function TrustReportsPage() {
  const workflow = useTrustWorkflow();
  const bundle = workflow.getBundle();
  const [selectedType, setSelectedType] =
    useState<(typeof TRUST_REPORT_TYPES)[number]>("trial_balance");
  const [refreshKey, setRefreshKey] = useState(0);

  const reports = useMemo(
    () =>
      bundle.reportRepository.list({
        tenantId: bundle.tenantId,
        trustAccountId: bundle.accountId,
      }),
    [bundle, refreshKey],
  );

  const latestForType = [...reports]
    .reverse()
    .find((report) => report.reportType === selectedType);

  function handleGenerate() {
    workflow.generateReport(selectedType);
    setRefreshKey((value) => value + 1);
  }

  function handleExportCsv() {
    if (!latestForType) {
      return;
    }
    downloadTrustReportCsv(latestForType);
  }

  function handlePrintView() {
    if (!latestForType) {
      return;
    }
    openTrustReportPrintView(latestForType);
  }

  return (
    <div data-testid="trust-reports-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Trust Accounting"
            title="Trust reports"
            subtitle="Immutable read-only projections from trust services."
          />
        }
        table={
          <>
            <TrustSubNav active="reports" />
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[var(--color-muted-foreground)]">
                  Report type
                </span>
                <select
                  className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
                  value={selectedType}
                  onChange={(event) =>
                    setSelectedType(
                      event.target.value as (typeof TRUST_REPORT_TYPES)[number],
                    )
                  }
                  data-testid="trust-report-type-select"
                >
                  {TRUST_REPORT_TYPES.map((reportType) => (
                    <option key={reportType} value={reportType}>
                      {reportType}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="button" size="sm" onClick={handleGenerate}>
                Generate report
              </Button>
            </div>

            <LawInformationCard title="Generated reports">
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {reports.length} report(s) stored in memory for this session.
              </p>
            </LawInformationCard>

            {latestForType ? (
              <LawInformationCard title={`Latest ${selectedType} report`}>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleExportCsv}
                    data-testid="trust-report-export-csv"
                  >
                    Export CSV
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handlePrintView}
                    data-testid="trust-report-print-view"
                  >
                    Print View
                  </Button>
                </div>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Report ID</dt>
                    <dd className="font-mono text-xs">{latestForType.reportId}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Generated</dt>
                    <dd>{latestForType.generatedAt}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Transactions
                    </dt>
                    <dd>{latestForType.sourceCounts.transactions ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Transaction total
                    </dt>
                    <dd>
                      {latestForType.totals.transactionAmountTotal !== undefined
                        ? formatTrustAmount(latestForType.totals.transactionAmountTotal)
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </LawInformationCard>
            ) : (
              <LawInformationCard title="No report generated yet">
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Select a report type and generate a read model.
                </p>
              </LawInformationCard>
            )}
          </>
        }
      />
    </div>
  );
}
