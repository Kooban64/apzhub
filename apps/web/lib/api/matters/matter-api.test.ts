import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GET as listMatters,
  POST as createMatter,
} from "../../../app/api/law/v1/matters/route";
import {
  GET as getMatter,
  PATCH as patchMatter,
  DELETE as deleteMatter,
} from "../../../app/api/law/v1/matters/[matterId]/route";
import { POST as createClient } from "../../../app/api/law/v1/clients/route";
import { resetMatterApiMetadataCache } from "@/lib/api/matters";
import { DEFAULT_LAW_TENANT_ID } from "@/lib/api";
import {
  resetSharedClientRepository,
  resetSharedMatterRepository,
  resetLawPersistenceScope,
} from "@apzhub/law-platform/api";

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

const TEST_LEAD_ATTORNEY_ID = "a1000001-0001-4000-8000-000000000001";

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "x-tenant-id": DEFAULT_LAW_TENANT_ID,
    ...extra,
  };
}

function matterPayload(clientId: string, overrides: Record<string, unknown> = {}) {
  return {
    title: "Employment Dispute",
    clientId,
    matterTypeId: "litigation",
    practiceAreaId: "litigation",
    leadAttorneyId: TEST_LEAD_ATTORNEY_ID,
    ...overrides,
  };
}

async function createTestClient(
  displayName = "Matter API Test Client",
): Promise<string> {
  const response = await createClient(
    new NextRequest("http://localhost/api/law/v1/clients", {
      method: "POST",
      headers: authHeaders({ "content-type": "application/json" }),
      body: JSON.stringify({
        displayName,
        clientType: "organisation",
        status: "active",
      }),
    }),
  );
  const body = await response.json();
  return body.data.clientId as string;
}

