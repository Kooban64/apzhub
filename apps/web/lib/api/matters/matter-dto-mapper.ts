import type { Matter } from "@apzhub/legal-business-core";

import {
  createEntityMetadataCache,
  type EntityApiMetadata,
} from "../framework/entity-metadata-cache";

/** Matter API DTO shapes aligned with LAW-OpenAPI-v1 (LAW-014-06). */

export interface MatterSummaryV1 {
  readonly matterId: string;
  readonly matterReference: string;
  readonly title: string;
  readonly clientId: string;
  readonly matterStatus: Matter["matterStatus"];
  readonly priority: Matter["priority"];
  readonly leadAttorneyId: string;
  readonly openedAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MatterDetailV1 extends MatterSummaryV1 {
  readonly version: number;
  readonly description?: string | null;
  readonly matterTypeId: string;
  readonly practiceAreaId: string;
  readonly closedAt?: string | null;
  readonly courtId?: string | null;
  readonly judgeId?: string | null;
  readonly teamMemberIds: readonly string[];
  readonly tags: readonly string[];
  readonly customFields: Readonly<Record<string, string>>;
}

export interface CreateMatterV1Request {
  readonly title: string;
  readonly clientId: string;
  readonly matterTypeId: string;
  readonly practiceAreaId: string;
  readonly leadAttorneyId: string;
  readonly description?: string;
  readonly priority?: Matter["priority"];
  readonly teamMemberIds?: readonly string[];
  readonly tags?: readonly string[];
  readonly customFields?: Readonly<Record<string, string>>;
}

export interface UpdateMatterV1Request {
  readonly title?: string;
  readonly description?: string | null;
  readonly matterStatus?: Matter["matterStatus"];
  readonly priority?: Matter["priority"];
  readonly leadAttorneyId?: string;
  readonly teamMemberIds?: readonly string[];
  readonly tags?: readonly string[];
  readonly customFields?: Readonly<Record<string, string>>;
}

export interface MatterListResponseV1 {
  readonly items: readonly MatterSummaryV1[];
  readonly pagination: {
    readonly limit: number;
    readonly nextCursor: string | null;
    readonly prevCursor: string | null;
    readonly hasMore: boolean;
  };
}

export interface MatterDeleteResponseV1 {
  readonly matterId: string;
  readonly status: "archived";
}

export type MatterApiMetadata = EntityApiMetadata;

const matterMetadataCache = createEntityMetadataCache();

export function resetMatterApiMetadataCache(): void {
  matterMetadataCache.reset();
}

export function seedMatterApiMetadata(
  matterId: string,
  metadata: MatterApiMetadata,
): void {
  matterMetadataCache.seed(matterId, metadata);
}

export function touchMatterApiMetadata(
  matterId: string,
  created = false,
): MatterApiMetadata {
  return matterMetadataCache.touch(matterId, created);
}

export function getMatterApiMetadata(matterId: string): MatterApiMetadata {
  return matterMetadataCache.get(matterId);
}

export function mapMatterToSummaryV1(
  matter: Matter,
  metadata: MatterApiMetadata,
): MatterSummaryV1 {
  return {
    matterId: matter.matterId,
    matterReference: matter.matterReference,
    title: matter.title,
    clientId: matter.clientId,
    matterStatus: matter.matterStatus,
    priority: matter.priority,
    leadAttorneyId: matter.leadAttorneyId,
    openedAt: matter.openedAt,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
  };
}

export function mapMatterToDetailV1(
  matter: Matter,
  metadata: MatterApiMetadata,
): MatterDetailV1 {
  return {
    ...mapMatterToSummaryV1(matter, metadata),
    version: metadata.version,
    description: matter.description ?? null,
    matterTypeId: matter.matterTypeId,
    practiceAreaId: matter.practiceAreaId,
    closedAt: matter.closedAt ?? null,
    courtId: matter.courtId ?? null,
    judgeId: matter.judgeId ?? null,
    teamMemberIds: [...matter.teamMemberIds],
    tags: [...matter.tags],
    customFields: { ...matter.customFields },
  };
}
