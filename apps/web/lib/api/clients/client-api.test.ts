import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GET as listClients,
  POST as createClient,
} from "../../../app/api/law/v1/clients/route";
import {
  GET as getClient,
  PATCH as patchClient,
  DELETE as deleteClient,
} from "../../../app/api/law/v1/clients/[clientId]/route";
import { resetClientApiMetadataCache } from "@/lib/api/clients";
import { DEFAULT_LAW_TENANT_ID } from "@/lib/api";
import {
  resetSharedClientRepository,
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

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "x-tenant-id": DEFAULT_LAW_TENANT_ID,
    ...extra,
  };
}

describe("Law Client API", () => {
  beforeEach(() => {
    mockGetValidatedSession.mockReset();
    mockIsDevRegistrationAllowed.mockReturnValue(false);
    resetSharedClientRepository();
    resetLawPersistenceScope();
    resetClientApiMetadataCache();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("LAW_REPOSITORY_MODE", "memory");
    process.env.LAW_API_ALLOW_DEV_TENANT_FALLBACK = "false";
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetValidatedSession.mockResolvedValue(null);

    const response = await listClients(
      new NextRequest("http://localhost/api/law/v1/clients", { method: "GET" }),
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 403 when permission is missing", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    vi.stubEnv("NODE_ENV", "production");

    const response = await listClients(
      new NextRequest("http://localhost/api/law/v1/clients", {
        method: "GET",
        headers: authHeaders(),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("lists clients with pagination envelope", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    await createClient(
      new NextRequest("http://localhost/api/law/v1/clients", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          displayName: "Harbourview Holdings Pty Ltd",
          clientType: "organisation",
          status: "active",
        }),
      }),
    );

    const response = await listClients(
      new NextRequest("http://localhost/api/law/v1/clients?limit=1", {
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

  it("filters clients by query", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    await createClient(
      new NextRequest("http://localhost/api/law/v1/clients", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          displayName: "Meridian Family Trust",
          clientType: "organisation",
          status: "prospect",
        }),
      }),
    );

    const response = await listClients(
      new NextRequest("http://localhost/api/law/v1/clients?query=meridian", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const body = await response.json();

    expect(
      body.data.some((client: { displayName: string }) =>
        client.displayName.includes("Meridian"),
      ),
    ).toBe(true);
  });

  it("creates a client and returns 201 envelope", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const response = await createClient(
      new NextRequest("http://localhost/api/law/v1/clients", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          displayName: "Chen Employment Client",
          clientType: "individual",
          status: "active",
          tags: ["employment"],
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.data.displayName).toBe("Chen Employment Client");
    expect(body.data.clientReference).toMatch(/^CLT-/);
  });

  it("returns validation error for invalid create body", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const response = await createClient(
      new NextRequest("http://localhost/api/law/v1/clients", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          displayName: "",
          clientType: "individual",
          status: "active",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_FAILED");
  });

  it("gets client by id", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const created = await createClient(
      new NextRequest("http://localhost/api/law/v1/clients", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          displayName: "Get By Id Client",
          clientType: "organisation",
          status: "active",
        }),
      }),
    );
    const createdBody = await created.json();

    const response = await getClient(
      new NextRequest(
        `http://localhost/api/law/v1/clients/${createdBody.data.clientId}`,
        {
          method: "GET",
          headers: authHeaders(),
        },
      ),
      { params: Promise.resolve({ clientId: createdBody.data.clientId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.clientId).toBe(createdBody.data.clientId);
  });

  it("returns 404 for unknown client", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const response = await getClient(
      new NextRequest("http://localhost/api/law/v1/clients/missing-client-id", {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ clientId: "missing-client-id" }) },
    );

    expect(response.status).toBe(404);
  });

  it("updates a client via PATCH", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const created = await createClient(
      new NextRequest("http://localhost/api/law/v1/clients", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          displayName: "Patch Target Client",
          clientType: "organisation",
          status: "prospect",
        }),
      }),
    );
    const createdBody = await created.json();
    const clientId = createdBody.data.clientId;

    const response = await patchClient(
      new NextRequest(`http://localhost/api/law/v1/clients/${clientId}`, {
        method: "PATCH",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ status: "active" }),
      }),
      { params: Promise.resolve({ clientId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe("active");
  });

  it("soft deletes a client", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const created = await createClient(
      new NextRequest("http://localhost/api/law/v1/clients", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          displayName: "Delete Target Client",
          clientType: "organisation",
          status: "active",
        }),
      }),
    );
    const createdBody = await created.json();
    const clientId = createdBody.data.clientId;

    const response = await deleteClient(
      new NextRequest(`http://localhost/api/law/v1/clients/${clientId}`, {
        method: "DELETE",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ clientId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe("archived");

    const afterDelete = await getClient(
      new NextRequest(`http://localhost/api/law/v1/clients/${clientId}`, {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ clientId }) },
    );
    expect(afterDelete.status).toBe(404);
  });

  it("paginates with cursor", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    for (const name of ["Alpha Legal", "Beta Legal", "Gamma Legal"]) {
      await createClient(
        new NextRequest("http://localhost/api/law/v1/clients", {
          method: "POST",
          headers: authHeaders({ "content-type": "application/json" }),
          body: JSON.stringify({
            displayName: name,
            clientType: "organisation",
            status: "active",
          }),
        }),
      );
    }

    const first = await listClients(
      new NextRequest("http://localhost/api/law/v1/clients?limit=1&sort=displayName", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const firstBody = await first.json();
    expect(firstBody.pagination.hasMore).toBe(true);

    const second = await listClients(
      new NextRequest(
        `http://localhost/api/law/v1/clients?limit=1&sort=displayName&cursor=${firstBody.pagination.nextCursor}`,
        { method: "GET", headers: authHeaders() },
      ),
    );
    const secondBody = await second.json();

    expect(secondBody.data[0]?.clientId).not.toBe(firstBody.data[0]?.clientId);
  });

  it("retrieves a created client in the same tenant", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const created = await createClient(
      new NextRequest("http://localhost/api/law/v1/clients", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          displayName: "Same Tenant Persistence Client",
          clientType: "organisation",
          status: "active",
        }),
      }),
    );
    const createdBody = await created.json();
    const clientId = createdBody.data.clientId;

    const response = await getClient(
      new NextRequest(`http://localhost/api/law/v1/clients/${clientId}`, {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ clientId }) },
    );

    expect(response.status).toBe(200);
  });
});
