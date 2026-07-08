import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createPlaceholderEventBus } from "@apzhub/event-notification-framework";
import {
  ClientWorkflowService,
  MatterWorkflowService,
  createEmptyClientFormValues,
  createEmptyMatterFormValues,
  getSharedClientRepository,
  getSharedMatterRepository,
  resetSharedClientRepository,
  resetSharedMatterRepository,
  resetSharedTaskRepository,
  resetLawPersistenceScope,
} from "@apzhub/law-platform/api";

import {
  GET as listTasks,
  POST as createTask,
} from "../../../app/api/law/v1/tasks/route";
import {
  GET as getTask,
  PATCH as patchTask,
  DELETE as deleteTask,
} from "../../../app/api/law/v1/tasks/[taskId]/route";
import { resetTaskApiMetadataCache } from "@/lib/api/tasks";
import { DEFAULT_LAW_TENANT_ID } from "@/lib/api";

const mockGetValidatedSession = vi.fn();
const mockIsDevRegistrationAllowed = vi.fn(() => false);

vi.mock("@apzhub/auth/server", () => ({
  getValidatedSession: (...args: unknown[]) => mockGetValidatedSession(...args),
}));

vi.mock("@apzhub/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@apzhub/config")>();
  return {
    ...actual,
    isDevRegistrationAllowed: () => mockIsDevRegistrationAllowed(),
  };
});

const mockSession = {
  session: { id: "sess-1", expiresAt: new Date(Date.now() + 60_000).toISOString() },
  user: {
    id: "user-1",
    email: "counsel@example.com",
    name: "Alex Morgan",
    emailVerified: true,
  },
};

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "x-tenant-id": DEFAULT_LAW_TENANT_ID,
    ...extra,
  };
}

function createClientAndMatter(): { clientId: string; matterId: string } {
  const eventBus = createPlaceholderEventBus();
  const clientService = new ClientWorkflowService({
    repository: getSharedClientRepository(),
    eventBus,
    actorId: "user-1",
  });
  const clientResult = clientService.createClient({
    ...createEmptyClientFormValues(),
    displayName: "Task API Test Client",
    clientType: "organisation",
    status: "active",
  });
  const clientId = clientResult.client!.clientId;

  const matterService = new MatterWorkflowService({
    repository: getSharedMatterRepository(),
    eventBus,
    actorId: "user-1",
  });
  const matterResult = matterService.createMatter({
    ...createEmptyMatterFormValues(),
    title: "Task API Test Matter",
    clientId,
    leadAttorneyId: "user-1",
  });

  return { clientId, matterId: matterResult.matter!.matterId };
}

function validTaskBody(matterId: string, overrides: Record<string, unknown> = {}) {
  return {
    title: "Review discovery documents",
    assigneeUserId: "user-1",
    matterId,
    ...overrides,
  };
}

