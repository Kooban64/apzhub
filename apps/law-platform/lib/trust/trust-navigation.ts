let navigateHandler: ((path: string) => void) | undefined;

export function registerTrustNavigationHandler(handler: (path: string) => void): void {
  navigateHandler = handler;
}

export function unregisterTrustNavigationHandler(): void {
  navigateHandler = undefined;
}

export function navigateToTrustRoute(path: string): boolean {
  if (!navigateHandler) {
    return false;
  }

  navigateHandler(path);
  return true;
}
