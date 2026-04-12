import { sessionSnapshotSchema, type SessionSnapshot } from "@/lib/auth/session-types";

export type UserRowForSession = {
  id: string;
  email: string;
  displayName: string;
  status: "active" | "suspended";
  platformRole: "user" | "admin" | "superadmin";
};

export function buildSessionSnapshotForUser(
  row: UserRowForSession,
  opts: { expiresAtEpochSec: number; authSessionId: string },
): SessionSnapshot {
  const availableModes =
    row.platformRole === "user" ? (["workspace"] as const) : (["workspace", "admin"] as const);
  const defaultLandingMode = row.platformRole === "user" ? "workspace" : "admin";
  const defaultLandingPath = row.platformRole === "user" ? "/workspace" : "/admin";
  return sessionSnapshotSchema.parse({
    sessionStatus: "active",
    user: {
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      status: row.status,
    },
    platformRole: row.platformRole,
    availableModes: [...availableModes],
    defaultLandingMode,
    defaultLandingPath,
    linkedAccounts: { google: "not_linked" },
    expiresAtEpochSec: opts.expiresAtEpochSec,
    authSessionId: opts.authSessionId,
  });
}

/** OIDC / legacy JSON cookie transport: stable portal user id without `authSessionId`. */
export function buildOidcLinkedSessionSnapshot(row: UserRowForSession, expiresAtEpochSec: number): SessionSnapshot {
  const availableModes =
    row.platformRole === "user" ? (["workspace"] as const) : (["workspace", "admin"] as const);
  const defaultLandingMode = row.platformRole === "user" ? "workspace" : "admin";
  const defaultLandingPath = row.platformRole === "user" ? "/workspace" : "/admin";
  return sessionSnapshotSchema.parse({
    sessionStatus: "active",
    user: {
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      status: row.status,
    },
    platformRole: row.platformRole,
    availableModes: [...availableModes],
    defaultLandingMode,
    defaultLandingPath,
    linkedAccounts: { google: "not_linked" },
    expiresAtEpochSec,
  });
}
