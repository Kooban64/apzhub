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
import { TrustDiagnosticsPanel } from "./trust-diagnostics-panel";
import { TrustSubNav } from "./trust-sub-nav";

const ACCOUNT_COLUMNS = [
  { id: "code", header: "Code", width: "8rem" },
  { id: "name", header: "Account", width: "12rem" },
  { id: "institution", header: "Institution" },
  { id: "currency", header: "Currency", width: "6rem" },
  { id: "balance", header: "Balance", width: "10rem" },
  { id: "status", header: "Status", width: "8rem" },
] as const;

/** Trust accounts list view (LAW-015-09). */
export function TrustAccountsPage() {
  const workflow = useTrustWorkflow();
  const bundle = workflow.getBundle();
  const accounts = useMemo(
    () => bundle.ledgerService.listAccounts(bundle.tenantId),
    [bundle],
  );

  return (
    <div data-testid="trust-accounts-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Trust Accounting"
            title="Trust accounts"
            subtitle="Regulated trust bank accounts for client funds."
          />
        }
        table={
          <>
            <TrustSubNav active="accounts" />
            <LawListTableShell
              columns={ACCOUNT_COLUMNS}
              testId="trust-accounts-table"
              isEmpty={accounts.length === 0}
              emptyMessage="No trust accounts opened."
            >
              {accounts.map((account) => {
                const balances = bundle.ledgerService.getBalances(
                  bundle.tenantId,
                  account.trustAccountId,
                );
                const accountBalance =
                  balances.find((item) => item.scope === "account")?.balanceAmount ?? 0;

                return (
                  <tr
                    key={account.trustAccountId}
                    data-testid={`trust-account-row-${account.trustAccountId}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {account.trustAccountCode}
                    </td>
                    <td className="px-4 py-3">{account.name}</td>
                    <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
                      {account.institutionName} · {account.accountNumberMasked}
                    </td>
                    <td className="px-4 py-3">{account.currency}</td>
                    <td className="px-4 py-3">
                      {formatTrustAmount(accountBalance, account.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <LawStatusBadge
                        status={account.isActive ? "active" : "archived"}
                      />
                    </td>
                  </tr>
                );
              })}
            </LawListTableShell>
            <div className="mt-6">
              <LawInformationCard title="Account summary">
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {accounts.length} trust account(s) · opened{" "}
                  {accounts[0] ? formatTrustDate(accounts[0].openedAt) : "—"}
                </p>
              </LawInformationCard>
              <TrustDiagnosticsPanel compact />
            </div>
          </>
        }
      />
    </div>
  );
}
