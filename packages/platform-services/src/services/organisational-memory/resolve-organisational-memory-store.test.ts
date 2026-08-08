import { afterEach, describe, expect, it, vi } from "vitest";

describe("KNW-PR-01 resolveOrganisationalMemoryStore fail-closed", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("forbids memory store mode in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APZHUB_KNOWLEDGE_MEMORY_STORE", "memory");
    const mod = await import("./create-organisational-memory-service");
    expect(() => mod.resolveOrganisationalMemoryStore()).toThrow(
      /organisational_memory_memory_forbidden_in_production/,
    );
  });
});
