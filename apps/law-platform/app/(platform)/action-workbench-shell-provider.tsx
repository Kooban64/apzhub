"use client";

import { useSession } from "@apzhub/auth";
import { createActionAuditEventBusHook } from "@apzhub/event-notification-framework";
import type { ActionExecutor } from "@apzhub/command-framework";
import type { ActionRegistryDto } from "@apzhub/command-framework/server";
import { CommandRegistryProvider } from "@apzhub/command-framework/react";
import type { ActionRegistryHydrationDiagnostics } from "@apzhub/command-framework/server";
import {
  KnowledgeDiscoveryProvider,
  type KnowledgeSourceRegistryDto,
} from "@apzhub/knowledge-discovery-framework/react";
import {
  NotificationRegistryProvider,
  NotificationServiceProvider,
} from "@apzhub/event-notification-framework/react";
import type {
  EventRegistryHydrationDiagnostics,
  NotificationRegistryDto,
  NotificationRegistryHydrationDiagnostics,
} from "@apzhub/event-notification-framework/server";
import {
  ActivityTimelineProvider,
  ActivityTimelineServiceProvider,
  createActivityTimelineServiceFromHydration,
  useActivityTimelineContext,
  type ActivityTimelineHydrationBundle,
} from "@apzhub/activity-timeline-framework/react";
import type {
  ActivityRegistryHydrationDiagnostics,
  TimelineRegistryHydrationDiagnostics,
} from "@apzhub/activity-timeline-framework/server";
import type { EventBus } from "@apzhub/event-notification-framework";
import type { AuthSessionPermissionInput } from "@apzhub/workbench-framework";
import { WorkbenchProvider } from "@apzhub/workbench-framework/react";
import type { WorkbenchRegistryDto } from "@apzhub/workbench-framework/server";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { PersonalisationThemeBridge } from "@/components/platform-personalisation/personalisation-theme-bridge";
import { SessionAuthorizationProvider } from "@/components/session-authorization-provider";
import { createPlatformPersonalisationSessionStore } from "@/lib/platform-personalisation/session-store";

import { ActionFrameworkDiagnostics } from "@/components/action-framework-diagnostics";
import { ActivityTimelineDiagnostics } from "@/components/activity-timeline-diagnostics";
import { EventNotificationDiagnostics } from "@/components/event-notification-diagnostics";
import { KnowledgeDiscoveryDiagnostics } from "@/components/knowledge-discovery-diagnostics";
import { createAppActionExecutorBundle } from "@/lib/create-app-action-executor";
import { createLawPersistenceContextFromSession } from "@/lib/persistence/tenant-resolver";
import { setSessionLawPersistenceContext } from "@/lib/persistence/law-persistence-session";
import { ClientWorkflowProvider } from "@/lib/clients/client-workflow-context";
import type { ClientWorkflowService } from "@/lib/clients/client-workflow-service";
import { MatterWorkflowProvider } from "@/lib/matters/matter-workflow-context";
import type { MatterWorkflowService } from "@/lib/matters/matter-workflow-service";
import { DocumentWorkflowProvider } from "@/lib/documents/document-workflow-context";
import type { DocumentWorkflowService } from "@/lib/documents/document-workflow-service";
import { TaskWorkflowProvider } from "@/lib/tasks/task-workflow-context";
import type { TaskWorkflowService } from "@/lib/tasks/task-workflow-service";
import { TimeEntryWorkflowProvider } from "@/lib/time/time-entry-workflow-context";
import { InvoiceWorkflowProvider } from "@/lib/billing/invoice-workflow-context";
import type { InvoiceWorkflowService } from "@/lib/billing/invoice-workflow-service";
import { CalendarEventWorkflowProvider } from "@/lib/calendar/calendar-event-workflow-context";
import { TrustWorkflowProvider } from "@/lib/trust/trust-workflow-context";
import type { TrustWorkbenchService } from "@/lib/trust/trust-workbench-service";
import type { CalendarEventWorkflowService } from "@/lib/calendar/calendar-event-workflow-service";
import type { TimeEntryWorkflowService } from "@/lib/time/time-entry-workflow-service";
import { LegalSearchWorkflowBridge } from "@/lib/search/legal-search-workflow-context";
import { useE2eActivityTimelineTestHooks } from "@/lib/e2e-activity-timeline-hooks";
import { useE2eEventNotificationTestHooks } from "@/lib/e2e-event-notification-hooks";
import { useAppActivityTimelineContext } from "@/lib/use-app-activity-timeline-context";
import { useAppEventNotificationContext } from "@/lib/use-app-event-notification-context";
import { useAppKnowledgeService } from "@/lib/use-app-knowledge-service";

