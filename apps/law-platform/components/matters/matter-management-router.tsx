"use client";

import { MatterDetailPage } from "./matter-detail-page";
import { MatterFormPage } from "./matter-form-page";
import { MatterListPage } from "./matter-list-page";
import { MatterWorkspacePage } from "./matter-workspace-page";
import { parseMatterRoute } from "../../lib/matters";

export interface MatterManagementRouterProps {
  readonly pathname: string;
  readonly initialSearchQuery?: string;
}

/** Routes Matter Management screens from the workbench pathname (LAW-003-01). */
export function MatterManagementRouter({
  pathname,
  initialSearchQuery,
}: MatterManagementRouterProps) {
  const route = parseMatterRoute(pathname);

  if (!route) {
    return <MatterListPage />;
  }

  switch (route.kind) {
    case "list":
      return <MatterListPage initialQuery={initialSearchQuery} />;
    case "detail":
      return <MatterDetailPage matterId={route.matterId} />;
    case "workspace":
      return <MatterWorkspacePage matterId={route.matterId} />;
    case "create":
      return <MatterFormPage mode="create" />;
    case "edit":
      return <MatterFormPage mode="edit" matterId={route.matterId} />;
    default: {
      const exhaustive: never = route;
      return exhaustive;
    }
  }
}
