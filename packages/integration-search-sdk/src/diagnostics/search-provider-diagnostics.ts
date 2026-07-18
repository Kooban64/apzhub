/**
 * Search provider diagnostics — safe metadata only (no secrets / connection strings).
 */

import type { IntegrationDiagnostics } from "@apzhub/integration-sdk";
import type {
  SearchCapabilities,
  SearchDiagnostics,
  SearchHealth,
  SearchStatistics,
} from "@apzhub/search-contracts";
import {
  createEmptySearchStatistics,
  createFoundationSearchDiagnostics,
  createUnknownSearchHealth,
  FOUNDATION_SEARCH_CAPABILITIES,
} from "@apzhub/search-contracts";
import type { SearchIntegrationCapabilityId } from "../capabilities/constants";

const SECRET_FIELD_PATTERN =
  /password|secret|token|credential|api[_-]?key|authorization|connectionstring/i;

export type SearchSafeIntegrationDiagnostics = {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly healthStatus: IntegrationDiagnostics["healthStatus"];
  readonly observedAt: string;
  readonly warnings: readonly string[];
};

export type SearchProviderDiagnosticsReport = {
  readonly search: SearchDiagnostics;
  readonly declaredCapabilities: readonly SearchIntegrationCapabilityId[];
  readonly integration?: SearchSafeIntegrationDiagnostics;
  readonly secretFieldsRedacted: true;
  readonly executionEnabled: false;
};

export class SearchProviderDiagnostics {
  constructor(
    private readonly clock: { now(): string } = { now: () => new Date().toISOString() },
  ) {}

  foundation(
    declaredCapabilities: readonly SearchIntegrationCapabilityId[] = [],
  ): SearchProviderDiagnosticsReport {
    return {
      search: createFoundationSearchDiagnostics(this.clock.now.bind(this.clock)),
      declaredCapabilities,
      secretFieldsRedacted: true,
      executionEnabled: false,
    };
  }

  build(input: {
    readonly health?: SearchHealth;
    readonly capabilities?: SearchCapabilities;
    readonly statistics?: SearchStatistics;
    readonly declaredCapabilities?: readonly SearchIntegrationCapabilityId[];
    readonly notes?: readonly string[];
    readonly integration?: IntegrationDiagnostics;
  }): SearchProviderDiagnosticsReport {
    const notes = [...(input.notes ?? [])];
    if (input.integration) {
      notes.push(
        `Integration health: ${input.integration.healthStatus}`,
        ...input.integration.warnings.map((w) => this.redact(w)),
      );
    }

    const search: SearchDiagnostics = {
      health:
        input.health ?? createUnknownSearchHealth(this.clock.now.bind(this.clock)),
      capabilities: input.capabilities ?? FOUNDATION_SEARCH_CAPABILITIES,
      statistics: input.statistics ?? createEmptySearchStatistics(),
      configurationSummary: {
        defaultPageSize: 20,
        maxPageSize: 100,
        enforceTenantIsolation: true,
        enforcePermissionFilter: true,
      },
      notes: [
        "APZSEARCH-004: Search Integration SDK — no engine, HTTP, or indexing",
        ...notes,
      ],
    };

    return {
      search,
      declaredCapabilities: input.declaredCapabilities ?? [],
      integration: input.integration
        ? {
            integrationId: input.integration.integrationId,
            capabilityId: input.integration.capabilityId,
            healthStatus: input.integration.healthStatus,
            observedAt: input.integration.observedAt,
            warnings: input.integration.warnings.map((w) => this.redact(w)),
          }
        : undefined,
      secretFieldsRedacted: true,
      executionEnabled: false,
    };
  }

  /** Redact potential secret material from free-form diagnostic text. */
  redact(value: string): string {
    if (SECRET_FIELD_PATTERN.test(value)) {
      return "[redacted]";
    }
    return value.replace(/(bearer\s+)[a-z0-9._-]+/gi, "$1[redacted]");
  }

  assertSafe(payload: Readonly<Record<string, unknown>>): boolean {
    for (const [key, value] of Object.entries(payload)) {
      if (SECRET_FIELD_PATTERN.test(key)) {
        return false;
      }
      if (typeof value === "string" && SECRET_FIELD_PATTERN.test(value)) {
        return false;
      }
    }
    return true;
  }
}

export function createSearchProviderDiagnostics(clock?: {
  now(): string;
}): SearchProviderDiagnostics {
  return new SearchProviderDiagnostics(clock);
}
