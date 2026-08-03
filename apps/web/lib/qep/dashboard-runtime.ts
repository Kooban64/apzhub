import { createQepDashboards, type QepDashboardsFacade } from "@apzhub/qep-dashboards";

let singleton: QepDashboardsFacade | undefined;

/** Process-local Dashboard Experience runtime (APZQEP-164). */
export function getQepDashboardRuntime(): QepDashboardsFacade {
  if (!singleton) {
    singleton = createQepDashboards();
  }
  return singleton;
}

export function resetQepDashboardRuntimeForTests(): void {
  singleton = undefined;
}
