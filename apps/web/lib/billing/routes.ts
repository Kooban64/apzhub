export const BILLING_WORKSPACE_BASE = "/workspace/billing" as const;

export function isBillingRoute(pathname: string): boolean {
  return (
    pathname === BILLING_WORKSPACE_BASE ||
    pathname.startsWith(`${BILLING_WORKSPACE_BASE}/`)
  );
}
