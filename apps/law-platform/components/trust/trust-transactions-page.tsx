"use client";

import { useEffect, useMemo, useState } from "react";

import {
  LawFilterBar,
  LawListPageLayout,
  LawPageHeader,
  LawSearchBar,
  LawStatusBadge,
  LawTableLoadingSkeleton,
} from "../ux";
import { LawListTableShell } from "../ux/data-table/law-list-table-shell";
import { useTrustWorkflow } from "../../lib/trust/trust-workflow-context";
import { formatTrustAmount, formatTrustDate } from "../../lib/trust/trust-format";
import { TrustSubNav } from "./trust-sub-nav";

const TRANSACTION_COLUMNS = [
  { id: "reference", header: "Reference", width: "10rem" },
  { id: "type", header: "Type", width: "8rem" },
  { id: "client", header: "Client", width: "8rem" },
  { id: "matter", header: "Matter", width: "8rem" },
  { id: "amount", header: "Amount", width: "10rem" },
  { id: "date", header: "Posted", width: "8rem" },
  { id: "status", header: "Status", width: "8rem" },
] as const;

export interface TrustTransactionsPageProps {
  readonly initialQuery?: string;
}

/** Trust transactions list view (LAW-015-09). */
export function TrustTransactionsPage({
  initialQuery = "",
}: TrustTransactionsPageProps) {
  const workflow = useTrustWorkflow();
  const bundle = workflow.getBundle();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 200);
    return () => window.clearTimeout(timer);
  }, []);

  const transactions = useMemo(() => {
    const items = bundle.ledgerService.listTransactions(
      bundle.tenantId,
      bundle.accountId,
    );
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items;
    }

    return items.filter(
      (transaction) =>
        transaction.transactionReference.toLowerCase().includes(normalized) ||
        transaction.narrative.toLowerCase().includes(normalized) ||
        transaction.trustTransactionType.toLowerCase().includes(normalized),
    );
  }, [bundle, query]);

  return (
    <div data-testid="trust-transactions-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Trust Accounting"
            title="Trust transactions"
            subtitle="Posted trust movements from the immutable ledger."
          />
        }
        searchArea={
          <LawSearchBar
            placeholder="Search by reference, type, or narrative…"
            value={query}
            onChange={setQuery}
          />
        }
        filtersArea={
          <LawFilterBar label="Transaction filters">
            <span className="text-sm text-[var(--color-muted-foreground)]">
              {transactions.length} transaction(s)
            </span>
          </LawFilterBar>
        }
        state={loading ? <LawTableLoadingSkeleton /> : null}
        table={
          <>
            <TrustSubNav active="transactions" />
            <LawListTableShell
              columns={TRANSACTION_COLUMNS}
              testId="trust-transactions-table"
              isEmpty={!loading && transactions.length === 0}
              emptyMessage="No trust transactions match the current filters."
            >
              {transactions.map((transaction) => (
                <tr
                  key={transaction.trustTransactionId}
                  data-testid={`trust-transaction-row-${transaction.trustTransactionId}`}
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {transaction.transactionReference}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {transaction.trustTransactionType}
                  </td>
                  <td className="px-4 py-3">{transaction.clientId}</td>
                  <td className="px-4 py-3">{transaction.matterId ?? "—"}</td>
                  <td className="px-4 py-3">
                    {formatTrustAmount(transaction.amount, transaction.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {formatTrustDate(transaction.postingDate)}
                  </td>
                  <td className="px-4 py-3">
                    <LawStatusBadge status={transaction.status} />
                  </td>
                </tr>
              ))}
            </LawListTableShell>
          </>
        }
      />
    </div>
  );
}
