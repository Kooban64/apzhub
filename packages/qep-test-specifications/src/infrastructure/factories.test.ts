import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";

import {
  createEmptyTestSpecificationStore,
  createQepTestSpecificationPersistence,
  createQepTestSpecificationPersistenceForProduction,
  createQepTestSpecificationPersistenceForTest,
} from "./factories";
import { createTestSpecification } from "../domain/test-specification/test-specification";

describe("QEP test specification persistence factories", () => {
  it("creates in-memory repositories in memory mode", async () => {
    const stores = createEmptyTestSpecificationStore();
    const repos = createQepTestSpecificationPersistence({ mode: "memory", stores });
    expect(repos.specifications).toBeDefined();
    const draft = createTestSpecification({
      id: "tsp_memory_mode",
      tenantId: "tenant_memory",
      number: "TS-MEM-001",
      title: "Memory mode",
      description: "Desc",
      objective: "Obj",
      scope: "Scope",
      type: "functional",
      classification: "standard",
      owner: "user_memory",
      author: "user_memory",
      createdAt: "2026-07-26T12:00:00.000Z",
      createdBy: "user_memory",
      correlationId: "corr_memory",
    });
    await repos.specifications.create(draft);
    expect(
      await repos.specifications.exists("tenant_memory", "tsp_memory_mode" as never),
    ).toBe(true);
  });

  it("uses a fresh store when memory mode omits stores", () => {
    const repos = createQepTestSpecificationPersistence({ mode: "memory" });
    expect(repos.specifications).toBeDefined();
  });

  it("requires db for postgres mode", () => {
    expect(() => createQepTestSpecificationPersistence({ mode: "postgres" })).toThrow(
      /requires db/,
    );
  });

  it("creates postgres repositories when db is provided", () => {
    const db = { select: vi.fn() } as unknown as DatabaseExecutor;
    const repos = createQepTestSpecificationPersistence({ mode: "postgres", db });
    expect(repos.specifications).toBeDefined();
  });

  it("rejects unsupported persistence modes", () => {
    expect(() =>
      createQepTestSpecificationPersistence({ mode: "sqlite" as "memory" }),
    ).toThrow(/Unsupported QEP test specification persistence mode/);
  });

  it("requires db for production persistence", () => {
    expect(() =>
      createQepTestSpecificationPersistenceForProduction({
        db: undefined as unknown as DatabaseExecutor,
      }),
    ).toThrow(/requires explicit postgres db/);
  });

  it("creates production postgres repositories", () => {
    const db = { select: vi.fn() } as unknown as DatabaseExecutor;
    const repos = createQepTestSpecificationPersistenceForProduction({ db });
    expect(repos.specifications).toBeDefined();
  });

  it("requires postgresDb or allowInMemoryPersistence for test persistence", () => {
    expect(() => createQepTestSpecificationPersistenceForTest()).toThrow(
      /requires postgresDb or allowInMemoryPersistence/,
    );
  });

  it("uses postgres when postgresDb is provided for tests", () => {
    const db = { select: vi.fn() } as unknown as DatabaseExecutor;
    const repos = createQepTestSpecificationPersistenceForTest({ postgresDb: db });
    expect(repos.specifications).toBeDefined();
  });

  it("allows in-memory persistence for tests when explicitly enabled", async () => {
    const stores = createEmptyTestSpecificationStore();
    const repos = createQepTestSpecificationPersistenceForTest({
      allowInMemoryPersistence: true,
      stores,
    });
    const draft = createTestSpecification({
      id: "tsp_factory_test",
      tenantId: "tenant_factory",
      number: "TS-FACTORY-001",
      title: "Factory test",
      description: "Desc",
      objective: "Obj",
      scope: "Scope",
      type: "functional",
      classification: "standard",
      owner: "user_factory",
      author: "user_factory",
      createdAt: "2026-07-26T12:00:00.000Z",
      createdBy: "user_factory",
      correlationId: "corr_factory",
    });
    const created = await repos.specifications.create(draft);
    expect(created.record.id).toBe("tsp_factory_test");
  });
});
