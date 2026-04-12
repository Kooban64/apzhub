import { z } from "zod";

export const platformRoleSchema = z.enum(["user", "admin", "superadmin"]);
export type PlatformRole = z.infer<typeof platformRoleSchema>;

export const sessionModesSchema = z.enum(["workspace", "admin"]);
export type SessionModes = z.infer<typeof sessionModesSchema>;

export const sessionStatusSchema = z.enum(["active", "expired", "anonymous"]);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const authenticatedUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  status: z.enum(["active", "suspended"]),
});
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

export const sessionSnapshotSchema = z.object({
  sessionStatus: sessionStatusSchema,
  user: authenticatedUserSchema.nullable(),
  platformRole: platformRoleSchema,
  availableModes: z.array(sessionModesSchema),
  defaultLandingMode: sessionModesSchema,
  defaultLandingPath: z.string(),
  /**
   * OAuth / integration link state — **not** core identity (user id, email, roles remain authoritative).
   * Long term this belongs to a profile/integration service; the session carries a denormalized snapshot for UI only.
   */
  linkedAccounts: z.object({
    google: z.enum(["linked", "not_linked", "error"]),
  }),
  /** Mock-only hints for Phase 8 UI (e.g. post-disconnect copy); omit in production paths later. */
  mockProfileFlags: z
    .object({
      googleDisconnected: z.boolean().optional(),
    })
    .optional(),
  /** When set and in the past, `proxy` and session resolution treat the session as expired. */
  expiresAtEpochSec: z.number().optional(),
  /** Server-backed session id (local identity); used with signed `s2.` cookie transport. */
  authSessionId: z.string().uuid().optional(),
});

export type SessionSnapshot = z.infer<typeof sessionSnapshotSchema>;

export function anonymousSessionSnapshot(): SessionSnapshot {
  return {
    sessionStatus: "anonymous",
    user: null,
    platformRole: "user",
    availableModes: [],
    defaultLandingMode: "workspace",
    defaultLandingPath: "/workspace",
    linkedAccounts: { google: "not_linked" },
    mockProfileFlags: undefined,
  };
}
