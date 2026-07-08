import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { bootstrapActionRegistry } from "@apzhub/command-framework/server";
import { bootstrapKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";
import { Runtime } from "@apzhub/platform-runtime/server";
import { mapPlatformCapabilitiesToActionRecords } from "@apzhub/command-framework/server";
import { mapPlatformCapabilitiesToEventRecords } from "@apzhub/event-notification-framework/server";
import { mapPlatformCapabilitiesToActivityRecords } from "@apzhub/activity-timeline-framework/server";

import { createAppEventNotificationContext } from "./create-app-event-notification-context";
import { createAppActivityTimelineContext } from "./create-app-activity-timeline-context";
import {
  LAW_CLIENT_COMMAND_IDS,
  LAW_OPEN_COMMAND_IDS,
  LAW_PLATFORM_MODULES,
  LAW_TRUST_COMMAND_IDS,
} from "./law-platform-constants";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("Law Platform bootstrap", () => {
  it("discovers legal manifests and registers workbench, commands, knowledge, events, and activities", async () => {
    await Runtime.bootstrap({ workspaceRoot, failFast: false });
    const capabilities = Runtime.registry().findAll();

    expect(capabilities.some((capability) => capability.id === "legal-platform")).toBe(
      true,
    );

    const workbench = Runtime.registry().getWorkbenchViewDescriptors();
    const lawViews = workbench.descriptors.filter((view) => view.workspace === "law");
    expect(lawViews.length).toBeGreaterThanOrEqual(LAW_PLATFORM_MODULES.length);

    const actionRecords = mapPlatformCapabilitiesToActionRecords(capabilities);
    const actionBootstrap = bootstrapActionRegistry({
      capabilityRecords: actionRecords,
    });
    for (const commandId of LAW_OPEN_COMMAND_IDS) {
      expect(actionBootstrap.registry.has(commandId)).toBe(true);
    }
    for (const commandId of LAW_CLIENT_COMMAND_IDS) {
      expect(actionBootstrap.registry.has(commandId)).toBe(true);
    }
    for (const commandId of LAW_TRUST_COMMAND_IDS) {
      expect(actionBootstrap.registry.has(commandId)).toBe(true);
    }

    const knowledgeRecords = mapPlatformCapabilitiesToActionRecords(capabilities);
    const knowledgeBootstrap = bootstrapKnowledgeRegistry({
      capabilityRecords: knowledgeRecords,
    });
    expect(knowledgeBootstrap.ok).toBe(true);
    expect(
      knowledgeBootstrap.registry
        .listSources()
        .some((source) => source.id.startsWith("legal.help.")),
    ).toBe(true);

    const eventRecords = mapPlatformCapabilitiesToEventRecords(capabilities);
    const eventContext = createAppEventNotificationContext({
      capabilityRecords: eventRecords,
    });
    expect(eventContext.eventRegistry.has("legal-platform-module-opened")).toBe(true);
    expect(eventContext.eventRegistry.has("legal.client.viewed")).toBe(true);
    expect(eventContext.notificationRegistry.has("legal.module.opened.inbox")).toBe(
      true,
    );
    expect(eventContext.notificationRegistry.has("legal.client.viewed.inbox")).toBe(
      true,
    );

    const activityRecords = mapPlatformCapabilitiesToActivityRecords(capabilities);
    const activityContext = createAppActivityTimelineContext({
      capabilityRecords: activityRecords,
    });
    expect(activityContext.registry.has("legal.activity.dashboard.opened")).toBe(true);
    expect(activityContext.registry.has("legal.activity.client.opened")).toBe(true);
  });
});
