import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GET as listInvoices,
  POST as createInvoice,
} from "../../../app/api/law/v1/invoices/route";
import {
  GET as getInvoice,
  PATCH as patchInvoice,
  DELETE as cancelInvoice,
} from "../../../app/api/law/v1/invoices/[invoiceId]/route";
import { resetInvoiceApiMetadataCache } from "@/lib/api/invoices";
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
  seedLawApiTimeEntry,
} from "@/lib/api/testing/law-api-test-helpers";
import {
  resetSharedClientRepository,
  resetSharedInvoiceRepository,
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

function invoiceCreateBody(
  clientId: string,
  matterId: string,
  timeEntryId: string,
  overrides: Record<string, unknown> = {},
) {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date();
  due.setDate(due.getDate() + 30);

  return {
    clientId,
    matterId,
    issueDate: today,
    dueDate: due.toISOString().slice(0, 10),
    lineItems: [
      {
        description: "Professional fees",
        quantity: "1.0",
        unitPrice: { amount: "450.00", currency: "AUD" },
        matterId,
        timeEntryId,
      },
    ],
    ...overrides,
  };
}

describe("Law Invoice API", () => {
  beforeEach(() => {
    configureLawApiTestEnv();
    resetSharedInvoiceRepository();
    resetSharedTimeEntryRepository();
    resetSharedClientRepository();
    resetSharedMatterRepository();
    resetLawPersistenceScope();
    resetInvoiceApiMetadataCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetValidatedSession.mockResolvedValue(null);

    const response = await listInvoices(
      new NextRequest("http://localhost/api/law/v1/invoices", { method: "GET" }),
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

    const response = await listInvoices(
      new NextRequest("http://localhost/api/law/v1/invoices", {
        method: "GET",
        headers: authHeaders(),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("lists invoices with pagination envelope", async () => {
    enableDevPermissions();
    const { clientId, matterId } = seedLawApiClientAndMatter();
    const timeEntryId = seedLawApiTimeEntry(matterId);

    await createInvoice(
      new NextRequest("http://localhost/api/law/v1/invoices", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(invoiceCreateBody(clientId, matterId, timeEntryId)),
      }),
    );

    const response = await listInvoices(
      new NextRequest("http://localhost/api/law/v1/invoices?limit=1", {
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

  it("filters invoices by query", async () => {
    enableDevPermissions();
    const { clientId, matterId } = seedLawApiClientAndMatter();
    const timeEntryId = seedLawApiTimeEntry(matterId, "user-1");

    await createInvoice(
      new NextRequest("http://localhost/api/law/v1/invoices", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          invoiceCreateBody(clientId, matterId, timeEntryId, {
            lineItems: [
              {
                description: "Professional fees",
                quantity: "1.0",
                unitPrice: { amount: "450.00", currency: "AUD" },
                matterId,
                timeEntryId,
              },
            ],
          }),
        ),
      }),
    );

    const response = await listInvoices(
      new NextRequest("http://localhost/api/law/v1/invoices?query=INV-", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const body = await response.json();

    expect(body.data.length).toBeGreaterThan(0);
  });

  it("creates an invoice and returns 201 envelope", async () => {
    enableDevPermissions();
    const { clientId, matterId } = seedLawApiClientAndMatter();
    const timeEntryId = seedLawApiTimeEntry(matterId);

    const response = await createInvoice(
      new NextRequest("http://localhost/api/law/v1/invoices", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(invoiceCreateBody(clientId, matterId, timeEntryId)),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.data.clientId).toBe(clientId);
    expect(body.data.invoiceReference).toMatch(/^INV-/);
  });

  it("returns validation error for invalid create body", async () => {
    enableDevPermissions();
    const { clientId } = seedLawApiClientAndMatter();

    const response = await createInvoice(
      new NextRequest("http://localhost/api/law/v1/invoices", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          clientId,
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate: new Date().toISOString().slice(0, 10),
          lineItems: [],
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_FAILED");
  });

  it("gets invoice by id", async () => {
    enableDevPermissions();
    const { clientId, matterId } = seedLawApiClientAndMatter();
    const timeEntryId = seedLawApiTimeEntry(matterId);

    const created = await createInvoice(
      new NextRequest("http://localhost/api/law/v1/invoices", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(invoiceCreateBody(clientId, matterId, timeEntryId)),
      }),
    );
    const createdBody = await created.json();

    const response = await getInvoice(
      new NextRequest(
        `http://localhost/api/law/v1/invoices/${createdBody.data.invoiceId}`,
        {
          method: "GET",
          headers: authHeaders(),
        },
      ),
      { params: Promise.resolve({ invoiceId: createdBody.data.invoiceId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.invoiceId).toBe(createdBody.data.invoiceId);
  });

  it("returns 404 for unknown invoice", async () => {
    enableDevPermissions();

    const response = await getInvoice(
      new NextRequest("http://localhost/api/law/v1/invoices/missing-invoice-id", {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ invoiceId: "missing-invoice-id" }) },
    );

    expect(response.status).toBe(404);
  });

  it("updates an invoice via PATCH", async () => {
    enableDevPermissions();
    const { clientId, matterId } = seedLawApiClientAndMatter();
    const timeEntryId = seedLawApiTimeEntry(matterId);

    const created = await createInvoice(
      new NextRequest("http://localhost/api/law/v1/invoices", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(invoiceCreateBody(clientId, matterId, timeEntryId)),
      }),
    );
    const createdBody = await created.json();
    const invoiceId = createdBody.data.invoiceId;
    const newDueDate = "2099-12-31";

    const response = await patchInvoice(
      new NextRequest(`http://localhost/api/law/v1/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ dueDate: newDueDate }),
      }),
      { params: Promise.resolve({ invoiceId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.dueDate).toBe(newDueDate);
  });

  it("cancels an invoice", async () => {
    enableDevPermissions();
    const { clientId, matterId } = seedLawApiClientAndMatter();
    const timeEntryId = seedLawApiTimeEntry(matterId);

    const created = await createInvoice(
      new NextRequest("http://localhost/api/law/v1/invoices", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(invoiceCreateBody(clientId, matterId, timeEntryId)),
      }),
    );
    const createdBody = await created.json();
    const invoiceId = createdBody.data.invoiceId;

    const response = await cancelInvoice(
      new NextRequest(`http://localhost/api/law/v1/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ invoiceId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe("cancelled");
    expect(body.data.invoiceId).toBe(invoiceId);
  });

  it("paginates with cursor", async () => {
    enableDevPermissions();
    const { clientId, matterId } = seedLawApiClientAndMatter();

    for (let index = 0; index < 3; index += 1) {
      const timeEntryId = seedLawApiTimeEntry(matterId);
      await createInvoice(
        new NextRequest("http://localhost/api/law/v1/invoices", {
          method: "POST",
          headers: authHeaders({ "content-type": "application/json" }),
          body: JSON.stringify(invoiceCreateBody(clientId, matterId, timeEntryId)),
        }),
      );
    }

    const first = await listInvoices(
      new NextRequest("http://localhost/api/law/v1/invoices?limit=1&sort=issueDate", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const firstBody = await first.json();
    expect(firstBody.pagination.hasMore).toBe(true);

    const second = await listInvoices(
      new NextRequest(
        `http://localhost/api/law/v1/invoices?limit=1&sort=issueDate&cursor=${firstBody.pagination.nextCursor}`,
        { method: "GET", headers: authHeaders() },
      ),
    );
    const secondBody = await second.json();

    expect(secondBody.data[0]?.invoiceId).not.toBe(firstBody.data[0]?.invoiceId);
  });

  it("retrieves a created invoice in the same tenant", async () => {
    enableDevPermissions();
    const { clientId, matterId } = seedLawApiClientAndMatter();
    const timeEntryId = seedLawApiTimeEntry(matterId);

    const created = await createInvoice(
      new NextRequest("http://localhost/api/law/v1/invoices", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(invoiceCreateBody(clientId, matterId, timeEntryId)),
      }),
    );
    const createdBody = await created.json();
    const invoiceId = createdBody.data.invoiceId;

    const response = await getInvoice(
      new NextRequest(`http://localhost/api/law/v1/invoices/${invoiceId}`, {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ invoiceId }) },
    );

    expect(response.status).toBe(200);
  });
});
