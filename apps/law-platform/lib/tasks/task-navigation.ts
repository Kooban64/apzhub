type TaskNavigationHandler = (path: string) => void;

let navigationHandler: TaskNavigationHandler | undefined;

export function registerTaskNavigationHandler(handler: TaskNavigationHandler): void {
  navigationHandler = handler;
}

export function unregisterTaskNavigationHandler(): void {
  navigationHandler = undefined;
}

export function navigateToTaskRoute(path: string): void {
  navigationHandler?.(path);
}
