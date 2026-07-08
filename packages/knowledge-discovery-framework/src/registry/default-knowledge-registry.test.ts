import { describe, expect, it, vi } from "vitest";

import { createScaffoldKnowledgeProvider } from "../provider/scaffold-knowledge-provider";
import type { KnowledgeSource } from "../types/knowledge-source";
import {
  KnowledgeRegistryDuplicateError,
  KnowledgeRegistryNotFoundError,
  KnowledgeRegistryValidationError,
  createDefaultKnowledgeRegistry,
  validateKnowledgeSource,
} from "./index";

function sampleSource(overrides: Partial<KnowledgeSource> = {}): KnowledgeSource {
  return {
    id: "platform.actions",
    label: "Actions",
    kind: "registry-projection",
    tier: "T0",
    priority: 10,
    status: "active",
    provides: ["command"],
    version: "1.0.0",
    origin: "builtin",
    ...overrides,
  };
}

describe("validateKnowledgeSource", () => {
  it("accepts valid source descriptors", () => {
    expect(() => validateKnowledgeSource(sampleSource())).not.toThrow();
  });

  it("rejects empty id", () => {
    expect(() => validateKnowledgeSource(sampleSource({ id: "  " }))).toThrow(
      KnowledgeRegistryValidationError,
    );
  });

  it("rejects invalid id pattern", () => {
    expect(() => validateKnowledgeSource(sampleSource({ id: "Bad_ID" }))).toThrow(
      KnowledgeRegistryValidationError,
    );
  });

  it("rejects empty provides array", () => {
    expect(() => validateKnowledgeSource(sampleSource({ provides: [] }))).toThrow(
      KnowledgeRegistryValidationError,
    );
  });

  it("rejects invalid priority", () => {
    expect(() => validateKnowledgeSource(sampleSource({ priority: -1 }))).toThrow(
      KnowledgeRegistryValidationError,
    );
  });

  it("rejects invalid kind, tier, status, and document kind", () => {
    expect(() =>
      validateKnowledgeSource(
        sampleSource({ kind: "invalid" as KnowledgeSource["kind"] }),
      ),
    ).toThrow(KnowledgeRegistryValidationError);
    expect(() =>
      validateKnowledgeSource(sampleSource({ tier: "T9" as KnowledgeSource["tier"] })),
    ).toThrow(KnowledgeRegistryValidationError);
    expect(() =>
      validateKnowledgeSource(
        sampleSource({ status: "invalid" as KnowledgeSource["status"] }),
      ),
    ).toThrow(KnowledgeRegistryValidationError);
    expect(() =>
      validateKnowledgeSource(sampleSource({ provides: ["invalid" as "command"] })),
    ).toThrow(KnowledgeRegistryValidationError);
  });
});

