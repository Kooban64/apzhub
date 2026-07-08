export const INVOICE_MODULE_BASE_ROUTE = "/workspace/law/billing";

export type InvoiceRoute =
  | { readonly kind: "list" }
  | { readonly kind: "detail"; readonly invoiceId: string }
  | { readonly kind: "create" }
  | { readonly kind: "edit"; readonly invoiceId: string }
  | { readonly kind: "preview"; readonly invoiceId: string };

export function isInvoiceModuleRoute(pathname: string): boolean {
  return (
    pathname === INVOICE_MODULE_BASE_ROUTE ||
    pathname.startsWith(`${INVOICE_MODULE_BASE_ROUTE}/`)
  );
}

export function parseInvoiceRoute(pathname: string): InvoiceRoute | null {
  if (!isInvoiceModuleRoute(pathname)) {
    return null;
  }

  if (
    pathname === INVOICE_MODULE_BASE_ROUTE ||
    pathname === `${INVOICE_MODULE_BASE_ROUTE}/`
  ) {
    return { kind: "list" };
  }

  const suffix = pathname.slice(INVOICE_MODULE_BASE_ROUTE.length + 1);
  if (suffix === "new") {
    return { kind: "create" };
  }

  const segments = suffix.split("/").filter(Boolean);
  if (segments.length === 1) {
    return { kind: "detail", invoiceId: segments[0]! };
  }

  if (segments.length === 2 && segments[1] === "edit") {
    return { kind: "edit", invoiceId: segments[0]! };
  }

  if (segments.length === 2 && segments[1] === "preview") {
    return { kind: "preview", invoiceId: segments[0]! };
  }

  return null;
}

export function invoiceDetailRoute(invoiceId: string): string {
  return `${INVOICE_MODULE_BASE_ROUTE}/${invoiceId}`;
}

export function invoiceEditRoute(invoiceId: string): string {
  return `${INVOICE_MODULE_BASE_ROUTE}/${invoiceId}/edit`;
}

export function invoicePreviewRoute(invoiceId: string): string {
  return `${INVOICE_MODULE_BASE_ROUTE}/${invoiceId}/preview`;
}

export function invoiceCreateRoute(matterId?: string, clientId?: string): string {
  const params = new URLSearchParams();
  if (matterId) {
    params.set("matterId", matterId);
  }
  if (clientId) {
    params.set("clientId", clientId);
  }

  const query = params.toString();
  return query
    ? `${INVOICE_MODULE_BASE_ROUTE}/new?${query}`
    : `${INVOICE_MODULE_BASE_ROUTE}/new`;
}

export function invoiceListRoute(): string {
  return INVOICE_MODULE_BASE_ROUTE;
}
