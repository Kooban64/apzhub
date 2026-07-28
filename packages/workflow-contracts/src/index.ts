/**
 * @apzhub/workflow-contracts — Workflow Platform contracts.
 * APZWORKFLOW-001/002/007 baseline + APZHUB-PLATFORM-WORKFLOW-003 canonical IM surface.
 * Provider-neutral models + service interfaces. No business logic. No n8n DTOs.
 */

export { WORKFLOW_CONTRACTS_VERSION } from "./version";
export * from "./identifiers";
export * from "./enums/catalogue";
export * from "./common/context";
export * from "./common/audit";
export * from "./domain/workflow";
export * from "./domain/runtime";
export * from "./permissions/catalogue";
export * from "./services/workflow-service";
export * from "./services/platform-gateway";
export * from "./services/engine-gateway";
export type {
  WorkflowRunService,
  StartWorkflowRunInput,
  ListWorkflowRunsInput,
} from "./services/run-service";
export type {
  WorkflowScheduleService,
  CreateWorkflowScheduleInput,
  CreateWorkflowTriggerBindingInput,
} from "./services/schedule-service";
export type {
  WorkflowTaskService,
  ApprovalService,
  ListWorkflowTasksInput,
  CompleteWorkflowTaskInput,
  ApprovalDecisionInput,
} from "./services/task-service";
export type {
  WorkflowNotificationService,
  NotificationService,
  PublishWorkflowNotificationInput,
} from "./services/notification-service";
export type { CapabilityService, HealthService } from "./services/capability-service";
export type { WorkflowCanonicalGateway } from "./services/canonical-gateway";

export {
  EXAMPLE_WORKFLOW_CONTEXT,
  EXAMPLE_WORKFLOW,
  EXAMPLE_WORKFLOW_TEMPLATE,
  EXAMPLE_WORKFLOW_DEFINITION,
  EXAMPLE_WORKFLOW_RUN,
  EXAMPLE_WORKFLOW_SCHEDULE,
  EXAMPLE_TRIGGER_BINDING,
  EXAMPLE_APPROVAL_TASK,
  EXAMPLE_SECRET_REFERENCE,
  EXAMPLE_WORKFLOW_HEALTH,
  EXAMPLE_WORKFLOW_CAPABILITY,
  EXAMPLE_WORKFLOW_PROVIDER,
} from "./examples/example-shapes";
