/** Formats a monetary amount with currency code. */
export function formatCurrency(
  amount: number,
  currency: string,
  locale = "en-AU",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
