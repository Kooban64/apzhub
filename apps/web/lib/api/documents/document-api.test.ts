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
  resetSharedDocumentRepository,
  resetSharedMatterRepository,
  resetLawPersistenceScope,
} from "@apzhub/law-platform/api";

import {
  GET as listDocuments,
  POST as createDocument,
} from "../../../app/api/law/v1/documents/route";
import {
  GET as getDocument,
  PATCH as patchDocument,
  DELETE as deleteDocument,
} from "../../../app/api/law/v1/documents/[documentId]/route";
import { resetDocumentApiMetadataCache } from "@/lib/api/documents";
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
    displayName: "Document API Test Client",
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
    title: "Document API Test Matter",
    clientId,
    leadAttorneyId: "user-1",
  });

  return { clientId, matterId: matterResult.matter!.matterId };
}

function validDocumentBody(matterId: string, overrides: Record<string, unknown> = {}) {
  return {
    title: "Engagement Letter",
    documentType: "contract",
    matterId,
    fileName: "engagement-letter.pdf",
    mimeType: "application/pdf",
    sizeBytes: 2048,
    ...overrides,
  };
}

describe("Law Document API", () => {
  let matterId = "";

  beforeEach(() => {
    mockGetValidatedSession.mockReset();
    mockIsDevRegistrationAllowed.mockReturnValue(false);
    resetSharedClientRepository();
    resetSharedMatterRepository();
    resetSharedDocumentRepository();
    resetLawPersistenceScope();
    resetDocumentApiMetadataCache();
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

    const response = await listDocuments(
      new NextRequest("http://localhost/api/law/v1/documents", { method: "GET" }),
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 403 when permission is missing", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    vi.stubEnv("NODE_ENV", "production");

    const response = await listDocuments(
      new NextRequest("http://localhost/api/law/v1/documents", {
        method: "GET",
        headers: authHeaders(),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("lists documents with pagination envelope", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    await createDocument(
      new NextRequest("http://localhost/api/law/v1/documents", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(validDocumentBody(matterId)),
      }),
    );

    const response = await listDocuments(
      new NextRequest("http://localhost/api/law/v1/documents?limit=1", {
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

  it("filters documents by query", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    await createDocument(
      new NextRequest("http://localhost/api/law/v1/documents", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          validDocumentBody(matterId, { title: "Meridian Settlement Deed" }),
        ),
      }),
    );

    const response = await listDocuments(
      new NextRequest("http://localhost/api/law/v1/documents?query=meridian", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const body = await response.json();

    expect(
      body.data.some((document: { title: string }) =>
        document.title.includes("Meridian"),
      ),
    ).toBe(true);
  });

  it("creates a document and returns 201 envelope", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const response = await createDocument(
      new NextRequest("http://localhost/api/law/v1/documents", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          validDocumentBody(matterId, { title: "Witness Statement" }),
        ),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.data.title).toBe("Witness Statement");
    expect(body.data.documentReference).toMatch(/^DOC-/);
  });

  it("returns validation error for invalid create body", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const response = await createDocument(
      new NextRequest("http://localhost/api/law/v1/documents", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(validDocumentBody(matterId, { title: "" })),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_FAILED");
  });

  it("gets document by id", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const created = await createDocument(
      new NextRequest("http://localhost/api/law/v1/documents", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          validDocumentBody(matterId, { title: "Get By Id Document" }),
        ),
      }),
    );
    const createdBody = await created.json();

    const response = await getDocument(
      new NextRequest(
        `http://localhost/api/law/v1/documents/${createdBody.data.documentId}`,
        { method: "GET", headers: authHeaders() },
      ),
      { params: Promise.resolve({ documentId: createdBody.data.documentId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.documentId).toBe(createdBody.data.documentId);
  });

  it("returns 404 for unknown document", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const response = await getDocument(
      new NextRequest("http://localhost/api/law/v1/documents/missing-document-id", {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ documentId: "missing-document-id" }) },
    );

    expect(response.status).toBe(404);
  });

  it("updates a document via PATCH", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const created = await createDocument(
      new NextRequest("http://localhost/api/law/v1/documents", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          validDocumentBody(matterId, { title: "Patch Target Document" }),
        ),
      }),
    );
    const createdBody = await created.json();
    const documentId = createdBody.data.documentId;

    const response = await patchDocument(
      new NextRequest(`http://localhost/api/law/v1/documents/${documentId}`, {
        method: "PATCH",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ documentStatus: "approved" }),
      }),
      { params: Promise.resolve({ documentId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.documentStatus).toBe("approved");
  });

  it("archives a document", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const created = await createDocument(
      new NextRequest("http://localhost/api/law/v1/documents", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          validDocumentBody(matterId, { title: "Archive Target Document" }),
        ),
      }),
    );
    const createdBody = await created.json();
    const documentId = createdBody.data.documentId;

    const response = await deleteDocument(
      new NextRequest(`http://localhost/api/law/v1/documents/${documentId}`, {
        method: "DELETE",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ documentId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe("archived");

    const afterArchive = await getDocument(
      new NextRequest(`http://localhost/api/law/v1/documents/${documentId}`, {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ documentId }) },
    );
    expect(afterArchive.status).toBe(404);
  });

  it("paginates with cursor", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    for (const title of ["Alpha Document", "Beta Document", "Gamma Document"]) {
      await createDocument(
        new NextRequest("http://localhost/api/law/v1/documents", {
          method: "POST",
          headers: authHeaders({ "content-type": "application/json" }),
          body: JSON.stringify(validDocumentBody(matterId, { title })),
        }),
      );
    }

    const first = await listDocuments(
      new NextRequest("http://localhost/api/law/v1/documents?limit=1&sort=title", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const firstBody = await first.json();
    expect(firstBody.pagination.hasMore).toBe(true);

    const second = await listDocuments(
      new NextRequest(
        `http://localhost/api/law/v1/documents?limit=1&sort=title&cursor=${firstBody.pagination.nextCursor}`,
        { method: "GET", headers: authHeaders() },
      ),
    );
    const secondBody = await second.json();

    expect(secondBody.data[0]?.documentId).not.toBe(firstBody.data[0]?.documentId);
  });

  it("retrieves a created document in the same tenant", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const created = await createDocument(
      new NextRequest("http://localhost/api/law/v1/documents", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          validDocumentBody(matterId, { title: "Same Tenant Document" }),
        ),
      }),
    );
    const createdBody = await created.json();
    const documentId = createdBody.data.documentId;

    const response = await getDocument(
      new NextRequest(`http://localhost/api/law/v1/documents/${documentId}`, {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ documentId }) },
    );

    expect(response.status).toBe(200);
  });
});
