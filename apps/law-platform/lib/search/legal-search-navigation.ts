type LegalSearchNavigationHandler = (path: string) => void;

let navigationHandler: LegalSearchNavigationHandler | undefined;

export function registerLegalSearchNavigationHandler(
  handler: LegalSearchNavigationHandler,
): void {
  navigationHandler = handler;
}

export function unregisterLegalSearchNavigationHandler(): void {
  navigationHandler = undefined;
}

export function navigateToLegalSearchRoute(path: string): void {
  navigationHandler?.(path);
}
