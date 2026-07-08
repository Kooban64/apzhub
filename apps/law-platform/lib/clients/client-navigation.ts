/** Registers client module navigation from command handlers (LAW-002-03). */

let navigateHandler: ((path: string) => void) | undefined;

export function registerClientNavigationHandler(handler: (path: string) => void): void {
  navigateHandler = handler;
}

export function unregisterClientNavigationHandler(): void {
  navigateHandler = undefined;
}

export function navigateToClientRoute(path: string): boolean {
  if (!navigateHandler) {
    return false;
  }

  navigateHandler(path);
  return true;
}

export function getClientNavigationHandler(): ((path: string) => void) | undefined {
  return navigateHandler;
}
