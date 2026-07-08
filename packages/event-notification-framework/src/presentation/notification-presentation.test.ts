import { describe, expect, it } from "vitest";

import { createNotificationItem } from "../notification/create-notification-item";
import type { EventEnvelope } from "../event/event-envelope";
import type { NotificationDescriptor } from "../notification/notification-descriptor";
import { NOTIFICATION_LAYER_STATUS } from "../status";
import {
  buildNotificationPresentationDiagnostics,
  formatNotificationRelativeTimestamp,
  groupNotificationViewModelsByPriority,
  mapNotificationDtoToViewModel,
  mapNotificationItemToViewModel,
  mapNotificationItemsToViewModels,
  presentNotificationsFromItems,
  sortNotificationViewModelsByPriority,
} from "./index";

const ROUTE: NotificationDescriptor = {
  routeId: "platform.inbox.system",
  eventPattern: "system.platform.bootstrap.completed",
  notificationKind: "inbox",
  channel: "in-app",
  templateRef: "bootstrap-completed",
  version: "1.0.0",
  status: "active",
  priority: "high",
};

const ENVELOPE: EventEnvelope = {
  envelopeId: "env-present-1",
  eventId: "system.platform.bootstrap.completed",
  eventVersion: "1.0.0",
  category: "system",
  correlationId: "corr-present",
  timestamp: "2026-07-04T10:00:00.000Z",
  publisher: "platform-runtime",
  payload: {},
};

const ENVELOPE_OLDER: EventEnvelope = {
  ...ENVELOPE,
  envelopeId: "env-present-0",
  timestamp: "2026-07-04T09:00:00.000Z",
};

function itemForEnvelope(
  envelope: EventEnvelope,
  route: NotificationDescriptor = ROUTE,
  read = false,
) {
  const item = createNotificationItem({
    envelope,
    route,
    title: `Title ${envelope.envelopeId}`,
    body: "Body",
    renderedAt: "2026-07-04T10:00:01.000Z",
  });

  if (read) {
    return {
      ...item,
      metadata: Object.freeze({ ...item.metadata, read: true }),
    };
  }

  return item;
}

describe("mapNotificationItemToViewModel", () => {
  it("maps fields, severity, read state, and relative timestamp", () => {
    const item = itemForEnvelope(ENVELOPE, {
      ...ROUTE,
      priority: "urgent",
    });

    const model = mapNotificationItemToViewModel(item, {
      now: "2026-07-04T10:02:00.000Z",
    });

    expect(model.notificationId).toBe(item.notificationId);
    expect(model.title).toBe(item.title);
    expect(model.severity).toBe("critical");
    expect(model.readState).toBe("unread");
    expect(model.isUnread).toBe(true);
    expect(model.relativeTimestamp).toBe("2m ago");
  });

  it("exposes mapNotificationDtoToViewModel alias", () => {
    const item = itemForEnvelope(ENVELOPE);
    expect(mapNotificationDtoToViewModel(item).notificationId).toBe(
      item.notificationId,
    );
  });

  it("passes actionRef through unchanged", () => {
    const item = itemForEnvelope(ENVELOPE);
    const withAction = {
      ...item,
      metadata: Object.freeze({
        ...item.metadata,
        actionRef: Object.freeze({
          actionId: "platform.theme.toggle",
          handlerContext: Object.freeze({ source: "notification" }),
        }),
      }),
    };

    const model = mapNotificationItemToViewModel(withAction);
    expect(model.actionRef?.actionId).toBe("platform.theme.toggle");
    expect(model.actionRef?.handlerContext).toEqual({ source: "notification" });
  });

  it("maps read items to read presentation state", () => {
    const model = mapNotificationItemToViewModel(
      itemForEnvelope(ENVELOPE, ROUTE, true),
    );
    expect(model.readState).toBe("read");
    expect(model.isUnread).toBe(false);
  });
});

