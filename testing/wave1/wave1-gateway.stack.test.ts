/**
 * OSS-101-10 — Gateway → Plane → Mock stack certification (no HTTP / Next.js).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createPlaneAdapter,
  disposePlaneAdapter,
  PLANE_ADAPTER_VERSION,
} from "@apzhub/integration-plane";
import {
  createPlatformServicesWithPlane,
  InMemoryEntityMappingStore,
} from "@apzhub/platform-services";

import { createMockPlaneCoreFetch } from "../../integrations/plane/src/testing/mock-plane-core-fetch";
import {
  DEFAULT_TEST_PLANE_CONFIG,
  TEST_TENANT_ID,
} from "../../integrations/plane/src/testing/mock-plane-api";

const TENANT = TEST_TENANT_ID;
const CORR = "corr-wave1-gateway-001";

describe("OSS-101-10 Wave 1 gateway stack certification", () => {
  let adapter: Awaited<ReturnType<typeof createPlaneAdapter>>["adapter"];
  let factory: Awaited<ReturnType<typeof createPlaneAdapter>>["factory"];

  beforeEach(async () => {
    const created = await createPlaneAdapter({
      plane: DEFAULT_TEST_PLANE_CONFIG,
      tenantId: TENANT,
      apiToken: "wave1-gateway-token",
      adapterOptions: { fetchFn: createMockPlaneCoreFetch() },
    });
    adapter = created.adapter;
    factory = created.factory;
    await adapter.initialise();
    await adapter.testConnection({ correlationId: CORR, tenantId: TENANT });
  });

  afterEach(async () => {
    if (adapter && factory) {
      await disposePlaneAdapter(adapter, factory);
    }
  });

  it("certifies gateway → providers → plane → mock", async () => {
    expect(PLANE_ADAPTER_VERSION).toBe("0.6.0");
    const mappingStore = new InMemoryEntityMappingStore();
    const bundle = createPlatformServicesWithPlane(adapter.core, mappingStore);
    const serviceCtx = {
      tenantId: TENANT,
      userId: "user_wave1_gateway",
      correlationId: CORR,
      permissions: [
        "projects.view",
        "projects.manage",
        "workspace.view",
        "task.view",
        "task.create",
      ],
    };

    const workspaces = await bundle.gateway.workspaces.listWorkspaces(serviceCtx, {});
    expect(workspaces.items.length).toBeGreaterThanOrEqual(1);

    const created = await bundle.gateway.projects.createProject(serviceCtx, {
      workspaceId: workspaces.items[0]!.id,
      name: "Gateway Cert Project",
      identifier: "GCP",
    });
    expect(created.id.startsWith("proj_")).toBe(true);

    const fetched = await bundle.gateway.projects.getProject(serviceCtx, created.id);
    expect(fetched.name).toContain("Gateway Cert");

    const mappings = await mappingStore.list({ tenantId: TENANT });
    expect(mappings.length).toBeGreaterThanOrEqual(1);

    const sync = await adapter.core.synchronisation.runFullSync({
      correlationId: CORR,
      tenantId: TENANT,
    });
    expect(sync.status.status).toBe("succeeded");

    const readiness = await adapter.evaluateReadiness({
      correlationId: CORR,
      tenantId: TENANT,
    });
    expect(readiness.ready).toBe(true);
  });
});
