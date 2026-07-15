import { expect, it } from "vitest";

import { isPlatformServiceError } from "@apzhub/platform-service-contracts";

import { generateGlobalId } from "./global-id";
import type { EntityMappingStore } from "./entity-mapping-store";
import type { CreateEntityMappingInput } from "./types";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";
const ORG_1 = "org-1";
const ORG_2 = "org-2";

function baseCreate(
  overrides: Partial<CreateEntityMappingInput> &
    Pick<CreateEntityMappingInput, "platformId" | "entityType" | "providerNativeId">,
): CreateEntityMappingInput {
  return {
    providerId: "plane-project",
    integrationId: "plane",
    tenantId: TENANT_A,
    ...overrides,
  };
}

/**
 * Implementation-independent EntityMappingStore contract suite (OSS-110-05).
 * Run against InMemoryEntityMappingStore and PostgresEntityMappingStore.
 */
export function defineEntityMappingStoreContractTests(options: {
  readonly label: string;
  readonly createStore: () => Promise<EntityMappingStore> | EntityMappingStore;
  readonly resetStore?: (store: EntityMappingStore) => Promise<void> | void;
}): void {
  const { createStore, resetStore } = options;

  async function freshStore(): Promise<EntityMappingStore> {
    const store = await createStore();
    if (resetStore) {
      await resetStore(store);
    }
    return store;
  }

  it("creates and retrieves by platform id and provider-native id", async () => {
    const store = await freshStore();
    const platformId = generateGlobalId("project");

    const created = await store.create(
      baseCreate({
        platformId,
        entityType: "project",
        providerNativeId: "native-1",
        metadata: { source: "test" },
      }),
    );

    expect(created.platformId).toBe(platformId);
    expect(created.revision).toBe(1);
    expect(created.metadata).toEqual({ source: "test" });

    const byPlatform = await store.getByPlatformId(platformId, TENANT_A);
    expect(byPlatform?.providerNativeId).toBe("native-1");

    const byNative = await store.getByProviderNativeId({
      tenantId: TENANT_A,
      entityType: "project",
      providerId: "plane-project",
      providerNativeId: "native-1",
    });
    expect(byNative?.platformId).toBe(platformId);
  });

  it("resolves bidirectionally for active mappings", async () => {
    const store = await freshStore();
    const platformId = generateGlobalId("workspace");

    await store.create(
      baseCreate({
        platformId,
        entityType: "workspace",
        providerNativeId: "ws-native",
        providerId: "plane-workspace",
      }),
    );

    await expect(
      store.resolveProviderNativeId({ platformId, tenantId: TENANT_A }),
    ).resolves.toBe("ws-native");

    await expect(
      store.resolvePlatformId({
        tenantId: TENANT_A,
        entityType: "workspace",
        providerId: "plane-workspace",
        providerNativeId: "ws-native",
      }),
    ).resolves.toBe(platformId);
  });

  it("enforces platformId uniqueness and provider-native uniqueness", async () => {
    const store = await freshStore();
    const platformId = generateGlobalId("project");

    await store.create(
      baseCreate({
        platformId,
        entityType: "project",
        providerNativeId: "dup-native",
      }),
    );

    await expect(
      store.create(
        baseCreate({
          platformId,
          entityType: "project",
          providerNativeId: "other",
        }),
      ),
    ).rejects.toMatchObject({ code: "MAPPING_CONFLICT" });

    await expect(
      store.create(
        baseCreate({
          platformId: generateGlobalId("project"),
          entityType: "project",
          providerNativeId: "dup-native",
        }),
      ),
    ).rejects.toMatchObject({ code: "MAPPING_CONFLICT" });
  });

  it("allows rebinding provider-native id after deactivation", async () => {
    const store = await freshStore();
    const first = generateGlobalId("project");
    const second = generateGlobalId("project");

    await store.create(
      baseCreate({
        platformId: first,
        entityType: "project",
        providerNativeId: "rebind",
      }),
    );
    await store.deactivate(first, TENANT_A);

    const rebound = await store.create(
      baseCreate({
        platformId: second,
        entityType: "project",
        providerNativeId: "rebind",
      }),
    );
    expect(rebound.platformId).toBe(second);
  });

  it("isolates tenants and organisations", async () => {
    const store = await freshStore();
    const platformId = generateGlobalId("project");

    await store.create(
      baseCreate({
        platformId,
        entityType: "project",
        providerNativeId: "scoped",
        organisationId: ORG_1,
      }),
    );

    expect(await store.getByPlatformId(platformId, TENANT_B)).toBeNull();
    expect(await store.getByPlatformId(platformId, TENANT_A, ORG_2)).toBeNull();
    expect(await store.getByPlatformId(platformId, TENANT_A, ORG_1)).not.toBeNull();

    const listed = await store.list({ tenantId: TENANT_A, organisationId: ORG_1 });
    expect(listed).toHaveLength(1);

    const otherTenant = await store.list({ tenantId: TENANT_B });
    expect(otherTenant).toHaveLength(0);
  });

  it("supports parent-child listing and metadata/status updates", async () => {
    const store = await freshStore();
    const parentId = generateGlobalId("project");
    const childId = generateGlobalId("sprint");

    await store.create(
      baseCreate({
        platformId: parentId,
        entityType: "project",
        providerNativeId: "parent-n",
      }),
    );

    await store.create(
      baseCreate({
        platformId: childId,
        entityType: "sprint",
        providerNativeId: "child-n",
        parentPlatformId: parentId,
        parentProviderNativeId: "parent-n",
      }),
    );

    const children = await store.list({
      tenantId: TENANT_A,
      parentPlatformId: parentId,
    });
    expect(children.map((row) => row.platformId)).toEqual([childId]);

    const updated = await store.update(
      childId,
      { metadata: { k: "v" }, status: "pending" },
      TENANT_A,
    );
    expect(updated.metadata).toEqual({ k: "v" });
    expect(updated.status).toBe("pending");
    expect(updated.revision).toBe(2);
  });

  it("enforces optimistic concurrency", async () => {
    const store = await freshStore();
    const platformId = generateGlobalId("team");

    await store.create(
      baseCreate({
        platformId,
        entityType: "team",
        providerNativeId: "team-1",
        providerId: "plane-team",
      }),
    );

    await expect(
      store.update(platformId, { status: "inactive", expectedRevision: 99 }, TENANT_A),
    ).rejects.toMatchObject({ code: "MAPPING_REVISION_CONFLICT" });
  });

  it("filters by provider and integration and lists deterministically", async () => {
    const store = await freshStore();
    const a = generateGlobalId("project");
    const b = generateGlobalId("project");
    const ids = [a, b].sort((left, right) => left.localeCompare(right));

    await store.create(
      baseCreate({
        platformId: ids[1]!,
        entityType: "project",
        providerNativeId: "p-b",
      }),
    );
    await store.create(
      baseCreate({
        platformId: ids[0]!,
        entityType: "project",
        providerNativeId: "p-a",
      }),
    );

    const listed = await store.list({
      tenantId: TENANT_A,
      providerId: "plane-project",
      integrationId: "plane",
    });
    expect(listed.map((row) => row.platformId)).toEqual(ids);
  });

  it("returns immutable copies", async () => {
    const store = await freshStore();
    const platformId = generateGlobalId("label");

    const created = await store.create(
      baseCreate({
        platformId,
        entityType: "label",
        providerNativeId: "label-1",
        metadata: { a: "1" },
      }),
    );

    (created.metadata as Record<string, string>).a = "mutated";
    const again = await store.getByPlatformId(platformId, TENANT_A);
    expect(again?.metadata).toEqual({ a: "1" });
  });

  it("classifies inactive resolve and not-found errors", async () => {
    const store = await freshStore();
    const platformId = generateGlobalId("module");

    await store.create(
      baseCreate({
        platformId,
        entityType: "module",
        providerNativeId: "mod-1",
      }),
    );
    await store.deactivate(platformId, TENANT_A);

    try {
      await store.resolveProviderNativeId({
        platformId,
        tenantId: TENANT_A,
        requireActive: true,
      });
      expect.unreachable("expected inactive error");
    } catch (error) {
      expect(isPlatformServiceError(error)).toBe(true);
      if (isPlatformServiceError(error)) {
        expect(error.code).toBe("MAPPING_INACTIVE");
      }
    }

    await expect(
      store.resolveProviderNativeId({
        platformId: generateGlobalId("module"),
        tenantId: TENANT_A,
      }),
    ).rejects.toMatchObject({ code: "MAPPING_NOT_FOUND" });
  });

  it("removes mappings when explicitly requested", async () => {
    const store = await freshStore();
    const platformId = generateGlobalId("status");

    await store.create(
      baseCreate({
        platformId,
        entityType: "status",
        providerNativeId: "st-1",
      }),
    );

    expect(await store.remove(platformId, TENANT_A)).toBe(true);
    expect(await store.getByPlatformId(platformId, TENANT_A)).toBeNull();
    expect(await store.remove(platformId, TENANT_A)).toBe(false);
  });
}
