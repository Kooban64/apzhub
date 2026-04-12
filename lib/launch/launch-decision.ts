import { z } from "zod";

import { launchReasonCodeSchema } from "@/lib/launch/launch-reason-code";
import { launchMethodSchema } from "@/lib/launch/launch-method";
import { launchReadinessSchema } from "@/lib/launch/launch-readiness";
import { launchTargetSchema } from "@/lib/launch/launch-target";
import { workspaceServiceIdSchema } from "@/lib/workspace/workspace-config";

/**
 * Outcome of the launch decision layer. Callers must not merge this with realization or job rows.
 */
export const launchDecisionResultSchema = z.object({
  serviceId: workspaceServiceIdSchema,
  method: launchMethodSchema,
  readiness: launchReadinessSchema,
  /** True only when `readiness` is `ready` and `target` is present. */
  allowed: z.boolean(),
  /** Stable machine reason when launch is not allowed or deferred. */
  reasonCode: launchReasonCodeSchema.optional(),
  /** Copy safe for launcher tiles and end-user toasts. */
  userMessage: z.string(),
  /** Optional richer explanation for admin surfaces; omit when same as user copy. */
  operatorMessage: z.string().optional(),
  target: launchTargetSchema.nullable(),
  /** Whether an audit event should be recorded for this attempt (Phase 7 hook only). */
  emitAuditEvent: z.boolean(),
});

export type LaunchDecisionResult = z.infer<typeof launchDecisionResultSchema>;
