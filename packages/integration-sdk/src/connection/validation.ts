import { invalidConnectionConfigurationError } from "../errors/codes";
import { sdkErr, sdkOk, type SdkResult } from "../errors/result";
import { isAuthenticationMode } from "../auth/modes";
import type { ConnectionDefinition } from "./types";

export interface ValidationIssue {
  readonly field: string;
  readonly code: string;
  readonly message: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}

const ID_PATTERN = /^[a-z][a-z0-9-]*$/;

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateConnectionDefinition(
  definition: ConnectionDefinition,
  correlationId: string,
): SdkResult<void> {
  const issues: ValidationIssue[] = [];

  if (!definition.connectionId.trim() || !ID_PATTERN.test(definition.connectionId)) {
    issues.push({
      field: "connectionId",
      code: "invalid_format",
      message: "connectionId must be kebab-case starting with a letter",
    });
  }

  if (!definition.tenantId.trim()) {
    issues.push({
      field: "tenantId",
      code: "required",
      message: "tenantId is required",
    });
  }

  if (!definition.integrationId.trim() || !ID_PATTERN.test(definition.integrationId)) {
    issues.push({
      field: "integrationId",
      code: "invalid_format",
      message: "integrationId must be kebab-case starting with a letter",
    });
  }

  if (!definition.adapterId.trim() || !ID_PATTERN.test(definition.adapterId)) {
    issues.push({
      field: "adapterId",
      code: "invalid_format",
      message: "adapterId must be kebab-case starting with a letter",
    });
  }

  if (!definition.baseUrl.trim() || !isValidUrl(definition.baseUrl)) {
    issues.push({
      field: "baseUrl",
      code: "invalid_url",
      message: "baseUrl must be a valid http or https URL",
    });
  }

  if (!isAuthenticationMode(definition.authenticationMode)) {
    issues.push({
      field: "authenticationMode",
      code: "invalid_mode",
      message: "authenticationMode is not supported",
    });
  }

  if (!definition.credentialRef.trim()) {
    issues.push({
      field: "credentialRef",
      code: "required",
      message: "credentialRef is required",
    });
  }

  const result: ValidationResult = {
    valid: issues.length === 0,
    issues,
  };

  if (!result.valid) {
    return sdkErr(
      invalidConnectionConfigurationError(
        {
          correlationId,
          details: Object.fromEntries(
            issues.map((issue, index) => [`issue_${index}`, issue.field]),
          ),
        },
        issues.map((issue) => `${issue.field}: ${issue.message}`).join("; "),
      ),
    );
  }

  return sdkOk(undefined);
}

export function assertTenantScope(
  expectedTenantId: string,
  actualTenantId: string,
  correlationId: string,
): SdkResult<void> {
  if (expectedTenantId !== actualTenantId) {
    return sdkErr(
      invalidConnectionConfigurationError(
        { correlationId, details: { expectedTenantId, actualTenantId } },
        "Tenant scope mismatch",
      ),
    );
  }

  return sdkOk(undefined);
}