export interface ActionWorkbenchShellProviderProps {
  readonly registry: WorkbenchRegistryDto;
  readonly commandDto: ActionRegistryDto;
  readonly commandDiagnostics: ActionRegistryHydrationDiagnostics;
  readonly knowledgeDto: KnowledgeSourceRegistryDto;
  readonly notificationDto: NotificationRegistryDto;
  readonly eventDiagnostics: EventRegistryHydrationDiagnostics;
  readonly notificationDiagnostics: NotificationRegistryHydrationDiagnostics;
  readonly activityTimelineBundle: ActivityTimelineHydrationBundle;
  readonly activityDiagnostics: ActivityRegistryHydrationDiagnostics;
  readonly timelineDiagnostics: TimelineRegistryHydrationDiagnostics;
  readonly authPermissionContext?: AuthSessionPermissionInput | null;
  readonly initialTheme?: "light" | "dark" | "system";
  readonly children: ReactNode;
}

function KnowledgeDiscoveryShell({
  knowledgeDto,
  actionDto,
  workbenchDto,
  eventBus,
  actorId,
  children,
}: {
  readonly knowledgeDto: KnowledgeSourceRegistryDto;
  readonly actionDto: ActionRegistryDto;
  readonly workbenchDto: WorkbenchRegistryDto;
  readonly eventBus?: EventBus;
  readonly actorId?: string;
  readonly children: ReactNode;
}) {
  const knowledgeService = useAppKnowledgeService({
    knowledgeDto,
    actionDto,
    workbenchDto,
    eventBus,
    actorId,
  });

  return (
    <KnowledgeDiscoveryProvider dto={knowledgeDto} service={knowledgeService}>
      <LegalSearchWorkflowBridge
        knowledgeService={knowledgeService}
        eventBus={eventBus}
        actorId={actorId}
      >
        {children}
      </LegalSearchWorkflowBridge>
    </KnowledgeDiscoveryProvider>
  );
}

function E2eTestHookBridge({
  context,
  actionExecutor,
  userId,
}: {
  readonly context: ReturnType<typeof useAppEventNotificationContext>;
  readonly actionExecutor: ActionExecutor;
  readonly userId?: string;
}) {
  useE2eEventNotificationTestHooks({
    context,
    executeAction: actionExecutor.execute.bind(actionExecutor),
    userId,
  });
  return null;
}

function E2eActivityTimelineTestHookBridge({
  activityService,
}: {
  readonly activityService: ReturnType<typeof useAppActivityTimelineContext>["service"];
}) {
  useE2eActivityTimelineTestHooks({ activityService });
  return null;
}

function ActivityTimelineServiceShell({
  runtimeService,
  activityDiagnostics,
  timelineDiagnostics,
  children,
}: {
  readonly runtimeService: ReturnType<typeof useAppActivityTimelineContext>["service"];
  readonly activityDiagnostics: ActivityRegistryHydrationDiagnostics;
  readonly timelineDiagnostics: TimelineRegistryHydrationDiagnostics;
  readonly children: ReactNode;
}) {
  const hydrationContext = useActivityTimelineContext();
  const service = useMemo(
    () =>
      createActivityTimelineServiceFromHydration({
        context: hydrationContext,
        activityService: runtimeService,
      }),
    [hydrationContext, runtimeService],
  );

  return (
    <ActivityTimelineServiceProvider service={service}>
      <E2eActivityTimelineTestHookBridge activityService={runtimeService} />
      {children}
      <ActivityTimelineDiagnostics
        activityDiagnostics={activityDiagnostics}
        timelineDiagnostics={timelineDiagnostics}
      />
    </ActivityTimelineServiceProvider>
  );
}

