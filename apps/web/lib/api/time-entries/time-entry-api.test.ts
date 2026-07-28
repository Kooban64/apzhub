import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GET as listTimeEntries,
  POST as createTimeEntry,
} from "../../../app/api/law/v1/time-entries/route";
import {
  GET as getTimeEntry,
  PATCH as patchTimeEntry,
  DELETE as deleteTimeEntry,
} from "../../../app/api/law/v1/time-entries/[timeEntryId]/route";
import { resetTimeEntryApiMetadataCache } from "@/lib/api/time-entries";
import {
  authHeaders,
  configureLawApiTestEnv,
  denyAllLawApiTestPermissions,
  enableDevPermissions,
  mockGetValidatedSession,
  mockIsDevRegistrationAllowed,
  mockSession,
  resolveSessionAuthorizationForLawApiTest,
  seedLawApiClientAndMatter,
} from "@/lib/api/testing/law-api-test-helpers";
import {
  resetSharedClientRepository,
  resetSharedMatterRepository,
  resetSharedTimeEntryRepository,
  resetLawPersistenceScope,
} from "@apzhub/law-platform/api";

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

vi.mock("@apzhub/platform-authorization/server", () => ({
  resolveSessionAuthorization: (input?: unknown) =>
    resolveSessionAuthorizationForLawApiTest(input),
}));

function timeEntryCreateBody(
  matterId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    matterId,
    entryDate: new Date().toISOString().slice(0, 10),
    durationMinutes: 60,
    narrative: "Research and drafting",
    billable: true,
    ...overrides,
  };
}

