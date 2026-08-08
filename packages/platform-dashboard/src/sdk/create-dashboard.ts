import {
  DASHBOARD_EVENT_TYPES,
  type DashboardEventPublisher,
} from "../contracts/events";
import { DashboardEngine } from "../engine/dashboard-engine";
import { DashboardRegistry } from "../registry/dashboard-registry";
import { WidgetRegistry } from "../registry/widget-registry";
import type { LayoutStore } from "../store/layout-store";
import { createBuiltinWidgetDescriptors } from "../widgets/builtin-widgets";

export interface CreatePlatformDashboardOptions {
  readonly publishEvent?: DashboardEventPublisher;
  readonly includeBuiltinWidgets?: boolean;
  readonly store?: LayoutStore;
}

export interface PlatformDashboard {
  readonly engine: DashboardEngine;
  readonly dashboards: DashboardRegistry;
  readonly widgets: WidgetRegistry;
}

/**
 * Bootstrap the reusable APZHUB Dashboard Platform.
 * Product-agnostic — products register their own dashboards after create.
 */
export function createPlatformDashboard(
  options: CreatePlatformDashboardOptions = {},
): PlatformDashboard {
  const dashboards = new DashboardRegistry();
  const widgets = new WidgetRegistry();
  const publishEvent: DashboardEventPublisher = async (event) => {
    await options.publishEvent?.(event);
  };

  if (options.includeBuiltinWidgets !== false) {
    for (const descriptor of createBuiltinWidgetDescriptors()) {
      widgets.register(descriptor);
      void publishEvent({
        type: DASHBOARD_EVENT_TYPES.widgetRegistered,
        occurredAt: new Date().toISOString(),
        tenantId: "platform",
        correlationId: "bootstrap",
        widgetId: descriptor.widgetId,
        payload: { kind: descriptor.kind, title: descriptor.title },
      });
    }
  }

  const engine = new DashboardEngine({
    dashboards,
    widgets,
    publishEvent,
    store: options.store,
  });

  return { engine, dashboards, widgets };
}
