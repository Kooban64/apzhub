import { legalLookups } from "@apzhub/legal-business-core";

import { getSharedClientRepository } from "../clients/in-memory-client-repository";
import { getAttorneyDisplayName } from "./seed-attorneys";

export function getMatterTypeLabel(matterTypeId: string): string {
  return legalLookups.matterType.get(matterTypeId as never)?.label ?? matterTypeId;
}

export function getPracticeAreaLabel(practiceAreaId: string): string {
  return legalLookups.practiceArea.get(practiceAreaId)?.label ?? practiceAreaId;
}

export function getMatterStatusLabel(status: string): string {
  return legalLookups.matterStatus.get(status as never)?.label ?? status;
}

export function getClientDisplayName(clientId: string): string {
  return getSharedClientRepository().getById(clientId)?.displayName ?? clientId;
}

export function getLeadAttorneyLabel(attorneyId: string): string {
  return getAttorneyDisplayName(attorneyId);
}

export const MATTER_TYPE_OPTIONS = legalLookups.matterType.list();
export const PRACTICE_AREA_OPTIONS = legalLookups.practiceArea.list();
export const MATTER_STATUS_OPTIONS = legalLookups.matterStatus.list();
