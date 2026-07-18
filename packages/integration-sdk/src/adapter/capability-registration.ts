import type { IntegrationCapabilityId } from "./capability-types";
import { isIntegrationCapabilityId } from "./capability-types";
import type { AdapterManifest } from "./manifest-types";

export interface RegisteredCapabilityRecord {
  readonly integrationId: string;
  readonly adapterId: string;
  readonly capabilityId: IntegrationCapabilityId;
  readonly manifestVersion: string;
  readonly registeredAt: string;
  readonly name: string;
}

export interface CapabilityRegistrationResult {
  readonly ok: boolean;
  readonly integrationId: string;
  readonly adapterId: string;
  readonly registeredCapabilities: readonly IntegrationCapabilityId[];
  readonly message: string;
  readonly issues?: readonly string[];
}

export interface CapabilityDiscoveryFilter {
  readonly capabilityId?: IntegrationCapabilityId;
  readonly integrationId?: string;
}

export interface CapabilityRegistration {
  register(
    manifest: AdapterManifest,
    registeredAt?: string,
  ): CapabilityRegistrationResult;
  unregister(integrationId: string): boolean;
  discover(filter?: CapabilityDiscoveryFilter): readonly RegisteredCapabilityRecord[];
  getDeclaredCapabilities(integrationId: string): readonly IntegrationCapabilityId[];
  hasCapability(integrationId: string, capabilityId: IntegrationCapabilityId): boolean;
}

export class InMemoryCapabilityRegistration implements CapabilityRegistration {
  private readonly records = new Map<string, RegisteredCapabilityRecord[]>();

  register(
    manifest: AdapterManifest,
    registeredAt?: string,
  ): CapabilityRegistrationResult {
    const issues: string[] = [];

    if (!manifest.integrationId.trim()) {
      issues.push("integrationId is required");
    }
    if (!manifest.adapterId.trim()) {
      issues.push("adapterId is required");
    }
    if (manifest.declaredCapabilities.length === 0) {
      issues.push("At least one capability must be declared");
    }

    const invalidCapabilities = manifest.declaredCapabilities.filter(
      (capability) => !isIntegrationCapabilityId(capability),
    );
    if (invalidCapabilities.length > 0) {
      issues.push(`Unknown capabilities: ${invalidCapabilities.join(", ")}`);
    }

    if (issues.length > 0) {
      return {
        ok: false,
        integrationId: manifest.integrationId,
        adapterId: manifest.adapterId,
        registeredCapabilities: [],
        message: "Capability registration failed",
        issues,
      };
    }

    const timestamp = registeredAt ?? new Date().toISOString();
    const entries: RegisteredCapabilityRecord[] = manifest.declaredCapabilities.map(
      (capabilityId) => ({
        integrationId: manifest.integrationId,
        adapterId: manifest.adapterId,
        capabilityId,
        manifestVersion: manifest.version,
        registeredAt: timestamp,
        name: manifest.name,
      }),
    );

    this.records.set(manifest.integrationId, entries);

    return {
      ok: true,
      integrationId: manifest.integrationId,
      adapterId: manifest.adapterId,
      registeredCapabilities: manifest.declaredCapabilities,
      message: "Capabilities registered",
    };
  }

  unregister(integrationId: string): boolean {
    return this.records.delete(integrationId);
  }

  discover(
    filter: CapabilityDiscoveryFilter = {},
  ): readonly RegisteredCapabilityRecord[] {
    const all = [...this.records.values()].flat();

    return all.filter((record) => {
      if (filter.integrationId && record.integrationId !== filter.integrationId) {
        return false;
      }
      if (filter.capabilityId && record.capabilityId !== filter.capabilityId) {
        return false;
      }
      return true;
    });
  }

  getDeclaredCapabilities(integrationId: string): readonly IntegrationCapabilityId[] {
    const records = this.records.get(integrationId) ?? [];
    return records.map((record) => record.capabilityId);
  }

  hasCapability(integrationId: string, capabilityId: IntegrationCapabilityId): boolean {
    return this.getDeclaredCapabilities(integrationId).includes(capabilityId);
  }
}

export function createInMemoryCapabilityRegistration(): CapabilityRegistration {
  return new InMemoryCapabilityRegistration();
}

export function validateAdapterManifest(
  manifest: AdapterManifest,
): CapabilityRegistrationResult {
  return createInMemoryCapabilityRegistration().register(manifest);
}
