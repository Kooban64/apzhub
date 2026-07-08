import type { Matter } from "@apzhub/legal-business-core";

import { lawMatter } from "../legal-schema";

type MatterRow = typeof lawMatter.$inferSelect;

export function matterToRow(
  matter: Matter,
  tenantId: string,
): typeof lawMatter.$inferInsert {
  return {
    matterId: matter.matterId,
    tenantId,
    clientId: matter.clientId,
    matterReference: matter.matterReference,
    title: matter.title,
    description: matter.description ?? null,
    matterTypeId: matter.matterTypeId,
    matterStatus: matter.matterStatus,
    practiceAreaId: matter.practiceAreaId,
    priority: matter.priority,
    openedAt: new Date(matter.openedAt),
    closedAt: matter.closedAt ? new Date(matter.closedAt) : null,
    courtId: matter.courtId ?? null,
    judgeId: matter.judgeId ?? null,
    leadAttorneyId: matter.leadAttorneyId,
    teamMemberIds: [...matter.teamMemberIds],
    tags: [...matter.tags],
    customFields: { ...matter.customFields },
  };
}

export function rowToMatter(row: MatterRow): Matter {
  return {
    matterId: row.matterId,
    matterReference: row.matterReference,
    title: row.title,
    description: row.description ?? undefined,
    clientId: row.clientId,
    matterTypeId: row.matterTypeId,
    matterStatus: row.matterStatus as Matter["matterStatus"],
    practiceAreaId: row.practiceAreaId,
    priority: row.priority as Matter["priority"],
    openedAt: row.openedAt.toISOString(),
    closedAt: row.closedAt?.toISOString(),
    courtId: row.courtId ?? undefined,
    judgeId: row.judgeId ?? undefined,
    leadAttorneyId: row.leadAttorneyId,
    teamMemberIds: row.teamMemberIds ?? [],
    tags: row.tags ?? [],
    customFields: row.customFields ?? {},
  };
}
