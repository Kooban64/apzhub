export type EnvironmentProfile = "development" | "test" | "production";

export type ValidationTier = "permissive" | "strict";

export type SecretClassification =
  "none" | "public" | "credential" | "connection-string" | "secret";

export type ConfigOwner =
  | "platform"
  | "identity"
  | "law-platform"
  | "infrastructure"
  | "presentation"
  | "integrations";

export type ConfigValueType =
  "string" | "number" | "boolean" | "url" | "email" | "enum";

export type ConfigSource = "default" | "environment" | "override" | "deprecated-alias";

export interface ConfigVariableDefinition {
  readonly key: string;
  readonly type: ConfigValueType;
  readonly defaultValue?: string | number | boolean;
  readonly description: string;
  readonly owner: ConfigOwner;
  readonly scope: readonly EnvironmentProfile[] | "all";
  readonly secret: SecretClassification;
  readonly required?: boolean;
  readonly enumValues?: readonly string[];
  readonly deprecated?: {
    readonly replacement: string;
    readonly since: string;
  };
  readonly minLength?: number;
}

export interface ConfigValidationIssue {
  readonly key: string;
  readonly severity: "pass" | "warn" | "fail";
  readonly message: string;
  readonly code: string;
}

export interface ConfigurationValidationResult {
  readonly valid: boolean;
  readonly profile: EnvironmentProfile;
  readonly tier: ValidationTier;
  readonly issues: readonly ConfigValidationIssue[];
}

export interface ConfigurationVariableDiagnostic {
  readonly key: string;
  readonly type: ConfigValueType;
  readonly description: string;
  readonly owner: ConfigOwner;
  readonly scope: readonly EnvironmentProfile[] | "all";
  readonly secret: SecretClassification;
  readonly source: ConfigSource;
  readonly usingDefault: boolean;
  readonly present: boolean;
  readonly maskedValue?: string;
  readonly status: "ok" | "missing" | "invalid" | "deprecated" | "unknown";
}

export interface SecretDiagnostic {
  readonly key: string;
  readonly classification: SecretClassification;
  readonly present: boolean;
  readonly status: "configured" | "missing" | "weak";
  readonly maskedPreview?: string;
}

export interface ConfigurationDiagnostics {
  readonly healthy: boolean;
  readonly profile: EnvironmentProfile;
  readonly tier: ValidationTier;
  readonly missingVariables: readonly string[];
  readonly deprecatedVariables: readonly string[];
  readonly unknownVariables: readonly string[];
  readonly defaultUsage: readonly string[];
  readonly overrideUsage: readonly string[];
  readonly secrets: readonly SecretDiagnostic[];
  readonly validationErrors: readonly ConfigValidationIssue[];
  readonly variables: readonly ConfigurationVariableDiagnostic[];
  readonly vault: {
    readonly provider: "environment";
    readonly status: "active";
    readonly note: string;
  };
}
