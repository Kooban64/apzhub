import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { SearchCapabilities, SearchStatistics } from "@apzhub/search-contracts";

import type { MeilisearchRestClient } from "../internal/meilisearch-rest-client";
import type { MeilisearchCapabilityProvider } from "../capabilities/meilisearch-capability-provider";
import type { MeilisearchCompatibilityMatrix } from "../capabilities/meilisearch-compatibility-provider";
import { MEILISEARCH_ADAPTER_VERSION, MEILISEARCH_INTEGRATION_ID } from "../version";
import { MEILISEARCH_UNSUPPORTED_OPERATIONS } from "../results/unsupported";
import {
  createErrorResult,
  createOkResult,
  type SearchOperationResult,
} from "../results/search-operation-result";

export type MeilisearchDiagnosticsReport = {
  readonly integrationId: typeof MEILISEARCH_INTEGRATION_ID;
  readonly adapterVersion: typeof MEILISEARCH_ADAPTER_VERSION;
  readonly capabilities: SearchCapabilities;
  readonly compatibility?: MeilisearchCompatibilityMatrix;
  readonly statistics?: SearchStatistics & {
    readonly databaseSize?: number;
    readonly engineVersion?: string;
  };
  readonly unsupportedOperations: readonly string[];
  readonly secretFieldsRedacted: true;
  readonly apiStatus: "reachable" | "degraded" | "unavailable" | "not_tested";
  readonly notes: readonly string[];
};

const SECRET_PATTERN = /password|secret|token|credential|api[_-]?key|authorization/i;

export class MeilisearchDiagnosticsProvider {
  constructor(
    private readonly getClient: () => MeilisearchRestClient,
    private readonly capabilities: MeilisearchCapabilityProvider,
    private readonly getCompatibility: () => MeilisearchCompatibilityMatrix,
    private readonly getApiStatus: () => MeilisearchDiagnosticsReport["apiStatus"],
  ) {}

  async collect(
    context: IntegrationRequestContext,
  ): Promise<SearchOperationResult<"diagnostics", MeilisearchDiagnosticsReport>> {
    try {
      const stats = await this.getClient().getStats(context);
      let engineVersion: string | undefined;
      try {
        engineVersion = (await this.getClient().getVersion(context)).pkgVersion;
      } catch {
        engineVersion = undefined;
      }

      const indexCount = stats.indexes ? Object.keys(stats.indexes).length : 0;
      const report: MeilisearchDiagnosticsReport = {
        integrationId: MEILISEARCH_INTEGRATION_ID,
        adapterVersion: MEILISEARCH_ADAPTER_VERSION,
        capabilities: this.capabilities.toContractCapabilities(),
        compatibility: this.getCompatibility(),
        statistics: {
          declaredIndexCount: indexCount,
          declaredProviderCount: 1,
          declaredCollectionCount: indexCount,
          declaredSourceCount: 0,
          databaseSize: stats.databaseSize,
          engineVersion,
        },
        unsupportedOperations: MEILISEARCH_UNSUPPORTED_OPERATIONS,
        secretFieldsRedacted: true,
        apiStatus: this.getApiStatus(),
        notes: [
          "APZSEARCH-005 Meilisearch reference adapter",
          "Semantic/vector/fuzzy/AI/OCR are NOT_SUPPORTED",
          "Platform Search remains vendor-neutral — OpenSearch remains a future option",
        ],
      };

      if (!this.assertSafe(report as unknown as Readonly<Record<string, unknown>>)) {
        return createErrorResult(
          "diagnostics",
          "Diagnostics payload failed secret-safety assertion",
          "meilisearch.diagnostics.unsafe",
          "internal",
        );
      }

      return createOkResult("diagnostics", report);
    } catch (error) {
      return createErrorResult(
        "diagnostics",
        error instanceof Error ? error.message : String(error),
        "meilisearch.diagnostics.failed",
        "vendor_unavailable",
      );
    }
  }

  assertSafe(payload: Readonly<Record<string, unknown>>): boolean {
    for (const [key, value] of Object.entries(payload)) {
      if (key === "secretFieldsRedacted") continue;
      if (SECRET_PATTERN.test(key)) return false;
      if (typeof value === "string" && SECRET_PATTERN.test(value)) return false;
    }
    return true;
  }

  redact(value: string): string {
    if (SECRET_PATTERN.test(value)) return "[redacted]";
    return value.replace(/(bearer\s+)[a-z0-9._-]+/gi, "$1[redacted]");
  }
}

export function createMeilisearchDiagnosticsProvider(
  getClient: () => MeilisearchRestClient,
  capabilities: MeilisearchCapabilityProvider,
  getCompatibility: () => MeilisearchCompatibilityMatrix,
  getApiStatus: () => MeilisearchDiagnosticsReport["apiStatus"],
): MeilisearchDiagnosticsProvider {
  return new MeilisearchDiagnosticsProvider(
    getClient,
    capabilities,
    getCompatibility,
    getApiStatus,
  );
}
