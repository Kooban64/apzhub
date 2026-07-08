import { loadActionRegistryHealthSummary } from "./command-hydration";
import { loadActivityFrameworkHealthSummary } from "./activity-timeline-hydration";
import { loadKnowledgeHealthSummary } from "./knowledge-hydration";
import { loadNotificationFrameworkHealthSummary } from "./event-notification-hydration";
import { buildLawPlatformHealthSummary } from "./law-platform-health-summary";
import { LAW_PLATFORM_MODULES } from "./law-platform-constants";

/** Hydrated Law Platform health summary for `/api/health`. */
export async function loadLawPlatformHealthSummary() {
  const [commands, knowledge, notifications, activities] = await Promise.all([
    loadActionRegistryHealthSummary().catch(() => undefined),
    loadKnowledgeHealthSummary().catch(() => undefined),
    loadNotificationFrameworkHealthSummary().catch(() => undefined),
    loadActivityFrameworkHealthSummary().catch(() => undefined),
  ]);

  return buildLawPlatformHealthSummary({
    registeredCommandCount: commands?.registeredCount ?? LAW_PLATFORM_MODULES.length,
    registeredKnowledgeSourceCount:
      knowledge?.registeredCount ?? LAW_PLATFORM_MODULES.length,
    registeredNotificationRouteCount: notifications?.registeredRouteCount ?? 2,
    registeredActivityTypeCount: activities?.registeredTypeCount ?? 3,
  });
}

export { buildLawPlatformHealthSummary } from "./law-platform-health-summary";
