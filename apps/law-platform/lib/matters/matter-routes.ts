export const MATTER_MODULE_BASE_ROUTE = "/workspace/law/matters";

export type MatterRoute =
  | { readonly kind: "list" }
  | { readonly kind: "detail"; readonly matterId: string }
  | { readonly kind: "workspace"; readonly matterId: string }
  | { readonly kind: "create" }
  | { readonly kind: "edit"; readonly matterId: string };

export function isMatterModuleRoute(pathname: string): boolean {
  return (
    pathname === MATTER_MODULE_BASE_ROUTE ||
    pathname.startsWith(`${MATTER_MODULE_BASE_ROUTE}/`)
  );
}

export function parseMatterRoute(pathname: string): MatterRoute | null {
  if (!isMatterModuleRoute(pathname)) {
    return null;
  }

  if (
    pathname === MATTER_MODULE_BASE_ROUTE ||
    pathname === `${MATTER_MODULE_BASE_ROUTE}/`
  ) {
    return { kind: "list" };
  }

  const suffix = pathname.slice(MATTER_MODULE_BASE_ROUTE.length + 1);
  if (suffix === "new") {
    return { kind: "create" };
  }

  const segments = suffix.split("/").filter(Boolean);
  if (segments.length === 1) {
    return { kind: "detail", matterId: segments[0]! };
  }

  if (segments.length === 2 && segments[1] === "edit") {
    return { kind: "edit", matterId: segments[0]! };
  }

  if (segments.length === 2 && segments[1] === "workspace") {
    return { kind: "workspace", matterId: segments[0]! };
  }

  return null;
}

export function matterDetailRoute(matterId: string): string {
  return `${MATTER_MODULE_BASE_ROUTE}/${matterId}`;
}

export function matterWorkspaceRoute(matterId: string): string {
  return `${MATTER_MODULE_BASE_ROUTE}/${matterId}/workspace`;
}

export function matterEditRoute(matterId: string): string {
  return `${MATTER_MODULE_BASE_ROUTE}/${matterId}/edit`;
}

export function matterCreateRoute(): string {
  return `${MATTER_MODULE_BASE_ROUTE}/new`;
}

export function matterListRoute(): string {
  return MATTER_MODULE_BASE_ROUTE;
}
