/**
 * WorkflowScheduleService — interfaces only (APZHUB-PLATFORM-WORKFLOW-003).
 */

import type { WorkflowSchedule, WorkflowTriggerBinding } from "../domain/runtime";
import type {
  WorkflowId,
  WorkflowScheduleId,
  WorkflowTriggerId,
  WorkflowVersionId,
} from "../identifiers";
import type { WorkflowPlatformServiceContext } from "./platform-gateway";

export type CreateWorkflowScheduleInput = {
  readonly workflowId: WorkflowId;
  readonly versionId?: WorkflowVersionId;
  readonly triggerId?: WorkflowTriggerId;
  readonly cron: string;
  readonly timezone?: string;
};

export type CreateWorkflowTriggerBindingInput = {
  readonly workflowId: WorkflowId;
  readonly versionId?: WorkflowVersionId;
  readonly kind: "manual" | "event" | "api" | "schedule";
  readonly label?: string;
  readonly eventType?: string;
  readonly enabled?: boolean;
};

export type WorkflowScheduleService = {
  readonly create: (
    ctx: WorkflowPlatformServiceContext,
    input: CreateWorkflowScheduleInput,
  ) => Promise<WorkflowSchedule>;
  readonly get: (
    ctx: WorkflowPlatformServiceContext,
    scheduleId: WorkflowScheduleId,
  ) => Promise<WorkflowSchedule>;
  readonly list: (
    ctx: WorkflowPlatformServiceContext,
    workflowId?: WorkflowId,
  ) => Promise<readonly WorkflowSchedule[]>;
  readonly arm: (
    ctx: WorkflowPlatformServiceContext,
    scheduleId: WorkflowScheduleId,
  ) => Promise<WorkflowSchedule>;
  readonly pause: (
    ctx: WorkflowPlatformServiceContext,
    scheduleId: WorkflowScheduleId,
  ) => Promise<WorkflowSchedule>;
  readonly retire: (
    ctx: WorkflowPlatformServiceContext,
    scheduleId: WorkflowScheduleId,
  ) => Promise<WorkflowSchedule>;
  readonly createTriggerBinding: (
    ctx: WorkflowPlatformServiceContext,
    input: CreateWorkflowTriggerBindingInput,
  ) => Promise<WorkflowTriggerBinding>;
};
