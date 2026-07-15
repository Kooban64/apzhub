/**
 * OSS-101-10 — Performance baseline (mocked). Measurement only — no optimisation.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createPlaneAdapter, disposePlaneAdapter } from "@apzhub/integration-plane";
import {
  createPlatformServicesWithPlane,
  InMemoryEntityMappingStore,
} from "@apzhub/platform-services";

import { createMockPlaneCoreFetch } from "../../integrations/plane/src/testing/mock-plane-core-fetch";
import {
  DEFAULT_TEST_PLANE_CONFIG,
  TEST_TENANT_ID,
} from "../../integrations/plane/src/testing/mock-plane-api";

const CORR = "corr-wave1-perf-001";
const TENANT = TEST_TENANT_ID;

async function timed<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<{ label: string; ms: number; result: T }> {
  const start = performance.now();
  const result = await fn();
  const ms = Number((performance.now() - start).toFixed(3));
  return { label, ms, result };
}

describe("OSS-101-10 performance baseline (mocked)", () => {
  let adapter: Awaited<ReturnType<typeof createPlaneAdapter>>["adapter"];
  let factory: Awaited<ReturnType<typeof createPlaneAdapter>>["factory"];
  let mappingStore: InMemoryEntityMappingStore;

  beforeEach(async () => {
    mappingStore = new InMemoryEntityMappingStore();
    const created = await createPlaneAdapter({
      plane: DEFAULT_TEST_PLANE_CONFIG,
      tenantId: TENANT,
      apiToken: "wave1-perf-token",
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

  it("records baseline timings for representative operations", async () => {
    const ctx = { correlationId: CORR, tenantId: TENANT };
    const bundle = createPlatformServicesWithPlane(adapter.core, mappingStore);
    const serviceCtx = {
      tenantId: TENANT,
      userId: "user_perf",
      correlationId: CORR,
      permissions: [
        "projects.view",
        "projects.manage",
        "workspace.view",
        "task.view",
        "task.update",
      ],
    };

    const baselines: { label: string; ms: number }[] = [];

    baselines.push(
      await timed("workspace.list", async () => {
        await adapter.core.workspaces.list(ctx);
      }).then(({ label, ms }) => ({ label, ms })),
    );

    baselines.push(
      await timed("project.list", async () => {
        await adapter.core.projects.list(ctx);
      }).then(({ label, ms }) => ({ label, ms })),
    );

    const created = await timed("project.create", async () =>
      adapter.core.projects.create(ctx, {
        name: "Perf Project",
        identifier: "PERF",
      }),
    );
    baselines.push({ label: created.label, ms: created.ms });

    baselines.push(
      await timed("task.list", async () => {
        await adapter.core.tasks.list(ctx, created.result.id);
      }).then(({ label, ms }) => ({ label, ms })),
    );

    const tasks = await adapter.core.tasks.list(ctx, created.result.id);
    if (tasks.items[0]) {
      baselines.push(
        await timed("task.update", async () => {
          await adapter.core.tasks.update(ctx, created.result.id, tasks.items[0]!.id, {
            title: "Perf Updated",
          });
        }).then(({ label, ms }) => ({ label, ms })),
      );
    }

    baselines.push(
      await timed("gateway.workspaces.list", async () => {
        await bundle.gateway.workspaces.listWorkspaces(serviceCtx, {});
      }).then(({ label, ms }) => ({ label, ms })),
    );

    baselines.push(
      await timed("gateway.projects.list", async () => {
        await bundle.gateway.projects.listProjects(serviceCtx, {});
      }).then(({ label, ms }) => ({ label, ms })),
    );

    baselines.push(
      await timed("provider.resolution+mapping.lookup", async () => {
        const listed = await bundle.gateway.projects.listProjects(serviceCtx, {});
        if (listed.items[0]) {
          await bundle.gateway.projects.getProject(serviceCtx, listed.items[0].id);
        }
      }).then(({ label, ms }) => ({ label, ms })),
    );

    // Soft assertions — environment-dependent; ensure operations completed and timings are finite
    for (const entry of baselines) {
      expect(Number.isFinite(entry.ms)).toBe(true);
      expect(entry.ms).toBeGreaterThanOrEqual(0);
      // Mocked path should stay well under 5s per op on CI
      expect(entry.ms).toBeLessThan(5000);
    }

    // Expose for certification report capture
    console.info(
      "[WAVE1-PERF-BASELINE]",
      JSON.stringify({ generatedAt: new Date().toISOString(), baselines }),
    );
  });
});
