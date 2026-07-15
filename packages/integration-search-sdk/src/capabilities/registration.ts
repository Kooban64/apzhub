/**
 * Search-specific capability registration composing integration-sdk registration.
 */

import {
  createInMemoryCapabilityRegistration,
  type CapabilityDiscoveryFilter,
  type CapabilityRegistration,
  type CapabilityRegistrationResult,
  type AdapterManifest,
  type RegisteredCapabilityRecord,
} from "@apzhub/integration-sdk";
import type { SearchIntegrationCapabilityId } from "./constants";
import {
  DEFAULT_DECLARED_SEARCH_CAPABILITIES,
  isSearchIntegrationCapabilityId,
} from "./constants";

export interface SearchCapabilityRecord {
  readonly integrationId: string;
  readonly adapterId: string;
  readonly searchCapability: SearchIntegrationCapabilityId;
  readonly registeredAt: string;
  readonly name: string;
}

export interface SearchCapabilityRegistrationResult {
  readonly ok: boolean;
  readonly integrationId: string;
  readonly adapterId: string;
  readonly platformRegistration: CapabilityRegistrationResult;
  readonly searchCapabilities: readonly SearchIntegrationCapabilityId[];
  readonly message: string;
  readonly issues?: readonly string[];
}

export interface SearchCapabilityDiscoveryFilter {
  readonly integrationId?: string;
  readonly searchCapability?: SearchIntegrationCapabilityId;
}

function emptyPlatformResult(
  manifest: AdapterManifest,
): CapabilityRegistrationResult {
  return {
    ok: false,
    integrationId: manifest.integrationId,
    adapterId: manifest.adapterId,
    registeredCapabilities: [],
    message: "Platform registration skipped due to search validation failure",
  };
}

/**
 * Registers platform `search` capability plus fine-grained search declarations.
 * Delegates platform registration to integration-sdk — does not reimplement storage.
 */
export class SearchCapabilityRegistration {
  private readonly searchRecords = new Map<string, SearchCapabilityRecord[]>();
  private readonly platform: CapabilityRegistration;

  constructor(platform?: CapabilityRegistration) {
    this.platform = platform ?? createInMemoryCapabilityRegistration();
  }

  register(
    manifest: AdapterManifest,
    searchCapabilities: readonly SearchIntegrationCapabilityId[] = DEFAULT_DECLARED_SEARCH_CAPABILITIES,
    registeredAt?: string,
  ): SearchCapabilityRegistrationResult {
    const issues: string[] = [];

    if (!manifest.declaredCapabilities.includes("search")) {
      issues.push('Adapter manifest must declare platform capability "search"');
    }

    const invalid = searchCapabilities.filter(
      (c) => !isSearchIntegrationCapabilityId(c),
    );
    if (invalid.length > 0) {
      issues.push(`Unknown search capabilities: ${invalid.join(", ")}`);
    }

    if (searchCapabilities.length === 0) {
      issues.push("At least one search capability must be declared");
    }

    if (issues.length > 0) {
      return {
        ok: false,
        integrationId: manifest.integrationId,
        adapterId: manifest.adapterId,
        platformRegistration: emptyPlatformResult(manifest),
        searchCapabilities: [],
        message: "Search capability registration failed",
        issues,
      };
    }

    const platformRegistration = this.platform.register(manifest, registeredAt);
    if (!platformRegistration.ok) {
      return {
        ok: false,
        integrationId: manifest.integrationId,
        adapterId: manifest.adapterId,
        platformRegistration,
        searchCapabilities: [],
        message: "Search capability registration failed",
        issues: [...(platformRegistration.issues ?? [platformRegistration.message])],
      };
    }

    const timestamp = registeredAt ?? new Date().toISOString();
    const entries = searchCapabilities.map((searchCapability) => ({
      integrationId: manifest.integrationId,
      adapterId: manifest.adapterId,
      searchCapability,
      registeredAt: timestamp,
      name: manifest.name,
    }));
    this.searchRecords.set(manifest.integrationId, entries);

    return {
      ok: true,
      integrationId: manifest.integrationId,
      adapterId: manifest.adapterId,
      platformRegistration,
      searchCapabilities,
      message: "Search capabilities registered",
    };
  }

  unregister(integrationId: string): boolean {
    const removedSearch = this.searchRecords.delete(integrationId);
    const removedPlatform = this.platform.unregister(integrationId);
    return removedSearch || removedPlatform;
  }

  discover(
    filter: SearchCapabilityDiscoveryFilter = {},
  ): readonly SearchCapabilityRecord[] {
    const all = [...this.searchRecords.values()].flat();
    return all.filter((record) => {
      if (filter.integrationId && record.integrationId !== filter.integrationId) {
        return false;
      }
      if (
        filter.searchCapability &&
        record.searchCapability !== filter.searchCapability
      ) {
        return false;
      }
      return true;
    });
  }

  getDeclaredSearchCapabilities(
    integrationId: string,
  ): readonly SearchIntegrationCapabilityId[] {
    return (this.searchRecords.get(integrationId) ?? []).map(
      (r) => r.searchCapability,
    );
  }

  hasSearchCapability(
    integrationId: string,
    capability: SearchIntegrationCapabilityId,
  ): boolean {
    return this.getDeclaredSearchCapabilities(integrationId).includes(capability);
  }

  /** Delegate platform discovery for operators. */
  discoverPlatform(
    filter?: CapabilityDiscoveryFilter,
  ): readonly RegisteredCapabilityRecord[] {
    return this.platform.discover(filter);
  }

  getPlatformRegistration(): CapabilityRegistration {
    return this.platform;
  }
}

export function createSearchCapabilityRegistration(
  platform?: CapabilityRegistration,
): SearchCapabilityRegistration {
  return new SearchCapabilityRegistration(platform);
}
