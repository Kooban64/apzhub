import {
  createCommandRegistryFromDto,
  type ActionAuditHook,
  type ActionExecutor,
} from "@apzhub/command-framework";
import { createWorkbenchActionExecutorFromActionExecutor } from "@apzhub/command-framework";
import type { ActionRegistryDto } from "@apzhub/command-framework/server";
import type { EventBus } from "@apzhub/event-notification-framework";
import { createPlaceholderEventBus } from "@apzhub/event-notification-framework";
import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import type {
  WorkbenchRequest,
  WorkbenchRequestResult,
} from "@apzhub/workbench-framework";
import type { WorkbenchActionExecutor } from "@apzhub/workbench-framework";

import { ClientWorkflowService } from "./clients/client-workflow-service";
import { getSharedClientRepository } from "./clients/in-memory-client-repository";
import { DocumentWorkflowService } from "./documents/document-workflow-service";
import { getSharedDocumentRepository } from "./documents/in-memory-document-repository";
import { MatterWorkflowService } from "./matters/matter-workflow-service";
import { getSharedMatterRepository } from "./matters/in-memory-matter-repository";
import { createManifestAwareWorkbenchCommandBridge } from "./create-manifest-aware-workbench-bridge";
import {
  createDefaultLegalClientsDelegate,
  createLegalClientsActionExecutor,
} from "./legal-clients-command-handler";
import { createLegalDocumentsActionExecutor } from "./legal-documents-command-handler";
import { createLegalMattersActionExecutor } from "./legal-matters-command-handler";
import { createLegalTasksActionExecutor } from "./legal-tasks-command-handler";
import { createLegalCalendarActionExecutor } from "./legal-calendar-command-handler";
import { createLegalBillingActionExecutor } from "./legal-billing-command-handler";
import { createLegalSearchActionExecutor } from "./legal-search-command-handler";
import { createLegalTimeActionExecutor } from "./legal-time-command-handler";
import { createLegalTrustActionExecutor } from "./legal-trust-command-handler";
import { TrustWorkbenchService } from "./trust/trust-workbench-service";
import { getSharedTrustWorkbench } from "./trust/shared-trust-workbench";
import { InvoiceWorkflowService } from "./billing/invoice-workflow-service";
import { getSharedInvoiceRepository } from "./billing/in-memory-invoice-repository";
import { CalendarEventWorkflowService } from "./calendar/calendar-event-workflow-service";
import { getSharedCalendarEventRepository } from "./calendar/in-memory-calendar-event-repository";
import { TaskWorkflowService } from "./tasks/task-workflow-service";
import { getSharedTaskRepository } from "./tasks/in-memory-task-repository";
import { TimeEntryWorkflowService } from "./time/time-entry-workflow-service";
import { getSharedTimeEntryRepository } from "./time/in-memory-time-entry-repository";
import { wireLawSearchPublication } from "./search/law-publication-wiring";

export interface CreateAppActionExecutorOptions {
  readonly dto: ActionRegistryDto;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly publish: (request: WorkbenchRequest) => WorkbenchRequestResult;
  readonly auditHook?: ActionAuditHook;
  readonly eventBus?: EventBus;
  readonly actorId?: string;
}

export interface AppActionExecutorBundle {
  readonly actionExecutor: ActionExecutor;
  readonly workbenchActionExecutor: WorkbenchActionExecutor;
  readonly clientWorkflow: ClientWorkflowService;
  readonly matterWorkflow: MatterWorkflowService;
  readonly documentWorkflow: DocumentWorkflowService;
  readonly taskWorkflow: TaskWorkflowService;
  readonly calendarEventWorkflow: CalendarEventWorkflowService;
  readonly timeEntryWorkflow: TimeEntryWorkflowService;
  readonly invoiceWorkflow: InvoiceWorkflowService;
  readonly trustWorkflow: TrustWorkbenchService;
}

