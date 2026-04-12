import { z } from "zod";

/** Google link state aligned with `SessionSnapshot.linkedAccounts.google`. */
export const googleLinkStateSchema = z.enum(["linked", "not_linked", "error"]);

export type GoogleLinkState = z.infer<typeof googleLinkStateSchema>;

export const linkedAccountsSnapshotSchema = z.object({
  google: googleLinkStateSchema,
});

export type LinkedAccountsSnapshot = z.infer<typeof linkedAccountsSnapshotSchema>;
