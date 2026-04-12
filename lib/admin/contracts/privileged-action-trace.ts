import { z } from "zod";

import { adminTraceDomainSchema, auditOutcomeSchema } from "@/lib/admin/contracts/admin-trace-domain";

export const privilegedActionVerbSchema = z.enum([
  "user_suspend",
  "user_resume",
  "role_assign",
  "policy_update",
  "connector_rotate_secret",
  "tenant_policy_update",
  "manual_provisioning_override",
  /** Internal service launch (JWT mint / OIDC start) — operator traceability. */
  "service_launch",
]);

export type PrivilegedActionVerb = z.infer<typeof privilegedActionVerbSchema>;

/** Append-only privileged action record for operator traceability (mock Phase 9). */
export const adminPrivilegedActionTraceSchema = z.object({
  id: z.string(),
  correlationId: z.string(),
  actor: z.string(),
  verb: privilegedActionVerbSchema,
  target: z.string(),
  domain: adminTraceDomainSchema,
  at: z.string(),
  outcome: auditOutcomeSchema,
  contextSummary: z.string().optional(),
});

export type AdminPrivilegedActionTrace = z.infer<typeof adminPrivilegedActionTraceSchema>;

export const adminPrivilegedActionListSchema = z.object({
  items: z.array(adminPrivilegedActionTraceSchema),
});
