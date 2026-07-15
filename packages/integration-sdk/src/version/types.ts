import type { ConnectionRecord } from "../connection/types";
import type { IntegrationRequestContext, VendorVersionInfo, VersionCompatibilityResult, VersionRange } from "../types";
import {
  checkVersionCompatibility,
  extractDeclaredVersionRange,
  extractDetectedVersion,
} from "./compatibility";

export interface VersionProbeInput {
  readonly connection: ConnectionRecord;
  readonly context: IntegrationRequestContext;
}

export interface VersionProvider {
  probe(input: VersionProbeInput): Promise<VendorVersionInfo | undefined>;
  checkCompatibility(
    detected: VendorVersionInfo,
    declared: VersionRange,
  ): VersionCompatibilityResult;
  resolveDeclaredRange(metadata: Readonly<Record<string, string>>): VersionRange | undefined;
}

export class DefaultVersionProvider implements VersionProvider {
  async probe(input: VersionProbeInput): Promise<VendorVersionInfo | undefined> {
    return extractDetectedVersion(input.connection.metadata);
  }

  checkCompatibility(
    detected: VendorVersionInfo,
    declared: VersionRange,
  ): VersionCompatibilityResult {
    return checkVersionCompatibility(detected, declared);
  }

  resolveDeclaredRange(metadata: Readonly<Record<string, string>>): VersionRange | undefined {
    return extractDeclaredVersionRange(metadata);
  }
}

export function createDefaultVersionProvider(): VersionProvider {
  return new DefaultVersionProvider();
}
