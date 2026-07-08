import { REFERENCE_PREFIXES } from "../constants";

export function formatClientReference(reference: string): string {
  return reference.trim().toUpperCase();
}

export function formatMatterReference(reference: string): string {
  return reference.trim().toUpperCase();
}

export function formatInvoiceReference(reference: string): string {
  return reference.trim().toUpperCase();
}

export function formatReferenceByPrefix(
  prefix: keyof typeof REFERENCE_PREFIXES,
  reference: string,
): string {
  const normalized = reference.trim().toUpperCase();
  return normalized.startsWith(`${REFERENCE_PREFIXES[prefix]}-`)
    ? normalized
    : `${REFERENCE_PREFIXES[prefix]}-${normalized}`;
}
