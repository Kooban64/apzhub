import type { LaunchDecisionResult } from "@/lib/launch/launch-decision";

type LaunchNavigation = {
  push: (href: string) => void;
  /** Mock external open — no credential payload (Phase 7). */
  openExternal: (href: string) => void;
};

/**
 * Applies a **ready** launch decision. Caller must have shown loading and verified `allowed`.
 */
export function executeWorkspaceLaunch(decision: LaunchDecisionResult, nav: LaunchNavigation): void {
  if (!decision.allowed || !decision.target) {
    return;
  }
  const t = decision.target;
  switch (t.kind) {
    case "oidc_redirect":
      nav.push(t.href);
      return;
    case "jwt_internal":
      nav.push(t.appRoute);
      return;
    case "vault_delegated": {
      const q = new URLSearchParams({
        delegationRequestId: t.delegationRequestId,
        service: decision.serviceId,
      });
      nav.push(`/workspace/launch/mock-vault?${q.toString()}`);
      return;
    }
    case "external_redirect":
      nav.openExternal(t.href);
      return;
  }
}