describe("Law Time Entry API", () => {
  beforeEach(() => {
    configureLawApiTestEnv();
    resetSharedTimeEntryRepository();
    resetSharedClientRepository();
    resetSharedMatterRepository();
    resetLawPersistenceScope();
    resetTimeEntryApiMetadataCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetValidatedSession.mockResolvedValue(null);

    const response = await listTimeEntries(
      new NextRequest("http://localhost/api/law/v1/time-entries", { method: "GET" }),
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 403 when permission is missing", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    denyAllLawApiTestPermissions();
    vi.stubEnv("NODE_ENV", "production");

    const response = await listTimeEntries(
      new NextRequest("http://localhost/api/law/v1/time-entries", {
        method: "GET",
        headers: authHeaders(),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("lists time entries with pagination envelope", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    await createTimeEntry(
      new NextRequest("http://localhost/api/law/v1/time-entries", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(timeEntryCreateBody(matterId)),
      }),
    );

    const response = await listTimeEntries(
      new NextRequest("http://localhost/api/law/v1/time-entries?limit=1", {
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

  it("filters time entries by query", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    await createTimeEntry(
      new NextRequest("http://localhost/api/law/v1/time-entries", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          timeEntryCreateBody(matterId, { narrative: "Unique Meridian research work" }),
        ),
      }),
    );

    const response = await listTimeEntries(
      new NextRequest("http://localhost/api/law/v1/time-entries?query=meridian", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const body = await response.json();

    expect(
      body.data.some((entry: { narrative: string }) =>
        entry.narrative.includes("Meridian"),
      ),
    ).toBe(true);
  });

  it("creates a time entry and returns 201 envelope", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    const response = await createTimeEntry(
      new NextRequest("http://localhost/api/law/v1/time-entries", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          timeEntryCreateBody(matterId, { narrative: "Chen client call" }),
        ),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.data.narrative).toBe("Chen client call");
    expect(body.data.timeEntryReference).toMatch(/^TIM-/);
  });

  it("returns validation error for invalid create body", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    const response = await createTimeEntry(
      new NextRequest("http://localhost/api/law/v1/time-entries", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(timeEntryCreateBody(matterId, { narrative: "" })),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_FAILED");
  });

  it("gets time entry by id", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    const created = await createTimeEntry(
      new NextRequest("http://localhost/api/law/v1/time-entries", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          timeEntryCreateBody(matterId, { narrative: "Get By Id Entry" }),
        ),
      }),
    );
    const createdBody = await created.json();

    const response = await getTimeEntry(
      new NextRequest(
        `http://localhost/api/law/v1/time-entries/${createdBody.data.timeEntryId}`,
        { method: "GET", headers: authHeaders() },
      ),
      { params: Promise.resolve({ timeEntryId: createdBody.data.timeEntryId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.timeEntryId).toBe(createdBody.data.timeEntryId);
  });

  it("returns 404 for unknown time entry", async () => {
    enableDevPermissions();

    const response = await getTimeEntry(
      new NextRequest("http://localhost/api/law/v1/time-entries/missing-entry-id", {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ timeEntryId: "missing-entry-id" }) },
    );

    expect(response.status).toBe(404);
  });

  it("updates a time entry via PATCH", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    const created = await createTimeEntry(
      new NextRequest("http://localhost/api/law/v1/time-entries", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          timeEntryCreateBody(matterId, { narrative: "Patch Target Entry" }),
        ),
      }),
    );
    const createdBody = await created.json();
    const timeEntryId = createdBody.data.timeEntryId;

    const response = await patchTimeEntry(
      new NextRequest(`http://localhost/api/law/v1/time-entries/${timeEntryId}`, {
        method: "PATCH",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ durationMinutes: 90 }),
      }),
      { params: Promise.resolve({ timeEntryId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.durationMinutes).toBe(90);
  });

  it("deletes a time entry", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    const created = await createTimeEntry(
      new NextRequest("http://localhost/api/law/v1/time-entries", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          timeEntryCreateBody(matterId, { narrative: "Delete Target Entry" }),
        ),
      }),
    );
    const createdBody = await created.json();
    const timeEntryId = createdBody.data.timeEntryId;

    const response = await deleteTimeEntry(
      new NextRequest(`http://localhost/api/law/v1/time-entries/${timeEntryId}`, {
        method: "DELETE",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ timeEntryId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe("deleted");

    const afterDelete = await getTimeEntry(
      new NextRequest(`http://localhost/api/law/v1/time-entries/${timeEntryId}`, {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ timeEntryId }) },
    );
    expect(afterDelete.status).toBe(404);
  });

  it("paginates with cursor", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    for (const narrative of ["Alpha Entry", "Beta Entry", "Gamma Entry"]) {
      await createTimeEntry(
        new NextRequest("http://localhost/api/law/v1/time-entries", {
          method: "POST",
          headers: authHeaders({ "content-type": "application/json" }),
          body: JSON.stringify(timeEntryCreateBody(matterId, { narrative })),
        }),
      );
    }

    const first = await listTimeEntries(
      new NextRequest(
        "http://localhost/api/law/v1/time-entries?limit=1&sort=narrative",
        {
          method: "GET",
          headers: authHeaders(),
        },
      ),
    );
    const firstBody = await first.json();
    expect(firstBody.pagination.hasMore).toBe(true);

    const second = await listTimeEntries(
      new NextRequest(
        `http://localhost/api/law/v1/time-entries?limit=1&sort=narrative&cursor=${firstBody.pagination.nextCursor}`,
        { method: "GET", headers: authHeaders() },
      ),
    );
    const secondBody = await second.json();

    expect(secondBody.data[0]?.timeEntryId).not.toBe(firstBody.data[0]?.timeEntryId);
  });

  it("retrieves a created time entry in the same tenant", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    const created = await createTimeEntry(
      new NextRequest("http://localhost/api/law/v1/time-entries", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          timeEntryCreateBody(matterId, { narrative: "Same Tenant Persistence Entry" }),
        ),
      }),
    );
    const createdBody = await created.json();
    const timeEntryId = createdBody.data.timeEntryId;

    const response = await getTimeEntry(
      new NextRequest(`http://localhost/api/law/v1/time-entries/${timeEntryId}`, {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ timeEntryId }) },
    );

    expect(response.status).toBe(200);
  });
});
