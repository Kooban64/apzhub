import { z } from "zod";

import { adminTraceDomainSchema, auditOutcomeSchema } from "@/lib/admin/contracts/admin-trace-domain";

export const adminAuditEventSchema = z.object({
  id: z.string(),
  actor: z.string(),
  /** Action verb (stable identifier for filtering). */
  verb: z.string(),
  target: z.string(),
  at: z.string(),
  domain: adminTraceDomainSchema,
  outcome: auditOutcomeSchema,
  /** Legacy structured fields; prefer contextSummary for new events. */
  metadata: z.string().optional(),
  contextSummary: z.string().optional(),
});

export type AdminAuditEvent = z.infer<typeof adminAuditEventSchema>;

export const adminAuditSnippetSchema = z.object({
  events: z.array(adminAuditEventSchema),
});

export type AdminAuditSnippet = z.infer<typeof adminAuditSnippetSchema>;
