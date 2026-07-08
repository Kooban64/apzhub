export const TRUST_MODULE_BASE_ROUTE = "/workspace/law/trust";

export type TrustRouteKind =
  | "dashboard"
  | "accounts"
  | "transactions"
  | "allocations"
  | "reconciliation"
  | "interest"
  | "transfers"
  | "reports";

export type TrustRoute = { readonly kind: TrustRouteKind };

export function isTrustModuleRoute(pathname: string): boolean {
  return (
    pathname === TRUST_MODULE_BASE_ROUTE ||
    pathname.startsWith(`${TRUST_MODULE_BASE_ROUTE}/`)
  );
}

export function parseTrustRoute(pathname: string): TrustRoute | null {
  if (!isTrustModuleRoute(pathname)) {
    return null;
  }

  if (
    pathname === TRUST_MODULE_BASE_ROUTE ||
    pathname === `${TRUST_MODULE_BASE_ROUTE}/`
  ) {
    return { kind: "dashboard" };
  }

  const suffix = pathname
    .slice(TRUST_MODULE_BASE_ROUTE.length + 1)
    .split("/")
    .filter(Boolean)[0];

  switch (suffix) {
    case "accounts":
      return { kind: "accounts" };
    case "transactions":
      return { kind: "transactions" };
    case "allocations":
      return { kind: "allocations" };
    case "reconciliation":
      return { kind: "reconciliation" };
    case "interest":
      return { kind: "interest" };
    case "transfers":
      return { kind: "transfers" };
    case "reports":
      return { kind: "reports" };
    default:
      return { kind: "dashboard" };
  }
}

export function trustDashboardRoute(): string {
  return TRUST_MODULE_BASE_ROUTE;
}

export function trustAccountsRoute(): string {
  return `${TRUST_MODULE_BASE_ROUTE}/accounts`;
}

export function trustTransactionsRoute(): string {
  return `${TRUST_MODULE_BASE_ROUTE}/transactions`;
}

export function trustAllocationsRoute(): string {
  return `${TRUST_MODULE_BASE_ROUTE}/allocations`;
}

export function trustReconciliationRoute(): string {
  return `${TRUST_MODULE_BASE_ROUTE}/reconciliation`;
}

export function trustInterestRoute(): string {
  return `${TRUST_MODULE_BASE_ROUTE}/interest`;
}

export function trustTransfersRoute(): string {
  return `${TRUST_MODULE_BASE_ROUTE}/transfers`;
}

export function trustReportsRoute(): string {
  return `${TRUST_MODULE_BASE_ROUTE}/reports`;
}

export const TRUST_SUB_ROUTES: readonly {
  readonly kind: TrustRouteKind;
  readonly label: string;
  readonly route: string;
}[] = [
  { kind: "dashboard", label: "Dashboard", route: trustDashboardRoute() },
  { kind: "accounts", label: "Accounts", route: trustAccountsRoute() },
  { kind: "transactions", label: "Transactions", route: trustTransactionsRoute() },
  { kind: "allocations", label: "Allocations", route: trustAllocationsRoute() },
  {
    kind: "reconciliation",
    label: "Reconciliation",
    route: trustReconciliationRoute(),
  },
  { kind: "interest", label: "Interest", route: trustInterestRoute() },
  { kind: "transfers", label: "Transfers", route: trustTransfersRoute() },
  { kind: "reports", label: "Reports", route: trustReportsRoute() },
];