describe("DefaultKnowledgeRegistry registration", () => {
  it("registers sources and lists by priority", () => {
    const registry = createDefaultKnowledgeRegistry();

    registry.registerSource(sampleSource());
    registry.registerSource(
      sampleSource({
        id: "platform.navigation",
        label: "Navigation",
        priority: 5,
        provides: ["navigation"],
      }),
    );

    expect(registry.listSources()).toHaveLength(2);
    expect(registry.listSources()[0]?.id).toBe("platform.navigation");
    expect(registry.getSource("platform.actions")).toMatchObject({
      id: "platform.actions",
    });
  });

  it("throws on duplicate source registration", () => {
    const registry = createDefaultKnowledgeRegistry();
    registry.registerSource(sampleSource());

    expect(() => registry.registerSource(sampleSource())).toThrow(
      KnowledgeRegistryDuplicateError,
    );
  });

  it("registerManySources rejects batch duplicates", () => {
    const registry = createDefaultKnowledgeRegistry();

    expect(() =>
      registry.registerManySources([sampleSource(), sampleSource()]),
    ).toThrow(KnowledgeRegistryDuplicateError);
  });

  it("registerManySourcesAtomic rejects invalid sources without registering", () => {
    const registry = createDefaultKnowledgeRegistry();

    const result = registry.registerManySourcesAtomic([
      sampleSource(),
      sampleSource({ id: "Bad_ID" }),
    ]);

    expect(result.ok).toBe(false);
    expect(result.registeredCount).toBe(0);
    expect(result.errors[0]?.code).toBe("VALIDATION");
    expect(registry.listSources()).toHaveLength(0);
  });

  it("registerManySourcesAtomic rejects duplicate ids without registering", () => {
    const registry = createDefaultKnowledgeRegistry();
    registry.registerSource(sampleSource());

    const result = registry.registerManySourcesAtomic([
      sampleSource({ id: "platform.navigation", provides: ["navigation"] }),
      sampleSource({ id: "platform.navigation", provides: ["navigation"] }),
    ]);

    expect(result.ok).toBe(false);
    expect(result.registeredCount).toBe(0);
    expect(result.errors.some((issue) => issue.code === "DUPLICATE_ID")).toBe(true);
    expect(registry.listSources()).toHaveLength(1);
  });

  it("registerManySourcesAtomic commits valid batch", () => {
    const registry = createDefaultKnowledgeRegistry();

    const result = registry.registerManySourcesAtomic([
      sampleSource(),
      sampleSource({
        id: "platform.navigation",
        provides: ["navigation"],
        priority: 5,
      }),
    ]);

    expect(result.ok).toBe(true);
    expect(result.registeredCount).toBe(2);
    expect(registry.listSources()).toHaveLength(2);
  });

  it("replaceSource updates existing descriptor", () => {
    const registry = createDefaultKnowledgeRegistry();
    registry.registerSource(sampleSource());

    registry.replaceSource(sampleSource({ label: "Platform Actions" }));

    expect(registry.getSource("platform.actions")?.label).toBe("Platform Actions");
  });

  it("replaceSource throws when source is missing", () => {
    const registry = createDefaultKnowledgeRegistry();

    expect(() => registry.replaceSource(sampleSource())).toThrow(
      KnowledgeRegistryNotFoundError,
    );
  });
});

describe("DefaultKnowledgeRegistry providers", () => {
  it("registers providers without invoking query()", async () => {
    const registry = createDefaultKnowledgeRegistry();
    const provider = createScaffoldKnowledgeProvider(sampleSource());
    const querySpy = vi.spyOn(provider, "query");

    registry.registerProvider(provider);

    expect(registry.hasProvider("platform.actions")).toBe(true);
    expect(querySpy).not.toHaveBeenCalled();
    await querySpy.mockRestore();
  });

  it("throws on duplicate provider registration", () => {
    const registry = createDefaultKnowledgeRegistry();
    const provider = createScaffoldKnowledgeProvider(sampleSource());

    registry.registerProvider(provider);

    expect(() => registry.registerProvider(provider)).toThrow(
      KnowledgeRegistryDuplicateError,
    );
  });

  it("registerManyProvidersAtomic rejects invalid providers", () => {
    const registry = createDefaultKnowledgeRegistry();
    const provider = createScaffoldKnowledgeProvider(sampleSource());
    const invalidProvider = {
      ...provider,
      query: undefined,
    } as unknown as typeof provider;

    const result = registry.registerManyProvidersAtomic([invalidProvider]);

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });

  it("registerManyProviders commits valid batch", () => {
    const registry = createDefaultKnowledgeRegistry();

    registry.registerManyProviders([
      createScaffoldKnowledgeProvider(sampleSource()),
      createScaffoldKnowledgeProvider(
        sampleSource({ id: "platform.navigation", provides: ["navigation"] }),
      ),
    ]);

    expect(registry.listProviders()).toHaveLength(2);
  });
});

