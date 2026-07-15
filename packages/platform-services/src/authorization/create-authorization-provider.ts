import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import type { AuthorizationProvider } from "./authorization-provider";
import { AllowAllAuthorizationProvider } from "./authorization-provider";
import type { AuthorizationAccessResolver } from "./authorization-access-resolver";
import {
  DenyAllAuthorizationProvider,
  ProductionAuthorizationProvider,
} from "./production-authorization-provider";
import { createDefaultProductionPolicies } from "./production-policies";
import type { Policy } from "../policy/policy-pipeline";
import type { EntityMappingStore } from "../mapping/entity-mapping-store";
import type { AuthorizationAuditSink } from "./authorization-audit";
import { noopAuthorizationAuditSink } from "./authorization-audit";

export type AuthorizationProviderMode = "production" | "allow-all" | "deny-all";

export interface AuthorizationBootstrapEnv {
  readonly NODE_ENV?: string;
  readonly AUTHORIZATION_PROVIDER_MODE?: string;
  readonly AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION?: string;
}

export interface ResolveAuthorizationProviderModeResult {
  readonly mode: AuthorizationProviderMode;
  readonly source: "explicit" | "default";
}

/**
 * Resolves AUTHORIZATION_PROVIDER_MODE.
 * Defaults: allow-all outside production; production mode in production.
 * Never silently uses allow-all in production.
 */
export function resolveAuthorizationProviderMode(
  env: AuthorizationBootstrapEnv = process.env,
): ResolveAuthorizationProviderModeResult {
  const raw = env.AUTHORIZATION_PROVIDER_MODE?.trim().toLowerCase();
  if (!raw) {
    const mode: AuthorizationProviderMode =
      env.NODE_ENV === "production" ? "production" : "allow-all";
    return { mode, source: "default" };
  }

  if (raw !== "production" && raw !== "allow-all" && raw !== "deny-all") {
    throw new PlatformServiceError({
      category: "configuration",
      code: "INVALID_AUTHORIZATION_CONFIGURATION",
      message:
        "AUTHORIZATION_PROVIDER_MODE must be 'production', 'allow-all', or 'deny-all'",
      correlationId: "authorization-bootstrap",
      retryable: false,
      details: { value: raw },
    });
  }

  return { mode: raw, source: "explicit" };
}

export function assertAuthorizationProviderModeAllowed(
  mode: AuthorizationProviderMode,
  env: AuthorizationBootstrapEnv = process.env,
): void {
  if (env.NODE_ENV !== "production") {
    return;
  }
  if (mode === "allow-all") {
    const allow = env.AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION === "true";
    if (!allow) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "INVALID_AUTHORIZATION_CONFIGURATION",
        message:
          "Allow-all authorisation is not permitted in production without AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION=true",
        correlationId: "authorization-bootstrap",
        retryable: false,
        details: { mode },
      });
    }
  }
}

export interface CreateAuthorizationProviderOptions {
  readonly env?: AuthorizationBootstrapEnv;
  readonly mode?: AuthorizationProviderMode;
  readonly accessResolver?: AuthorizationAccessResolver;
  readonly provider?: AuthorizationProvider;
}

export function createAuthorizationProvider(
  options: CreateAuthorizationProviderOptions = {},
): AuthorizationProvider {
  if (options.provider) {
    return options.provider;
  }

  const env = options.env ?? process.env;
  const mode = options.mode ?? resolveAuthorizationProviderMode(env).mode;
  assertAuthorizationProviderModeAllowed(mode, env);

  if (mode === "allow-all") {
    return new AllowAllAuthorizationProvider();
  }
  if (mode === "deny-all") {
    return new DenyAllAuthorizationProvider();
  }

  if (!options.accessResolver) {
    throw new PlatformServiceError({
      category: "configuration",
      code: "INVALID_AUTHORIZATION_CONFIGURATION",
      message:
        "AUTHORIZATION_PROVIDER_MODE=production requires an AuthorizationAccessResolver",
      correlationId: "authorization-bootstrap",
      retryable: false,
    });
  }

  return new ProductionAuthorizationProvider({
    accessResolver: options.accessResolver,
  });
}

export interface CreateAuthorizationRuntimeOptions {
  readonly env?: AuthorizationBootstrapEnv;
  readonly mode?: AuthorizationProviderMode;
  readonly accessResolver?: AuthorizationAccessResolver;
  readonly mappingStore?: EntityMappingStore;
  readonly auditSink?: AuthorizationAuditSink;
  readonly isMaintenanceMode?: () => boolean;
  readonly provider?: AuthorizationProvider;
  readonly policies?: readonly Policy[];
}

export interface AuthorizationRuntime {
  readonly mode: AuthorizationProviderMode;
  readonly provider: AuthorizationProvider;
  readonly policies: readonly Policy[];
  readonly auditSink: AuthorizationAuditSink;
  readonly accessResolver?: AuthorizationAccessResolver;
}

export function createAuthorizationRuntime(
  options: CreateAuthorizationRuntimeOptions = {},
): AuthorizationRuntime {
  const env = options.env ?? process.env;
  const mode = options.mode ?? resolveAuthorizationProviderMode(env).mode;
  assertAuthorizationProviderModeAllowed(mode, env);

  const provider = createAuthorizationProvider({
    env,
    mode,
    accessResolver: options.accessResolver,
    provider: options.provider,
  });

  const policies =
    options.policies ??
    (mode === "production" && options.accessResolver
      ? createDefaultProductionPolicies({
          accessResolver: options.accessResolver,
          mappingStore: options.mappingStore,
          isMaintenanceMode: options.isMaintenanceMode,
        })
      : []);

  return {
    mode,
    provider,
    policies,
    auditSink: options.auditSink ?? noopAuthorizationAuditSink,
    accessResolver: options.accessResolver,
  };
}
