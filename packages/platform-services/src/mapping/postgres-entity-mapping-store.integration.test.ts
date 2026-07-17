import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  checkDatabaseHealth,
  createDb,
  platformEntityMapping,
  runMigrations,
} from "@apzhub/config/db";
import { isPlatformServiceError, PlatformServiceError } from "@apzhub/platform-service-contracts";

import { TEST_SERVICE_CONTEXT, TEST_TENANT_ID } from "../testing";
import { MappingOrchestrator } from "../orchestration/mapping-orchestrator";
import {
  assertEntityMappingStoreModeAllowed,
  createEntityMappingStore,
  resolveEntityMappingStoreMode,
} from "./create-entity-mapping-store";
import { defineEntityMappingStoreContractTests } from "./entity-mapping-store.contract";
import { generateGlobalId } from "./global-id";
import {
  InMemoryMappingStoreLogger,
  InMemoryMappingStoreMetrics,
} from "./mapping-store-observability";
import { translateMappingPersistenceError } from "./map-persistence-error";
import { PostgresEntityMappingStore } from "./postgres-entity-mapping-store";

async function isPostgresIntegrationAvailable(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    return false;
  }
  const health = await checkDatabaseHealth();
  return health.ok;
}

const postgresAvailable = await isPostgresIntegrationAvailable();

