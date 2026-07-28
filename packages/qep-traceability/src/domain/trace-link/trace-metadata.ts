import { TraceInvariantViolation } from "../../shared/errors";
import {
  TRACE_METADATA_KEY_MAX_LENGTH,
  TRACE_METADATA_MAX_ENTRIES,
  TRACE_METADATA_VALUE_MAX_LENGTH,
} from "./constants";

/**
 * Extensible structured attributes that do not alter core Trace semantics.
 */
export type TraceMetadata = {
  readonly entries: Readonly<Record<string, string>>;
};

export function createTraceMetadata(
  entries: Readonly<Record<string, string>> = {},
): TraceMetadata {
  const keys = Object.keys(entries);
  if (keys.length > TRACE_METADATA_MAX_ENTRIES) {
    throw new TraceInvariantViolation(
      `Trace metadata must not exceed ${TRACE_METADATA_MAX_ENTRIES} entries`,
    );
  }
  const normalized: Record<string, string> = {};
  for (const key of keys) {
    const trimmedKey = key.trim();
    if (!trimmedKey || trimmedKey.length > TRACE_METADATA_KEY_MAX_LENGTH) {
      throw new TraceInvariantViolation("Trace metadata key is invalid");
    }
    const value = entries[key]?.trim() ?? "";
    if (value.length > TRACE_METADATA_VALUE_MAX_LENGTH) {
      throw new TraceInvariantViolation("Trace metadata value exceeds maximum length");
    }
    normalized[trimmedKey] = value;
  }
  return { entries: Object.freeze(normalized) };
}

export function mergeTraceMetadata(
  current: TraceMetadata,
  patch: Readonly<Record<string, string>>,
): TraceMetadata {
  return createTraceMetadata({ ...current.entries, ...patch });
}
