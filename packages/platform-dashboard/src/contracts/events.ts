export const DASHBOARD_EVENT_TYPES = {
  dashboardRegistered: "platform.dashboard.dashboard.registered",
  widgetRegistered: "platform.dashboard.widget.registered",
  layoutSaved: "platform.dashboard.layout.saved",
  viewPinned: "platform.dashboard.view.pinned",
  viewFavourited: "platform.dashboard.view.favourited",
} as const;

export type DashboardEventType =
  (typeof DASHBOARD_EVENT_TYPES)[keyof typeof DASHBOARD_EVENT_TYPES];

export interface DashboardDomainEvent {
  readonly type: DashboardEventType;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly dashboardId?: string;
  readonly widgetId?: string;
  readonly payload?: Readonly<Record<string, string | number | boolean>>;
}

export type DashboardEventPublisher = (
  event: DashboardDomainEvent,
) => void | Promise<void>;
