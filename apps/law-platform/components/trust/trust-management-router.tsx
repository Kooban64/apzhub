"use client";

import { TrustAccountsPage } from "./trust-accounts-page";
import { TrustAllocationsPage } from "./trust-allocations-page";
import { TrustDashboardPage } from "./trust-dashboard-page";
import { TrustInterestPage } from "./trust-interest-page";
import { TrustReconciliationPage } from "./trust-reconciliation-page";
import { TrustReportsPage } from "./trust-reports-page";
import { TrustTransactionsPage } from "./trust-transactions-page";
import { TrustTransfersPage } from "./trust-transfers-page";
import { parseTrustRoute } from "../../lib/trust/trust-routes";

export interface TrustManagementRouterProps {
  readonly pathname: string;
  readonly initialSearchQuery?: string;
}

/** Client-side router for Trust Accounting workbench views (LAW-015-09). */
export function TrustManagementRouter({
  pathname,
  initialSearchQuery,
}: TrustManagementRouterProps) {
  const route = parseTrustRoute(pathname);

  switch (route?.kind) {
    case "accounts":
      return <TrustAccountsPage />;
    case "transactions":
      return <TrustTransactionsPage initialQuery={initialSearchQuery} />;
    case "allocations":
      return <TrustAllocationsPage />;
    case "reconciliation":
      return <TrustReconciliationPage />;
    case "interest":
      return <TrustInterestPage />;
    case "transfers":
      return <TrustTransfersPage />;
    case "reports":
      return <TrustReportsPage />;
    case "dashboard":
    default:
      return <TrustDashboardPage />;
  }
}
