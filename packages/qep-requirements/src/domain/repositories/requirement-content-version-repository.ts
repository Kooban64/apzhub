import type { RequirementContentVersion } from "../content-version/requirement-content-version";
import type { RequirementContentVersionId } from "../content-version/requirement-content-version-id";
import type { RequirementContentVersionNumber } from "../content-version/requirement-content-version-number";
import type { RequirementId } from "../value-objects/requirement-id";

export type RequirementContentVersionMetadata = Omit<RequirementContentVersion, "snapshot">;

export interface RequirementContentVersionRepository {
  append(version: RequirementContentVersion): Promise<RequirementContentVersion>;
  getById(tenantId: string, id: RequirementContentVersionId): Promise<RequirementContentVersion | null>;
  getByRequirementAndNumber(
    tenantId: string,
    requirementId: RequirementId,
    versionNumber: RequirementContentVersionNumber,
  ): Promise<RequirementContentVersion | null>;
  getLatest(tenantId: string, requirementId: RequirementId): Promise<RequirementContentVersion | null>;
  listMetadata(
    tenantId: string,
    requirementId: RequirementId,
    pagination?: { readonly limit?: number; readonly offset?: number },
  ): Promise<readonly RequirementContentVersionMetadata[]>;
  exists(
    tenantId: string,
    requirementId: RequirementId,
    versionNumber: RequirementContentVersionNumber,
  ): Promise<boolean>;
}
