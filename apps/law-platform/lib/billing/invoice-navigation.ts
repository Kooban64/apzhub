type InvoiceNavigationHandler = (route: string) => void;

let navigationHandler: InvoiceNavigationHandler | undefined;

export function registerInvoiceNavigationHandler(
  handler: InvoiceNavigationHandler,
): void {
  navigationHandler = handler;
}

export function unregisterInvoiceNavigationHandler(): void {
  navigationHandler = undefined;
}

export function navigateToInvoiceRoute(route: string): void {
  navigationHandler?.(route);
}
