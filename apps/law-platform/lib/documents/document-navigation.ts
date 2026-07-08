type DocumentNavigationHandler = (path: string) => void;

let navigationHandler: DocumentNavigationHandler | undefined;

export function registerDocumentNavigationHandler(
  handler: DocumentNavigationHandler,
): void {
  navigationHandler = handler;
}

export function unregisterDocumentNavigationHandler(): void {
  navigationHandler = undefined;
}

export function navigateToDocumentRoute(path: string): void {
  navigationHandler?.(path);
}
