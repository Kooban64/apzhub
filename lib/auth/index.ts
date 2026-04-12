export { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
export { getSessionSnapshot } from "@/lib/auth/get-session-server";
export { encodeSessionCookie, decodeSessionCookie } from "@/lib/auth/session-cookie";
export {
  buildMockSessionFromCredentials,
  mockAdminSession,
  mockUserSession,
} from "@/lib/auth/mock-session";
export {
  adminModeAllowed,
  canAccessAdminFromSnapshot,
  dualWorkspaceAdminMode,
} from "@/lib/auth/mode-contract";
export { canAccessPath, isSessionExpired } from "@/lib/auth/session-policy";
export { sessionCredentialStateSchema } from "@/lib/auth/session-credential-state";
export type { SessionCredentialState } from "@/lib/auth/session-credential-state";
export { resolveSessionCookie } from "@/lib/auth/session-resolution";
export type { ResolvedSessionCookie } from "@/lib/auth/session-resolution";
export {
  anonymousSessionSnapshot,
  authenticatedUserSchema,
  platformRoleSchema,
  sessionModesSchema,
  sessionSnapshotSchema,
  sessionStatusSchema,
} from "@/lib/auth/session-types";
export type {
  AuthenticatedUser,
  PlatformRole,
  SessionModes,
  SessionSnapshot,
  SessionStatus,
} from "@/lib/auth/session-types";
