import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import * as eventExports from "./event/index";
import * as notificationExports from "./notification/index";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function readSource(relativePath: string): string {
  return readFileSync(join(packageRoot, "src", relativePath), "utf8");
}

describe("event and notification boundary separation", () => {
  it("event public exports do not include notification symbols", () => {
    const keys = Object.keys(eventExports);
    expect(keys.some((key) => key.includes("Notification"))).toBe(false);
  });

  it("notification public exports do not include event bus placeholders", () => {
    const keys = Object.keys(notificationExports);
    expect(keys.some((key) => key.includes("EventBus"))).toBe(false);
    expect(keys.some((key) => key.includes("EventRegistry"))).toBe(false);
  });

  it("event layer source files do not import notification modules", () => {
    const eventSources = [
      "event/event-envelope.ts",
      "event/event-descriptor.ts",
      "event/placeholders.ts",
      "event/in-process-event-bus.ts",
      "event/validate-event-envelope.ts",
      "event/index.ts",
      "catalogue/bootstrap-event-registry.ts",
      "catalogue/register-platform-events.ts",
      "extraction/extract-events.ts",
      "server/map-event-registry-dto.ts",
      "server/filter-event-registry-dto.ts",
      "server/validate-event-registry-dto.ts",
    ];

    for (const source of eventSources) {
      const content = readSource(source);
      expect(content.includes("../notification")).toBe(false);
      expect(content.includes("notification/")).toBe(false);
    }
  });

  it("notification mapper consumes EventEnvelope without importing event placeholders", () => {
    const mapperSource = readSource("notification/notification-mapper.ts");
    expect(mapperSource.includes("../event/event-envelope")).toBe(true);
    expect(mapperSource.includes("PlaceholderEventBus")).toBe(false);
    expect(mapperSource.includes("publish(")).toBe(false);
  });

  it("notification placeholders map events but never publish", () => {
    const placeholderSource = readSource("notification/placeholders.ts");
    expect(placeholderSource.includes("EventEnvelope")).toBe(true);
    expect(placeholderSource.includes("publish(")).toBe(false);
    expect(placeholderSource.includes("EventBus")).toBe(false);
  });

  it("notification registry source files do not import event bus modules", () => {
    const notificationSources = [
      "notification/default-notification-registry.ts",
      "notification/validate-notification-descriptor.ts",
      "notification/placeholders.ts",
      "notification/index.ts",
      "catalogue/bootstrap-notification-registry.ts",
      "catalogue/register-platform-notifications.ts",
      "extraction/extract-notifications.ts",
      "server/notification-registry-hydration-diagnostics.ts",
      "notification/default-notification-mapper.ts",
      "notification/render-notification-template.ts",
      "presentation/notification-presentation-diagnostics.ts",
      "presentation/map-notification-item-to-view-model.ts",
      "notification/default-notification-session-store.ts",
      "notification/notification-session-store.ts",
    ];

    for (const source of notificationSources) {
      const content = readSource(source);
      expect(content.includes("InProcessEventBus")).toBe(false);
      expect(content.includes("eventBus")).toBe(false);
      expect(content.includes("EventBus")).toBe(false);
    }
  });
});
