import type { AuthenticatedUser, SessionSnapshot } from "@/lib/auth/session-types";

function userFromEmail(email: string): AuthenticatedUser {
  const local = email.split("@")[0] ?? "user";
  return {
    id: `mock:${email}`,
    email,
    displayName: local.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    status: "active",
  };
}

/** Dev-only heuristic: local part includes "superadmin" → superadmin; "admin" → admin. */
export function buildMockSessionFromCredentials(email: string): SessionSnapshot {
  const user = userFromEmail(email);
  const local = email.split("@")[0] ?? "";
  const isSuper = /superadmin/i.test(local);
  const isAdmin = isSuper || /admin/i.test(local);
  const platformRole = isSuper ? "superadmin" : isAdmin ? "admin" : "user";
  const availableModes = isAdmin ? (["workspace", "admin"] as const) : (["workspace"] as const);
  const defaultLandingMode = isAdmin ? "admin" : "workspace";
  const defaultLandingPath = isAdmin ? "/admin" : "/workspace";
  const now = Math.floor(Date.now() / 1000);
  return {
    sessionStatus: "active",
    user,
    platformRole,
    availableModes: [...availableModes],
    defaultLandingMode,
    defaultLandingPath,
    linkedAccounts: { google: "not_linked" },
    expiresAtEpochSec: now + 60 * 60 * 8,
  };
}

export function mockAdminSession(): SessionSnapshot {
  return buildMockSessionFromCredentials("ops.admin@example.com");
}

export function mockUserSession(): SessionSnapshot {
  return buildMockSessionFromCredentials("pat@example.com");
}
