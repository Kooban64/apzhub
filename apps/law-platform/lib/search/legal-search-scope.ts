import { clientDetailRoute, parseClientRoute } from "../clients/client-routes";
import { matterDetailRoute, parseMatterRoute } from "../matters/matter-routes";

export interface LegalSearchScope {
  readonly matterId?: string;
  readonly clientId?: string;
  readonly label?: string;
}

/** Resolve context-scoped search from the active workbench route (LAW-007-02). */
export function resolveLegalSearchScopeFromPathname(
  pathname: string,
): LegalSearchScope | undefined {
  const matterRoute = parseMatterRoute(pathname);
  if (matterRoute?.kind === "detail" || matterRoute?.kind === "workspace") {
    return {
      matterId: matterRoute.matterId,
      label: `Matter ${matterRoute.matterId}`,
    };
  }

  const clientRoute = parseClientRoute(pathname);
  if (clientRoute?.kind === "detail") {
    return {
      clientId: clientRoute.clientId,
      label: `Client ${clientRoute.clientId}`,
    };
  }

  if (pathname.includes("/matters/") && !pathname.endsWith("/matters")) {
    const matterId = pathname.split("/matters/")[1]?.split("/")[0];
    if (matterId) {
      return { matterId, label: `Matter ${matterId}` };
    }
  }

  if (pathname.includes("/clients/") && !pathname.endsWith("/clients")) {
    const clientId = pathname.split("/clients/")[1]?.split("/")[0];
    if (clientId) {
      return { clientId, label: `Client ${clientId}` };
    }
  }

  return undefined;
}

export function buildScopedSearchRouteHint(scope: LegalSearchScope): string {
  if (scope.matterId) {
    return matterDetailRoute(scope.matterId);
  }

  if (scope.clientId) {
    return clientDetailRoute(scope.clientId);
  }

  return "";
}
