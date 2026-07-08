import type { Matter } from "@apzhub/legal-business-core";

import type { MatterListCriteria } from "./matter-types";

export function matchesMatterCriteria(
  matter: Matter,
  criteria?: MatterListCriteria,
): boolean {
  if (!criteria) {
    return true;
  }

  if (
    criteria.status &&
    criteria.status !== "all" &&
    matter.matterStatus !== criteria.status
  ) {
    return false;
  }

  if (
    criteria.clientId &&
    criteria.clientId !== "all" &&
    matter.clientId !== criteria.clientId
  ) {
    return false;
  }

  if (
    criteria.priority &&
    criteria.priority !== "all" &&
    matter.priority !== criteria.priority
  ) {
    return false;
  }

  const query = criteria.query?.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    matter.title,
    matter.matterReference,
    matter.matterTypeId,
    matter.matterStatus,
    matter.practiceAreaId,
    matter.priority,
    matter.leadAttorneyId,
    ...matter.tags,
    ...Object.values(matter.customFields),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function sortMattersByTitle(matters: readonly Matter[]): Matter[] {
  return [...matters].sort((left, right) => left.title.localeCompare(right.title));
}
