import type {
  ProjectService,
  SearchService,
  ServiceRequestContext,
  Task,
  TeamService,
  UserService,
  Workspace,
  WorkspaceService,
} from "@apzhub/platform-service-contracts";

import type {
  ProjectProvider,
  SearchProvider,
  TaskProvider,
  TeamProvider,
  UserProvider,
  WorkspaceProvider,
} from "../providers/capability-providers";

export const TEST_CORRELATION_ID = "corr_test_platform_services";
export const TEST_TENANT_ID = "t0000001-0000-4000-8000-000000000001";
export const TEST_USER_ID = "user_test_001";

export const TEST_SERVICE_CONTEXT: ServiceRequestContext = {
  tenantId: TEST_TENANT_ID,
  userId: TEST_USER_ID,
  correlationId: TEST_CORRELATION_ID,
  permissions: ["projects.view", "projects.manage"],
  workspaceId: "ws_plane_test",
};

export const TEST_WORKSPACE: Workspace = {
  id: "ws_plane_test",
  tenantId: TEST_TENANT_ID,
  name: "Test Workspace",
  slug: "test-workspace",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export function createMockWorkspaceProvider(
  overrides: Partial<WorkspaceProvider> = {},
): WorkspaceProvider {
  return {
    async listWorkspaces() {
      return {
        items: [TEST_WORKSPACE],
        totalCount: 1,
        page: 1,
        perPage: 20,
        hasNextPage: false,
      };
    },
    async getWorkspace(_ctx, workspaceId) {
      return { ...TEST_WORKSPACE, id: workspaceId };
    },
    ...overrides,
  };
}

export function createMockProjectProvider(
  overrides: Partial<ProjectProvider> = {},
): ProjectProvider {
  const notImplemented = async () => {
    throw new Error("not implemented in mock");
  };

  return {
    listProjects: notImplemented,
    getProject: notImplemented,
    createProject: notImplemented,
    updateProject: notImplemented,
    archiveProject: notImplemented,
    listStatuses: notImplemented,
    getStatus: notImplemented,
    createStatus: notImplemented,
    updateStatus: notImplemented,
    deleteStatus: notImplemented,
    listLabels: notImplemented,
    createLabel: notImplemented,
    updateLabel: notImplemented,
    deleteLabel: notImplemented,
    listSprints: notImplemented,
    getSprint: notImplemented,
    createSprint: notImplemented,
    updateSprint: notImplemented,
    archiveSprint: notImplemented,
    startSprint: notImplemented,
    completeSprint: notImplemented,
    listModules: notImplemented,
    getModule: notImplemented,
    createModule: notImplemented,
    updateModule: notImplemented,
    archiveModule: notImplemented,
    listMilestones: notImplemented,
    createMilestone: notImplemented,
    updateMilestone: notImplemented,
    getRoadmap: notImplemented,
    listProjectActivity: notImplemented,
    ...overrides,
  };
}

export function createMockTeamProvider(overrides: Partial<TeamProvider> = {}): TeamProvider {
  return {
    listTeam: async () => ({
      items: [],
      totalCount: 0,
      page: 1,
      perPage: 20,
      hasNextPage: false,
    }),
    getTeamMember: async () => {
      throw new Error("not found");
    },
    addTeamMember: async () => {
      throw new Error("not implemented");
    },
    updateTeamMember: async () => {
      throw new Error("not implemented");
    },
    removeTeamMember: async () => undefined,
    ...overrides,
  };
}

export function createMockUserProvider(overrides: Partial<UserProvider> = {}): UserProvider {
  return {
    listUsers: async () => ({
      items: [],
      totalCount: 0,
      page: 1,
      perPage: 20,
      hasNextPage: false,
    }),
    getUser: async () => {
      throw new Error("not found");
    },
    getUserByEmail: async () => null,
    getUserProfile: async () => {
      throw new Error("not found");
    },
    createUser: async () => {
      throw new Error("not implemented");
    },
    updateUser: async () => {
      throw new Error("not implemented");
    },
    ...overrides,
  };
}

export function createMockSearchProvider(overrides: Partial<SearchProvider> = {}): SearchProvider {
  return {
    search: async () => ({
      status: "ok",
      documents: [],
    }),
    suggest: async () => [],
    ...overrides,
  };
}

export const TEST_PROVIDER_TASK: Task = {
  id: "task_plane_issue-001",
  projectId: "proj_plane_proj-001",
  title: "Provider task",
  status: "open",
  statusId: "status_plane_state-001",
  priority: "medium",
  labelIds: [],
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

export function createMockTaskProvider(overrides: Partial<TaskProvider> = {}): TaskProvider {
  return {
    listTasks: async () => ({
      items: [TEST_PROVIDER_TASK],
      totalCount: 1,
      page: 1,
      perPage: 20,
      hasNextPage: false,
    }),
    getTask: async (_ctx, _projectId, taskId) => ({ ...TEST_PROVIDER_TASK, id: taskId }),
    createTask: async (_ctx, projectId, input) => ({
      ...TEST_PROVIDER_TASK,
      id: `task_plane_${Date.now()}`,
      projectId,
      title: input.title,
    }),
    updateTask: async (_ctx, _projectId, taskId, input) => ({
      ...TEST_PROVIDER_TASK,
      id: taskId,
      title: input.title ?? TEST_PROVIDER_TASK.title,
      priority: input.priority ?? TEST_PROVIDER_TASK.priority,
    }),
    archiveTask: async (_ctx, _projectId, taskId) => ({
      ...TEST_PROVIDER_TASK,
      id: taskId,
      archivedAt: "2026-07-10T00:00:00.000Z",
    }),
    transitionTaskStatus: async (_ctx, _projectId, taskId, input) => ({
      ...TEST_PROVIDER_TASK,
      id: taskId,
      statusId: input.statusId,
      status: "in_progress",
    }),
    assignTask: async (_ctx, _projectId, taskId, input) => ({
      ...TEST_PROVIDER_TASK,
      id: taskId,
      assigneeId: input.assigneeId ?? undefined,
    }),
    ...overrides,
  };
}

export type {
  WorkspaceService,
  ProjectService,
  TeamService,
  UserService,
  SearchService,
};
