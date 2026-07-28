/**
 * Canonical Workflow Platform contracts gateway composition
 * (APZHUB-PLATFORM-WORKFLOW-003).
 *
 * Interfaces only — not wired into PlatformServiceGateway by this programme.
 * Existing nested {@link WorkflowPlatformGateway} (definition + engine) remains
 * the implemented SoR surface (APZWORKFLOW-002 / 007).
 */

import type { ApprovalService, WorkflowTaskService } from "./task-service";
import type { CapabilityService, HealthService } from "./capability-service";
import type { NotificationService } from "./notification-service";
import type {
  WorkflowService,
  WorkflowTemplateService,
  WorkflowPlatformGateway,
} from "./platform-gateway";
import type { WorkflowRunService } from "./run-service";
import type { WorkflowScheduleService } from "./schedule-service";

/**
 * Canonical composition view (APZHUB-PLATFORM-WORKFLOW-003/004).
 * Prefer {@link WorkflowPlatformGateway} on `gateway.workflow` (runtime facets included).
 * This type remains for documentation / selective composition.
 */
export type WorkflowCanonicalGateway = {
  readonly workflows: WorkflowService;
  readonly templates: WorkflowTemplateService;
  readonly runs: WorkflowRunService;
  readonly schedules: WorkflowScheduleService;
  readonly tasks: WorkflowTaskService;
  readonly approvals: ApprovalService;
  readonly notifications: NotificationService;
  readonly capabilities: CapabilityService;
  readonly health: HealthService;
  /** Full nested gateway including SoR + engine + runtime. */
  readonly platform: WorkflowPlatformGateway;
};
