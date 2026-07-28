import type { qepRequirement } from "@apzhub/config";

import type { PersistedRequirement } from "../../domain/persisted-requirement";
import { createRequirement } from "../../domain/entities/requirement";
import { createRequirementOwner } from "../../domain/value-objects/requirement-owner";
import { createRequirementVersion } from "../../domain/value-objects/requirement-version";
import { createRequirementBaselineReference } from "../../domain/value-objects/requirement-baseline-reference";
import type { RequirementReference } from "../../domain/value-objects/requirement-reference";
import { createRequirementReference } from "../../domain/value-objects/requirement-reference";

type QepRequirementRow = typeof qepRequirement.$inferSelect;

function mapOwner(
  owner: QepRequirementRow["ownerJson"],
): PersistedRequirement["owner"] {
  if (!owner) return undefined;
  return createRequirementOwner(owner);
}

function mapReferences(
  references: QepRequirementRow["referencesJson"],
): PersistedRequirement["references"] {
  return (references ?? []).map((ref) => createRequirementReference(ref));
}

export function rowToPersistedRequirement(
  row: QepRequirementRow,
): PersistedRequirement {
  const base = createRequirement({
    id: row.id,
    key: row.key,
    title: row.title,
    description: row.description ?? undefined,
    type: row.type,
    status: row.status,
    priority: row.priority,
    category: row.category ?? undefined,
    owner: row.ownerJson ? createRequirementOwner(row.ownerJson) : undefined,
    approvalState: row.approvalState,
    version: createRequirementVersion(
      row.versionMajor,
      row.versionMinor,
      row.versionPatch,
    ),
    acceptanceCriteriaItems: row.acceptanceCriteriaJson?.items,
    attributes: row.attributesJson ?? undefined,
    references: mapReferences(row.referencesJson),
    baseline: row.baselineJson
      ? createRequirementBaselineReference(row.baselineJson)
      : undefined,
    tenantId: row.tenantId,
    projectId: row.projectId,
  });

  return {
    ...base,
    owner: mapOwner(row.ownerJson),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    ...(row.archivedAt ? { archivedAt: row.archivedAt.toISOString() } : {}),
    ...(row.archivedBy ? { archivedBy: row.archivedBy } : {}),
    revision: row.revision,
  };
}

export function persistedRequirementToRow(
  record: PersistedRequirement,
): typeof qepRequirement.$inferInsert {
  return {
    id: record.id,
    tenantId: record.tenantId,
    projectId: record.projectId,
    key: record.key,
    title: record.title,
    description: record.description ?? null,
    type: record.type,
    status: record.status,
    priority: record.priority,
    category: record.category ?? null,
    ownerJson: record.owner
      ? {
          userId: record.owner.userId,
          ...(record.owner.displayName
            ? { displayName: record.owner.displayName }
            : {}),
        }
      : null,
    approvalState: record.approvalState,
    versionMajor: record.version.major,
    versionMinor: record.version.minor,
    versionPatch: record.version.patch,
    acceptanceCriteriaJson: record.acceptanceCriteria
      ? { items: [...record.acceptanceCriteria.items] }
      : null,
    attributesJson: {
      tags: [...record.attributes.tags],
      custom: { ...record.attributes.custom },
    },
    referencesJson: record.references.map((ref: RequirementReference) => ({
      system: ref.system,
      externalId: ref.externalId,
      ...(ref.label ? { label: ref.label } : {}),
    })),
    baselineJson: record.baseline
      ? { baselineId: record.baseline.baselineId, label: record.baseline.label }
      : null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    archivedAt: record.archivedAt ? new Date(record.archivedAt) : null,
    archivedBy: record.archivedBy ?? null,
    revision: record.revision,
  };
}

export function matchesRequirementSearch(
  record: PersistedRequirement,
  q: string,
): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const haystacks = [record.key, record.title, record.description ?? ""].map((value) =>
    value.toLowerCase(),
  );
  return haystacks.some((value) => value.includes(needle));
}
