"use client";

import { useSearchParams } from "next/navigation";

import { InvoiceDetailPage } from "./invoice-detail-page";
import { InvoiceFormPage } from "./invoice-form-page";
import { InvoiceListPage } from "./invoice-list-page";
import { InvoicePreviewPage } from "./invoice-preview-page";
import { parseInvoiceRoute } from "../../lib/billing";

export interface InvoiceManagementRouterProps {
  readonly pathname: string;
  readonly initialSearchQuery?: string;
}

export function InvoiceManagementRouter({
  pathname,
  initialSearchQuery,
}: InvoiceManagementRouterProps) {
  const searchParams = useSearchParams();
  const route = parseInvoiceRoute(pathname);

  if (!route) {
    return <InvoiceListPage />;
  }

  switch (route.kind) {
    case "list":
      return <InvoiceListPage initialQuery={initialSearchQuery} />;
    case "detail":
      return <InvoiceDetailPage invoiceId={route.invoiceId} />;
    case "create":
      return (
        <InvoiceFormPage
          mode="create"
          initialMatterId={searchParams.get("matterId") ?? undefined}
          initialClientId={searchParams.get("clientId") ?? undefined}
        />
      );
    case "edit":
      return <InvoiceFormPage mode="edit" invoiceId={route.invoiceId} />;
    case "preview":
      return <InvoicePreviewPage invoiceId={route.invoiceId} />;
    default: {
      const exhaustive: never = route;
      return exhaustive;
    }
  }
}