describe("DefaultKnowledgeRegistry metadata", () => {
  it("exposes per-source metadata with health and declared capabilities", () => {
    const registry = createDefaultKnowledgeRegistry();
    registry.registerSource(sampleSource());

    const metadata = registry.getMetadata("platform.actions");

    expect(metadata).toMatchObject({
      sourceId: "platform.actions",
      providerRegistered: false,
      version: "1.0.0",
      declaredCapabilities: ["command"],
      healthStatus: "degraded",
    });
  });

  it("marks source healthy when provider is registered", () => {
    const registry = createDefaultKnowledgeRegistry();
    registry.registerProvider(createScaffoldKnowledgeProvider(sampleSource()));

    expect(registry.getMetadata("platform.actions")).toMatchObject({
      providerRegistered: true,
      providerId: "platform.actions",
      healthStatus: "healthy",
    });
  });

  it("reports disabled and planned health statuses", () => {
    const registry = createDefaultKnowledgeRegistry();
    registry.registerSource(sampleSource({ status: "disabled" }));
    registry.registerSource(
      sampleSource({
        id: "platform.semantic",
        status: "planned",
        provides: ["custom"],
      }),
    );

    const metadata = registry.listMetadata();
    expect(
      metadata.find((entry) => entry.sourceId === "platform.actions")?.healthStatus,
    ).toBe("disabled");
    expect(
      metadata.find((entry) => entry.sourceId === "platform.semantic")?.healthStatus,
    ).toBe("planned");
  });

  it("returns registry metadata summary", () => {
    const registry = createDefaultKnowledgeRegistry();
    registry.recordFrameworkVersion("0.5.0");
    registry.recordManifestCapabilities(["capability-a", "capability-b"]);
    registry.registerProvider(createScaffoldKnowledgeProvider(sampleSource()));

    const metadata = registry.getRegistryMetadata();

    expect(metadata.frameworkVersion).toBe("0.5.0");
    expect(metadata.manifestCapabilityCount).toBe(2);
    expect(metadata.sourceMetadata).toHaveLength(1);
  });
});

describe("DefaultKnowledgeRegistry diagnostics", () => {
  it("returns empty diagnostics for new registry", () => {
    const registry = createDefaultKnowledgeRegistry();

    expect(registry.getDiagnostics()).toMatchObject({
      status: "empty",
      registeredSourceCount: 0,
      registeredProviderCount: 0,
      sourceIds: [],
      validationIssueCount: 0,
    });
  });

  it("returns degraded status when active source lacks provider", () => {
    const registry = createDefaultKnowledgeRegistry();
    registry.registerSource(sampleSource());

    expect(registry.getDiagnostics()).toMatchObject({
      status: "degraded",
      registeredSourceCount: 1,
      healthSummary: {
        healthy: 0,
        degraded: 1,
        planned: 0,
        disabled: 0,
        unknown: 0,
      },
    });
  });

  it("returns ready status when provider-backed sources are healthy", () => {
    const registry = createDefaultKnowledgeRegistry();
    registry.registerProvider(createScaffoldKnowledgeProvider(sampleSource()));

    expect(registry.getDiagnostics().status).toBe("ready");
    expect(registry.getDiagnostics().healthSummary.healthy).toBe(1);
  });

  it("clears registry state", () => {
    const registry = createDefaultKnowledgeRegistry();
    registry.registerProvider(createScaffoldKnowledgeProvider(sampleSource()));
    registry.clear();

    expect(registry.getDiagnostics().status).toBe("empty");
    expect(registry.listMetadata()).toEqual([]);
  });
});

describe("DefaultKnowledgeRegistry immutability", () => {
  it("deep-freezes registered sources", () => {
    const registry = createDefaultKnowledgeRegistry();
    registry.registerSource(sampleSource());

    const source = registry.getSource("platform.actions");
    expect(Object.isFrozen(source)).toBe(true);
    expect(Object.isFrozen(source?.provides)).toBe(true);
  });
});
