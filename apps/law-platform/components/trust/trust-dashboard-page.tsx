"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import {
  LawInformationCard,
  LawLinkList,
  LawPageHeader,
  LawQuickActionsCard,
  LawStatisticsCard,
  LawWorkspaceLayout,
  lawUxTokens,
} from "../ux";
import { useTrustWorkflow } from "../../lib/trust/trust-workflow-context";
import { formatTrustAmount } from "../../lib/trust/trust-format";
import { TrustDiagnosticsPanel } from "./trust-diagnostics-panel";
import { TrustSubNav } from "./trust-sub-nav";

/** Trust Accounting dashboard — firm trust overview (LAW-015-09). */
export function TrustDashboardPage() {
  const router = useRouter();
  const workflow = useTrustWorkflow();
  const snapshot = useMemo(() => workflow.getDashboardSnapshot(), [workflow]);

  return (
    <div data-testid="trust-dashboard-page">
      <LawWorkspaceLayout
        header={
          <LawPageHeader
            eyebrow="Trust Accounting"
            title="Trust dashboard"
            subtitle="Regulated client funds — in-memory trust engine only."
          />
        }
      >
        <TrustSubNav active="dashboard" />

        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          data-testid="trust-dashboard-metrics"
        >
          <LawStatisticsCard
            label="Total trust balance"
            value={formatTrustAmount(snapshot.totalTrustBalance, snapshot.currency)}
          />
          <LawStatisticsCard
            label="Pending drafts"
            value={String(snapshot.pendingDraftCount)}
            hint="Awaiting validation or post"
          />
          <LawStatisticsCard
            label="Reconciliation"
            value={snapshot.reconciliationStatus}
            hint={
              snapshot.lastReconciliationAt
                ? `Last run ${snapshot.lastReconciliationAt}`
                : "Not run"
            }
          />
          <LawStatisticsCard
            label="Interest pending"
            value={String(snapshot.interestPendingCount)}
            hint="Draft or approved postings"
          />
          <LawStatisticsCard
            label="Posted transfers"
            value={String(snapshot.transferCount)}
          />
          <LawStatisticsCard
            label="Transfer total"
            value={formatTrustAmount(snapshot.transferTotal, snapshot.currency)}
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <LawInformationCard title="Matter trust balances">
            {snapshot.matterBalances.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No matter balances.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.matterBalances.map((item) => (
                  <li key={item.matterId} className="flex justify-between gap-4">
                    <span>{item.matterId}</span>
                    <span>{formatTrustAmount(item.amount, snapshot.currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </LawInformationCard>

          <LawInformationCard title="Client trust balances">
            {snapshot.clientBalances.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No client balances.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.clientBalances.map((item) => (
                  <li key={item.clientId} className="flex justify-between gap-4">
                    <span>{item.clientId}</span>
                    <span>{formatTrustAmount(item.amount, snapshot.currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </LawInformationCard>
        </div>

        <LawLinkList
          items={snapshot.recentTransactions}
          emptyLabel="No trust transactions posted."
          testId="trust-recent-transactions"
        />

        <LawQuickActionsCard
          title="Report shortcuts"
          actions={snapshot.reportShortcuts.map((item) => (
            <Button
              key={item.reportType}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push(item.route)}
            >
              {item.label}
            </Button>
          ))}
        />

        <LawQuickActionsCard
          title="Trust views"
          actions={snapshot.quickActions.map((action) => (
            <Button
              key={action.route}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push(action.route)}
            >
              {action.title}
            </Button>
          ))}
        />

        <section
          className={`${lawUxTokens.surface} border p-4`}
          data-testid="trust-compliance-placeholder"
        >
          <p className={lawUxTokens.label}>Compliance alerts</p>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            {snapshot.complianceAlertPlaceholder}
          </p>
        </section>

        <TrustDiagnosticsPanel />
      </LawWorkspaceLayout>
    </div>
  );
}
