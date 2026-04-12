import { z } from "zod";

import { launchMethodSchema } from "@/lib/launch/launch-method";
import { launchReadinessSchema } from "@/lib/launch/launch-readiness";
import { launchReasonCodeSchema } from "@/lib/launch/launch-reason-code";
import { workspaceServiceIdSchema } from "@/lib/workspace/workspace-config";

import type { LaunchEventOutcome } from "@/db/schema/launch";

export type { LaunchEventOutcome };

/**
 * `reason_code` values:
 * - Policy: {@link launchReasonCodeSchema} (e.g. `not_provisioned`)
 * - Execution: codes from `LAUNCH_EXECUTION_ERROR_CODES` (e.g. `SESSION_REQUIRED`)
 * Store the raw string only; do not merge user/operator copy into this column.
 */

export const launchEventOutcomesSchema = z.enum([
  "initiated",
  "redirect_started",
  "succeeded",
  "failed",
  "rejected",
]);

export const clientLaunchRejectedBodySchema = z.object({
  allowed: z.literal(false),
  serviceId: workspaceServiceIdSchema,
  method: launchMethodSchema,
  readiness: launchReadinessSchema,
  reasonCode: launchReasonCodeSchema.optional(),
  userMessage: z.string().min(1),
  operatorMessage: z.string().optional(),
  correlationId: z.string().optional(),
});

export type ClientLaunchRejectedBody = z.infer<typeof clientLaunchRejectedBodySchema>;
