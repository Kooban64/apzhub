export const CLIENT_MODULE_BASE_ROUTE = "/workspace/law/clients";

export type ClientRoute =
  | { readonly kind: "list" }
  | { readonly kind: "detail"; readonly clientId: string }
  | { readonly kind: "create" }
  | { readonly kind: "edit"; readonly clientId: string };

export function isClientModuleRoute(pathname: string): boolean {
  return (
    pathname === CLIENT_MODULE_BASE_ROUTE ||
    pathname.startsWith(`${CLIENT_MODULE_BASE_ROUTE}/`)
  );
}

export function parseClientRoute(pathname: string): ClientRoute | null {
  if (!isClientModuleRoute(pathname)) {
    return null;
  }

  if (
    pathname === CLIENT_MODULE_BASE_ROUTE ||
    pathname === `${CLIENT_MODULE_BASE_ROUTE}/`
  ) {
    return { kind: "list" };
  }

  const suffix = pathname.slice(CLIENT_MODULE_BASE_ROUTE.length + 1);
  if (suffix === "new") {
    return { kind: "create" };
  }

  const segments = suffix.split("/").filter(Boolean);
  if (segments.length === 1) {
    return { kind: "detail", clientId: segments[0]! };
  }

  if (segments.length === 2 && segments[1] === "edit") {
    return { kind: "edit", clientId: segments[0]! };
  }

  return null;
}

export function clientDetailRoute(clientId: string): string {
  return `${CLIENT_MODULE_BASE_ROUTE}/${clientId}`;
}

export function clientEditRoute(clientId: string): string {
  return `${CLIENT_MODULE_BASE_ROUTE}/${clientId}/edit`;
}

export function clientCreateRoute(): string {
  return `${CLIENT_MODULE_BASE_ROUTE}/new`;
}

export function clientListRoute(): string {
  return CLIENT_MODULE_BASE_ROUTE;
}