describe("sortNotificationViewModelsByPriority", () => {
  it("orders urgent before normal and newest first within priority", () => {
    const models = mapNotificationItemsToViewModels([
      itemForEnvelope(ENVELOPE, { ...ROUTE, priority: "normal" }),
      itemForEnvelope(ENVELOPE_OLDER, { ...ROUTE, priority: "urgent" }),
      itemForEnvelope(ENVELOPE, { ...ROUTE, priority: "urgent" }),
    ]);

    const sorted = sortNotificationViewModelsByPriority(models);
    expect(sorted.map((model) => model.priority)).toEqual([
      "urgent",
      "urgent",
      "normal",
    ]);
    expect(sorted[0]?.notificationId).toContain("env-present-1");
  });
});

describe("groupNotificationViewModelsByPriority", () => {
  it("groups by priority with unread counts", () => {
    const models = mapNotificationItemsToViewModels([
      itemForEnvelope(ENVELOPE, { ...ROUTE, priority: "high" }),
      itemForEnvelope(ENVELOPE_OLDER, { ...ROUTE, priority: "high" }, true),
      itemForEnvelope(ENVELOPE, {
        ...ROUTE,
        priority: "low",
        routeId: "platform.toast.default",
      }),
    ]);

    const groups = groupNotificationViewModelsByPriority(models);

    expect(groups.map((group) => group.key)).toEqual(["high", "low"]);
    expect(groups[0]?.unreadCount).toBe(1);
    expect(groups[0]?.items).toHaveLength(2);
  });
});

describe("formatNotificationRelativeTimestamp", () => {
  it("formats just now, minutes, hours, days, and absolute dates", () => {
    const timestamp = "2026-07-04T10:00:00.000Z";

    expect(
      formatNotificationRelativeTimestamp(timestamp, {
        now: "2026-07-04T10:00:30.000Z",
      }),
    ).toBe("Just now");
    expect(
      formatNotificationRelativeTimestamp(timestamp, {
        now: "2026-07-04T10:05:00.000Z",
      }),
    ).toBe("5m ago");
    expect(
      formatNotificationRelativeTimestamp(timestamp, {
        now: "2026-07-04T12:00:00.000Z",
      }),
    ).toBe("2h ago");
    expect(
      formatNotificationRelativeTimestamp(timestamp, {
        now: "2026-07-06T10:00:00.000Z",
      }),
    ).toBe("2d ago");
    expect(
      formatNotificationRelativeTimestamp(timestamp, {
        now: "2026-08-01T10:00:00.000Z",
        locale: "en-US",
      }),
    ).toContain("Jul");
  });
});

describe("buildNotificationPresentationDiagnostics", () => {
  it("reports counts, groups, and layer status", () => {
    const empty = buildNotificationPresentationDiagnostics([]);
    expect(empty.status).toBe("empty");
    expect(empty.layerStatus).toBe(NOTIFICATION_LAYER_STATUS);
    expect(empty.groupCount).toBe(0);

    const models = mapNotificationItemsToViewModels([
      itemForEnvelope(ENVELOPE, { ...ROUTE, priority: "high" }),
    ]);
    const diagnostics = buildNotificationPresentationDiagnostics(models);

    expect(diagnostics.status).toBe("ready");
    expect(diagnostics.totalCount).toBe(1);
    expect(diagnostics.unreadCount).toBe(1);
    expect(diagnostics.priorityCounts.high).toBe(1);
    expect(diagnostics.kindCounts.inbox).toBe(1);
    expect(diagnostics.groupCount).toBe(1);
  });
});

describe("presentNotificationsFromItems", () => {
  it("maps, groups, and diagnoses in one helper", () => {
    const result = presentNotificationsFromItems(
      [
        itemForEnvelope(ENVELOPE, { ...ROUTE, priority: "urgent" }),
        itemForEnvelope(ENVELOPE_OLDER, {
          ...ROUTE,
          priority: "normal",
          routeId: "platform.toast.default",
        }),
      ],
      { now: "2026-07-04T11:00:00.000Z" },
    );

    expect(result.viewModels).toHaveLength(2);
    expect(result.groups.map((group) => group.key)).toEqual(["urgent", "normal"]);
    expect(result.diagnostics.totalCount).toBe(2);
  });
});

describe("presentation boundary", () => {
  it("does not import service mutation or event bus modules", async () => {
    const presentationIndex = await import("./index");
    expect(presentationIndex.presentNotificationsFromItems).toBeTypeOf("function");
    expect(presentationIndex.mapNotificationItemToViewModel).toBeTypeOf("function");
  });
});
