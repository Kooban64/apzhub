import type { AccessRealizationStatus } from "@/lib/admin/access/realization-status";
import type { AdminAccessData } from "@/lib/admin/mock-access-data";
import { getMockAccessData } from "@/lib/admin/mock-access-data";
import type { SessionSnapshot } from "@/lib/auth/session-types";
import type { WorkspaceServiceId } from "@/lib/workspace/workspace-config";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Map signed-in workspace user to **admin access directory** `userId` for matrix posture.
 * - Local / portal users: stable `users.id` UUID (matches `buildAdminAccessDataFromDb`).
 * - Mock identity: match mock directory by email, then legacy dev shortcuts (`ops.admin` → u-1001, `pat@` → u-1002).
 */
export function directorySubjectIdForSession(snapshot: SessionSnapshot): string | null {
  if (snapshot.sessionStatus !== "active" || !snapshot.user) {
    return null;
  }
  const { id, email } = snapshot.user;
  if (UUID_RE.test(id)) {
    return id;
  }
  const lower = email.toLowerCase();
  const mockData = getMockAccessData();
  const byEmail = mockData.directory.users.find((u) => u.email.toLowerCase() === lower);
  if (byEmail) {
    return byEmail.id;
  }
  if (lower.includes("ops.admin")) {
    return "u-1001";
  }
  if (lower.includes("pat@")) {
    return "u-1002";
  }
  return null;
}

/** @deprecated Use `directorySubjectIdForSession` — kept for incremental refactors. */
export const mockAdminUserIdForSession = directorySubjectIdForSession;

export function readMatrixPostureFromModel(
  data: AdminAccessData,
  directoryUserId: string,
  serviceId: WorkspaceServiceId,
): { effectiveRole: string; realization: AccessRealizationStatus | null } {
  const cell = data.matrix.cells.find((c) => c.userId === directoryUserId && c.serviceId === serviceId);
  if (!cell) {
    return { effectiveRole: "none", realization: "not_assigned" };
  }
  return {
    effectiveRole: cell.effectiveRole,
    realization: cell.realizationStatus ?? null,
  };
}

/**
 * Client-side mock posture when `APZHUB_ACCESS_SOURCE=mock` only.
 * In real mode callers must use `/api/workspace/access-posture` — this returns a safe non-leaking fallback if mis-invoked.
 */
export function readMatrixPostureForUserSync(directoryUserId: string, serviceId: WorkspaceServiceId) {
  if (typeof window !== "undefined") {
    const src = (process.env.NEXT_PUBLIC_APZHUB_ACCESS_SOURCE ?? "mock").toLowerCase().trim();
    if (src !== "mock") {
      return { effectiveRole: "none", realization: "pending" as AccessRealizationStatus };
    }
  }
  return readMatrixPostureFromModel(getMockAccessData(), directoryUserId, serviceId);
}
