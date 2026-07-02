import { parse as parseYaml } from "yaml";
import type { ZodError } from "zod";

import type { CapabilityKind } from "./capability-kinds";
import {
  type CapabilityManifest,
  capabilityManifestSchema,
  getCapabilityManifestSchema,
} from "./schemas";
import {
  isValidSemver,
  isValidPlatformVersionConstraint,
} from "../version-manager/semver";

export type ManifestValidationErrorCode =
  | "MANIFEST_PARSE_ERROR"
  | "MANIFEST_VALIDATION_ERROR"
  | "VERSION_INVALID"
  | "PLATFORM_VERSION_INVALID"
  | "KIND_MISMATCH";

export interface ManifestValidationError {
  code: ManifestValidationErrorCode;
  field?: string;
  message: string;
  path?: string;
}

export type ManifestValidationResult<T = CapabilityManifest> =
  { success: true; data: T } | { success: false; errors: ManifestValidationError[] };

function zodErrorsToManifestErrors(error: ZodError): ManifestValidationError[] {
  return error.issues.map((issue) => ({
    code: "MANIFEST_VALIDATION_ERROR" as const,
    field: issue.path.join("."),
    message: issue.message,
    path: issue.path.join("."),
  }));
}

function validateVersionFields(
  manifest: CapabilityManifest,
): ManifestValidationError[] {
  const errors: ManifestValidationError[] = [];

  if (!isValidSemver(manifest.version)) {
    errors.push({
      code: "VERSION_INVALID",
      field: "version",
      message: `Invalid semver: ${manifest.version}`,
      path: "version",
    });
  }

  const compatibility =
    "compatibility" in manifest ? manifest.compatibility : undefined;
  if (
    compatibility?.platformVersion &&
    !isValidPlatformVersionConstraint(compatibility.platformVersion)
  ) {
    errors.push({
      code: "PLATFORM_VERSION_INVALID",
      field: "compatibility.platformVersion",
      message: `Invalid platform version constraint: ${compatibility.platformVersion}`,
      path: "compatibility.platformVersion",
    });
  }

  return errors;
}

export function validateCapabilityManifest(
  input: unknown,
  expectedKind?: CapabilityKind,
): ManifestValidationResult {
  if (
    expectedKind &&
    typeof input === "object" &&
    input !== null &&
    "kind" in input &&
    (input as { kind: unknown }).kind !== expectedKind
  ) {
    return {
      success: false,
      errors: [
        {
          code: "KIND_MISMATCH",
          field: "kind",
          message: `Expected kind ${expectedKind}, got ${String((input as { kind: unknown }).kind)}`,
          path: "kind",
        },
      ],
    };
  }

  const schema = expectedKind
    ? getCapabilityManifestSchema(expectedKind)
    : capabilityManifestSchema;

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: zodErrorsToManifestErrors(parsed.error) };
  }

  const versionErrors = validateVersionFields(parsed.data);
  if (versionErrors.length > 0) {
    return { success: false, errors: versionErrors };
  }

  return { success: true, data: parsed.data };
}

export function parseCapabilityManifestYaml(
  yamlSource: string,
): ManifestValidationResult | { success: false; errors: ManifestValidationError[] } {
  let document: unknown;
  try {
    document = parseYaml(yamlSource);
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          code: "MANIFEST_PARSE_ERROR",
          message: error instanceof Error ? error.message : "YAML parse failed",
        },
      ],
    };
  }

  return validateCapabilityManifest(document);
}
