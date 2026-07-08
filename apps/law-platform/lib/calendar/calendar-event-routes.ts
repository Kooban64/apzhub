export const CALENDAR_MODULE_BASE_ROUTE = "/workspace/law/calendar";

export type CalendarEventRoute =
  | { readonly kind: "list" }
  | { readonly kind: "detail"; readonly calendarEventId: string }
  | { readonly kind: "create" }
  | { readonly kind: "edit"; readonly calendarEventId: string };

export function isCalendarModuleRoute(pathname: string): boolean {
  return (
    pathname === CALENDAR_MODULE_BASE_ROUTE ||
    pathname.startsWith(`${CALENDAR_MODULE_BASE_ROUTE}/`)
  );
}

export function parseCalendarEventRoute(pathname: string): CalendarEventRoute | null {
  if (!isCalendarModuleRoute(pathname)) {
    return null;
  }

  if (
    pathname === CALENDAR_MODULE_BASE_ROUTE ||
    pathname === `${CALENDAR_MODULE_BASE_ROUTE}/`
  ) {
    return { kind: "list" };
  }

  const suffix = pathname.slice(CALENDAR_MODULE_BASE_ROUTE.length + 1);
  if (suffix === "new") {
    return { kind: "create" };
  }

  const segments = suffix.split("/").filter(Boolean);
  if (segments.length === 1) {
    return { kind: "detail", calendarEventId: segments[0]! };
  }

  if (segments.length === 2 && segments[1] === "edit") {
    return { kind: "edit", calendarEventId: segments[0]! };
  }

  return null;
}

export function calendarEventDetailRoute(calendarEventId: string): string {
  return `${CALENDAR_MODULE_BASE_ROUTE}/${calendarEventId}`;
}

export function calendarEventEditRoute(calendarEventId: string): string {
  return `${CALENDAR_MODULE_BASE_ROUTE}/${calendarEventId}/edit`;
}

export function calendarEventCreateRoute(matterId?: string): string {
  if (!matterId) {
    return `${CALENDAR_MODULE_BASE_ROUTE}/new`;
  }

  return `${CALENDAR_MODULE_BASE_ROUTE}/new?matterId=${encodeURIComponent(matterId)}`;
}

export function calendarEventListRoute(): string {
  return CALENDAR_MODULE_BASE_ROUTE;
}
