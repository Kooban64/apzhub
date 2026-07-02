import { createDefaultHealthProviders } from "../defaults/default-providers";
import {
  buildFailedProviderResult,
  buildHealthDiagnostics,
  buildHealthSnapshot,
  toCheckResult,
} from "../diagnostics/diagnostics";
import { aggregateHealthStatus, buildHealthSummary } from "../implementation/aggregate";
import type {
  HealthCheckResult,
  HealthDiagnostics,
  HealthProvider,
  HealthProviderContext,
  HealthProviderResult,
  HealthSnapshot,
  HealthStatus,
} from "../interfaces/types";
import { healthError, type HealthError } from "../validation/errors";

export class RuntimeHealthManager {
  private readonly providers = new Map<string, HealthProvider>();

  private lastCheck: HealthCheckResult | undefined;

  private snapshotTimestamp: string | undefined;

  private readonly now: () => string;

  constructor(
    options: { now?: () => string; providers?: readonly HealthProvider[] } = {},
  ) {
    this.now = options.now ?? (() => new Date().toISOString());

    const initialProviders = options.providers ?? createDefaultHealthProviders();
    for (const provider of initialProviders) {
      this.providers.set(provider.id, provider);
    }
  }

  registerProvider(provider: HealthProvider): {
    success: boolean;
    error?: HealthError;
  } {
    if (!provider.id) {
      return {
        success: false,
        error: healthError("HEALTH_INVALID_INPUT", "Health provider id is required"),
      };
    }

    if (this.providers.has(provider.id)) {
      return {
        success: false,
        error: healthError(
          "HEALTH_PROVIDER_DUPLICATE",
          `Health provider "${provider.id}" is already registered`,
          {
            providerId: provider.id,
          },
        ),
      };
    }

    this.providers.set(provider.id, provider);
    return { success: true };
  }

  unregisterProvider(providerId: string): boolean {
    if (!providerId) {
      return false;
    }

    return this.providers.delete(providerId);
  }

  check(context: HealthProviderContext): HealthCheckResult {
    const timestamp = this.now();
    const providerResults: HealthProviderResult[] = [];
    const failedProviders: string[] = [];

    for (const provider of this.providers.values()) {
      const result = this.executeProvider(provider, context, timestamp);
      providerResults.push(result);

      if (result.metadata.error !== undefined) {
        failedProviders.push(provider.id);
      }
    }

    const status = aggregateHealthStatus(providerResults);
    const summary = buildHealthSummary(status, providerResults, failedProviders);
    this.lastCheck = toCheckResult(
      status,
      summary,
      providerResults,
      failedProviders,
      timestamp,
    );
    this.snapshotTimestamp = undefined;

    return this.lastCheck;
  }

  checkProvider(
    providerId: string,
    context: HealthProviderContext,
  ): HealthProviderResult | HealthError {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return healthError(
        "HEALTH_PROVIDER_NOT_FOUND",
        `Health provider "${providerId}" is not registered`,
        {
          providerId,
        },
      );
    }

    return this.executeProvider(provider, context, this.now());
  }

  snapshot(): HealthSnapshot {
    if (!this.lastCheck) {
      throw new Error("Health check has not been executed");
    }

    const timestamp = this.now();
    this.snapshotTimestamp = timestamp;

    return buildHealthSnapshot(
      this.lastCheck.status,
      this.lastCheck.summary,
      this.lastCheck.providerResults,
      timestamp,
    );
  }

  getStatus(): HealthStatus {
    return this.lastCheck?.status ?? "unknown";
  }

  getDiagnostics(): HealthDiagnostics {
    return buildHealthDiagnostics({
      status: this.getStatus(),
      registeredProviders: [...this.providers.keys()],
      lastExecution: this.lastCheck?.timestamp,
      failedProviders: this.lastCheck?.failedProviders ?? [],
      summary: this.lastCheck?.summary ?? "Health check has not been executed",
      snapshotTimestamp: this.snapshotTimestamp,
    });
  }

  /** Returns registered provider ids. */
  getRegisteredProviderIds(): readonly string[] {
    return [...this.providers.keys()];
  }

  /** @internal Resets manager state for tests. */
  _resetForTests(): void {
    this.providers.clear();
    for (const provider of createDefaultHealthProviders()) {
      this.providers.set(provider.id, provider);
    }
    this.lastCheck = undefined;
    this.snapshotTimestamp = undefined;
  }

  private executeProvider(
    provider: HealthProvider,
    context: HealthProviderContext,
    timestamp: string,
  ): HealthProviderResult {
    try {
      return provider.check(context);
    } catch (error) {
      return buildFailedProviderResult(
        provider.id,
        provider.name,
        error instanceof Error ? error.message : "Health provider check failed",
        timestamp,
      );
    }
  }
}

export function createRuntimeHealthManager(
  options: { now?: () => string; providers?: readonly HealthProvider[] } = {},
): RuntimeHealthManager {
  return new RuntimeHealthManager(options);
}
