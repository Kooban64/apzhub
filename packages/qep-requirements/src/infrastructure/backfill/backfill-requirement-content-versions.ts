import { randomUUID } from "node:crypto";

import {
  MIGRATION_ACTOR,
  MIGRATION_REASON,
  buildCanonicalSnapshot,
  createRequirementContentVersion,
} from "../../domain/content-version";
import type { RequirementContentVersionRepository } from "../../domain/repositories/requirement-content-version-repository";
import type { RequirementRepository } from "../../domain/repositories/requirement-repository";

export type BackfillRequirementContentVersionsInput = {
  readonly tenantId: string;
  readonly requirements: RequirementRepository;
  readonly contentVersions: RequirementContentVersionRepository;
  readonly actorUserId?: string;
  readonly correlationId?: string;
  readonly now?: () => string;
};

/**
 * Appends content version `1` for Requirements that have none.
 * Idempotent — skips Requirements that already have a latest version.
 * Does **not** generate Platform business audit events (migration convention).
 */
export async function backfillRequirementContentVersions(
  input: BackfillRequirementContentVersionsInput,
): Promise<{ readonly examined: number; readonly appended: number }> {
  const requirements = await input.requirements.list(input.tenantId, { includeArchived: true });
  let appended = 0;
  for (const requirement of requirements) {
    if (await input.contentVersions.getLatest(input.tenantId, requirement.id)) continue;
    const snapshot = buildCanonicalSnapshot(requirement);
    await input.contentVersions.append(
      createRequirementContentVersion({
        id: `rcv_${randomUUID().replace(/-/g, "")}`,
        tenantId: input.tenantId,
        requirementId: requirement.id,
        versionNumber: 1,
        snapshot,
        snapshotSchemaVersion: "requirement-snapshot/v1",
        hashAlgorithm: "sha256",
        changeReason: MIGRATION_REASON,
        actorUserId: input.actorUserId ?? MIGRATION_ACTOR,
        createdAt: input.now?.() ?? new Date().toISOString(),
        sourceRevision: requirement.revision,
        correlationId: input.correlationId ?? "corr_apzqep_eng_020d_backfill",
      }),
    );
    appended += 1;
  }
  return { examined: requirements.length, appended };
}
