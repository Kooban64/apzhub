"use client";

import { Button } from "@apzhub/ui";
import { useMemo, useState } from "react";

import {
  LawInformationCard,
  LawListPageLayout,
  LawPageHeader,
  LawStatusBadge,
} from "../ux";
import { LawListTableShell } from "../ux/data-table/law-list-table-shell";
import { useTrustWorkflow } from "../../lib/trust/trust-workflow-context";
import { formatTrustDate } from "../../lib/trust/trust-format";
import { TrustSubNav } from "./trust-sub-nav";

const RECONCILIATION_COLUMNS = [
  { id: "run", header: "Run", width: "10rem" },
  { id: "status", header: "Status", width: "8rem" },
  { id: "started", header: "Started", width: "10rem" },
  { id: "completed", header: "Completed", width: "10rem" },
  { id: "warnings", header: "Warnings", width: "8rem" },
  { id: "errors", header: "Errors", width: "8rem" },
] as const;

/** Trust reconciliation view (LAW-015-09). */
export function TrustReconciliationPage() {
  const workflow = useTrustWorkflow();
  const bundle = workflow.getBundle();
  const [refreshKey, setRefreshKey] = useState(0);

  const runs = useMemo(
    () =>
      bundle.reconciliationService.listRuns({
        tenantId: bundle.tenantId,
        trustAccountId: bundle.accountId,
      }),
    [bundle, refreshKey],
  );

  const latest = runs[runs.length - 1];

  function handleRunReconciliation() {
    workflow.runReconciliation();
    setRefreshKey((value) => value + 1);
  }

  return (
    <div data-testid="trust-reconciliation-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Trust Accounting"
            title="Trust reconciliation"
            subtitle="Read-only ledger vs allocation integrity checks."
            primaryAction={
              <Button type="button" size="sm" onClick={handleRunReconciliation}>
                Run reconciliation
              </Button>
            }
          />
        }
        table={
          <>
            <TrustSubNav active="reconciliation" />
            {latest ? (
              <LawInformationCard title="Latest run summary">
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Status <LawStatusBadge status={latest.status} /> ·{" "}
                  {latest.variances.length} variance(s)
                </p>
              </LawInformationCard>
            ) : null}
            <LawListTableShell
              columns={RECONCILIATION_COLUMNS}
              testId="trust-reconciliation-table"
              isEmpty={runs.length === 0}
              emptyMessage="No reconciliation runs yet."
            >
              {runs.map((run) => (
                <tr
                  key={run.reconciliationId}
                  data-testid={`trust-reconciliation-row-${run.reconciliationId}`}
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {run.reconciliationId}
                  </td>
                  <td className="px-4 py-3">
                    <LawStatusBadge status={run.status} />
                  </td>
                  <td className="px-4 py-3">{formatTrustDate(run.startedAt)}</td>
                  <td className="px-4 py-3">
                    {run.completedAt ? formatTrustDate(run.completedAt) : "—"}
                  </td>
                  <td className="px-4 py-3">{run.warningCount}</td>
                  <td className="px-4 py-3">{run.errorCount}</td>
                </tr>
              ))}
            </LawListTableShell>
          </>
        }
      />
    </div>
  );
}
