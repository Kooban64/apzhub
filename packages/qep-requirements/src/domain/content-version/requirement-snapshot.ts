import { createHash } from "node:crypto";

import type { PersistedRequirement } from "../persisted-requirement";
import { HASH_ALG, SNAPSHOT_SCHEMA_V1 } from "./constants";
import { QepVersionIntegrityError } from "../../shared/errors";

export type RequirementSnapshot = {
  readonly requirementId: string;
  readonly key: string;
  readonly title: string;
  readonly description: string | null;
  readonly type: string;
  readonly priority: string;
  readonly category: string | null;
  readonly owner: {
    readonly userId: string;
    readonly displayName: string | null;
  } | null;
  readonly approvalState: string;
  readonly semver: {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
  };
  readonly acceptanceCriteria: { readonly items: readonly string[] } | null;
  readonly attributes: {
    readonly tags: readonly string[];
    readonly custom: Readonly<Record<string, string>>;
  };
  readonly references: readonly {
    readonly system: string;
    readonly externalId: string;
    readonly label: string | null;
  }[];
  readonly baseline: { readonly baselineId: string; readonly label: string } | null;
  readonly status: string;
  readonly sourceRevision: number;
  readonly projectId: string;
  readonly tenantId: string;
  readonly schemaVersion: typeof SNAPSHOT_SCHEMA_V1;
};

export function buildCanonicalSnapshot(
  requirement: PersistedRequirement,
): RequirementSnapshot {
  return {
    requirementId: requirement.id,
    key: requirement.key,
    title: requirement.title,
    description: requirement.description ?? null,
    type: requirement.type,
    priority: requirement.priority,
    category: requirement.category ?? null,
    owner: requirement.owner
      ? {
          userId: requirement.owner.userId,
          displayName: requirement.owner.displayName ?? null,
        }
      : null,
    approvalState: requirement.approvalState,
    semver: { ...requirement.version },
    acceptanceCriteria: requirement.acceptanceCriteria
      ? { items: [...requirement.acceptanceCriteria.items] }
      : null,
    attributes: {
      tags: [...requirement.attributes.tags].sort(),
      custom: Object.fromEntries(
        Object.entries(requirement.attributes.custom).sort(([a], [b]) =>
          a.localeCompare(b),
        ),
      ),
    },
    references: requirement.references.map((reference) => ({
      system: reference.system,
      externalId: reference.externalId,
      label: reference.label ?? null,
    })),
    baseline: requirement.baseline
      ? {
          baselineId: requirement.baseline.baselineId,
          label: requirement.baseline.label,
        }
      : null,
    status: requirement.status,
    sourceRevision: requirement.revision,
    projectId: requirement.projectId,
    tenantId: requirement.tenantId,
    schemaVersion: SNAPSHOT_SCHEMA_V1,
  };
}

export function canonicalizeToJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }
  return value;
}

export function computeSnapshotHash(snapshot: RequirementSnapshot): string {
  return createHash(HASH_ALG).update(canonicalizeToJson(snapshot)).digest("hex");
}

export function verifyIntegrity(
  snapshot: RequirementSnapshot,
  expectedHash: string,
): void {
  if (computeSnapshotHash(snapshot) !== expectedHash) {
    throw new QepVersionIntegrityError(
      "Requirement content version snapshot integrity check failed",
    );
  }
}
