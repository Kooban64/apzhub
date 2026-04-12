import { z } from "zod";

export const adminUserIssueFlagSchema = z.enum(["mfa_missing", "suspended", "stale_login", "policy_conflict"]);

export type AdminUserIssueFlag = z.infer<typeof adminUserIssueFlagSchema>;

export const adminLinkedAccountSummarySchema = z.object({
  provider: z.string(),
  state: z.enum(["linked", "not_linked", "error"]),
});

export type AdminLinkedAccountSummary = z.infer<typeof adminLinkedAccountSummarySchema>;

export const adminAccessSummarySchema = z.object({
  label: z.string(),
  tone: z.enum(["ok", "warning", "critical"]).default("ok"),
});

export type AdminAccessSummary = z.infer<typeof adminAccessSummarySchema>;

export const adminUserRowSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  platformRole: z.enum(["user", "admin", "superadmin"]),
  status: z.enum(["active", "suspended"]),
  linkedAccounts: z.array(adminLinkedAccountSummarySchema),
  lastLoginAt: z.string(),
  accessSummary: adminAccessSummarySchema,
  issueFlags: z.array(adminUserIssueFlagSchema),
});

export type AdminUserRow = z.infer<typeof adminUserRowSchema>;

export const adminUserDirectorySchema = z.object({
  users: z.array(adminUserRowSchema),
});

export type AdminUserDirectory = z.infer<typeof adminUserDirectorySchema>;