function EventNotificationShell({
  notificationDto,
  eventDiagnostics,
  notificationDiagnostics,
  activityTimelineBundle,
  activityDiagnostics,
  timelineDiagnostics,
  commandDto,
  registry,
  knowledgeDto,
  commandDiagnostics,
  userId,
  sessionTenantId,
  authPermissionContext,
  initialTheme,
  children,
}: {
  readonly notificationDto: NotificationRegistryDto;
  readonly eventDiagnostics: EventRegistryHydrationDiagnostics;
  readonly notificationDiagnostics: NotificationRegistryHydrationDiagnostics;
  readonly activityTimelineBundle: ActivityTimelineHydrationBundle;
  readonly activityDiagnostics: ActivityRegistryHydrationDiagnostics;
  readonly timelineDiagnostics: TimelineRegistryHydrationDiagnostics;
  readonly commandDto: ActionRegistryDto;
  readonly registry: WorkbenchRegistryDto;
  readonly knowledgeDto: KnowledgeSourceRegistryDto;
  readonly commandDiagnostics: ActionRegistryHydrationDiagnostics;
  readonly userId?: string;
  readonly sessionTenantId?: string;
  readonly authPermissionContext?: AuthSessionPermissionInput | null;
  readonly initialTheme?: "light" | "dark" | "system";
  readonly children: ReactNode;
}) {
  const eventNotificationContext = useAppEventNotificationContext({
    userId,
    tenantId: sessionTenantId,
  });
  const activityTimelineContext = useAppActivityTimelineContext(
    eventNotificationContext,
    {
      userId,
      tenantId: sessionTenantId,
    },
  );
  const sessionStore = useMemo(
    () => (userId ? createPlatformPersonalisationSessionStore() : undefined),
    [userId],
  );
  const [executorState, setExecutorState] = useState<{
    readonly actionExecutor: ActionExecutor;
    readonly clientWorkflow: ClientWorkflowService;
    readonly matterWorkflow: MatterWorkflowService;
    readonly documentWorkflow: DocumentWorkflowService;
    readonly taskWorkflow: TaskWorkflowService;
    readonly calendarEventWorkflow: CalendarEventWorkflowService;
    readonly timeEntryWorkflow: TimeEntryWorkflowService;
    readonly invoiceWorkflow: InvoiceWorkflowService;
    readonly trustWorkflow: TrustWorkbenchService;
  } | null>(null);

  const auditHook = useMemo(
    () =>
      createActionAuditEventBusHook({
        eventBus: eventNotificationContext.eventBus,
      }),
    [eventNotificationContext.eventBus],
  );

  const resolveActionExecutor = useCallback(
    (context: {
      publish: (
        request: import("@apzhub/workbench-framework").WorkbenchRequest,
      ) => import("@apzhub/workbench-framework").WorkbenchRequestResult;
      permissionAdapter: import("@apzhub/workbench-framework").WorkbenchPermissionAdapter;
    }) => {
      const { context: persistenceContext } = createLawPersistenceContextFromSession({
        userId,
        sessionTenantId,
        actorId: userId,
      });
      setSessionLawPersistenceContext(persistenceContext);

      const bundle = createAppActionExecutorBundle({
        dto: commandDto,
        permissionAdapter: context.permissionAdapter,
        publish: context.publish,
        auditHook,
        eventBus: eventNotificationContext.eventBus,
        actorId: userId,
      });
      setExecutorState({
        actionExecutor: bundle.actionExecutor,
        clientWorkflow: bundle.clientWorkflow,
        matterWorkflow: bundle.matterWorkflow,
        documentWorkflow: bundle.documentWorkflow,
        taskWorkflow: bundle.taskWorkflow,
        timeEntryWorkflow: bundle.timeEntryWorkflow,
        invoiceWorkflow: bundle.invoiceWorkflow,
        trustWorkflow: bundle.trustWorkflow,
        calendarEventWorkflow: bundle.calendarEventWorkflow,
      });
      return bundle.workbenchActionExecutor;
    },
    [auditHook, commandDto, eventNotificationContext.eventBus, sessionTenantId, userId],
  );

  return (
    <SessionAuthorizationProvider value={authPermissionContext ?? null}>
      <NotificationRegistryProvider dto={notificationDto}>
        <NotificationServiceProvider
          service={eventNotificationContext.notificationService}
        >
          <WorkbenchProvider
            initialRegistry={registry}
            userId={userId}
            authPermissionContext={authPermissionContext}
            permissionMode="auth"
            sessionStore={sessionStore}
            sessionStorageBackend={sessionStore ? "memory" : "localStorage"}
            resolveActionExecutor={resolveActionExecutor}
          >
            <PersonalisationThemeBridge userId={userId} initialTheme={initialTheme} />
            <ActivityTimelineProvider bundle={activityTimelineBundle}>
              {executorState ? (
                <ActivityTimelineServiceShell
                  runtimeService={activityTimelineContext.service}
                  activityDiagnostics={activityDiagnostics}
                  timelineDiagnostics={timelineDiagnostics}
                >
                  <CommandRegistryProvider
                    dto={commandDto}
                    executor={executorState.actionExecutor}
                  >
                    <E2eTestHookBridge
                      context={eventNotificationContext}
                      actionExecutor={executorState.actionExecutor}
                      userId={userId}
                    />
                    <ClientWorkflowProvider service={executorState.clientWorkflow}>
                      <MatterWorkflowProvider service={executorState.matterWorkflow}>
                        <DocumentWorkflowProvider
                          service={executorState.documentWorkflow}
                        >
                          <TaskWorkflowProvider service={executorState.taskWorkflow}>
                            <CalendarEventWorkflowProvider
                              service={executorState.calendarEventWorkflow}
                            >
                              <TimeEntryWorkflowProvider
                                service={executorState.timeEntryWorkflow}
                              >
                                <InvoiceWorkflowProvider
                                  service={executorState.invoiceWorkflow}
                                >
                                  <TrustWorkflowProvider
                                    service={executorState.trustWorkflow}
                                  >
                                    <KnowledgeDiscoveryShell
                                      knowledgeDto={knowledgeDto}
                                      actionDto={commandDto}
                                      workbenchDto={registry}
                                      eventBus={eventNotificationContext.eventBus}
                                      actorId={userId}
                                    >
                                      {children}
                                      <ActionFrameworkDiagnostics
                                        diagnostics={commandDiagnostics}
                                        userId={userId}
                                      />
                                      <KnowledgeDiscoveryDiagnostics />
                                      <EventNotificationDiagnostics
                                        eventDiagnostics={eventDiagnostics}
                                        notificationDiagnostics={
                                          notificationDiagnostics
                                        }
                                      />
                                    </KnowledgeDiscoveryShell>
                                  </TrustWorkflowProvider>
                                </InvoiceWorkflowProvider>
                              </TimeEntryWorkflowProvider>
                            </CalendarEventWorkflowProvider>
                          </TaskWorkflowProvider>
                        </DocumentWorkflowProvider>
                      </MatterWorkflowProvider>
                    </ClientWorkflowProvider>
                  </CommandRegistryProvider>
                </ActivityTimelineServiceShell>
              ) : null}
            </ActivityTimelineProvider>
          </WorkbenchProvider>
        </NotificationServiceProvider>
      </NotificationRegistryProvider>
    </SessionAuthorizationProvider>
  );
}

