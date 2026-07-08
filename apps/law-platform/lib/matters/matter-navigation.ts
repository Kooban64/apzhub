type MatterNavigationHandler = (path: string) => void;

let navigationHandler: MatterNavigationHandler | undefined;

export function registerMatterNavigationHandler(
  handler: MatterNavigationHandler,
): void {
  navigationHandler = handler;
}

export function unregisterMatterNavigationHandler(): void {
  navigationHandler = undefined;
}

export function navigateToMatterRoute(path: string): void {
  navigationHandler?.(path);
}
