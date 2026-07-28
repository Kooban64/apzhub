import { TestSpecificationInvariantViolation } from "../../shared/errors";

const METADATA_MAX_ENTRIES = 64;
const METADATA_KEY_MAX = 64;
const METADATA_VALUE_MAX = 512;

/**
 * Extensible structured attributes that do not alter core Specification semantics.
 */
export type SpecificationMetadata = {
  readonly entries: Readonly<Record<string, string>>;
};

export function createSpecificationMetadata(
  entries: Readonly<Record<string, string>> = {},
): SpecificationMetadata {
  const keys = Object.keys(entries);
  if (keys.length > METADATA_MAX_ENTRIES) {
    throw new TestSpecificationInvariantViolation(
      `Specification metadata must not exceed ${METADATA_MAX_ENTRIES} entries`,
    );
  }
  const normalized: Record<string, string> = {};
  for (const key of keys) {
    const trimmedKey = key.trim();
    if (!trimmedKey || trimmedKey.length > METADATA_KEY_MAX) {
      throw new TestSpecificationInvariantViolation(
        "Specification metadata key is invalid",
      );
    }
    const value = entries[key]?.trim() ?? "";
    if (value.length > METADATA_VALUE_MAX) {
      throw new TestSpecificationInvariantViolation(
        "Specification metadata value exceeds maximum length",
      );
    }
    normalized[trimmedKey] = value;
  }
  return { entries: Object.freeze(normalized) };
}

export function mergeSpecificationMetadata(
  current: SpecificationMetadata,
  patch: Readonly<Record<string, string>>,
): SpecificationMetadata {
  return createSpecificationMetadata({ ...current.entries, ...patch });
}
