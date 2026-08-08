import {
  createDashboardPersistence,
  createQepDashboards,
  type QepDashboardsFacade,
} from "@apzhub/qep-dashboards";

import { resolveDashboardPersistence } from "@/lib/qep/persistence/resolve-dashboard-persistence";

let singleton: QepDashboardsFacade | undefined;

/**
 * Dashboard Experience runtime (APZQEP-164 / QX-PR-04).
 * Production defaults to PostgreSQL LayoutStore (fail-closed).
 */
export function getQepDashboardRuntime(): QepDashboardsFacade {
  if (!singleton) {
    const persistence = resolveDashboardPersistence();
    const store = createDashboardPersistence({
      mode: persistence.mode,
      db: persistence.db,
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    singleton = createQepDashboards({ store });
  }
  return singleton;
}

export function resetQepDashboardRuntimeForTests(): void {
  singleton = undefined;
}
