import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GET as listTrustAccounts,
  POST as createTrustAccount,
} from "../../../app/api/law/v1/trust/accounts/route";
import { GET as getTrustAccount } from "../../../app/api/law/v1/trust/accounts/[trustAccountId]/route";
import { GET as trustDiagnostics } from "../../../app/api/law/v1/trust/diagnostics/route";
import {
  GET as listTrustTransactions,
  POST as createTrustTransactionDraft,
} from "../../../app/api/law/v1/trust/transactions/route";
import { POST as postTrustTransactionDraft } from "../../../app/api/law/v1/trust/transactions/[trustTransactionId]/post/route";
import { GET as listTrustAllocations } from "../../../app/api/law/v1/trust/allocations/route";
import { POST as runTrustReconciliation } from "../../../app/api/law/v1/trust/reconciliation/route";
import {
  GET as listTrustReports,
  POST as generateTrustReport,
} from "../../../app/api/law/v1/trust/reports/route";
import { GET as exportTrustReport } from "../../../app/api/law/v1/trust/reports/[reportId]/export/route";
import { GET as listTrustApprovals } from "../../../app/api/law/v1/trust/approvals/route";
import { resetTrustApiRepositories } from "@/lib/api/trust";
import { DEFAULT_LAW_TENANT_ID } from "@/lib/api";
import { resetLawPersistenceScope } from "@apzhub/law-platform/api";

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

vi.mock("@apzhub/platform-authorization/server", () => ({
  resolveSessionAuthorization: vi.fn(async () => ({ roles: [], permissions: [] })),
}));

const mockSession = {
  session: { id: "sess-1", expiresAt: new Date(Date.now() + 60_000).toISOString() },
  user: {
    id: "user-1",
    email: "trust@example.com",
    name: "Trust Officer",
    emailVerified: true,
  },
};

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "x-tenant-id": DEFAULT_LAW_TENANT_ID,
    ...extra,
  };
}