describe("Law Task API", () => {
  let matterId = "";

  beforeEach(() => {
    mockGetValidatedSession.mockReset();
    mockIsDevRegistrationAllowed.mockReturnValue(false);
    resetSharedClientRepository();
    resetSharedMatterRepository();
    resetSharedTaskRepository();
    resetLawPersistenceScope();
    resetTaskApiMetadataCache();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("LAW_REPOSITORY_MODE", "memory");
    process.env.LAW_API_ALLOW_DEV_TENANT_FALLBACK = "false";

    matterId = createClientAndMatter().matterId;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetValidatedSession.mockResolvedValue(null);

    const response = await listTasks(
      new NextRequest("http://localhost/api/law/v1/tasks", { method: "GET" }),
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 403 when permission is missing", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    vi.stubEnv("NODE_ENV", "production");

    const response = await listTasks(
      new NextRequest("http://localhost/api/law/v1/tasks", {
        method: "GET",
        headers: authHeaders(),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("lists tasks with pagination envelope", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    await createTask(
      new NextRequest("http://localhost/api/law/v1/tasks", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(validTaskBody(matterId)),
      }),
    );

    const response = await listTasks(
      new NextRequest("http://localhost/api/law/v1/tasks?limit=1", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.pagination.limit).toBe(1);
    expect(body.meta.requestId).toBeTruthy();
  });

  it("filters tasks by query", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    await createTask(
      new NextRequest("http://localhost/api/law/v1/tasks", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          validTaskBody(matterId, { title: "Meridian Due Diligence Task" }),
        ),
      }),
    );

    const response = await listTasks(
      new NextRequest("http://localhost/api/law/v1/tasks?query=meridian", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const body = await response.json();

    expect(
      body.data.some((task: { title: string }) => task.title.includes("Meridian")),
    ).toBe(true);
  });

  it("creates a task and returns 201 envelope", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const response = await createTask(
      new NextRequest("http://localhost/api/law/v1/tasks", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          validTaskBody(matterId, { title: "Prepare witness statement" }),
        ),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.data.title).toBe("Prepare witness statement");
    expect(body.data.taskReference).toMatch(/^TSK-/);
  });

  it("returns validation error for invalid create body", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const response = await createTask(
      new NextRequest("http://localhost/api/law/v1/tasks", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(validTaskBody(matterId, { title: "" })),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_FAILED");
  });

  it("gets task by id", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const created = await createTask(
      new NextRequest("http://localhost/api/law/v1/tasks", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(validTaskBody(matterId, { title: "Get By Id Task" })),
      }),
    );
    const createdBody = await created.json();

    const response = await getTask(
      new NextRequest(`http://localhost/api/law/v1/tasks/${createdBody.data.taskId}`, {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ taskId: createdBody.data.taskId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.taskId).toBe(createdBody.data.taskId);
  });

  it("returns 404 for unknown task", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const response = await getTask(
      new NextRequest("http://localhost/api/law/v1/tasks/missing-task-id", {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ taskId: "missing-task-id" }) },
    );

    expect(response.status).toBe(404);
  });

  it("updates a task via PATCH", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const created = await createTask(
      new NextRequest("http://localhost/api/law/v1/tasks", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(validTaskBody(matterId, { title: "Patch Target Task" })),
      }),
    );
    const createdBody = await created.json();
    const taskId = createdBody.data.taskId;

    const response = await patchTask(
      new NextRequest(`http://localhost/api/law/v1/tasks/${taskId}`, {
        method: "PATCH",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ taskStatus: "in_progress" }),
      }),
      { params: Promise.resolve({ taskId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.taskStatus).toBe("in_progress");
  });

  it("archives a task", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const created = await createTask(
      new NextRequest("http://localhost/api/law/v1/tasks", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(validTaskBody(matterId, { title: "Archive Target Task" })),
      }),
    );
    const createdBody = await created.json();
    const taskId = createdBody.data.taskId;

    const response = await deleteTask(
      new NextRequest(`http://localhost/api/law/v1/tasks/${taskId}`, {
        method: "DELETE",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ taskId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe("archived");

    const afterArchive = await getTask(
      new NextRequest(`http://localhost/api/law/v1/tasks/${taskId}`, {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ taskId }) },
    );
    expect(afterArchive.status).toBe(404);
  });

  it("paginates with cursor", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    for (const title of ["Alpha Task", "Beta Task", "Gamma Task"]) {
      await createTask(
        new NextRequest("http://localhost/api/law/v1/tasks", {
          method: "POST",
          headers: authHeaders({ "content-type": "application/json" }),
          body: JSON.stringify(validTaskBody(matterId, { title })),
        }),
      );
    }

    const first = await listTasks(
      new NextRequest("http://localhost/api/law/v1/tasks?limit=1&sort=title", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const firstBody = await first.json();
    expect(firstBody.pagination.hasMore).toBe(true);

    const second = await listTasks(
      new NextRequest(
        `http://localhost/api/law/v1/tasks?limit=1&sort=title&cursor=${firstBody.pagination.nextCursor}`,
        { method: "GET", headers: authHeaders() },
      ),
    );
    const secondBody = await second.json();

    expect(secondBody.data[0]?.taskId).not.toBe(firstBody.data[0]?.taskId);
  });

  it("retrieves a created task in the same tenant", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const created = await createTask(
      new NextRequest("http://localhost/api/law/v1/tasks", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(validTaskBody(matterId, { title: "Same Tenant Task" })),
      }),
    );
    const createdBody = await created.json();
    const taskId = createdBody.data.taskId;

    const response = await getTask(
      new NextRequest(`http://localhost/api/law/v1/tasks/${taskId}`, {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ taskId }) },
    );

    expect(response.status).toBe(200);
  });
});
