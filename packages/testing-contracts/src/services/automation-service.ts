import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { AutomationJob } from "../domain";
import type { AutomationJobId } from "../identifiers";

/** Automation job metadata contract — no runner or engine execution. */
export interface AutomationService {
  listJobs(ctx: ServiceRequestContext): Promise<readonly AutomationJob[]>;
  getJob(ctx: ServiceRequestContext, id: AutomationJobId): Promise<AutomationJob>;
  enqueueJob(
    ctx: ServiceRequestContext,
    input: Omit<
      AutomationJob,
      "id" | "createdAt" | "updatedAt" | "status" | "queuedAt"
    > & {
      readonly queuedAt?: string;
    },
  ): Promise<AutomationJob>;
  updateJobStatus(
    ctx: ServiceRequestContext,
    id: AutomationJobId,
    status: AutomationJob["status"],
    errorSummary?: string,
  ): Promise<AutomationJob>;
  cancelJob(ctx: ServiceRequestContext, id: AutomationJobId): Promise<AutomationJob>;
}
