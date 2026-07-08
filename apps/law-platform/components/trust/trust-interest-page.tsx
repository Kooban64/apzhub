"use client";

import { useMemo } from "react";

import {
  LawInformationCard,
  LawListPageLayout,
  LawPageHeader,
  LawStatusBadge,
} from "../ux";
import { LawListTableShell } from "../ux/data-table/law-list-table-shell";
import { useTrustWorkflow } from "../../lib/trust/trust-workflow-context";
import { formatTrustAmount, formatTrustDate } from "../../lib/trust/trust-format";
import { TrustSubNav } from "./trust-sub-nav";

const INTEREST_COLUMNS = [
  { id: "posting", header: "Posting", width: "10rem" },
  { id: "status", header: "Status", width: "8rem" },
  { id: "period", header: "Period", width: "14rem" },
  { id: "amount", header: "Interest", width: "10rem" },
  { id: "lines", header: "Lines", width: "6rem" },
] as const;

/** Trust interest view (LAW-015-09). */
export function TrustInterestPage() {
  const workflow = useTrustWorkflow();
  const bundle = workflow.getBundle();

  const rules = useMemo(
    () => bundle.interestService.listRules(bundle.tenantId, bundle.accountId),
    [bundle],
  );

  const postings = useMemo(
    () =>
      bundle.interestService.listPostings({
        tenantId: bundle.tenantId,
        trustAccountId: bundle.accountId,
      }),
    [bundle],
  );

  return (
    <div data-testid="trust-interest-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Trust Accounting"
            title="Trust interest"
            subtitle="Interest rules, accrual batches, and posting workflow."
          />
        }
        table={
          <>
            <TrustSubNav active="interest" />
            <LawInformationCard title="Interest rules">
              {rules.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  No interest rules configured.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {rules.map((rule) => (
                    <li key={rule.trustInterestRuleId}>
                      {rule.accrualMethod} · {rule.annualRatePercent}% · from{" "}
                      {formatTrustDate(rule.effectiveFrom)}
                    </li>
                  ))}
                </ul>
              )}
            </LawInformationCard>
            <LawListTableShell
              columns={INTEREST_COLUMNS}
              testId="trust-interest-table"
              isEmpty={postings.length === 0}
              emptyMessage="No interest postings."
            >
              {postings.map((posting) => (
                <tr
                  key={posting.trustInterestPostingId}
                  data-testid={`trust-interest-row-${posting.trustInterestPostingId}`}
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {posting.trustInterestPostingId}
                  </td>
                  <td className="px-4 py-3">
                    <LawStatusBadge status={posting.status} />
                  </td>
                  <td className="px-4 py-3">
                    {formatTrustDate(posting.periodStart)} –{" "}
                    {formatTrustDate(posting.periodEnd)}
                  </td>
                  <td className="px-4 py-3">
                    {formatTrustAmount(posting.totalInterestAmount, posting.currency)}
                  </td>
                  <td className="px-4 py-3">{posting.lineItems.length}</td>
                </tr>
              ))}
            </LawListTableShell>
          </>
        }
      />
    </div>
  );
}
