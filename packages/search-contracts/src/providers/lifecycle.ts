/**
 * Production search provider lifecycle & configuration contracts (APZSEARCH-002).
 * No engine implementations — initialise/health/capabilities/dispose only.
 */

import type { SearchRequestContext } from "../common/context";
import type { SearchCapabilities, SearchHealth, SearchQuery } from "../domain/search";
import type { SearchQueryValidationResult } from "../domain/query-validation";
import type { SearchProviderId } from "../identifiers";
import type { SearchProviderKind } from "../enums/catalogue";
import type { SearchProviderDescriptor } from "./search-provider";

/** Provider operational status (persisted) — uppercase canonical states. */
export const SEARCH_PROVIDER_STATUS_STATES = [
  "AVAILABLE",
  "DEGRADED",
  "UNAVAILABLE",
  "UNKNOWN",
] as const;
export type SearchProviderStatusState = (typeof SEARCH_PROVIDER_STATUS_STATES)[number];

export function isSearchProviderStatusState(
  value: string,
): value is SearchProviderStatusState {
  return (SEARCH_PROVIDER_STATUS_STATES as readonly string[]).includes(value);
}

export function toSearchHealthStatus(
  state: SearchProviderStatusState,
): SearchHealth["status"] {
  switch (state) {
    case "AVAILABLE":
      return "available";
    case "DEGRADED":
      return "degraded";
    case "UNAVAILABLE":
      return "unavailable";
    case "UNKNOWN":
      return "unknown";
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

/**
 * Provider connection/configuration — secret refs only, never resolved values.
 */
export type SearchProviderConfiguration = {
  readonly providerId: SearchProviderId;
  readonly providerKind: SearchProviderKind;
  readonly version: string;
  readonly endpointMetadata?: {
    readonly baseUrl?: string;
    readonly pathPrefix?: string;
    readonly region?: string;
  };
  /** Platform secret abstraction — credential references only. */
  readonly authenticationRefs?: {
    readonly credentialRef?: string;
    readonly usernameRef?: string;
    readonly tlsClientCertRef?: string;
    readonly tlsClientKeyRef?: string;
  };
  readonly tls?: {
    readonly enabled: boolean;
    readonly rejectUnauthorized?: boolean;
    readonly caCertRef?: string;
  };
  readonly timeouts?: {
    readonly connectMs?: number;
    readonly requestMs?: number;
  };
  readonly connection?: {
    readonly maxConnections?: number;
    readonly keepAlive?: boolean;
  };
  readonly featureFlags?: Readonly<Record<string, boolean>>;
  readonly capabilities?: Partial<
    Omit<SearchCapabilities, "semantic" | "vector" | "fuzzy">
  > & {
    readonly semantic?: boolean;
    readonly vector?: boolean;
    readonly fuzzy?: boolean;
  };
  readonly customMetadata?: Readonly<Record<string, string>>;
};

export type SearchProviderConfigurationValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly string[];
};

export function validateSearchProviderConfiguration(
  config: SearchProviderConfiguration,
): SearchProviderConfigurationValidationResult {
  const issues: string[] = [];
  if (!config.providerId) issues.push("providerId is required");
  if (!config.providerKind) issues.push("providerKind is required");
  if (!config.version) issues.push("version is required");

  const auth = config.authenticationRefs;
  if (auth) {
    for (const [key, value] of Object.entries(auth)) {
      if (value === undefined) continue;
      if (!value || value.length < 3) {
        issues.push(`${key} must be a non-empty credential reference`);
      }
      if (/password|secret|token=/i.test(value)) {
        issues.push(`${key} must not contain inline secret material`);
      }
    }
  }

  if (config.timeouts?.connectMs !== undefined && config.timeouts.connectMs < 1) {
    issues.push("timeouts.connectMs must be >= 1");
  }
  if (config.timeouts?.requestMs !== undefined && config.timeouts.requestMs < 1) {
    issues.push("timeouts.requestMs must be >= 1");
  }

  if (config.capabilities) {
    if (config.capabilities.semantic === true) {
      issues.push("semantic capability is forbidden until a later milestone");
    }
    if (config.capabilities.vector === true) {
      issues.push("vector capability is forbidden until a later milestone");
    }
    if (config.capabilities.fuzzy === true) {
      issues.push("fuzzy capability is forbidden until a later milestone");
    }
  }

  return { valid: issues.length === 0, issues };
}

export type SearchProviderRegistrationInput = {
  readonly providerId: SearchProviderId;
  readonly kind: SearchProviderKind;
  readonly label: string;
  readonly version: string;
  readonly configuration: SearchProviderConfiguration;
  readonly capabilities: SearchCapabilities;
  readonly active?: boolean;
};

/**
 * Managed provider lifecycle — no search execution in APZSEARCH-002.
 */
export interface ManagedSearchProvider {
  readonly descriptor: SearchProviderDescriptor;
  initialise(
    context: SearchRequestContext,
    configuration: SearchProviderConfiguration,
  ): Promise<void> | void;
  validateConfiguration(
    context: SearchRequestContext,
    configuration: SearchProviderConfiguration,
  ):
    | Promise<SearchProviderConfigurationValidationResult>
    | SearchProviderConfigurationValidationResult;
  validateQuery(
    context: SearchRequestContext,
    query: SearchQuery,
  ): Promise<SearchQueryValidationResult> | SearchQueryValidationResult;
  getHealth(context: SearchRequestContext): Promise<SearchHealth> | SearchHealth;
  getCapabilities(
    context: SearchRequestContext,
  ): Promise<SearchCapabilities> | SearchCapabilities;
  getDiagnostics(
    context: SearchRequestContext,
  ): Promise<Readonly<Record<string, unknown>>> | Readonly<Record<string, unknown>>;
  dispose(context: SearchRequestContext): Promise<void> | void;
}

/** Extended registry surface for APZSEARCH-002 (persistence-backed). */
export interface SearchProviderRegistryOps {
  register(
    context: SearchRequestContext,
    input: SearchProviderRegistrationInput,
  ): Promise<void>;
  unregister(
    context: SearchRequestContext,
    providerId: SearchProviderId,
  ): Promise<void>;
  setActiveProvider(
    context: SearchRequestContext,
    providerId: SearchProviderId | null,
  ): Promise<void>;
  getActiveProviderId(context: SearchRequestContext): Promise<SearchProviderId | null>;
}
