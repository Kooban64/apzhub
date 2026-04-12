import type { AccessRealizationStatus } from "@/lib/admin/access/realization-status";
import type { AdminMatrixCell } from "@/lib/admin/access/matrix";
import type { AdminUserAccessDetail } from "@/lib/admin/access/user-access-inspector";
import type { AdminServiceAccessLine } from "@/lib/admin/access/user-access-inspector";
import { adminUserDirectorySchema, type AdminUserRow } from "@/lib/admin/access/user-directory";
import { adminAccessDataSchema } from "@/lib/admin/access/admin-access-data-schema";
import type { AdminAccessData } from "@/lib/admin/mock-access-data";
import { getMockAccessData } from "@/lib/admin/mock-access-data";
import { getAccessOptimisticRealization } from "@/lib/adapters/env";
import type { AppDbClient } from "@/db/client";
import { getDb } from "@/db/client";
import { computeEffectiveServiceAccessByServiceId } from "@/lib/access/effective-access";
import { listAllBundleAssignments, listAllServiceOverrides, listAllSubjectFlags } from "@/lib/access/repository/access-repository";
import { eq } from "drizzle-orm";

import { users } from "@/db/schema";

function effectiveSuspendedForUser(user: AdminUserRow, flagsRow: { suspended: boolean | null } | undefined): boolean {
  if (!flagsRow) {
    return user.status === "suspended";
  }
  if (flagsRow.suspended === null) {
    return user.status === "suspended";
  }
  return flagsRow.suspended;
}

function realizationForMaterializedLine(
  effective: { roleId: string; roleLabel: string } | null,
  suspended: boolean,
): AccessRealizationStatus {
  if (suspended) {
    return "suspended";
  }
  if (!effective) {
    return "not_assigned";
  }
  if (getAccessOptimisticRealization()) {
    return "provisioned";
  }
  return "pending";
}

/** True if this subject id is a mock catalog user or a row in `users` (portal identity). */
export async function isAccessCatalogSubject(subjectId: string, tx?: AppDbClient): Promise<boolean> {
  if (getMockAccessData().directory.users.some((u) => u.id === subjectId)) {
    return true;
  }
  const db = tx ?? getDb();
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.id, subjectId)).limit(1);
  return Boolean(row);
}

async function portalUsersAsAdminRows(db: AppDbClient): Promise<AdminUserRow[]> {
  const rows = await db.select().from(users);
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    displayName: r.displayName,
    platformRole: r.platformRole,
    status: r.status,
    linkedAccounts: [{ provider: "Portal", state: "not_linked" as const }],
    lastLoginAt: r.updatedAt.toISOString(),
    accessSummary: { label: "Portal identity", tone: "ok" as const },
    issueFlags: [],
  }));
}

/**
 * Build `AdminAccessData` from static mock catalog + Postgres assignment/override/flag rows +
 * real `users` rows (portal identities) merged into the directory.
 * Optional `tx` scopes reads to an open transaction (read-your-writes).
 */
