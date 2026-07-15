import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { SearchHealth } from "@apzhub/search-contracts";

import type { MeilisearchRestClient } from "../internal/meilisearch-rest-client";
import {
  createErrorResult,
  createOkResult,
  type SearchOperationResult,
} from "../results/search-operation-result";

export type MeilisearchHealthSnapshot = {
  readonly search: SearchHealth;
  readonly engineStatus?: string;
  readonly version?: string;
  readonly latencyMs?: number;
  readonly executionEnabled: true;
};

export class MeilisearchHealthProvider {
  constructor(
    private readonly getClient: () => MeilisearchRestClient,
    private readonly clock: { now(): string } = { now: () => new Date().toISOString() },
  ) {}

  async probe(
    context: IntegrationRequestContext,
  ): Promise<SearchOperationResult<"health", MeilisearchHealthSnapshot>> {
    try {
      const result = await this.getClient().testConnection(context);
      const status: SearchHealth["status"] = result.ok
        ? "available"
        : result.status
          ? "degraded"
          : "unavailable";
      return createOkResult("health", {
        search: {
          status,
          message: `Meilisearch health: ${result.status ?? "unknown"}`,
          checkedAt: this.clock.now(),
        },
        engineStatus: result.status,
        version: result.version,
        latencyMs: result.latencyMs,
        executionEnabled: true,
      });
    } catch (error) {
      return createErrorResult(
        "health",
        error instanceof Error ? error.message : String(error),
        "meilisearch.health.failed",
        "vendor_unavailable",
      );
    }
  }
}

export function createMeilisearchHealthProvider(
  getClient: () => MeilisearchRestClient,
  clock?: { now(): string },
): MeilisearchHealthProvider {
  return new MeilisearchHealthProvider(getClient, clock);
}
