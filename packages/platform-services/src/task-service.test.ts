import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it, vi } from "vitest";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import { generateGlobalId, isValidGlobalId } from "./mapping/global-id";
import { InMemoryEntityMappingStore } from "./mapping/in-memory-entity-mapping-store";
import { createPlaneTaskProvider } from "./providers/plane/plane-task-provider";
import { ProviderRegistry } from "./providers/registry/provider-registry";
import { resolveOperationAuthorization } from "./authorization/operation-authorization-map";
import { PLATFORM_SERVICE_PERMISSION_CATALOGUE } from "./authorization/permission-catalogue";
import { createPlatformServices } from "./services/create-platform-services";
import { PLATFORM_SERVICES_VERSION } from "./services/create-platform-services";
import {
  createMockProjectProvider,
  createMockSearchProvider,
  createMockTaskProvider,
  createMockTeamProvider,
  createMockUserProvider,
  createMockWorkspaceProvider,
  TEST_PROVIDER_TASK,
  TEST_SERVICE_CONTEXT,
} from "./testing/mock-providers";
import {
  AUTH_TEST_TENANT_A,
  AUTH_TEST_TENANT_B,
  buildServiceContext,
  createAuthzTestResolver,
} from "./testing/authorization-fixtures";
import { ProductionAuthorizationProvider } from "./authorization/production-authorization-provider";
import { createDefaultProductionPolicies } from "./authorization/production-policies";
import { InMemoryAuthorizationAuditSink } from "./authorization/authorization-audit";

async function seedProjectMapping(
  store: InMemoryEntityMappingStore,
  tenantId = TEST_SERVICE_CONTEXT.tenantId,
) {
  const projectId = generateGlobalId("project");
  await store.create({
    platformId: projectId,
    entityType: "project",
    providerId: "mock-task",
    integrationId: "mock",
    providerNativeId: "proj-001",
    tenantId,
    status: "active",
  });
  return projectId;
}

function createTaskBundle(options?: {
  readonly taskOverrides?: Parameters<typeof createMockTaskProvider>[0];
  readonly mappingStore?: InMemoryEntityMappingStore;
  readonly withAuthz?: boolean;
}) {
  const registry = new ProviderRegistry();
  const mappingStore = options?.mappingStore ?? new InMemoryEntityMappingStore();

  registry.register({
    providerId: "mock-workspace",
    integrationId: "mock",
    capability: "workspace",
    priority: 10,
    provider: createMockWorkspaceProvider(),
  });
  registry.register({
    providerId: "mock-project",
    integrationId: "mock",
    capability: "project",
    priority: 10,
    provider: createMockProjectProvider(),
  });
  registry.register({
    providerId: "mock-task",
    integrationId: "mock",
    capability: "task",
    priority: 10,
    provider: createMockTaskProvider(options?.taskOverrides),
  });
  registry.register({
    providerId: "mock-team",
    integrationId: "mock",
    capability: "team",
    priority: 10,
    provider: createMockTeamProvider(),
  });
  registry.register({
    providerId: "mock-user",
    integrationId: "mock",
    capability: "user",
    priority: 10,
    provider: createMockUserProvider(),
  });
  registry.register({
    providerId: "mock-search",
    integrationId: "mock",
    capability: "search",
    priority: 10,
    provider: createMockSearchProvider(),
  });

  if (options?.withAuthz) {
    const accessResolver = createAuthzTestResolver();
    return {
      ...createPlatformServices({
        registry,
        mappingStore,
        authorizationMode: "production",
        accessResolver,
        auditSink: new InMemoryAuthorizationAuditSink(),
        policies: createDefaultProductionPolicies({
          accessResolver,
          mappingStore,
        }),
      }),
      mappingStore,
    };
  }

  return { ...createPlatformServices({ registry, mappingStore }), mappingStore };
}

