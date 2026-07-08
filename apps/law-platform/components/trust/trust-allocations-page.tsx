"use client";

import { useMemo } from "react";

import { LawListPageLayout, LawPageHeader, LawStatusBadge } from "../ux";
import { LawListTableShell } from "../ux/data-table/law-list-table-shell";
import { useTrustWorkflow } from "../../lib/trust/trust-workflow-context";
import { formatTrustAmount, formatTrustDate } from "../../lib/trust/trust-format";
import { TrustSubNav } from "./trust-sub-nav";

const ALLOCATION_COLUMNS = [
  { id: "allocation", header: "Allocation", width: "10rem" },
  { id: "transaction", header: "Transaction", width: "10rem" },
  { id: "client", header: "Client", width: "8rem" },
  { id: "matter", header: "Matter", width: "8rem" },
  { id: "type", header: "Type", width: "8rem" },
  { id: "effect", header: "Effect", width: "8rem" },
  { id: "amount", header: "Amount", width: "10rem" },
  { id: "date", header: "Date", width: "8rem" },
] as const;

/** Trust allocations list view (LAW-015-09). */
export function TrustAllocationsPage() {
  const workflow = useTrustWorkflow();
  const bundle = workflow.getBundle();

  const allocations = useMemo(
    () =>
      bundle.allocationService.getAllocationHistory({
        tenantId: bundle.tenantId,
        trustAccountId: bundle.accountId,
      }),
    [bundle],
  );

  return (
    <div data-testid="trust-allocations-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Trust Accounting"
            title="Trust allocations"
            subtitle="Append-only client and matter sub-ledger allocations."
          />
        }
        table={
          <>
            <TrustSubNav active="allocations" />
            <LawListTableShell
              columns={ALLOCATION_COLUMNS}
              testId="trust-allocations-table"
              isEmpty={allocations.length === 0}
              emptyMessage="No allocations recorded."
            >
              {allocations.map((allocation) => (
                <tr
                  key={allocation.trustAllocationId}
                  data-testid={`trust-allocation-row-${allocation.trustAllocationId}`}
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {allocation.trustAllocationId}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {allocation.trustTransactionId}
                  </td>
                  <td className="px-4 py-3">{allocation.clientId}</td>
                  <td className="px-4 py-3">{allocation.matterId ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{allocation.allocationType}</td>
                  <td className="px-4 py-3">
                    <LawStatusBadge status={allocation.effect} tone="info" />
                  </td>
                  <td className="px-4 py-3">
                    {formatTrustAmount(allocation.amount, allocation.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {formatTrustDate(allocation.allocationDate)}
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
