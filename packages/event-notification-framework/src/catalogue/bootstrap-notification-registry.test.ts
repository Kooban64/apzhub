import { describe, expect, it } from "vitest";

import { PLATFORM_NOTIFICATION_CATALOGUE } from "../catalogue/platform-notification-catalogue";
import {
  bootstrapNotificationRegistry,
  bootstrapNotificationRegistryFromCapabilities,
} from "../catalogue/bootstrap-notification-registry";
import { registerPlatformNotificationCatalogue } from "../catalogue/register-platform-notifications";
import { createDefaultNotificationRegistry } from "../notification/default-notification-registry";
import {
  collectNotificationManifestEntries,
  extractNotificationDescriptorsFromCapabilities,
  hasCapabilityNotificationDeclarations,
} from "../extraction/extract-notifications";
import { buildNotificationRegistryHydrationDiagnostics } from "../server/notification-registry-hydration-diagnostics";

const SAMPLE_MANIFEST_ROUTE = {
  id: "capability.example.created.inbox",
  eventPattern: "capability.example.created",
  notificationKind: "inbox",
  channel: "in-app",
  templateRef: "example-created",
  version: "1.0.0",
  priority: "normal",
  titleTemplate: "Example created",
  bodyTemplate: "{{exampleId}} was created",
};

describe("collectNotificationManifestEntries", () => {
  it("collects notifications.routes array declarations", () => {
    const entries = collectNotificationManifestEntries({
      notifications: { routes: [SAMPLE_MANIFEST_ROUTE] },
    });

    expect(entries).toHaveLength(1);
    expect(
      hasCapabilityNotificationDeclarations({
        notifications: { routes: [SAMPLE_MANIFEST_ROUTE] },
      }),
    ).toBe(true);
  });

  it("ignores manifests without notifications.routes", () => {
    expect(hasCapabilityNotificationDeclarations({ events: [] })).toBe(false);
    expect(collectNotificationManifestEntries({ notifications: {} })).toEqual([]);
  });
});

