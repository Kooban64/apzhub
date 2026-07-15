import {
  SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION,
  SOURCE_EVENT_PAYLOAD_SCHEMA_VERSION,
} from "./types";

export interface SchemaVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly raw: string;
}

export type SchemaCompatibility =
  "compatible" | "minor_upgrade" | "major_incompatible" | "invalid";

export interface SchemaCompatibilityResult {
  readonly status: SchemaCompatibility;
  readonly expected: string;
  readonly actual: string;
  readonly message: string;
}

export function parseSchemaVersion(raw: string): SchemaVersion | undefined {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(raw.trim());
  if (!match) return undefined;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    raw,
  };
}

export function compareSchemaVersions(
  expected: string,
  actual: string,
): SchemaCompatibilityResult {
  const exp = parseSchemaVersion(expected);
  const act = parseSchemaVersion(actual);

  if (!exp || !act) {
    return {
      status: "invalid",
      expected,
      actual,
      message: "Schema version must be semver MAJOR.MINOR.PATCH",
    };
  }

  if (act.major !== exp.major) {
    return {
      status: "major_incompatible",
      expected,
      actual,
      message: `Major schema mismatch: expected ${expected}, got ${actual}`,
    };
  }

  if (act.minor > exp.minor || (act.minor === exp.minor && act.patch > exp.patch)) {
    return {
      status: "minor_upgrade",
      expected,
      actual,
      message: `Newer compatible schema: expected ${expected}, got ${actual}`,
    };
  }

  return {
    status: "compatible",
    expected,
    actual,
    message: "Schema versions are compatible",
  };
}

export function assertEnvelopeSchemaCompatible(
  actual: string,
  expected = SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION,
): SchemaCompatibilityResult {
  return compareSchemaVersions(expected, actual);
}

export function assertPayloadSchemaCompatible(
  actual: string,
  expected = SOURCE_EVENT_PAYLOAD_SCHEMA_VERSION,
): SchemaCompatibilityResult {
  return compareSchemaVersions(expected, actual);
}

export function currentEnvelopeSchemaVersion(): string {
  return SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION;
}

export function currentPayloadSchemaVersion(): string {
  return SOURCE_EVENT_PAYLOAD_SCHEMA_VERSION;
}
