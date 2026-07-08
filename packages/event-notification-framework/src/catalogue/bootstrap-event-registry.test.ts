import { describe, expect, it } from "vitest";

import { PLATFORM_EVENT_CATALOGUE } from "../catalogue/platform-event-catalogue";
import {
  bootstrapEventRegistry,
  bootstrapEventRegistryFromCapabilities,
} from "../catalogue/bootstrap-event-registry";
import { registerPlatformEventCatalogue } from "../catalogue/register-platform-events";
import { createDefaultEventRegistry } from "../event/default-event-registry";
import {
  collectEventManifestEntries,
  extractEventDescriptorsFromCapabilities,
  hasCapabilityEventDeclarations,
} from "../extraction/extract-events";
import { buildEventRegistryHydrationDiagnostics } from "../server/event-registry-hydration-diagnostics";

const SAMPLE_MANIFEST_EVENT = {
  id: "capability.example.created",
  version: "1.0.0",
  category: "capability",
  publisher: "example-capability",
  label: "Example Created",
  payload: {
    exampleId: { type: "string", required: true },
  },
};

describe("collectEventManifestEntries", () => {
  it("collects inline events array declarations", () => {
    const entries = collectEventManifestEntries({
      events: [SAMPLE_MANIFEST_EVENT],
    });

    expect(entries).toHaveLength(1);
    expect(hasCapabilityEventDeclarations({ events: [SAMPLE_MANIFEST_EVENT] })).toBe(
      true,
    );
  });

  it("collects standalone event block declarations", () => {
    const entries = collectEventManifestEntries({ event: SAMPLE_MANIFEST_EVENT });
    expect(entries).toHaveLength(1);
  });

  it("ignores worker-style events subscribes blocks", () => {
    expect(
      hasCapabilityEventDeclarations({ events: { subscribes: ["some.event"] } }),
    ).toBe(false);
    expect(
      collectEventManifestEntries({ events: { subscribes: ["some.event"] } }),
    ).toEqual([]);
  });
});

describe("extractEventDescriptorsFromCapabilities", () => {
  it("extracts valid manifest events", () => {
    const result = extractEventDescriptorsFromCapabilities([
      {
        id: "example-cap",
        kind: "module",
        lifecycleState: "active",
        manifest: { events: [SAMPLE_MANIFEST_EVENT] },
        version: "2.0.0",
      },
    ]);

    expect(result.ok).toBe(true);
    expect(result.descriptors).toHaveLength(1);
    expect(result.descriptors[0]?.eventId).toBe("capability.example.created");
    expect(result.descriptors[0]?.source).toBe("manifest");
    expect(result.descriptors[0]?.sourceCapability).toBe("example-cap");
  });

  it("rejects duplicate event ids across capabilities without extracting", () => {
    const result = extractEventDescriptorsFromCapabilities([
      {
        id: "cap-a",
        kind: "module",
        lifecycleState: "active",
        manifest: { events: [SAMPLE_MANIFEST_EVENT] },
      },
      {
        id: "cap-b",
        kind: "module",
        lifecycleState: "active",
        manifest: { events: [SAMPLE_MANIFEST_EVENT] },
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.descriptors).toHaveLength(0);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });

  it("rejects invalid manifest payloads", () => {
    const result = extractEventDescriptorsFromCapabilities([
      {
        id: "bad-cap",
        kind: "module",
        lifecycleState: "active",
        manifest: {
          events: [{ ...SAMPLE_MANIFEST_EVENT, payload: {} }],
        },
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });
});

describe("registerPlatformEventCatalogue", () => {
  it("registers foundational platform events atomically", () => {
    const registry = createDefaultEventRegistry();
    const result = registerPlatformEventCatalogue(registry);

    expect(result.ok).toBe(true);
    expect(result.registeredCount).toBe(PLATFORM_EVENT_CATALOGUE.length);
    expect(registry.has("system.platform.bootstrap.completed")).toBe(true);
    expect(registry.has("capability.action.executed")).toBe(true);
    expect(registry.get("capability.action.executed")?.source).toBe("builtin");

    const metadata = registry.getMetadata("capability.knowledge.query.completed");
    expect(metadata?.source).toBe("builtin");
    expect(metadata?.sourceCapability).toBe("knowledge-discovery-framework");
  });
});

describe("bootstrapEventRegistry", () => {
  it("bootstraps platform catalogue and manifest events", () => {
    const result = bootstrapEventRegistry({
      capabilityRecords: [
        {
          id: "example-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: { events: [SAMPLE_MANIFEST_EVENT] },
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.diagnostics.platformEventCount).toBe(PLATFORM_EVENT_CATALOGUE.length);
    expect(result.diagnostics.capabilityEventCount).toBe(1);
    expect(result.diagnostics.registeredCount).toBe(
      PLATFORM_EVENT_CATALOGUE.length + 1,
    );
    expect(result.registry.has("capability.example.created")).toBe(true);
    expect(result.registry.getDiagnostics().manifestCapabilities).toEqual([
      "example-cap",
    ]);
  });

  it("returns errors without registering manifests when extraction fails", () => {
    const registry = createDefaultEventRegistry();
    registerPlatformEventCatalogue(registry);

    const result = bootstrapEventRegistryFromCapabilities(
      [
        {
          id: "cap-a",
          kind: "module",
          lifecycleState: "active",
          manifest: { events: [SAMPLE_MANIFEST_EVENT] },
        },
        {
          id: "cap-b",
          kind: "module",
          lifecycleState: "active",
          manifest: { events: [SAMPLE_MANIFEST_EVENT] },
        },
      ],
      { registry },
    );

    expect(result.ok).toBe(false);
    expect(result.registry.list()).toHaveLength(PLATFORM_EVENT_CATALOGUE.length);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });

  it("detects duplicate against platform catalogue during manifest registration", () => {
    const result = bootstrapEventRegistry({
      capabilityRecords: [
        {
          id: "command-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            events: [
              {
                id: "capability.action.executed",
                version: "1.0.0",
                category: "capability",
                publisher: "command-framework",
                payload: { actionId: "string" },
              },
            ],
          },
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
    expect(result.registry.list()).toHaveLength(PLATFORM_EVENT_CATALOGUE.length);
  });

  it("is repeatable on fresh registry instances", () => {
    const first = bootstrapEventRegistry();
    const second = bootstrapEventRegistry();

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(first.diagnostics.platformEventIds).toEqual(
      second.diagnostics.platformEventIds,
    );
    expect(first.diagnostics.registeredCount).toBe(second.diagnostics.registeredCount);
  });

  it("reports hydration diagnostics with source metadata", () => {
    const bootstrap = bootstrapEventRegistry({
      capabilityRecords: [
        {
          id: "example-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: { events: [SAMPLE_MANIFEST_EVENT] },
        },
      ],
    });

    const diagnostics = buildEventRegistryHydrationDiagnostics(bootstrap.registry);
    expect(diagnostics.platformEventIds).toContain("system.platform.health.changed");
    expect(diagnostics.capabilityEventIds).toContain("capability.example.created");
    expect(diagnostics.manifestCapabilityCount).toBe(1);
  });
});
