import { z } from "zod";

/** Cross-cutting domain label for audit, alerts, and privileged-action traces. */
export const adminTraceDomainSchema = z.enum([
  "identity",
  "access",
  "provisioning",
  "launch",
  "linked_account",
  "security",
  "platform",
]);

export type AdminTraceDomain = z.infer<typeof adminTraceDomainSchema>;

export const auditOutcomeSchema = z.enum(["success", "failure", "blocked", "pending"]);

export type AuditOutcome = z.infer<typeof auditOutcomeSchema>;