describe("Law Trust API", () => {
  beforeEach(() => {
    mockGetValidatedSession.mockReset();
    mockIsDevRegistrationAllowed.mockReturnValue(false);
    resetTrustApiRepositories();
    resetLawPersistenceScope();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("LAW_REPOSITORY_MODE", "memory");
    process.env.LAW_DEV_PERMISSIONS = "true";
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete process.env.LAW_DEV_PERMISSIONS;
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetValidatedSession.mockResolvedValue(null);
    const response = await listTrustAccounts(
      new NextRequest("http://localhost/api/law/v1/trust/accounts", {
        headers: authHeaders(),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("lists trust accounts in memory mode", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    const response = await listTrustAccounts(
      new NextRequest("http://localhost/api/law/v1/trust/accounts", {
        headers: authHeaders(),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("creates and retrieves a trust account", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);

    const createResponse = await createTrustAccount(
      new NextRequest("http://localhost/api/law/v1/trust/accounts", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({
          name: "Client Trust",
          currency: "ZAR",
          institutionName: "FNB",
          accountNumberMasked: "****4321",
        }),
      }),
    );
    expect(createResponse.status).toBe(201);
    const created = await createResponse.json();
    expect(created.data.trustAccountId).toBeDefined();

    const getResponse = await getTrustAccount(
      new NextRequest(
        `http://localhost/api/law/v1/trust/accounts/${created.data.trustAccountId}`,
        {
          headers: authHeaders(),
        },
      ),
      { params: Promise.resolve({ trustAccountId: created.data.trustAccountId }) },
    );
    expect(getResponse.status).toBe(200);
    const detail = await getResponse.json();
    expect(detail.data.name).toBe("Client Trust");
  });

  it("returns trust diagnostics snapshot", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    const response = await trustDiagnostics(
      new NextRequest("http://localhost/api/law/v1/trust/diagnostics", {
        headers: authHeaders(),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.repositoryMode).toBe("memory");
    expect(body.data.accountCount).toBeGreaterThanOrEqual(0);
  });

  it("returns 403 when permission is missing", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    vi.stubEnv("NODE_ENV", "production");

    const response = await listTrustAccounts(
      new NextRequest("http://localhost/api/law/v1/trust/accounts", {
        headers: authHeaders(),
      }),
    );
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it("creates, posts a transaction draft, and lists transactions", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);

    const createAccountResponse = await createTrustAccount(
      new NextRequest("http://localhost/api/law/v1/trust/accounts", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({ name: "Txn Account", currency: "ZAR" }),
      }),
    );
    const accountBody = await createAccountResponse.json();
    const trustAccountId = accountBody.data.trustAccountId as string;

    const draftResponse = await createTrustTransactionDraft(
      new NextRequest("http://localhost/api/law/v1/trust/transactions", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({
          trustAccountId,
          trustTransactionType: "deposit",
          amount: 500,
          currency: "ZAR",
          transactionDate: "2026-07-07",
          postingDate: "2026-07-07",
          clientId: "c1000001-0001-4000-8000-000000000001",
          narrative: "API deposit",
        }),
      }),
    );
    expect(draftResponse.status).toBe(201);
    const draftBody = await draftResponse.json();
    const draftId = draftBody.data.draftId as string;

    const postResponse = await postTrustTransactionDraft(
      new NextRequest(
        `http://localhost/api/law/v1/trust/transactions/${draftId}/post`,
        {
          method: "POST",
          headers: authHeaders(),
        },
      ),
      { params: Promise.resolve({ trustTransactionId: draftId }) },
    );
    expect(postResponse.status).toBe(200);

    const listResponse = await listTrustTransactions(
      new NextRequest(
        `http://localhost/api/law/v1/trust/transactions?trustAccountId=${trustAccountId}`,
        { headers: authHeaders() },
      ),
    );
    expect(listResponse.status).toBe(200);
    const listBody = await listResponse.json();
    expect(listBody.data.length).toBeGreaterThanOrEqual(1);
  });

  it("lists allocations and runs reconciliation for an account", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);

    const createAccountResponse = await createTrustAccount(
      new NextRequest("http://localhost/api/law/v1/trust/accounts", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({ name: "Recon Account", currency: "ZAR" }),
      }),
    );
    const trustAccountId = (await createAccountResponse.json()).data
      .trustAccountId as string;

    const allocationsResponse = await listTrustAllocations(
      new NextRequest(
        `http://localhost/api/law/v1/trust/allocations?trustAccountId=${trustAccountId}`,
        { headers: authHeaders() },
      ),
    );
    expect(allocationsResponse.status).toBe(200);

    const reconResponse = await runTrustReconciliation(
      new NextRequest(
        `http://localhost/api/law/v1/trust/reconciliation?trustAccountId=${trustAccountId}`,
        { method: "POST", headers: authHeaders() },
      ),
    );
    expect(reconResponse.status).toBe(200);
  });

  it("generates report metadata and lists approvals", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);

    const createAccountResponse = await createTrustAccount(
      new NextRequest("http://localhost/api/law/v1/trust/accounts", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({ name: "Report Account", currency: "ZAR" }),
      }),
    );
    const trustAccountId = (await createAccountResponse.json()).data
      .trustAccountId as string;

    const reportResponse = await generateTrustReport(
      new NextRequest("http://localhost/api/law/v1/trust/reports", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({ reportType: "trial_balance", trustAccountId }),
      }),
    );
    expect(reportResponse.status).toBe(201);

    const listReportsResponse = await listTrustReports(
      new NextRequest("http://localhost/api/law/v1/trust/reports", {
        headers: authHeaders(),
      }),
    );
    expect(listReportsResponse.status).toBe(200);

    const approvalsResponse = await listTrustApprovals(
      new NextRequest("http://localhost/api/law/v1/trust/approvals", {
        headers: authHeaders(),
      }),
    );
    expect(approvalsResponse.status).toBe(200);
  });

  it("returns validation error envelope for malformed transaction list request", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    const response = await listTrustTransactions(
      new NextRequest("http://localhost/api/law/v1/trust/transactions", {
        headers: authHeaders(),
      }),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it("exports a generated report as CSV and HTML", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);

    const createAccountResponse = await createTrustAccount(
      new NextRequest("http://localhost/api/law/v1/trust/accounts", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({ name: "Export Account", currency: "ZAR" }),
      }),
    );
    const trustAccountId = (await createAccountResponse.json()).data
      .trustAccountId as string;

    const reportResponse = await generateTrustReport(
      new NextRequest("http://localhost/api/law/v1/trust/reports", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({ reportType: "trial_balance", trustAccountId }),
      }),
    );
    const reportId = (await reportResponse.json()).data.reportId as string;

    const csvResponse = await exportTrustReport(
      new NextRequest(
        `http://localhost/api/law/v1/trust/reports/${reportId}/export?format=csv`,
        { headers: authHeaders() },
      ),
      { params: Promise.resolve({ reportId }) },
    );
    expect(csvResponse.status).toBe(200);
    expect(csvResponse.headers.get("content-type")).toContain("text/csv");
    expect(await csvResponse.text()).toContain("Scope");

    const htmlResponse = await exportTrustReport(
      new NextRequest(
        `http://localhost/api/law/v1/trust/reports/${reportId}/export?format=html`,
        { headers: authHeaders() },
      ),
      { params: Promise.resolve({ reportId }) },
    );
    expect(htmlResponse.status).toBe(200);
    expect(htmlResponse.headers.get("content-type")).toContain("text/html");
    expect(await htmlResponse.text()).toContain("<!DOCTYPE html>");
  });

  it("returns validation error for unsupported and placeholder export formats", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);

    const xmlResponse = await exportTrustReport(
      new NextRequest(
        "http://localhost/api/law/v1/trust/reports/rpt-missing/export?format=xml",
        {
          headers: authHeaders(),
        },
      ),
      { params: Promise.resolve({ reportId: "rpt-missing" }) },
    );
    expect(xmlResponse.status).toBe(422);

    const pdfResponse = await exportTrustReport(
      new NextRequest(
        "http://localhost/api/law/v1/trust/reports/rpt-missing/export?format=pdf",
        {
          headers: authHeaders(),
        },
      ),
      { params: Promise.resolve({ reportId: "rpt-missing" }) },
    );
    expect(pdfResponse.status).toBe(422);
    const pdfBody = await pdfResponse.json();
    expect(pdfBody.ok).toBe(false);
  });

  it("returns 404 when exporting an unknown report", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    const response = await exportTrustReport(
      new NextRequest(
        "http://localhost/api/law/v1/trust/reports/rpt-unknown/export?format=csv",
        {
          headers: authHeaders(),
        },
      ),
      { params: Promise.resolve({ reportId: "rpt-unknown" }) },
    );
    expect(response.status).toBe(404);
  });

  it("returns 403 when export permission is missing", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    vi.stubEnv("NODE_ENV", "production");

    const response = await exportTrustReport(
      new NextRequest(
        "http://localhost/api/law/v1/trust/reports/rpt-unknown/export?format=csv",
        {
          headers: authHeaders(),
        },
      ),
      { params: Promise.resolve({ reportId: "rpt-unknown" }) },
    );
    expect(response.status).toBe(403);
  });

  it("returns 404 when exporting a report from another tenant", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);

    const createAccountResponse = await createTrustAccount(
      new NextRequest("http://localhost/api/law/v1/trust/accounts", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({ name: "Tenant A Account", currency: "ZAR" }),
      }),
    );
    const trustAccountId = (await createAccountResponse.json()).data
      .trustAccountId as string;

    const reportResponse = await generateTrustReport(
      new NextRequest("http://localhost/api/law/v1/trust/reports", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({ reportType: "trial_balance", trustAccountId }),
      }),
    );
    const reportId = (await reportResponse.json()).data.reportId as string;

    const secondaryTenantId = "t0000002-0000-4000-8000-000000000002";
    const response = await exportTrustReport(
      new NextRequest(
        `http://localhost/api/law/v1/trust/reports/${reportId}/export?format=csv`,
        { headers: authHeaders({ "x-tenant-id": secondaryTenantId }) },
      ),
      { params: Promise.resolve({ reportId }) },
    );
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe("TENANT_MEMBERSHIP_DENIED");
  });
});
