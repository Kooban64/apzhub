/**
 * Configuration validation metadata checks (APZCONFIG-001).
 * Validates rule metadata shapes — does NOT execute validators against payloads.
 */

import type {
  Configuration,
  ConfigurationKey,
  ConfigurationValidation,
  ConfigurationValue,
} from "@apzhub/configuration-contracts";
import {
  isConfigurationValidationKind,
  isConfigurationValueKind,
} from "@apzhub/configuration-contracts";

import { ConfigurationDomainError } from "../ports/repository-ports";

const FORBIDDEN_SECRET_HINTS =
  /\b(password|secret|api[_-]?key|token|credential|private[_-]?key|vault)\b/i;

export function assertNoSecretPayload(payload: string): void {
  if (FORBIDDEN_SECRET_HINTS.test(payload)) {
    throw new ConfigurationDomainError(
      "secret_payload_forbidden",
      "Configuration values must not contain secret/credential payloads",
    );
  }
}

export function validateConfigurationKeyMetadata(key: ConfigurationKey): void {
  if (!key.key.trim()) {
    throw new ConfigurationDomainError(
      "invalid_key",
      "Configuration key must be non-empty",
    );
  }
  if (!isConfigurationValueKind(key.valueKind)) {
    throw new ConfigurationDomainError(
      "invalid_value_kind",
      `Invalid value kind: ${key.valueKind}`,
    );
  }
}

export function validateValidationRuleMetadata(
  rule: ConfigurationValidation,
): void {
  if (!isConfigurationValidationKind(rule.kind)) {
    throw new ConfigurationDomainError(
      "invalid_validation_kind",
      `Invalid validation kind: ${rule.kind}`,
    );
  }
  if (rule.kind === "range") {
    if (rule.min != null && rule.max != null && rule.min > rule.max) {
      throw new ConfigurationDomainError(
        "invalid_range",
        "Validation range min must be <= max",
        { min: rule.min, max: rule.max },
      );
    }
  }
  if (rule.kind === "enum" && (!rule.enumValues || rule.enumValues.length === 0)) {
    throw new ConfigurationDomainError(
      "invalid_enum",
      "Enum validation requires enumValues metadata",
    );
  }
  if (rule.kind === "pattern" && !rule.pattern) {
    throw new ConfigurationDomainError(
      "invalid_pattern",
      "Pattern validation requires pattern metadata",
    );
  }
  if (rule.kind === "custom" && !rule.customValidatorKey) {
    throw new ConfigurationDomainError(
      "invalid_custom_validator",
      "Custom validation requires customValidatorKey metadata",
    );
  }
}

export function validateConfigurationValueMetadata(
  value: ConfigurationValue,
  key?: ConfigurationKey,
): void {
  assertNoSecretPayload(value.payload);
  if (!isConfigurationValueKind(value.valueKind)) {
    throw new ConfigurationDomainError(
      "invalid_value_kind",
      `Invalid value kind: ${value.valueKind}`,
    );
  }
  if (key && key.valueKind !== value.valueKind && value.valueKind !== "null") {
    throw new ConfigurationDomainError(
      "value_kind_mismatch",
      `Value kind ${value.valueKind} does not match key ${key.valueKind}`,
    );
  }
}

export function validateConfigurationAggregate(configuration: Configuration): void {
  if (!configuration.tenantId.trim()) {
    throw new ConfigurationDomainError(
      "invalid_tenant",
      "Configuration requires tenantId",
    );
  }
}
