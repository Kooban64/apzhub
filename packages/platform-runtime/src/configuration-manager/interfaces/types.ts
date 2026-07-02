import type { DiscoveryConfig } from "../../discovery-engine/config";

/** Runtime configuration schema version. */
export const RUNTIME_CONFIGURATION_VERSION = "1.0.0" as const;

export type ConfigurationSource = "defaults" | "environment" | "overrides";

export type RuntimeMode = "development" | "production" | "test";

/** Authoritative runtime configuration shape. */
export interface RuntimeConfiguration {
  readonly workspaceRoot: string;
  readonly platformVersion: string;
  readonly failFast: boolean;
  readonly runtimeMode: RuntimeMode;
  readonly discovery: Omit<DiscoveryConfig, "workspaceRoot">;
}

export type ConfigurationKey =
  | "workspaceRoot"
  | "platformVersion"
  | "failFast"
  | "runtimeMode"
  | "discovery.roots"
  | "discovery.manifestFileNames"
  | "discovery.ignoreDirNames";

export interface ConfigurationLoadOptions {
  readonly overrides?: Partial<RuntimeConfigurationOverrides>;
}

export interface RuntimeConfigurationOverrides {
  readonly workspaceRoot?: string;
  readonly platformVersion?: string;
  readonly failFast?: boolean;
  readonly runtimeMode?: RuntimeMode;
  readonly discovery?: Omit<DiscoveryConfig, "workspaceRoot">;
}

export interface ConfigurationLoadResult {
  readonly success: boolean;
  readonly configuration?: RuntimeConfiguration;
  readonly sources: readonly ConfigurationSource[];
  readonly errors?: readonly import("../validation/errors").ConfigurationError[];
}

export interface ConfigurationValidationResult {
  readonly success: boolean;
  readonly errors: readonly import("../validation/errors").ConfigurationError[];
  readonly warnings: readonly import("../validation/errors").ConfigurationError[];
  readonly unknownKeys: readonly string[];
}

export interface ConfigurationSnapshot {
  readonly version: typeof RUNTIME_CONFIGURATION_VERSION;
  readonly timestamp: string;
  readonly configuration: RuntimeConfiguration;
  readonly sources: readonly ConfigurationSource[];
}

export interface ConfigurationMetadata {
  readonly schemaVersion: typeof RUNTIME_CONFIGURATION_VERSION;
  readonly loadedAt: string | undefined;
  readonly sources: readonly ConfigurationSource[];
  readonly extensionPoints: readonly string[];
}

export interface ConfigurationReloadResult {
  readonly success: boolean;
  readonly placeholder: true;
  readonly message: string;
}

export interface ConfigurationDiagnostics {
  readonly validationStatus: "valid" | "invalid" | "not-loaded";
  readonly sources: readonly ConfigurationSource[];
  readonly missingValues: readonly string[];
  readonly invalidValues: readonly import("../validation/errors").ConfigurationError[];
  readonly unknownKeys: readonly string[];
  readonly metadata: ConfigurationMetadata;
  readonly snapshotTimestamp: string | undefined;
}

/** Extension points — documented only; not implemented in Phase 7. */
export interface ConfigurationExtensionPoints {
  readonly secretProvider?: unknown;
  readonly remoteConfiguration?: unknown;
  readonly featureFlags?: unknown;
  readonly tenantConfiguration?: unknown;
  readonly dynamicReload?: unknown;
}
