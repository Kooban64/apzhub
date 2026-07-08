"use client";

import { useSearchParams } from "next/navigation";

import { DocumentDetailPage } from "./document-detail-page";
import { DocumentFormPage } from "./document-form-page";
import { DocumentListPage } from "./document-list-page";
import { parseDocumentRoute } from "../../lib/documents";

export interface DocumentManagementRouterProps {
  readonly pathname: string;
  readonly initialSearchQuery?: string;
}

/** Routes Document Management screens from the workbench pathname (LAW-004-01). */
export function DocumentManagementRouter({
  pathname,
  initialSearchQuery,
}: DocumentManagementRouterProps) {
  const searchParams = useSearchParams();
  const route = parseDocumentRoute(pathname);

  if (!route) {
    return <DocumentListPage />;
  }

  switch (route.kind) {
    case "list":
      return <DocumentListPage initialQuery={initialSearchQuery} />;
    case "detail":
      return <DocumentDetailPage documentId={route.documentId} />;
    case "create":
      return (
        <DocumentFormPage
          mode="create"
          initialMatterId={searchParams.get("matterId") ?? undefined}
        />
      );
    case "edit":
      return <DocumentFormPage mode="edit" documentId={route.documentId} />;
    default: {
      const exhaustive: never = route;
      return exhaustive;
    }
  }
}
