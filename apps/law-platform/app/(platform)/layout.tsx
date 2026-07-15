import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import { loadActionRegistryDto } from "@/lib/command-hydration";
import { loadActivityTimelineHydration } from "@/lib/activity-timeline-hydration";
import { loadEventNotificationHydration } from "@/lib/event-notification-hydration";
import { loadKnowledgeSourceRegistryDto } from "@/lib/knowledge-hydration";
import { loadWorkbenchRegistryDto } from "@/lib/workbench-hydration";
import { createLawPlatformPersonalisationContext } from "@/lib/session-personalisation-context";

import { ActionWorkbenchShellProvider } from "./action-workbench-shell-provider";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    registry,
    commandHydration,
    knowledgeHydration,
    eventNotificationHydration,
    activityTimelineHydration,
    session,
  ] = await Promise.all([
    loadWorkbenchRegistryDto(),
    loadActionRegistryDto(),
    loadKnowledgeSourceRegistryDto(),
    loadEventNotificationHydration(),
    loadActivityTimelineHydration(),
    getValidatedSession(await headers()),
  ]);

  const personalisation = await createLawPlatformPersonalisationContext(session);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <ActionWorkbenchShellProvider
        registry={registry}
        commandDto={commandHydration.dto}
        commandDiagnostics={commandHydration.diagnostics}
        knowledgeDto={knowledgeHydration.dto}
        notificationDto={eventNotificationHydration.notificationDto}
        eventDiagnostics={eventNotificationHydration.eventDiagnostics}
        notificationDiagnostics={eventNotificationHydration.notificationDiagnostics}
        activityTimelineBundle={activityTimelineHydration.bundle}
        activityDiagnostics={activityTimelineHydration.activityDiagnostics}
        timelineDiagnostics={activityTimelineHydration.timelineDiagnostics}
        initialTheme={personalisation?.appearance.theme}
      >
        {children}
      </ActionWorkbenchShellProvider>
    </div>
  );
}