describe("extractNotificationDescriptorsFromCapabilities", () => {
  it("extracts valid manifest notification routes", () => {
    const result = extractNotificationDescriptorsFromCapabilities([
      {
        id: "example-cap",
        kind: "module",
        lifecycleState: "active",
        manifest: { notifications: { routes: [SAMPLE_MANIFEST_ROUTE] } },
        version: "2.0.0",
      },
    ]);

    expect(result.ok).toBe(true);
    expect(result.descriptors).toHaveLength(1);
    expect(result.descriptors[0]?.routeId).toBe("capability.example.created.inbox");
    expect(result.descriptors[0]?.source).toBe("manifest");
    expect(result.descriptors[0]?.sourceCapability).toBe("example-cap");
    expect(result.descriptors[0]?.schemaVersion).toBe("2.0.0");
  });

  it("rejects duplicate route ids across capabilities without extracting", () => {
    const result = extractNotificationDescriptorsFromCapabilities([
      {
        id: "cap-a",
        kind: "module",
        lifecycleState: "active",
        manifest: { notifications: { routes: [SAMPLE_MANIFEST_ROUTE] } },
      },
      {
        id: "cap-b",
        kind: "module",
        lifecycleState: "active",
        manifest: { notifications: { routes: [SAMPLE_MANIFEST_ROUTE] } },
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.descriptors).toHaveLength(0);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });

  it("rejects invalid kind/channel pairs", () => {
    const result = extractNotificationDescriptorsFromCapabilities([
      {
        id: "bad-cap",
        kind: "module",
        lifecycleState: "active",
        manifest: {
          notifications: {
            routes: [
              {
                ...SAMPLE_MANIFEST_ROUTE,
                notificationKind: "email",
                channel: "in-app",
              },
            ],
          },
        },
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
    expect(result.errors[0]?.message).toContain('requires channel "email"');
  });

  it("rejects invalid manifest payloads", () => {
    const result = extractNotificationDescriptorsFromCapabilities([
      {
        id: "bad-cap",
        kind: "module",
        lifecycleState: "active",
        manifest: {
          notifications: {
            routes: [{ ...SAMPLE_MANIFEST_ROUTE, templateRef: "" }],
          },
        },
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });
});

describe("registerPlatformNotificationCatalogue", () => {
  it("registers foundational platform notification routes atomically", () => {
    const registry = createDefaultNotificationRegistry();
    const result = registerPlatformNotificationCatalogue(registry);

    expect(result.ok).toBe(true);
    expect(result.registeredCount).toBe(PLATFORM_NOTIFICATION_CATALOGUE.length);
    expect(registry.has("platform.toast.default")).toBe(true);
    expect(registry.has("platform.inbox.system")).toBe(true);
    expect(registry.get("platform.banner.warning")?.source).toBe("builtin");

    const metadata = registry.getMetadata("platform.inapp.system");
    expect(metadata?.source).toBe("builtin");
    expect(metadata?.sourceCapability).toBe("platform-runtime");
    expect(metadata?.eventPattern).toBe("system.platform.health.changed");
  });
});

describe("bootstrapNotificationRegistry", () => {
  it("bootstraps platform catalogue and manifest notification routes", () => {
    const result = bootstrapNotificationRegistry({
      capabilityRecords: [
        {
          id: "example-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: { notifications: { routes: [SAMPLE_MANIFEST_ROUTE] } },
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.diagnostics.platformRouteCount).toBe(
      PLATFORM_NOTIFICATION_CATALOGUE.length,
    );
    expect(result.diagnostics.capabilityRouteCount).toBe(1);
    expect(result.diagnostics.registeredCount).toBe(
      PLATFORM_NOTIFICATION_CATALOGUE.length + 1,
    );
    expect(result.registry.has("capability.example.created.inbox")).toBe(true);
    expect(result.registry.getDiagnostics().manifestCapabilities).toEqual([
      "example-cap",
    ]);
  });

  it("returns errors without registering manifests when extraction fails", () => {
    const registry = createDefaultNotificationRegistry();
    registerPlatformNotificationCatalogue(registry);

    const result = bootstrapNotificationRegistryFromCapabilities(
      [
        {
          id: "cap-a",
          kind: "module",
          lifecycleState: "active",
          manifest: { notifications: { routes: [SAMPLE_MANIFEST_ROUTE] } },
        },
        {
          id: "cap-b",
          kind: "module",
          lifecycleState: "active",
          manifest: { notifications: { routes: [SAMPLE_MANIFEST_ROUTE] } },
        },
      ],
      { registry },
    );

    expect(result.ok).toBe(false);
    expect(result.registry.list()).toHaveLength(PLATFORM_NOTIFICATION_CATALOGUE.length);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });

  it("detects duplicate against platform catalogue during manifest registration", () => {
    const result = bootstrapNotificationRegistry({
      capabilityRecords: [
        {
          id: "platform-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            notifications: {
              routes: [
                {
                  id: "platform.toast.default",
                  eventPattern: "system.platform.bootstrap.completed",
                  notificationKind: "toast",
                  channel: "in-app",
                  templateRef: "duplicate",
                  version: "1.0.0",
                },
              ],
            },
          },
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
    expect(result.registry.list()).toHaveLength(PLATFORM_NOTIFICATION_CATALOGUE.length);
  });

  it("is repeatable on fresh registry instances", () => {
    const first = bootstrapNotificationRegistry();
    const second = bootstrapNotificationRegistry();

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(first.diagnostics.platformRouteIds).toEqual(
      second.diagnostics.platformRouteIds,
    );
    expect(first.diagnostics.registeredCount).toBe(second.diagnostics.registeredCount);
  });

  it("reports hydration diagnostics with source metadata", () => {
    const bootstrap = bootstrapNotificationRegistry({
      capabilityRecords: [
        {
          id: "example-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: { notifications: { routes: [SAMPLE_MANIFEST_ROUTE] } },
        },
      ],
    });

    const diagnostics = buildNotificationRegistryHydrationDiagnostics(
      bootstrap.registry,
    );
    expect(diagnostics.platformRouteIds).toContain("platform.banner.warning");
    expect(diagnostics.capabilityRouteIds).toContain(
      "capability.example.created.inbox",
    );
    expect(diagnostics.manifestCapabilityCount).toBe(1);
  });
});
