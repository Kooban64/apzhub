import type { RequirementId } from "../value-objects/requirement-id";
import { HASH_ALG, SNAPSHOT_SCHEMA_V1 } from "./constants";
import {
  createRequirementChangeReason,
  type RequirementChangeReason,
} from "./requirement-change-reason";
import {
  createRequirementContentVersionId,
  type RequirementContentVersionId,
} from "./requirement-content-version-id";
import {
  createRequirementContentVersionNumber,
  type RequirementContentVersionNumber,
} from "./requirement-content-version-number";
import { computeSnapshotHash, type RequirementSnapshot } from "./requirement-snapshot";

export type RequirementContentVersion = {
  readonly id: RequirementContentVersionId;
  readonly tenantId: string;
  readonly requirementId: RequirementId;
  readonly versionNumber: RequirementContentVersionNumber;
  readonly parentVersionNumber?: RequirementContentVersionNumber;
  readonly parentVersionId?: RequirementContentVersionId;
  readonly snapshot: RequirementSnapshot;
  readonly snapshotSchemaVersion: typeof SNAPSHOT_SCHEMA_V1;
  readonly hashAlgorithm: typeof HASH_ALG;
  readonly snapshotHash: string;
  readonly changeReason: RequirementChangeReason;
  readonly actorUserId: string;
  readonly createdAt: string;
  readonly sourceRevision: number;
  readonly correlationId: string;
};

export function createRequirementContentVersion(
  input: Omit<
    RequirementContentVersion,
    "id" | "versionNumber" | "changeReason" | "snapshotHash"
  > & {
    readonly id: string;
    readonly versionNumber: number;
    readonly parentVersionNumber?: number;
    readonly parentVersionId?: string;
    readonly changeReason: string;
    readonly snapshotHash?: string;
  },
): RequirementContentVersion {
  const snapshotHash = input.snapshotHash ?? computeSnapshotHash(input.snapshot);
  return {
    ...input,
    id: createRequirementContentVersionId(input.id),
    versionNumber: createRequirementContentVersionNumber(input.versionNumber),
    ...(input.parentVersionNumber !== undefined
      ? {
          parentVersionNumber: createRequirementContentVersionNumber(
            input.parentVersionNumber,
          ),
        }
      : {}),
    ...(input.parentVersionId
      ? { parentVersionId: createRequirementContentVersionId(input.parentVersionId) }
      : {}),
    changeReason: createRequirementChangeReason(input.changeReason),
    snapshotHash,
  };
}
