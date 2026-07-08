"use client";

import { useSearchParams } from "next/navigation";

import { LegalSearchPage } from "./legal-search-page";
import {
  isLegalSearchModuleRoute,
  parseLegalSearchRouteSearchParams,
  type LegalSearchScope,
} from "../../lib/search";

export interface LegalSearchManagementRouterProps {
  readonly pathname: string;
  readonly initialSearchQuery?: string;
  readonly initialScope?: LegalSearchScope;
}

/** Routes unified Legal Search screens from the workbench pathname (LAW-007-01 / LAW-007-02). */
export function LegalSearchManagementRouter({
  pathname,
  initialSearchQuery,
  initialScope,
}: LegalSearchManagementRouterProps) {
  const searchParams = useSearchParams();

  if (!isLegalSearchModuleRoute(pathname)) {
    return null;
  }

  const routeParams = parseLegalSearchRouteSearchParams(searchParams);

  return (
    <LegalSearchPage
      initialQuery={initialSearchQuery ?? routeParams.query}
      initialFilters={routeParams.filters}
      initialScope={initialScope}
    />
  );
}
