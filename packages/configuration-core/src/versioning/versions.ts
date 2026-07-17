/**
 * Configuration versioning helpers (APZCONFIG-001).
 * Immutable version metadata — no rollback execution.
 */

import type { ConfigurationVersion } from "@apzhub/configuration-contracts";

import { ConfigurationDomainError } from "../ports/repository-ports";

export function assertVersionImmutable(version: ConfigurationVersion): void {
  if (!version.immutable) {
    throw new ConfigurationDomainError(
      "version_not_immutable",
      `Configuration version ${version.id} must be immutable once recorded`,
      { versionId: version.id },
    );
  }
}

export function nextVersionNumber(
  existing: readonly ConfigurationVersion[],
): number {
  if (existing.length === 0) return 1;
  return Math.max(...existing.map((v) => v.versionNumber)) + 1;
}

export function selectCurrentVersion(
  versions: readonly ConfigurationVersion[],
): ConfigurationVersion | null {
  return versions.find((v) => v.isCurrent) ?? null;
}

/**
 * Record rollback intent metadata — does not apply prior values.
 */
export function buildRollbackVersionMetadata(input: {
  readonly configurationId: ConfigurationVersion["configurationId"];
  readonly id: ConfigurationVersion["id"];
  readonly fromVersion: ConfigurationVersion;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly versionNumber: number;
}): ConfigurationVersion {
  if (!input.fromVersion.immutable) {
    throw new ConfigurationDomainError(
      "rollback_source_mutable",
      "Rollback source version must be immutable",
    );
  }
  return {
    id: input.id,
    configurationId: input.configurationId,
    versionNumber: input.versionNumber,
    immutable: true,
    isCurrent: true,
    label: `rollback-from-v${input.fromVersion.versionNumber}`,
    createdAt: input.createdAt,
    createdBy: input.createdBy,
    rollbackFromVersionId: input.fromVersion.id,
  };
}
