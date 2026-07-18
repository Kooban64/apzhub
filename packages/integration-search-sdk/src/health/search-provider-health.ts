/**
 * Search provider health helpers — safe, declarative, no engine probes.
 */

import type {
  IntegrationHealth,
  IntegrationHealthCheck,
} from "@apzhub/integration-sdk";
import type { SearchHealth } from "@apzhub/search-contracts";
import { createUnknownSearchHealth } from "@apzhub/search-contracts";

export type SearchProviderHealthSnapshot = {
  readonly search: SearchHealth;
  readonly integration?: IntegrationHealth;
  readonly checks: readonly IntegrationHealthCheck[];
  readonly executionEnabled: false;
};

export class SearchProviderHealth {
  constructor(
    private readonly clock: { now(): string } = { now: () => new Date().toISOString() },
  ) {}

  /** SDK-only health — never implies engine availability. */
  unknown(
    message = "No search engine bound (APZSEARCH-004 Search Integration SDK)",
  ): SearchHealth {
    return {
      status: "unknown",
      message,
      checkedAt: this.clock.now(),
    };
  }

  fromIntegrationHealth(health: IntegrationHealth): SearchProviderHealthSnapshot {
    const searchStatus: SearchHealth["status"] =
      health.status === "healthy"
        ? "available"
        : health.status === "degraded"
          ? "degraded"
          : health.status === "unavailable"
            ? "unavailable"
            : "unknown";

    return {
      search: {
        status: searchStatus,
        message: `Mapped from integration health (${health.status}) — no engine execution`,
        checkedAt: health.observedAt,
      },
      integration: health,
      checks: health.checks,
      executionEnabled: false,
    };
  }

  createSnapshot(
    search: SearchHealth = createUnknownSearchHealth(this.clock.now.bind(this.clock)),
    checks: readonly IntegrationHealthCheck[] = [],
  ): SearchProviderHealthSnapshot {
    return {
      search,
      checks,
      executionEnabled: false,
    };
  }
}

export function createSearchProviderHealth(clock?: {
  now(): string;
}): SearchProviderHealth {
  return new SearchProviderHealth(clock);
}
