import type { Address } from "../domain";

/** Formats a multi-line postal address. */
export function formatAddressLines(address: Address): readonly string[] {
  const lines = [address.line1.trim()];
  if (address.line2?.trim()) {
    lines.push(address.line2.trim());
  }

  const locality = [
    address.city.trim(),
    address.region?.trim(),
    address.postalCode?.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  if (locality.length > 0) {
    lines.push(locality);
  }

  lines.push(address.countryCode.trim().toUpperCase());
  return lines;
}

/** Formats an address as a single line. */
export function formatAddressSingleLine(address: Address): string {
  return formatAddressLines(address).join(", ");
}
