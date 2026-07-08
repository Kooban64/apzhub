type TimeEntryNavigationHandler = (path: string) => void;

let navigationHandler: TimeEntryNavigationHandler | undefined;

export function registerTimeEntryNavigationHandler(
  handler: TimeEntryNavigationHandler,
): void {
  navigationHandler = handler;
}

export function unregisterTimeEntryNavigationHandler(): void {
  navigationHandler = undefined;
}

export function navigateToTimeEntryRoute(path: string): void {
  navigationHandler?.(path);
}
