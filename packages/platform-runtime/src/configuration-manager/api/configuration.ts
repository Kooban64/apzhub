import path from "node:path";

import {
  buildConfigurationDiagnostics,
  buildConfigurationMetadata,
  buildConfigurationSnapshot,
} from "../diagnostics/diagnostics";
import {
  collectUnknownOverrideKeys,
  mergeConfiguration,
} from "../implementation/loader";
import type {
  ConfigurationDiagnostics,
  ConfigurationKey,
  ConfigurationLoadOptions,
  ConfigurationLoadResult,
  ConfigurationMetadata,
  ConfigurationReloadResult,
  ConfigurationSnapshot,
  ConfigurationValidationResult,
  RuntimeConfiguration,
} from "../interfaces/types";
import { validateRuntimeConfiguration } from "../validation/validate";

function getConfigurationValue(
  configuration: RuntimeConfiguration,
  key: ConfigurationKey,
): unknown {
  switch (key) {
    case "workspaceRoot":
      return configuration.workspaceRoot;
    case "platformVersion":
      return configuration.platformVersion;
    case "failFast":
      return configuration.failFast;
    case "runtimeMode":
      return configuration.runtimeMode;
    case "discovery.roots":
      return configuration.discovery.roots;
    case "discovery.manifestFileNames":
      return configuration.discovery.manifestFileNames;
    case "discovery.ignoreDirNames":
      return configuration.discovery.ignoreDirNames;
    default:
      return undefined;
  }
}

export class RuntimeConfigurationManager {
  private configuration: RuntimeConfiguration | undefined;

  private loadedSources: readonly import("../interfaces/types").ConfigurationSource[] =
    [];

  private loadedAt: string | undefined;

  private snapshotTimestamp: string | undefined;

  private unknownKeys: string[] = [];

  private lastValidation: ReturnType<typeof validateRuntimeConfiguration> | undefined;

  private readonly defaultWorkspaceRoot: () => string;

  constructor(options: { defaultWorkspaceRoot?: () => string } = {}) {
    this.defaultWorkspaceRoot =
      options.defaultWorkspaceRoot ?? (() => path.resolve(process.cwd()));
  }

  load(options: ConfigurationLoadOptions = {}): ConfigurationLoadResult {
    const overrides = (options.overrides ?? {}) as Partial<
      import("../interfaces/types").RuntimeConfigurationOverrides
    > &
      Record<string, unknown>;

    this.unknownKeys = collectUnknownOverrideKeys(overrides);
    const merged = mergeConfiguration(this.defaultWorkspaceRoot(), overrides);

    this.configuration = merged.configuration;
    this.loadedSources = merged.sources;
    this.loadedAt = new Date().toISOString();
    this.snapshotTimestamp = undefined;
    this.lastValidation = validateRuntimeConfiguration(
      this.configuration,
      this.unknownKeys,
    );

    if (!this.lastValidation.success) {
      return {
        success: false,
        sources: merged.sources,
        errors: this.lastValidation.errors,
      };
    }

    return {
      success: true,
      configuration: this.configuration,
      sources: merged.sources,
    };
  }

  validate(): ConfigurationValidationResult {
    this.lastValidation = validateRuntimeConfiguration(
      this.configuration,
      this.unknownKeys,
    );

    return {
      success: this.lastValidation.success,
      errors: this.lastValidation.errors,
      warnings: this.lastValidation.warnings,
      unknownKeys: [...this.unknownKeys],
    };
  }

  get<K extends ConfigurationKey>(key: K): ReturnType<typeof getConfigurationValue> {
    if (!this.configuration) {
      return undefined;
    }

    return getConfigurationValue(this.configuration, key);
  }

  has(key: ConfigurationKey): boolean {
    return this.get(key) !== undefined;
  }

  snapshot(): ConfigurationSnapshot {
    if (!this.configuration) {
      throw new Error("Configuration has not been loaded");
    }

    const timestamp = new Date().toISOString();
    this.snapshotTimestamp = timestamp;

    return buildConfigurationSnapshot(
      this.configuration,
      this.loadedSources,
      timestamp,
    );
  }

  metadata(): ConfigurationMetadata {
    return buildConfigurationMetadata(this.loadedAt, this.loadedSources);
  }

  reload(): ConfigurationReloadResult {
    return {
      success: true,
      placeholder: true,
      message:
        "Configuration.reload() is a placeholder — dynamic reload deferred to a future phase",
    };
  }

  getDiagnostics(): ConfigurationDiagnostics {
    return buildConfigurationDiagnostics({
      configuration: this.configuration,
      sources: this.loadedSources,
      loadedAt: this.loadedAt,
      snapshotTimestamp: this.snapshotTimestamp,
      unknownKeys: this.unknownKeys,
      lastValidation: this.lastValidation,
    });
  }

  /** Returns the loaded configuration or undefined. */
  getConfiguration(): RuntimeConfiguration | undefined {
    return this.configuration;
  }

  /** @internal Resets manager state for tests. */
  _resetForTests(): void {
    this.configuration = undefined;
    this.loadedSources = [];
    this.loadedAt = undefined;
    this.snapshotTimestamp = undefined;
    this.unknownKeys = [];
    this.lastValidation = undefined;
  }
}

export function createRuntimeConfigurationManager(
  options: { defaultWorkspaceRoot?: () => string } = {},
): RuntimeConfigurationManager {
  return new RuntimeConfigurationManager(options);
}
