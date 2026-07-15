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
import { WorkbenchProvider } from "@apzhub/workbench-framework/react";
import type { WorkbenchRegistryDto } from "@apzhub/workbench-framework/server";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { PersonalisationThemeBridge } from "@/components/platform-personalisation/personalisation-theme-bridge";
import { createPlatformPersonalisationSessionStore } from "@/lib/platform-personalisation/session-store";

import { ActionFrameworkDiagnostics } from "@/components/action-framework-diagnostics";
import { ActivityTimelineDiagnostics } from "@/components/activity-timeline-diagnostics";
import { EventNotificationDiagnostics } from "@/components/event-notification-diagnostics";
import { KnowledgeDiscoveryDiagnostics } from "@/components/knowledge-discovery-diagnostics";
import { createAppActionExecutorBundle } from "@/lib/create-app-action-executor";
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
  readonly initialTheme?: "light" | "dark" | "system";
  readonly children: ReactNode;
}

function KnowledgeDiscoveryShell({
  knowledgeDto,
  actionDto,
  workbenchDto,
  children,
}: {
  readonly knowledgeDto: KnowledgeSourceRegistryDto;
  readonly actionDto: ActionRegistryDto;
  readonly workbenchDto: WorkbenchRegistryDto;
  readonly children: ReactNode;
}) {
  const knowledgeService = useAppKnowledgeService({
    knowledgeDto,
    actionDto,
    workbenchDto,
  });

  return (
    <KnowledgeDiscoveryProvider dto={knowledgeDto} service={knowledgeService}>
      {children}
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
  readonly initialTheme?: "light" | "dark" | "system";
  readonly children: ReactNode;
}) {
  const eventNotificationContext = useAppEventNotificationContext();
  const activityTimelineContext = useAppActivityTimelineContext(
    eventNotificationContext,
  );
  const [actionExecutor, setActionExecutor] = useState<ActionExecutor | null>(null);
  const sessionStore = useMemo(
    () => (userId ? createPlatformPersonalisationSessionStore() : undefined),
    [userId],
  );

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
      const bundle = createAppActionExecutorBundle({
        dto: commandDto,
        permissionAdapter: context.permissionAdapter,
        publish: context.publish,
        auditHook,
      });
      setActionExecutor(bundle.actionExecutor);
      return bundle.workbenchActionExecutor;
    },
    [auditHook, commandDto],
  );

  return (
    <NotificationRegistryProvider dto={notificationDto}>
      <NotificationServiceProvider
        service={eventNotificationContext.notificationService}
      >
        <WorkbenchProvider
          initialRegistry={registry}
          userId={userId}
          sessionStore={sessionStore}
          sessionStorageBackend={sessionStore ? "memory" : "localStorage"}
          resolveActionExecutor={resolveActionExecutor}
        >
          <PersonalisationThemeBridge userId={userId} initialTheme={initialTheme} />
          <ActivityTimelineProvider bundle={activityTimelineBundle}>
            {actionExecutor ? (
              <ActivityTimelineServiceShell
                runtimeService={activityTimelineContext.service}
                activityDiagnostics={activityDiagnostics}
                timelineDiagnostics={timelineDiagnostics}
              >
                <CommandRegistryProvider dto={commandDto} executor={actionExecutor}>
                  <E2eTestHookBridge
                    context={eventNotificationContext}
                    actionExecutor={actionExecutor}
                    userId={userId}
                  />
                  <KnowledgeDiscoveryShell
                    knowledgeDto={knowledgeDto}
                    actionDto={commandDto}
                    workbenchDto={registry}
                  >
                    {children}
                    <ActionFrameworkDiagnostics
                      diagnostics={commandDiagnostics}
                      userId={userId}
                    />
                    <KnowledgeDiscoveryDiagnostics />
                    <EventNotificationDiagnostics
                      eventDiagnostics={eventDiagnostics}
                      notificationDiagnostics={notificationDiagnostics}
                    />
                  </KnowledgeDiscoveryShell>
                </CommandRegistryProvider>
              </ActivityTimelineServiceShell>
            ) : null}
          </ActivityTimelineProvider>
        </WorkbenchProvider>
      </NotificationServiceProvider>
    </NotificationRegistryProvider>
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
      initialTheme={initialTheme}
    >
      {children}
    </EventNotificationShell>
  );
}
