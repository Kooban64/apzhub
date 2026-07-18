import { describe, expect, it, vi } from "vitest";

const persistenceFactoryMock = vi.hoisted(() => ({
  createPostgresTestingPersistence: vi.fn(),
}));

vi.mock("@apzhub/testing-persistence", async (importActual) => {
  const actual = await importActual<typeof import("@apzhub/testing-persistence")>();
  persistenceFactoryMock.createPostgresTestingPersistence.mockImplementation(() =>
    actual.createInMemoryTestingPersistence(),
  );
  return {
    ...actual,
    createPostgresTestingPersistence:
      persistenceFactoryMock.createPostgresTestingPersistence,
  };
});

import {
  createTestingPlatformServices,
  createTestingPlatformServicesForProduction,
  createTestingPlatformServicesForTest,
} from "./create-testing-platform-services";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { isTestingServiceEnabled } from "./testing-env";

describe("createTestingPlatformServicesForTest", () => {
  it("creates a gateway surface with testing service groups when in-memory persistence is explicitly allowed", () => {
    const bundle = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });

    expect(bundle.readiness).toMatchObject({
      enabled: true,
      persistence: "in-memory-test",
      domain: "created",
    });
    expect(bundle.gatewaySurface.plans).toBeDefined();
    expect(bundle.gatewaySurface.suites).toBeDefined();
    expect(bundle.gatewaySurface.cases).toBeDefined();
    expect(bundle.gatewaySurface.executions).toBeDefined();
    expect(bundle.gatewaySurface.evidence).toBeDefined();
    expect(bundle.gatewaySurface.certification).toBeDefined();
    expect(bundle.gatewaySurface.reporting).toBeDefined();
  });

  it("fails clearly without persistence, domain services, or explicit in-memory test opt-in", () => {
    expect(() => createTestingPlatformServicesForTest()).toThrow(
      /requires persistence or allowInMemoryPersistence/,
    );
    expect(() => createTestingPlatformServices({})).toThrow(
      /Testing persistence or prebuilt domain services are required/,
    );
  });

  it("accepts provided persistence and provided domain services without fallback persistence", () => {
    const withPersistence = createTestingPlatformServices({
      persistence: createInMemoryTestingPersistence(),
    });
    expect(withPersistence.readiness).toMatchObject({
      persistence: "provided",
      domain: "created",
    });

    const withDomain = createTestingPlatformServicesForTest({
      domain: withPersistence.domain,
    });
    expect(withDomain.readiness).toMatchObject({
      persistence: "provided",
      domain: "provided",
    });
    expect(withDomain.gatewaySurface.plans).toBeDefined();
  });
});

describe("createTestingPlatformServicesForProduction", () => {
  it("requires a postgres persistence factory and does not silently choose in-memory persistence", () => {
    const postgresDb = { select: vi.fn(), insert: vi.fn() } as unknown as Parameters<
      typeof createTestingPlatformServicesForProduction
    >[0]["postgresDb"];

    const bundle = createTestingPlatformServicesForProduction({ postgresDb });

    expect(
      persistenceFactoryMock.createPostgresTestingPersistence,
    ).toHaveBeenCalledWith(postgresDb);
    expect(bundle.readiness).toMatchObject({
      enabled: true,
      persistence: "postgres",
      domain: "created",
    });
    expect(bundle.gatewaySurface.plans).toBeDefined();
  });
});

describe("isTestingServiceEnabled", () => {
  it("reports enabled only when the feature flag is true", () => {
    expect(isTestingServiceEnabled({ TESTING_SERVICE_ENABLED: "true" })).toBe(true);
    expect(isTestingServiceEnabled({ TESTING_SERVICE_ENABLED: "false" })).toBe(false);
    expect(isTestingServiceEnabled(undefined)).toBe(false);
  });
});
