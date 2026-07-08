import { CALENDAR_MODULE_BASE_ROUTE } from "./calendar-event-routes";

type CalendarNavigationHandler = (path: string) => void;

let navigationHandler: CalendarNavigationHandler | undefined;

export function registerCalendarEventNavigationHandler(
  handler: CalendarNavigationHandler,
): void {
  navigationHandler = handler;
}

export function unregisterCalendarEventNavigationHandler(): void {
  navigationHandler = undefined;
}

export function navigateToCalendarEventRoute(path: string): void {
  if (navigationHandler) {
    navigationHandler(path);
    return;
  }

  if (typeof window !== "undefined" && path.startsWith(CALENDAR_MODULE_BASE_ROUTE)) {
    window.history.pushState({}, "", path);
  }
}
