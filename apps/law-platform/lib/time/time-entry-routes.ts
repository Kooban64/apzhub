export const TIME_ENTRY_MODULE_BASE_ROUTE = "/workspace/law/time";

export type TimeEntryRoute =
  | { readonly kind: "list" }
  | { readonly kind: "detail"; readonly timeEntryId: string }
  | { readonly kind: "create" }
  | { readonly kind: "edit"; readonly timeEntryId: string };

export function isTimeEntryModuleRoute(pathname: string): boolean {
  return (
    pathname === TIME_ENTRY_MODULE_BASE_ROUTE ||
    pathname.startsWith(`${TIME_ENTRY_MODULE_BASE_ROUTE}/`)
  );
}

export function parseTimeEntryRoute(pathname: string): TimeEntryRoute | null {
  if (!isTimeEntryModuleRoute(pathname)) {
    return null;
  }

  if (
    pathname === TIME_ENTRY_MODULE_BASE_ROUTE ||
    pathname === `${TIME_ENTRY_MODULE_BASE_ROUTE}/`
  ) {
    return { kind: "list" };
  }

  const suffix = pathname.slice(TIME_ENTRY_MODULE_BASE_ROUTE.length + 1);
  if (suffix === "new") {
    return { kind: "create" };
  }

  const segments = suffix.split("/").filter(Boolean);
  if (segments.length === 1) {
    return { kind: "detail", timeEntryId: segments[0]! };
  }

  if (segments.length === 2 && segments[1] === "edit") {
    return { kind: "edit", timeEntryId: segments[0]! };
  }

  return null;
}

export function timeEntryDetailRoute(timeEntryId: string): string {
  return `${TIME_ENTRY_MODULE_BASE_ROUTE}/${timeEntryId}`;
}

export function timeEntryEditRoute(timeEntryId: string): string {
  return `${TIME_ENTRY_MODULE_BASE_ROUTE}/${timeEntryId}/edit`;
}

export function timeEntryCreateRoute(matterId?: string): string {
  if (!matterId) {
    return `${TIME_ENTRY_MODULE_BASE_ROUTE}/new`;
  }

  return `${TIME_ENTRY_MODULE_BASE_ROUTE}/new?matterId=${encodeURIComponent(matterId)}`;
}

export function timeEntryListRoute(): string {
  return TIME_ENTRY_MODULE_BASE_ROUTE;
}