/** Hydrate executor stack for apps/law-platform — legal entity commands + manifest bridge. */
export function createAppActionExecutorBundle(
  options: CreateAppActionExecutorOptions,
): AppActionExecutorBundle {
  const hydration = createCommandRegistryFromDto(options.dto);
  const bridge = createManifestAwareWorkbenchCommandBridge(hydration.registry);
  const eventBus = options.eventBus ?? createPlaceholderEventBus();

  const clientRepository = getSharedClientRepository();

  const matterRepository = getSharedMatterRepository();

  const documentRepository = getSharedDocumentRepository();

  const taskRepository = getSharedTaskRepository();

  const calendarEventRepository = getSharedCalendarEventRepository();

  const timeEntryRepository = getSharedTimeEntryRepository();

  const invoiceRepository = getSharedInvoiceRepository();

  const clientWorkflowRaw = new ClientWorkflowService({
    repository: clientRepository,
    eventBus,
    actorId: options.actorId,
  });

  const matterWorkflowRaw = new MatterWorkflowService({
    repository: matterRepository,
    eventBus,
    actorId: options.actorId,
  });

  const documentWorkflowRaw = new DocumentWorkflowService({
    repository: documentRepository,
    eventBus,
    actorId: options.actorId,
  });

  const taskWorkflowRaw = new TaskWorkflowService({
    repository: taskRepository,
    eventBus,
    actorId: options.actorId,
  });

  const { clientWorkflow, matterWorkflow, documentWorkflow, taskWorkflow } =
    wireLawSearchPublication({
      clientWorkflow: clientWorkflowRaw,
      matterWorkflow: matterWorkflowRaw,
      documentWorkflow: documentWorkflowRaw,
      taskWorkflow: taskWorkflowRaw,
      env: { actorUserId: options.actorId },
    });

  const calendarEventWorkflow = new CalendarEventWorkflowService({
    repository: calendarEventRepository,
    eventBus,
    actorId: options.actorId,
  });

  const timeEntryWorkflow = new TimeEntryWorkflowService({
    repository: timeEntryRepository,
    eventBus,
    actorId: options.actorId,
  });

  const invoiceWorkflow = new InvoiceWorkflowService({
    repository: invoiceRepository,
    eventBus,
    actorId: options.actorId,
  });

  const trustWorkflow = new TrustWorkbenchService(getSharedTrustWorkbench());

  const platformDelegate = createDefaultLegalClientsDelegate({
    registry: hydration.registry,
    permissionAdapter: options.permissionAdapter,
    publish: options.publish,
    bridge,
    auditHook: options.auditHook,
  });

  const clientExecutor = createLegalClientsActionExecutor({
    registry: hydration.registry,
    permissionAdapter: options.permissionAdapter,
    publish: options.publish,
    workflow: clientWorkflow,
    delegate: platformDelegate,
  });

  const matterExecutor = createLegalMattersActionExecutor({
    registry: hydration.registry,
    permissionAdapter: options.permissionAdapter,
    workflow: matterWorkflow,
    delegate: clientExecutor,
  });

  const documentExecutor = createLegalDocumentsActionExecutor({
    registry: hydration.registry,
    permissionAdapter: options.permissionAdapter,
    workflow: documentWorkflow,
    delegate: matterExecutor,
  });

  const taskExecutor = createLegalTasksActionExecutor({
    registry: hydration.registry,
    permissionAdapter: options.permissionAdapter,
    workflow: taskWorkflow,
    delegate: documentExecutor,
  });

  const calendarExecutor = createLegalCalendarActionExecutor({
    registry: hydration.registry,
    permissionAdapter: options.permissionAdapter,
    workflow: calendarEventWorkflow,
    delegate: taskExecutor,
  });

  const timeExecutor = createLegalTimeActionExecutor({
    registry: hydration.registry,
    permissionAdapter: options.permissionAdapter,
    workflow: timeEntryWorkflow,
    delegate: calendarExecutor,
  });

  const billingExecutor = createLegalBillingActionExecutor({
    registry: hydration.registry,
    permissionAdapter: options.permissionAdapter,
    workflow: invoiceWorkflow,
    delegate: timeExecutor,
  });

  const trustExecutor = createLegalTrustActionExecutor({
    registry: hydration.registry,
    permissionAdapter: options.permissionAdapter,
    workflow: trustWorkflow,
    delegate: billingExecutor,
  });

  const actionExecutor = createLegalSearchActionExecutor({
    registry: hydration.registry,
    permissionAdapter: options.permissionAdapter,
    delegate: trustExecutor,
  });

  return {
    actionExecutor,
    workbenchActionExecutor:
      createWorkbenchActionExecutorFromActionExecutor(actionExecutor),
    clientWorkflow,
    matterWorkflow,
    documentWorkflow,
    taskWorkflow,
    calendarEventWorkflow,
    timeEntryWorkflow,
    invoiceWorkflow,
    trustWorkflow,
  };
}