export async function buildAdminAccessDataFromDb(tx?: AppDbClient): Promise<AdminAccessData> {
  const db = tx ?? getDb();
  const baseline = getMockAccessData();

  const [assignRows, overrideRows, flagRows, portalRows] = await Promise.all([
    listAllBundleAssignments(db),
    listAllServiceOverrides(db),
    listAllSubjectFlags(db),
    portalUsersAsAdminRows(db),
  ]);

  const assignmentsBySubject = new Map<string, string[]>();
  for (const r of assignRows) {
    const list = assignmentsBySubject.get(r.subjectId) ?? [];
    list.push(r.bundleId);
    assignmentsBySubject.set(r.subjectId, list);
  }

  const overridesBySubject = new Map<string, Map<string, string>>();
  for (const r of overrideRows) {
    if (r.effectiveRole === null || r.effectiveRole === undefined || r.effectiveRole === "") {
      continue;
    }
    const m = overridesBySubject.get(r.subjectId) ?? new Map<string, string>();
    m.set(r.serviceId, r.effectiveRole);
    overridesBySubject.set(r.subjectId, m);
  }

  const flagsBySubject = new Map(flagRows.map((r) => [r.subjectId, r]));

  const serviceIds = baseline.services.services.map((s) => s.id);

  const dbEmails = new Set(portalRows.map((u) => u.email.toLowerCase()));
  const mockOnlyUsers = baseline.directory.users.filter((u) => !dbEmails.has(u.email.toLowerCase()));
  const mergedUsers = [...portalRows, ...mockOnlyUsers];

  const directory = adminUserDirectorySchema.parse({
    users: mergedUsers.map((u) => {
      const flags = flagsBySubject.get(u.id);
      const suspended = effectiveSuspendedForUser(u, flags);
      return {
        ...u,
        status: suspended ? ("suspended" as const) : ("active" as const),
      };
    }),
  });

  const userAccessByUserId: AdminAccessData["userAccessByUserId"] = {};
  const matrixCells: AdminMatrixCell[] = [];

  for (const user of directory.users) {
    const mockDetail = baseline.userAccessByUserId[user.id];
    const fallbackDetail: AdminUserAccessDetail =
      mockDetail ??
      ({
        userId: user.id,
        displayName: user.displayName,
        email: user.email,
        platformRole: user.platformRole,
        bundleAssignments: [],
        serviceAccess: [],
      } satisfies AdminUserAccessDetail);

    const flags = flagsBySubject.get(user.id);
    const suspended = effectiveSuspendedForUser(user, flags);
    const bundlesFromDb = flags?.bundlesFromDb === true;
    const bundleIds = bundlesFromDb
      ? (assignmentsBySubject.get(user.id) ?? [])
      : fallbackDetail.bundleAssignments.map((b) => b.bundleId);

    const overrideMap = overridesBySubject.get(user.id) ?? new Map<string, string>();
    const effectiveByService = computeEffectiveServiceAccessByServiceId({
      bundleIds,
      bundleDetailsById: baseline.bundleDetailsById,
      serviceDetailsById: baseline.serviceDetailsById,
      serviceIds,
      overrideByServiceId: overrideMap,
      suspended,
    });

    const serviceAccess: AdminServiceAccessLine[] = [];
    for (const serviceId of serviceIds) {
      const eff = effectiveByService.get(serviceId) ?? null;
      const serviceName = baseline.services.services.find((s) => s.id === serviceId)?.name ?? serviceId;
      const line: AdminServiceAccessLine = {
        serviceId,
        serviceName,
        effectiveRole: eff?.effectiveDisplay ?? "none",
        source: eff?.source ?? "none",
        realizationStatus: realizationForMaterializedLine(eff, suspended),
      };
      serviceAccess.push(line);

      const cell: AdminMatrixCell = {
        userId: user.id,
        serviceId,
        effectiveRole: eff?.effectiveDisplay ?? "none",
        sourceVisibility: eff?.source ?? "none",
        realizationStatus: realizationForMaterializedLine(eff, suspended),
      };
      matrixCells.push(cell);
    }

    userAccessByUserId[user.id] = {
      userId: user.id,
      displayName: user.displayName,
      email: user.email,
      platformRole: user.platformRole,
      bundleAssignments: bundleIds.map((bundleId) => ({
        bundleId,
        bundleName: baseline.bundles.bundles.find((b) => b.id === bundleId)?.name ?? bundleId,
      })),
      serviceAccess,
    };
  }

  const out: AdminAccessData = {
    directory,
    userAccessByUserId,
    matrix: {
      services: baseline.matrix.services,
      cells: matrixCells,
    },
    bundles: baseline.bundles,
    bundleDetailsById: baseline.bundleDetailsById,
    services: baseline.services,
    serviceDetailsById: baseline.serviceDetailsById,
  };

  return adminAccessDataSchema.parse(out) as AdminAccessData;
}