describe.runIf(postgresAvailable)("PostgresEntityMappingStore integration", () => {
  // Dummy URL only for suite collection when skipped — never call getDatabaseUrl() at load.
  const connectionString =
    process.env.DATABASE_URL ?? "postgres://localhost:5432/apzhub_skip";
  const db = createDb(connectionString);
  const logger = new InMemoryMappingStoreLogger();
  const metrics = new InMemoryMappingStoreMetrics();

  beforeAll(async () => {
    await runMigrations(connectionString);
  });

  afterAll(async () => {
    await db.delete(platformEntityMapping);
  });

  async function reset(): Promise<void> {
    await db.delete(platformEntityMapping);
    logger.events.length = 0;
    metrics.events.length = 0;
  }

  defineEntityMappingStoreContractTests({
    label: "postgres",
    createStore: () =>
      new PostgresEntityMappingStore({
        db,
        logger,
        metrics,
      }),
    resetStore: async () => {
      await reset();
    },
  });

  it("enforces database uniqueness for active provider-native bindings", async () => {
    await reset();
    const store = new PostgresEntityMappingStore({ db });
    const first = generateGlobalId("project");
    const second = generateGlobalId("project");

    await store.create({
      platformId: first,
      entityType: "project",
      providerId: "plane-project",
      integrationId: "plane",
      providerNativeId: "db-unique",
      tenantId: TEST_TENANT_ID,
    });

    await expect(
      store.create({
        platformId: second,
        entityType: "project",
        providerId: "plane-project",
        integrationId: "plane",
        providerNativeId: "db-unique",
        tenantId: TEST_TENANT_ID,
      }),
    ).rejects.toMatchObject({ code: "MAPPING_CONFLICT" });
  });

  it("rolls back failed updates on revision conflict inside a transaction", async () => {
    await reset();
    const store = new PostgresEntityMappingStore({ db });
    const platformId = generateGlobalId("project");

    await store.create({
      platformId,
      entityType: "project",
      providerId: "plane-project",
      integrationId: "plane",
      providerNativeId: "tx-1",
      tenantId: TEST_TENANT_ID,
      metadata: { v: "1" },
    });

    await expect(
      store.update(platformId, { metadata: { v: "2" }, expectedRevision: 5 }, TEST_TENANT_ID),
    ).rejects.toMatchObject({ code: "MAPPING_REVISION_CONFLICT" });

    const current = await store.getByPlatformId(platformId, TEST_TENANT_ID);
    expect(current?.metadata).toEqual({ v: "1" });
    expect(current?.revision).toBe(1);
  });

  it("emits persistence observability events without secrets", async () => {
    await reset();
    const store = new PostgresEntityMappingStore({ db, logger, metrics });
    const platformId = generateGlobalId("project");

    await store.create({
      platformId,
      entityType: "project",
      providerId: "plane-project",
      integrationId: "plane",
      providerNativeId: "obs-1",
      tenantId: TEST_TENANT_ID,
    });

    expect(logger.events.some((event) => event.operation === "create")).toBe(true);
    expect(metrics.events.some((event) => event.operation === "create")).toBe(true);
    for (const event of logger.events) {
      expect(JSON.stringify(event)).not.toMatch(/postgresql:\/\//i);
      expect(JSON.stringify(event)).not.toMatch(/password/i);
    }
  });
});

describe.runIf(postgresAvailable)("MappingOrchestrator + Postgres store", () => {
  const connectionString =
    process.env.DATABASE_URL ?? "postgres://localhost:5432/apzhub_skip";
  const db = createDb(connectionString);

  beforeAll(async () => {
    await runMigrations(connectionString);
  });

  afterAll(async () => {
    await db.delete(platformEntityMapping);
  });

  it("persists mappings on ensureMappingAfterCreate and resolves provider identity", async () => {
    await db.delete(platformEntityMapping);
    const store = new PostgresEntityMappingStore({ db });
    const orchestrator = new MappingOrchestrator({ store });

    const mapping = await orchestrator.ensureMappingAfterCreate({
      ctx: TEST_SERVICE_CONTEXT,
      entityType: "project",
      providerId: "plane-project",
      integrationId: "plane",
      providerEntityId: "engine-project-99",
    });

    expect(mapping.platformId.startsWith("proj_")).toBe(true);
    expect(mapping.providerNativeId).toBe("engine-project-99");

    const resolved = await orchestrator.resolveExisting(
      TEST_SERVICE_CONTEXT,
      mapping.platformId,
      "project",
    );
    expect(resolved.providerNativeId).toBe("engine-project-99");
    expect(resolved.providerId).toBe("plane-project");
  });

  it("supports parent mapping resolution", async () => {
    await db.delete(platformEntityMapping);
    const store = new PostgresEntityMappingStore({ db });
    const orchestrator = new MappingOrchestrator({ store });

    const parent = await orchestrator.ensureMappingAfterCreate({
      ctx: TEST_SERVICE_CONTEXT,
      entityType: "project",
      providerId: "plane-project",
      integrationId: "plane",
      providerEntityId: "parent-engine",
    });

    const child = await orchestrator.ensureMappingAfterCreate({
      ctx: TEST_SERVICE_CONTEXT,
      entityType: "sprint",
      providerId: "plane-project",
      integrationId: "plane",
      providerEntityId: "child-engine",
      parentPlatformId: parent.platformId,
      parentProviderNativeId: parent.providerNativeId,
    });

    expect(child.parentPlatformId).toBe(parent.platformId);
    const listed = await store.list({
      tenantId: TEST_TENANT_ID,
      parentPlatformId: parent.platformId,
    });
    expect(listed).toHaveLength(1);
  });

  it("returns RECONCILIATION_REQUIRED when persistence fails after provider success", async () => {
    await db.delete(platformEntityMapping);
    const store = new PostgresEntityMappingStore({ db });

    const failingStore = {
      getByProviderNativeId: store.getByProviderNativeId.bind(store),
      update: store.update.bind(store),
      create: async () => {
        throw new PlatformServiceError({
          category: "system",
          code: "MAPPING_PERSISTENCE_FAILED",
          message: "simulated persistence failure",
          correlationId: "test",
          retryable: false,
        });
      },
    };

    const failingOrchestrator = new MappingOrchestrator({
      store: failingStore as unknown as PostgresEntityMappingStore,
    });

    await expect(
      failingOrchestrator.ensureMappingAfterCreate({
        ctx: TEST_SERVICE_CONTEXT,
        entityType: "project",
        providerId: "plane-project",
        integrationId: "plane",
        providerEntityId: "orphan-engine",
      }),
    ).rejects.toMatchObject({ code: "RECONCILIATION_REQUIRED" });
  });

  it("handles inactive mappings on resolve", async () => {
    await db.delete(platformEntityMapping);
    const store = new PostgresEntityMappingStore({ db });
    const orchestrator = new MappingOrchestrator({ store });

    const mapping = await orchestrator.ensureMappingAfterCreate({
      ctx: TEST_SERVICE_CONTEXT,
      entityType: "project",
      providerId: "plane-project",
      integrationId: "plane",
      providerEntityId: "inactive-native",
    });

    await store.deactivate(mapping.platformId, TEST_TENANT_ID);

    await expect(
      orchestrator.resolveExisting(TEST_SERVICE_CONTEXT, mapping.platformId, "project"),
    ).rejects.toMatchObject({ code: "MAPPING_INACTIVE" });
  });
});

describe("Entity mapping store bootstrap", () => {
  it("defaults to memory outside production", () => {
    expect(resolveEntityMappingStoreMode({ NODE_ENV: "test" }).mode).toBe("memory");
    expect(resolveEntityMappingStoreMode({ NODE_ENV: "development" }).mode).toBe("memory");
  });

  it("defaults to postgres in production", () => {
    expect(resolveEntityMappingStoreMode({ NODE_ENV: "production" }).mode).toBe("postgres");
  });

  it("rejects invalid mode values", () => {
    expect(() =>
      resolveEntityMappingStoreMode({ ENTITY_MAPPING_STORE_MODE: "sqlite" }),
    ).toThrow(/ENTITY_MAPPING_STORE_MODE/);
  });

  it("blocks memory mode in production without escape hatch", () => {
    expect(() =>
      assertEntityMappingStoreModeAllowed("memory", { NODE_ENV: "production" }),
    ).toThrow(/not permitted in production/);
  });

  it("allows memory in production when explicitly opted in", () => {
    expect(() =>
      assertEntityMappingStoreModeAllowed("memory", {
        NODE_ENV: "production",
        ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION: "true",
      }),
    ).not.toThrow();
  });

  it("creates an in-memory store when mode is memory", async () => {
    const store = await createEntityMappingStore({
      env: { NODE_ENV: "test", ENTITY_MAPPING_STORE_MODE: "memory" },
    });
    const platformId = generateGlobalId("project");
    await store.create({
      platformId,
      entityType: "project",
      providerId: "p",
      integrationId: "i",
      providerNativeId: "n",
      tenantId: "t",
    });
    expect(await store.getByPlatformId(platformId, "t")).not.toBeNull();
  });

  it.runIf(postgresAvailable)(
    "creates a postgres store when mode is postgres and database is healthy",
    async () => {
      const store = await createEntityMappingStore({
        env: {
          NODE_ENV: "test",
          ENTITY_MAPPING_STORE_MODE: "postgres",
          DATABASE_URL: process.env.DATABASE_URL,
        },
      });
      expect(store).toBeInstanceOf(PostgresEntityMappingStore);
    },
  );

  it("fails clearly when postgres mode lacks DATABASE_URL", async () => {
    await expect(
      createEntityMappingStore({
        env: {
          NODE_ENV: "test",
          ENTITY_MAPPING_STORE_MODE: "postgres",
          DATABASE_URL: "",
        },
      }),
    ).rejects.toMatchObject({ code: "CONFIGURATION_ERROR" });
  });
});

describe("translateMappingPersistenceError", () => {
  it("maps unique violations to MAPPING_CONFLICT", () => {
    const error = translateMappingPersistenceError({ code: "23505" }, "create");
    expect(error.code).toBe("MAPPING_CONFLICT");
    expect(error.message).not.toMatch(/platform_entity_mapping/i);
  });

  it("maps connection failures to PERSISTENCE_UNAVAILABLE", () => {
    const error = translateMappingPersistenceError(
      Object.assign(new Error("connect ECONNREFUSED"), { code: "ECONNREFUSED" }),
      "list",
    );
    expect(error.code).toBe("PERSISTENCE_UNAVAILABLE");
    expect(isPlatformServiceError(error)).toBe(true);
  });
});
