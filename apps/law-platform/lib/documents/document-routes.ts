export const DOCUMENT_MODULE_BASE_ROUTE = "/workspace/law/documents";

export type DocumentRoute =
  | { readonly kind: "list" }
  | { readonly kind: "detail"; readonly documentId: string }
  | { readonly kind: "create" }
  | { readonly kind: "edit"; readonly documentId: string };

export function isDocumentModuleRoute(pathname: string): boolean {
  return (
    pathname === DOCUMENT_MODULE_BASE_ROUTE ||
    pathname.startsWith(`${DOCUMENT_MODULE_BASE_ROUTE}/`)
  );
}

export function parseDocumentRoute(pathname: string): DocumentRoute | null {
  if (!isDocumentModuleRoute(pathname)) {
    return null;
  }

  if (
    pathname === DOCUMENT_MODULE_BASE_ROUTE ||
    pathname === `${DOCUMENT_MODULE_BASE_ROUTE}/`
  ) {
    return { kind: "list" };
  }

  const suffix = pathname.slice(DOCUMENT_MODULE_BASE_ROUTE.length + 1);
  if (suffix === "new") {
    return { kind: "create" };
  }

  const segments = suffix.split("/").filter(Boolean);
  if (segments.length === 1) {
    return { kind: "detail", documentId: segments[0]! };
  }

  if (segments.length === 2 && segments[1] === "edit") {
    return { kind: "edit", documentId: segments[0]! };
  }

  return null;
}

export function documentDetailRoute(documentId: string): string {
  return `${DOCUMENT_MODULE_BASE_ROUTE}/${documentId}`;
}

export function documentEditRoute(documentId: string): string {
  return `${DOCUMENT_MODULE_BASE_ROUTE}/${documentId}/edit`;
}

export function documentCreateRoute(matterId?: string): string {
  if (!matterId) {
    return `${DOCUMENT_MODULE_BASE_ROUTE}/new`;
  }

  return `${DOCUMENT_MODULE_BASE_ROUTE}/new?matterId=${encodeURIComponent(matterId)}`;
}

export function documentListRoute(): string {
  return DOCUMENT_MODULE_BASE_ROUTE;
}
