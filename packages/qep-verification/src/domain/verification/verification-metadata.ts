import { VerificationInvariantViolation } from "../../shared/errors";
import {
  VERIFICATION_METADATA_KEY_MAX_LENGTH,
  VERIFICATION_METADATA_MAX_ENTRIES,
  VERIFICATION_METADATA_VALUE_MAX_LENGTH,
} from "./constants";

/**
 * Extensible structured attributes that do not alter core Verification semantics.
 */
export type VerificationMetadata = {
  readonly entries: Readonly<Record<string, string>>;
};

export function createVerificationMetadata(
  entries: Readonly<Record<string, string>> = {},
): VerificationMetadata {
  const keys = Object.keys(entries);
  if (keys.length > VERIFICATION_METADATA_MAX_ENTRIES) {
    throw new VerificationInvariantViolation(
      `Verification metadata must not exceed ${VERIFICATION_METADATA_MAX_ENTRIES} entries`,
    );
  }
  const normalized: Record<string, string> = {};
  for (const key of keys) {
    const trimmedKey = key.trim();
    if (!trimmedKey || trimmedKey.length > VERIFICATION_METADATA_KEY_MAX_LENGTH) {
      throw new VerificationInvariantViolation("Verification metadata key is invalid");
    }
    const value = entries[key]?.trim() ?? "";
    if (value.length > VERIFICATION_METADATA_VALUE_MAX_LENGTH) {
      throw new VerificationInvariantViolation(
        "Verification metadata value exceeds maximum length",
      );
    }
    normalized[trimmedKey] = value;
  }
  return { entries: Object.freeze(normalized) };
}

export function mergeVerificationMetadata(
  current: VerificationMetadata,
  patch: Readonly<Record<string, string>>,
): VerificationMetadata {
  return createVerificationMetadata({ ...current.entries, ...patch });
}
