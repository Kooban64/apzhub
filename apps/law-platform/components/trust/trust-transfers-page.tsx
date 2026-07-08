"use client";

import { useMemo } from "react";

import { LawListPageLayout, LawPageHeader, LawStatusBadge } from "../ux";
import { LawListTableShell } from "../ux/data-table/law-list-table-shell";
import { useTrustWorkflow } from "../../lib/trust/trust-workflow-context";
import { formatTrustAmount, formatTrustDate } from "../../lib/trust/trust-format";
import { TrustSubNav } from "./trust-sub-nav";

const TRANSFER_COLUMNS = [
  { id: "transfer", header: "Transfer", width: "10rem" },
  { id: "type", header: "Type", width: "10rem" },
  { id: "status", header: "Status", width: "8rem" },
  { id: "amount", header: "Amount", width: "10rem" },
  { id: "source", header: "Source matter", width: "10rem" },
  { id: "destination", header: "Dest matter", width: "10rem" },
  { id: "created", header: "Created", width: "10rem" },
] as const;

/** Trust transfers list view (LAW-015-09). */
export function TrustTransfersPage() {
  const workflow = useTrustWorkflow();
  const bundle = workflow.getBundle();

  const transfers = useMemo(
    () =>
      bundle.transferService.listTransfers({
        tenantId: bundle.tenantId,
        trustAccountId: bundle.accountId,
      }),
    [bundle],
  );

  return (
    <div data-testid="trust-transfers-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Trust Accounting"
            title="Trust transfers"
            subtitle="Controlled fund movement via paired ledger postings."
          />
        }
        table={
          <>
            <TrustSubNav active="transfers" />
            <LawListTableShell
              columns={TRANSFER_COLUMNS}
              testId="trust-transfers-table"
              isEmpty={transfers.length === 0}
              emptyMessage="No trust transfers recorded."
            >
              {transfers.map((transfer) => (
                <tr
                  key={transfer.trustTransferId}
                  data-testid={`trust-transfer-row-${transfer.trustTransferId}`}
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {transfer.trustTransferId}
                  </td>
                  <td className="px-4 py-3">{transfer.transferType}</td>
                  <td className="px-4 py-3">
                    <LawStatusBadge status={transfer.status} />
                  </td>
                  <td className="px-4 py-3">
                    {formatTrustAmount(transfer.amount, transfer.currency)}
                  </td>
                  <td className="px-4 py-3">{transfer.sourceMatterId ?? "—"}</td>
                  <td className="px-4 py-3">{transfer.destinationMatterId ?? "—"}</td>
                  <td className="px-4 py-3">{formatTrustDate(transfer.createdAt)}</td>
                </tr>
              ))}
            </LawListTableShell>
          </>
        }
      />
    </div>
  );
}