describe("Law Matter API", () => {
  beforeEach(() => {
    mockGetValidatedSession.mockReset();
    mockIsDevRegistrationAllowed.mockReturnValue(false);
    resetSharedClientRepository();
    resetSharedMatterRepository();
    resetLawPersistenceScope();
    resetMatterApiMetadataCache();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("LAW_REPOSITORY_MODE", "memory");
    process.env.LAW_API_ALLOW_DEV_TENANT_FALLBACK = "false";
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetValidatedSession.mockResolvedValue(null);

    const response = await listMatters(
      new NextRequest("http://localhost/api/law/v1/matters", { method: "GET" }),
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 403 when permission is missing", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    vi.stubEnv("NODE_ENV", "production");

    const response = await listMatters(
      new NextRequest("http://localhost/api/law/v1/matters", {
        method: "GET",
        headers: authHeaders(),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("lists matters with pagination envelope", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const clientId = await createTestClient("Harbourview Matter Client");

    await createMatter(
      new NextRequest("http://localhost/api/law/v1/matters", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          matterPayload(clientId, { title: "Harbourview Contract Review" }),
        ),
      }),
    );

    const response = await listMatters(
      new NextRequest("http://localhost/api/law/v1/matters?limit=1", {
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

  it("filters matters by query", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const clientId = await createTestClient("Meridian Matter Client");

    await createMatter(
      new NextRequest("http://localhost/api/law/v1/matters", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          matterPayload(clientId, { title: "Meridian Family Trust Dispute" }),
        ),
      }),
    );

    const response = await listMatters(
      new NextRequest("http://localhost/api/law/v1/matters?query=meridian", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const body = await response.json();

    expect(
      body.data.some((matter: { title: string }) => matter.title.includes("Meridian")),
    ).toBe(true);
  });

  it("creates a matter and returns 201 envelope", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const clientId = await createTestClient("Chen Employment Client Org");

    const response = await createMatter(
      new NextRequest("http://localhost/api/law/v1/matters", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          matterPayload(clientId, {
            title: "Chen Employment Matter",
            tags: ["employment"],
          }),
        ),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.data.title).toBe("Chen Employment Matter");
    expect(body.data.matterReference).toMatch(/^MAT-/);
  });

  it("returns validation error for invalid create body", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const clientId = await createTestClient("Invalid Matter Client");

    const response = await createMatter(
      new NextRequest("http://localhost/api/law/v1/matters", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          matterPayload(clientId, {
            title: "",
          }),
        ),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_FAILED");
  });

  it("gets matter by id", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const clientId = await createTestClient("Get By Id Client Org");

    const created = await createMatter(
      new NextRequest("http://localhost/api/law/v1/matters", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(matterPayload(clientId, { title: "Get By Id Matter" })),
      }),
    );
    const createdBody = await created.json();

    const response = await getMatter(
      new NextRequest(
        `http://localhost/api/law/v1/matters/${createdBody.data.matterId}`,
        {
          method: "GET",
          headers: authHeaders(),
        },
      ),
      { params: Promise.resolve({ matterId: createdBody.data.matterId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.matterId).toBe(createdBody.data.matterId);
  });

  it("returns 404 for unknown matter", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const response = await getMatter(
      new NextRequest("http://localhost/api/law/v1/matters/missing-matter-id", {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ matterId: "missing-matter-id" }) },
    );

    expect(response.status).toBe(404);
  });

  it("updates a matter via PATCH", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const clientId = await createTestClient("Patch Target Client Org");

    const created = await createMatter(
      new NextRequest("http://localhost/api/law/v1/matters", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(matterPayload(clientId, { title: "Patch Target Matter" })),
      }),
    );
    const createdBody = await created.json();
    const matterId = createdBody.data.matterId;

    const response = await patchMatter(
      new NextRequest(`http://localhost/api/law/v1/matters/${matterId}`, {
        method: "PATCH",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ priority: "high" }),
      }),
      { params: Promise.resolve({ matterId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.priority).toBe("high");
  });

  it("archives a matter", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const clientId = await createTestClient("Delete Target Client Org");

    const created = await createMatter(
      new NextRequest("http://localhost/api/law/v1/matters", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          matterPayload(clientId, { title: "Delete Target Matter" }),
        ),
      }),
    );
    const createdBody = await created.json();
    const matterId = createdBody.data.matterId;

    const response = await deleteMatter(
      new NextRequest(`http://localhost/api/law/v1/matters/${matterId}`, {
        method: "DELETE",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ matterId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe("archived");

    const afterDelete = await getMatter(
      new NextRequest(`http://localhost/api/law/v1/matters/${matterId}`, {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ matterId }) },
    );
    expect(afterDelete.status).toBe(404);
  });

  it("paginates with cursor", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const clientId = await createTestClient("Pagination Client Org");

    for (const title of ["Alpha Matter", "Beta Matter", "Gamma Matter"]) {
      await createMatter(
        new NextRequest("http://localhost/api/law/v1/matters", {
          method: "POST",
          headers: authHeaders({ "content-type": "application/json" }),
          body: JSON.stringify(matterPayload(clientId, { title })),
        }),
      );
    }

    const first = await listMatters(
      new NextRequest("http://localhost/api/law/v1/matters?limit=1&sort=title", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const firstBody = await first.json();
    expect(firstBody.pagination.hasMore).toBe(true);

    const second = await listMatters(
      new NextRequest(
        `http://localhost/api/law/v1/matters?limit=1&sort=title&cursor=${firstBody.pagination.nextCursor}`,
        { method: "GET", headers: authHeaders() },
      ),
    );
    const secondBody = await second.json();

    expect(secondBody.data[0]?.matterId).not.toBe(firstBody.data[0]?.matterId);
  });

  it("retrieves a created matter in the same tenant", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const clientId = await createTestClient("Same Tenant Persistence Client Org");

    const created = await createMatter(
      new NextRequest("http://localhost/api/law/v1/matters", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          matterPayload(clientId, { title: "Same Tenant Persistence Matter" }),
        ),
      }),
    );
    const createdBody = await created.json();
    const matterId = createdBody.data.matterId;

    const response = await getMatter(
      new NextRequest(`http://localhost/api/law/v1/matters/${matterId}`, {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ matterId }) },
    );

    expect(response.status).toBe(200);
  });
});
