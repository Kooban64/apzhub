import type { DashboardDefinition } from "../contracts/dashboard";
import type { WidgetInstance } from "../contracts/widget";

export type ResponsiveBreakpoint = "mobile" | "tablet" | "desktop";

/**
 * Pure layout helpers — no business logic.
 */
export function resolveColumns(
  breakpoint: ResponsiveBreakpoint,
  preferred: 1 | 2 | 3 | 4 = 3,
): 1 | 2 | 3 | 4 {
  if (breakpoint === "mobile") {
    return 1;
  }
  if (breakpoint === "tablet") {
    return preferred === 1 ? 1 : 2;
  }
  return preferred;
}

export function orderWidgets(
  dashboard: DashboardDefinition,
  widgetOrder?: readonly string[],
): readonly WidgetInstance[] {
  if (!widgetOrder || widgetOrder.length === 0) {
    return [...dashboard.widgets].sort((a, b) => a.order - b.order);
  }
  const byId = new Map(dashboard.widgets.map((w) => [w.instanceId, w]));
  const ordered: WidgetInstance[] = [];
  for (const id of widgetOrder) {
    const widget = byId.get(id);
    if (widget) {
      ordered.push(widget);
      byId.delete(id);
    }
  }
  for (const remaining of [...byId.values()].sort((a, b) => a.order - b.order)) {
    ordered.push(remaining);
  }
  return ordered;
}

export function filterWidgetsByPermissions(
  widgets: readonly WidgetInstance[],
  allowedWidgetIds: ReadonlySet<string>,
): readonly WidgetInstance[] {
  return widgets.filter((w) => allowedWidgetIds.has(w.widgetId));
}
