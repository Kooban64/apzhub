import { REFERENCE_PREFIXES } from "../constants";

const REFERENCE_PATTERN = /^([A-Z]{3})-(\d{4})-(\d{5,6})$/;

export interface ReferenceValidationOptions {
  readonly prefix?: string;
  readonly minSequence?: number;
  readonly maxSequence?: number;
}

/** Validates canonical `{PREFIX}-{YYYY}-{SEQ}` reference numbers. */
export function validateReferenceNumber(
  value: string,
  options: ReferenceValidationOptions = {},
): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return false;
  }

  const match = REFERENCE_PATTERN.exec(trimmed);
  if (!match) {
    return false;
  }

  const [, prefix, , sequenceText] = match;
  if (options.prefix && prefix !== options.prefix) {
    return false;
  }

  const sequence = Number.parseInt(sequenceText!, 10);
  const minSequence = options.minSequence ?? 1;
  const maxSequence = options.maxSequence ?? 999_999;
  return sequence >= minSequence && sequence <= maxSequence;
}

export function isClientReference(value: string): boolean {
  return validateReferenceNumber(value, { prefix: REFERENCE_PREFIXES.client });
}

export function isMatterReference(value: string): boolean {
  return validateReferenceNumber(value, { prefix: REFERENCE_PREFIXES.matter });
}

export function isInvoiceReference(value: string): boolean {
  return validateReferenceNumber(value, { prefix: REFERENCE_PREFIXES.invoice });
}

export function isTrustAccountCode(value: string): boolean {
  return validateReferenceNumber(value, { prefix: REFERENCE_PREFIXES.trustAccount });
}
