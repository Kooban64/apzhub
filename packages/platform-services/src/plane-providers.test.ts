import { describe, expect, it, vi } from "vitest";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import { createPlaneProjectProvider } from "./providers/plane/plane-project-provider";
import { createPlaneTeamProvider } from "./providers/plane/plane-team-provider";
import { createPlaneWorkspaceProvider } from "./providers/plane/plane-workspace-provider";
import {
  createPlaneSearchProvider,
  createPlaneUserProvider,
} from "./providers/plane/plane-user-search-providers";
import { TEST_SERVICE_CONTEXT } from "./testing/mock-providers";

function createMockPlaneCore() {
  return {
    workspaces: {
      list: vi.fn(async () => ({
        items: [
          {
            id: "ws_plane_abc",
            tenantId: TEST_SERVICE_CONTEXT.tenantId,
            name: "Plane Workspace",
            slug: "plane-workspace",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        totalCount: 1,
        page: 1,
        perPage: 20,
        hasNextPage: false,
      })),
      get: vi.fn(async () => ({
        id: "ws_plane_abc",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        name: "Plane Workspace",
        slug: "plane-workspace",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      })),
    },
    projects: {
      list: vi.fn(async () => ({ items: [], totalCount: 0, page: 1, perPage: 20, hasNextPage: false })),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
    },
    projectStates: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    labels: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    cycles: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
    },
    modules: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
    },
    members: {
      list: vi.fn(async () => ({
        items: [
          {
            id: "member_plane_1",
            projectId: "proj_plane_1",
            userId: "user_plane_u1",
            role: "member",
            joinedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        totalCount: 1,
        page: 1,
        perPage: 20,
        hasNextPage: false,
      })),
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
  };
}

describe("Plane workspace provider", () => {
  it("delegates list/get to Plane core and returns canonical models", async () => {
    const core = createMockPlaneCore();
    const provider = createPlaneWorkspaceProvider(core as never);

    const listed = await provider.listWorkspaces(TEST_SERVICE_CONTEXT);
    expect(listed.items[0]?.id).toBe("ws_plane_abc");
    expect(core.workspaces.list).toHaveBeenCalledOnce();

    const workspace = await provider.getWorkspace(TEST_SERVICE_CONTEXT, "ws_plane_abc");
    expect(workspace.name).toBe("Plane Workspace");
  });
});

describe("Plane project provider", () => {
  it("returns empty roadmap and activity scaffolds using canonical types", async () => {
    const core = createMockPlaneCore();
    const provider = createPlaneProjectProvider(core as never);

    const roadmap = await provider.getRoadmap(TEST_SERVICE_CONTEXT, "proj_plane_1");
    expect(roadmap.projectId).toBe("proj_plane_1");
    expect(roadmap.items).toEqual([]);

    const activity = await provider.listProjectActivity(TEST_SERVICE_CONTEXT, "proj_plane_1");
    expect(activity.items).toEqual([]);
  });

  it("throws for sprint-by-id without project::sprint native ref", async () => {
    const provider = createPlaneProjectProvider(createMockPlaneCore() as never);

    await expect(provider.getSprint(TEST_SERVICE_CONTEXT, "sprint_plane_1")).rejects.toBeInstanceOf(
      PlatformServiceError,
    );
  });

  it("delegates sprint get when given project::sprint native ref", async () => {
    const core = createMockPlaneCore();
    core.cycles.get = vi.fn(async () => ({
      id: "sprint_plane_s1",
      projectId: "proj_plane_1",
      name: "Sprint 1",
      status: "active" as const,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }));
    const provider = createPlaneProjectProvider(core as never);

    const sprint = await provider.getSprint(TEST_SERVICE_CONTEXT, "p1::s1");
    expect(sprint.name).toBe("Sprint 1");
    expect(core.cycles.get).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: TEST_SERVICE_CONTEXT.correlationId }),
      "p1",
      "s1",
    );
  });

  it("throws for unsupported milestone operations", async () => {
    const provider = createPlaneProjectProvider(createMockPlaneCore() as never);

    await expect(provider.listMilestones(TEST_SERVICE_CONTEXT, "proj_plane_1")).rejects.toBeInstanceOf(
      PlatformServiceError,
    );
  });
});

describe("Plane team provider", () => {
  it("delegates member listing and resolves removeTeamMember by userId", async () => {
    const core = createMockPlaneCore();
    const provider = createPlaneTeamProvider(core as never);

    const members = await provider.listTeam(TEST_SERVICE_CONTEXT, "proj_plane_1");
    expect(members.items[0]?.userId).toBe("user_plane_u1");

    await provider.removeTeamMember(TEST_SERVICE_CONTEXT, "proj_plane_1", "user_plane_u1");
    expect(core.members.remove).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: TEST_SERVICE_CONTEXT.correlationId }),
      "proj_plane_1",
      "member_plane_1",
    );
  });
});

describe("Plane user and search providers", () => {
  it("throws unsupported for Plane user directory operations", async () => {
    const provider = createPlaneUserProvider();

    await expect(provider.listUsers(TEST_SERVICE_CONTEXT)).rejects.toBeInstanceOf(PlatformServiceError);
  });

  it("returns empty canonical search results without Plane types", async () => {
    const provider = createPlaneSearchProvider();
    const result = await provider.search(TEST_SERVICE_CONTEXT, { text: "Alpha" });

    expect(result.status).toBe("empty");
    expect(result.documents).toEqual([]);
    expect(JSON.stringify(result)).not.toMatch(/plane/i);
  });
});