export function ActionWorkbenchShellProvider({
  registry,
  commandDto,
  commandDiagnostics,
  knowledgeDto,
  notificationDto,
  eventDiagnostics,
  notificationDiagnostics,
  activityTimelineBundle,
  activityDiagnostics,
  timelineDiagnostics,
  authPermissionContext,
  initialTheme,
  children,
}: ActionWorkbenchShellProviderProps) {
  const { data: session } = useSession();

  return (
    <EventNotificationShell
      notificationDto={notificationDto}
      eventDiagnostics={eventDiagnostics}
      notificationDiagnostics={notificationDiagnostics}
      activityTimelineBundle={activityTimelineBundle}
      activityDiagnostics={activityDiagnostics}
      timelineDiagnostics={timelineDiagnostics}
      commandDto={commandDto}
      registry={registry}
      knowledgeDto={knowledgeDto}
      commandDiagnostics={commandDiagnostics}
      userId={session?.user.id}
      sessionTenantId={
        (session?.user as { activeTenantId?: string; tenantId?: string } | undefined)
          ?.activeTenantId ??
        (session?.user as { tenantId?: string } | undefined)?.tenantId
      }
      authPermissionContext={authPermissionContext}
      initialTheme={initialTheme}
    >
      {children}
    </EventNotificationShell>
  );
}
