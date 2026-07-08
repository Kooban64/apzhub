"use client";

import { ClientDetailPage } from "./client-detail-page";
import { ClientFormPage } from "./client-form-page";
import { ClientListPage } from "./client-list-page";
import { parseClientRoute } from "../../lib/clients";

export interface ClientManagementRouterProps {
  readonly pathname: string;
  readonly initialSearchQuery?: string;
}

/** Routes Client Management screens from the workbench pathname (LAW-002-01). */
export function ClientManagementRouter({
  pathname,
  initialSearchQuery,
}: ClientManagementRouterProps) {
  const route = parseClientRoute(pathname);

  if (!route) {
    return <ClientListPage />;
  }

  switch (route.kind) {
    case "list":
      return <ClientListPage initialQuery={initialSearchQuery} />;
    case "detail":
      return <ClientDetailPage clientId={route.clientId} />;
    case "create":
      return <ClientFormPage mode="create" />;
    case "edit":
      return <ClientFormPage mode="edit" clientId={route.clientId} />;
    default: {
      const exhaustive: never = route;
      return exhaustive;
    }
  }
}