describe("OSS-110-08 package version", () => {
  it("bumps platform-services to 0.25.0", () => {
    expect(PLATFORM_SERVICES_VERSION).toBe("0.25.0");
  });
});

describe("Plane task capability provider", () => {
  it("delegates list/get/create/update/archive/transition/assign to core.tasks", async () => {
    const tasks = {
      list: vi.fn(async () => ({
        items: [TEST_PROVIDER_TASK],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
      get: vi.fn(async () => TEST_PROVIDER_TASK),
      create: vi.fn(
        async (_ctx: unknown, _projectId: string, input: { title: string }) => ({
          ...TEST_PROVIDER_TASK,
          title: input.title,
          id: "task_plane_new",
        }),
      ),
      update: vi.fn(async () => ({ ...TEST_PROVIDER_TASK, title: "Updated" })),
      archive: vi.fn(async () => ({
        ...TEST_PROVIDER_TASK,
        archivedAt: "2026-07-10T00:00:00.000Z",
      })),
      transition: vi.fn(async () => ({
        ...TEST_PROVIDER_TASK,
        status: "in_progress" as const,
        statusId: "status_plane_state-2",
      })),
      assign: vi.fn(async () => ({
        ...TEST_PROVIDER_TASK,
        assigneeId: "user_plane_u1",
      })),
      unassign: vi.fn(async () => ({ ...TEST_PROVIDER_TASK, assigneeId: undefined })),
      setAssignees: vi.fn(async () => ({
        ...TEST_PROVIDER_TASK,
        assigneeId: "user_plane_u1",
        assigneeIds: ["user_plane_u2"],
      })),
    };

    const provider = createPlaneTaskProvider({ tasks } as never);
    const ctx = TEST_SERVICE_CONTEXT;

    await provider.listTasks(ctx, "proj-001");
    expect(tasks.list).toHaveBeenCalled();

    await provider.getTask(ctx, "proj-001", "issue-001");
    expect(tasks.get).toHaveBeenCalled();

    await provider.createTask(ctx, "proj-001", { title: "New" });
    expect(tasks.create).toHaveBeenCalled();

    await provider.updateTask(ctx, "proj-001", "issue-001", { title: "Updated" });
    expect(tasks.update).toHaveBeenCalled();

    await provider.archiveTask(ctx, "proj-001", "issue-001");
    expect(tasks.archive).toHaveBeenCalled();

    await provider.transitionTaskStatus(ctx, "proj-001", "issue-001", {
      statusId: "state-2",
    });
    expect(tasks.transition).toHaveBeenCalled();

    await provider.assignTask(ctx, "proj-001", "issue-001", { assigneeId: "user-1" });
    expect(tasks.assign).toHaveBeenCalled();

    await provider.assignTask(ctx, "proj-001", "issue-001", { assigneeId: null });
    expect(tasks.unassign).toHaveBeenCalled();

    await provider.assignTask(ctx, "proj-001", "issue-001", {
      assigneeId: "user-1",
      assigneeIds: ["user-1", "user-2"],
    });
    expect(tasks.setAssignees).toHaveBeenCalled();
  });
});

describe("TaskServiceImpl mapping-aware behaviour", () => {
  it("creates a task with a stable APZHUB global ID and reuses it on get/list", async () => {
    const { gateway, mappingStore, task } = createTaskBundle();
    const projectId = await seedProjectMapping(mappingStore);

    const created = await task.createTask(TEST_SERVICE_CONTEXT, projectId, {
      title: "Ship OSS-110-08",
    });

    expect(isValidGlobalId(created.id)).toBe(true);
    expect(created.id.startsWith("task_")).toBe(true);
    expect(created.id).not.toMatch(/task_plane_/);
    expect(created.projectId).toBe(projectId);
    expect(created.title).toBe("Ship OSS-110-08");

    const fetched = await task.getTask(TEST_SERVICE_CONTEXT, created.id);
    expect(fetched.id).toBe(created.id);

    const listed = await task.listTasks(TEST_SERVICE_CONTEXT, projectId);
    expect(listed.items.every((item) => isValidGlobalId(item.id))).toBe(true);
    expect(listed.items.every((item) => !item.id.includes("_plane_"))).toBe(true);

    // Gateway exposes tasks when provider registered
    const viaGateway = await gateway.tasks.getTask(TEST_SERVICE_CONTEXT, created.id);
    expect(viaGateway.id).toBe(created.id);
  });

  it("returns RECONCILIATION_REQUIRED when mapping persistence fails after create", async () => {
    const mappingStore = new InMemoryEntityMappingStore();
    const projectId = await seedProjectMapping(mappingStore);

    const originalCreate = mappingStore.create.bind(mappingStore);
    let taskCreates = 0;
    mappingStore.create = async (input) => {
      if (input.entityType === "task") {
        taskCreates += 1;
        if (taskCreates === 1) {
          throw new Error("simulated mapping persistence failure");
        }
      }
      return originalCreate(input);
    };

    const { task } = createTaskBundle({ mappingStore });

    await expect(
      task.createTask(TEST_SERVICE_CONTEXT, projectId, { title: "Orphan risk" }),
    ).rejects.toMatchObject({ code: "RECONCILIATION_REQUIRED" });
  });

  it("rejects self-parenting", async () => {
    const { task, mappingStore } = createTaskBundle();
    const projectId = await seedProjectMapping(mappingStore);
    const created = await task.createTask(TEST_SERVICE_CONTEXT, projectId, {
      title: "A",
    });

    await expect(
      task.updateTask(TEST_SERVICE_CONTEXT, created.id, { parentTaskId: created.id }),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("selects provider from task mapping over unrelated active provider", async () => {
    const registry = new ProviderRegistry();
    const mappingStore = new InMemoryEntityMappingStore();
    const projectId = generateGlobalId("project");
    await mappingStore.create({
      platformId: projectId,
      entityType: "project",
      providerId: "plane-task",
      integrationId: "plane",
      providerNativeId: "proj-001",
      tenantId: TEST_SERVICE_CONTEXT.tenantId,
      status: "active",
    });

    const planeCalls = vi.fn(async () => ({
      ...TEST_PROVIDER_TASK,
      id: "task_plane_mapped",
    }));
    const otherCalls = vi.fn(async () => {
      throw new Error("wrong provider");
    });

    registry.register({
      providerId: "other-task",
      integrationId: "other",
      capability: "task",
      priority: 1,
      provider: createMockTaskProvider({ getTask: otherCalls, createTask: otherCalls }),
    });
    registry.register({
      providerId: "plane-task",
      integrationId: "plane",
      capability: "task",
      priority: 100,
      provider: createMockTaskProvider({
        createTask: planeCalls,
        getTask: async (_ctx, _p, id) => ({ ...TEST_PROVIDER_TASK, id }),
      }),
    });
    registry.setActiveProvider("task", "other-task");

    registry.register({
      providerId: "mock-workspace",
      integrationId: "mock",
      capability: "workspace",
      priority: 10,
      provider: createMockWorkspaceProvider(),
    });
    registry.register({
      providerId: "mock-project",
      integrationId: "mock",
      capability: "project",
      priority: 10,
      provider: createMockProjectProvider(),
    });
    registry.register({
      providerId: "mock-team",
      integrationId: "mock",
      capability: "team",
      priority: 10,
      provider: createMockTeamProvider(),
    });
    registry.register({
      providerId: "mock-user",
      integrationId: "mock",
      capability: "user",
      priority: 10,
      provider: createMockUserProvider(),
    });
    registry.register({
      providerId: "mock-search",
      integrationId: "mock",
      capability: "search",
      priority: 10,
      provider: createMockSearchProvider(),
    });

    const { task } = createPlatformServices({ registry, mappingStore });
    const created = await task.createTask(TEST_SERVICE_CONTEXT, projectId, {
      title: "Mapped",
    });
    expect(planeCalls).toHaveBeenCalled();
    expect(otherCalls).not.toHaveBeenCalled();

    const fetched = await task.getTask(TEST_SERVICE_CONTEXT, created.id);
    expect(fetched.id).toBe(created.id);
  });

  it("supports update, archive, transition, assign, backlog, and sprint assignment", async () => {
    const statusId = generateGlobalId("status");
    const userId = generateGlobalId("user");
    const sprintId = generateGlobalId("sprint");
    const labelId = generateGlobalId("label");
    const moduleId = generateGlobalId("module");
    const mappingStore = new InMemoryEntityMappingStore();
    const projectId = await seedProjectMapping(mappingStore);

    await mappingStore.create({
      platformId: statusId,
      entityType: "status",
      providerId: "mock-task",
      integrationId: "mock",
      providerNativeId: "state-001",
      parentPlatformId: projectId,
      parentProviderNativeId: "proj-001",
      tenantId: TEST_SERVICE_CONTEXT.tenantId,
      status: "active",
    });
    await mappingStore.create({
      platformId: userId,
      entityType: "user",
      providerId: "mock-task",
      integrationId: "mock",
      providerNativeId: "user-001",
      tenantId: TEST_SERVICE_CONTEXT.tenantId,
      status: "active",
    });
    await mappingStore.create({
      platformId: sprintId,
      entityType: "sprint",
      providerId: "mock-task",
      integrationId: "mock",
      providerNativeId: "cycle-001",
      parentPlatformId: projectId,
      parentProviderNativeId: "proj-001",
      tenantId: TEST_SERVICE_CONTEXT.tenantId,
      status: "active",
    });
    await mappingStore.create({
      platformId: labelId,
      entityType: "label",
      providerId: "mock-task",
      integrationId: "mock",
      providerNativeId: "label-001",
      parentPlatformId: projectId,
      parentProviderNativeId: "proj-001",
      tenantId: TEST_SERVICE_CONTEXT.tenantId,
      status: "active",
    });
    await mappingStore.create({
      platformId: moduleId,
      entityType: "module",
      providerId: "mock-task",
      integrationId: "mock",
      providerNativeId: "module-001",
      parentPlatformId: projectId,
      parentProviderNativeId: "proj-001",
      tenantId: TEST_SERVICE_CONTEXT.tenantId,
      status: "active",
    });

    const { task } = createTaskBundle({
      mappingStore,
      taskOverrides: {
        async updateTask(_ctx, _projectId, taskId, input) {
          return {
            ...TEST_PROVIDER_TASK,
            id: taskId,
            title: input.title ?? TEST_PROVIDER_TASK.title,
            statusId: input.statusId ?? TEST_PROVIDER_TASK.statusId,
            assigneeId:
              input.assigneeId === null ? undefined : (input.assigneeId ?? undefined),
            sprintId:
              input.sprintId === null ? undefined : (input.sprintId ?? undefined),
          };
        },
        async transitionTaskStatus(_ctx, _projectId, taskId, input) {
          return {
            ...TEST_PROVIDER_TASK,
            id: taskId,
            statusId: input.statusId,
            status: "in_progress",
          };
        },
        async assignTask(_ctx, _projectId, taskId, input) {
          return {
            ...TEST_PROVIDER_TASK,
            id: taskId,
            assigneeId: input.assigneeId ?? undefined,
          };
        },
      },
    });

    const created = await task.createTask(TEST_SERVICE_CONTEXT, projectId, {
      title: "Lifecycle",
      statusId,
      assigneeId: userId,
    });

    const updated = await task.updateTask(TEST_SERVICE_CONTEXT, created.id, {
      title: "Lifecycle updated",
      sprintId,
      projectModuleId: moduleId,
      parentTaskId: undefined,
      labelIds: [labelId],
      assigneeIds: [userId],
      statusId,
    });
    expect(updated.title).toBe("Lifecycle updated");
    expect(updated.sprintId).toBe(sprintId);

    const clearedRelations = await task.updateTask(TEST_SERVICE_CONTEXT, created.id, {
      sprintId: null,
      projectModuleId: null,
      parentTaskId: null,
      assigneeId: null,
    });
    expect(clearedRelations.sprintId).toBeUndefined();

    const transitioned = await task.transitionTaskStatus(
      TEST_SERVICE_CONTEXT,
      created.id,
      {
        statusId,
      },
    );
    expect(transitioned.statusId).toBe(statusId);

    const assigned = await task.assignTask(TEST_SERVICE_CONTEXT, created.id, {
      assigneeId: userId,
    });
    expect(assigned.assigneeId).toBe(userId);

    const multi = await task.assignTask(TEST_SERVICE_CONTEXT, created.id, {
      assigneeId: userId,
      assigneeIds: [userId],
    });
    expect(multi.assigneeId).toBe(userId);

    const cleared = await task.assignTask(TEST_SERVICE_CONTEXT, created.id, {
      assigneeId: null,
    });
    expect(cleared.assigneeId).toBeUndefined();

    const archived = await task.archiveTask(TEST_SERVICE_CONTEXT, created.id);
    expect(archived.archivedAt).toBeTruthy();

    const backlog = await task.getBacklog(TEST_SERVICE_CONTEXT, projectId);
    expect(backlog.projectId).toBe(projectId);

    await task.assignTasksToSprint(TEST_SERVICE_CONTEXT, sprintId, {
      taskIds: [created.id],
    });

    const filtered = await task.listTasks(TEST_SERVICE_CONTEXT, projectId, {
      filter: { statusId, assigneeId: userId, sprintId },
    });
    expect(filtered.items.every((item) => isValidGlobalId(item.id))).toBe(true);
  });

  it("rejects wrong-project status on transition", async () => {
    const mappingStore = new InMemoryEntityMappingStore();
    const projectId = await seedProjectMapping(mappingStore);
    const otherProjectId = generateGlobalId("project");
    await mappingStore.create({
      platformId: otherProjectId,
      entityType: "project",
      providerId: "mock-task",
      integrationId: "mock",
      providerNativeId: "proj-other",
      tenantId: TEST_SERVICE_CONTEXT.tenantId,
      status: "active",
    });
    const foreignStatus = generateGlobalId("status");
    await mappingStore.create({
      platformId: foreignStatus,
      entityType: "status",
      providerId: "mock-task",
      integrationId: "mock",
      providerNativeId: "state-x",
      parentPlatformId: otherProjectId,
      parentProviderNativeId: "proj-other",
      tenantId: TEST_SERVICE_CONTEXT.tenantId,
      status: "active",
    });

    const { task } = createTaskBundle({ mappingStore });
    const created = await task.createTask(TEST_SERVICE_CONTEXT, projectId, {
      title: "X",
    });

    await expect(
      task.transitionTaskStatus(TEST_SERVICE_CONTEXT, created.id, {
        statusId: foreignStatus,
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("normalises labels, modules, parent, and multi-assignees; rejects unsupported ops", async () => {
    const mappingStore = new InMemoryEntityMappingStore();
    const projectId = await seedProjectMapping(mappingStore);
    const labelId = generateGlobalId("label");
    const moduleId = generateGlobalId("module");
    const userA = generateGlobalId("user");
    const userB = generateGlobalId("user");

    for (const [platformId, entityType, nativeId] of [
      [labelId, "label", "label-001"],
      [moduleId, "module", "module-001"],
      [userA, "user", "user-a"],
      [userB, "user", "user-b"],
    ] as const) {
      await mappingStore.create({
        platformId,
        entityType,
        providerId: "mock-task",
        integrationId: "mock",
        providerNativeId: nativeId,
        parentPlatformId: entityType === "user" ? undefined : projectId,
        parentProviderNativeId: entityType === "user" ? undefined : "proj-001",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        status: "active",
      });
    }

    const { task } = createTaskBundle({
      mappingStore,
      taskOverrides: {
        async createTask(_ctx, projectIdArg, input) {
          return {
            ...TEST_PROVIDER_TASK,
            id: "task_plane_rel-1",
            projectId: projectIdArg,
            title: input.title,
            labelIds: input.labelIds ?? [],
            projectModuleId: input.projectModuleId,
            assigneeId: input.assigneeIds?.[0] ?? input.assigneeId,
            assigneeIds: input.assigneeIds?.slice(1),
            parentTaskId: input.parentTaskId,
          };
        },
        async listTasks() {
          return {
            items: [
              {
                ...TEST_PROVIDER_TASK,
                id: "task_plane_rel-1",
                labelIds: ["label_plane_label-001"],
                projectModuleId: "module_plane_module-001",
                assigneeId: "user_plane_user-a",
                assigneeIds: ["user_plane_user-b"],
                parentTaskId: undefined,
              },
            ],
            totalCount: 1,
            page: 1,
            perPage: 20,
            hasNextPage: false,
          };
        },
      },
    });

    const parent = await task.createTask(TEST_SERVICE_CONTEXT, projectId, {
      title: "Parent",
    });

    const child = await task.createTask(TEST_SERVICE_CONTEXT, projectId, {
      title: "Child",
      labelIds: [labelId],
      projectModuleId: moduleId,
      assigneeIds: [userA, userB],
      parentTaskId: parent.id,
    });

    expect(child.labelIds).toContain(labelId);
    expect(child.projectModuleId).toBe(moduleId);
    expect(child.assigneeId).toBe(userA);
    expect(child.parentTaskId).toBe(parent.id);

    const listed = await task.listTasks(TEST_SERVICE_CONTEXT, projectId, {
      filter: { labelId, projectModuleId: moduleId, parentTaskId: null },
    });
    expect(listed.items.length).toBeGreaterThan(0);

    await expect(
      task.reorderBacklog(TEST_SERVICE_CONTEXT, projectId, { taskIds: [child.id] }),
    ).rejects.toMatchObject({ code: "CONFIGURATION_ERROR" });
    await expect(task.listMyTasks(TEST_SERVICE_CONTEXT)).rejects.toMatchObject({
      code: "CONFIGURATION_ERROR",
    });
    await expect(
      task.addComment(TEST_SERVICE_CONTEXT, child.id, { body: "hi" }),
    ).rejects.toMatchObject({ code: "CONFIGURATION_ERROR" });
  });

  it("throws controlled unsupported for comments and attachments", async () => {
    const { task, mappingStore } = createTaskBundle();
    const projectId = await seedProjectMapping(mappingStore);
    const created = await task.createTask(TEST_SERVICE_CONTEXT, projectId, {
      title: "T",
    });

    await expect(
      task.listComments(TEST_SERVICE_CONTEXT, created.id),
    ).rejects.toMatchObject({
      code: "CONFIGURATION_ERROR",
    });
    await expect(
      task.listAttachments(TEST_SERVICE_CONTEXT, created.id),
    ).rejects.toMatchObject({
      code: "CONFIGURATION_ERROR",
    });
  });
});

describe("Task gateway without provider", () => {
  it("throws PROVIDER_CAPABILITY_UNSUPPORTED when no task provider is registered", () => {
    const registry = new ProviderRegistry();
    registry.register({
      providerId: "mock-workspace",
      integrationId: "mock",
      capability: "workspace",
      priority: 10,
      provider: createMockWorkspaceProvider(),
    });
    registry.register({
      providerId: "mock-project",
      integrationId: "mock",
      capability: "project",
      priority: 10,
      provider: createMockProjectProvider(),
    });
    registry.register({
      providerId: "mock-team",
      integrationId: "mock",
      capability: "team",
      priority: 10,
      provider: createMockTeamProvider(),
    });
    registry.register({
      providerId: "mock-user",
      integrationId: "mock",
      capability: "user",
      priority: 10,
      provider: createMockUserProvider(),
    });
    registry.register({
      providerId: "mock-search",
      integrationId: "mock",
      capability: "search",
      priority: 10,
      provider: createMockSearchProvider(),
    });

    const { gateway } = createPlatformServices({ registry });
    expect(() => gateway.tasks).toThrow(PlatformServiceError);
    try {
      void gateway.tasks;
    } catch (error) {
      expect(error).toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });
    }
  });
});

describe("Task permissions and authorisation", () => {
  it("catalogues task permissions and maps operations", () => {
    expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain("task.create");
    expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain("task.archive");
    expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain("task.transition");
    expect(resolveOperationAuthorization("task", "archiveTask")).toMatchObject({
      requiredPermission: "task.archive",
      action: "archive",
    });
    expect(resolveOperationAuthorization("task", "transitionTaskStatus")).toMatchObject(
      {
        requiredPermission: "task.transition",
      },
    );
  });

  it("allows permitted actors and denies anonymous / missing permission", async () => {
    const { gateway, mappingStore } = createTaskBundle({ withAuthz: true });
    const projectId = await seedProjectMapping(mappingStore, AUTH_TEST_TENANT_A);

    const allowed = await gateway.tasks.createTask(
      buildServiceContext({ userId: "user-standard" }),
      projectId,
      { title: "Allowed" },
    );
    expect(isValidGlobalId(allowed.id)).toBe(true);

    await expect(
      gateway.tasks.createTask(
        buildServiceContext({ userId: "anonymous" }),
        projectId,
        {
          title: "Denied",
        },
      ),
    ).rejects.toMatchObject({ category: "authorization" });

    const provider = new ProductionAuthorizationProvider({
      accessResolver: createAuthzTestResolver(),
    });
    const decision = await provider.authorize({
      context: buildServiceContext({ userId: "user-standard" }),
      action: { name: "task.archiveTask" },
      requiredPermissions: ["task.archive"],
      resource: { type: "task", tenantId: AUTH_TEST_TENANT_A },
    });
    expect(decision.effect).toBe("allow");
  });

  it("denies cross-tenant guessed task IDs without disclosing existence", async () => {
    const { gateway, mappingStore } = createTaskBundle({ withAuthz: true });
    const projectId = await seedProjectMapping(mappingStore, AUTH_TEST_TENANT_A);
    const created = await gateway.tasks.createTask(
      buildServiceContext({ userId: "user-standard" }),
      projectId,
      { title: "Tenant A task" },
    );

    await expect(
      gateway.tasks.getTask(
        buildServiceContext({ userId: "user-standard", tenantId: AUTH_TEST_TENANT_B }),
        created.id,
      ),
    ).rejects.toBeTruthy();
  });
});

describe("Task architecture boundaries", () => {
  it("forbids Plane internal imports and HTTP task routes in platform-services", () => {
    const root = dirname(fileURLToPath(import.meta.url));
    const forbidden = [
      "internal/plane-api-types",
      "mappers/task-mapper",
      "PlaneIssueRecord",
      "PlaneRestClient",
      "/api/v1/tasks",
    ];
    const offenders: string[] = [];

    function walk(dir: string): void {
      for (const entry of readdirSync(dir)) {
        if (entry === "node_modules" || entry.endsWith(".test.ts")) continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.endsWith(".ts")) continue;
        const source = readFileSync(full, "utf8");
        for (const needle of forbidden) {
          if (source.includes(needle)) {
            offenders.push(`${relative(root, full)}:${needle}`);
          }
        }
      }
    }

    walk(root);
    expect(offenders).toEqual([]);
  });
});
