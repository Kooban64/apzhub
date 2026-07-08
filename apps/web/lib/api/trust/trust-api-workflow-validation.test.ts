import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GET as listTrustAccounts,
  POST as createTrustAccount,
} from "../../../app/api/law/v1/trust/accounts/route";
import { GET as trustDiagnostics } from "../../../app/api/law/v1/trust/diagnostics/route";
import {
  GET as listTrustTransactions,
  POST as createTrustTransactionDraft,
} from "../../../app/api/law/v1/trust/transactions/route";
import { POST as postTrustTransactionDraft } from "../../../app/api/law/v1/trust/transactions/[trustTransactionId]/post/route";
import { GET as listTrustAllocations } from "../../../app/api/law/v1/trust/allocations/route";
import { POST as runTrustReconciliation } from "../../../app/api/law/v1/trust/reconciliation/route";
import {
  GET as listTrustInterestPostings,
  POST as runTrustInterestAccrual,
} from "../../../app/api/law/v1/trust/interest/route";
import {
  GET as listTrustTransfers,
  POST as createTrustTransfer,
} from "../../../app/api/law/v1/trust/transfers/route";
import { GET as listTrustApprovals } from "../../../app/api/law/v1/trust/approvals/route";
import {
  GET as listTrustReports,
  POST as generateTrustReport,
} from "../../../app/api/law/v1/trust/reports/route";
import { GET as exportTrustReport } from "../../../app/api/law/v1/trust/reports/[reportId]/export/route";
import { resetTrustApiRepositories } from "@/lib/api/trust";
import { DEFAULT_LAW_TENANT_ID } from "@/lib/api";
import {
  createLawPersistenceContext,
  getSharedTrustServiceBundle,
} from "@apzhub/law-platform/api";
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

const CLIENT_ID = "c1000001-0001-4000-8000-000000000001";
const MATTER_A = "m1000001-0001-4000-8000-000000000001";
const MATTER_B = "m1000002-0002-4000-8000-000000000002";

const mockSession = {
  session: { id: "sess-e2e", expiresAt: new Date(Date.now() + 60_000).toISOString() },
  user: {
    id: "user-e2e",
    email: "trust-e2e@example.com",
    name: "Trust E2E Validator",
    emailVerified: true,
  },
};

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "x-tenant-id": DEFAULT_LAW_TENANT_ID,
    ...extra,
  };
}

function trustBundle() {
  const context = createLawPersistenceContext({
    tenantId: DEFAULT_LAW_TENANT_ID,
    actorId: mockSession.user.id,
  });
  return getSharedTrustServiceBundle(context);
}

/** Interest rule creation is not exposed via REST — seed via service bundle for accrual API validation. */
function seedInterestRule(trustAccountId: string): string {
  const bundle = trustBundle();
  const rule = bundle.interestService.createRule({
    tenantId: DEFAULT_LAW_TENANT_ID,
    trustAccountId,
    complianceProfileId: "ZA-LPC",
    accrualMethod: "simple_daily",
    annualRatePercent: 10,
    postingFrequency: "monthly",
    minimumBalance: 0,
    effectiveFrom: "2026-07-01",
    actorUserId: mockSession.user.id,
  });
  expect(rule.ok).toBe(true);
  return rule.data!.trustInterestRuleId;
}

/** Allocation POST is not exposed via REST — allocate posted deposit for transfer validation. */
function allocatePostedDeposit(
  _trustAccountId: string,
  trustTransactionId: string,
): void {
  const bundle = trustBundle();
  const result = bundle.allocationService.allocate({
    tenantId: DEFAULT_LAW_TENANT_ID,
    trustTransactionId,
    actorUserId: mockSession.user.id,
  });
  expect(result.ok).toBe(true);
}

describe("LAW-015-13 Trust API workflow validation", () => {
  beforeEach(() => {
    mockGetValidatedSession.mockReset();
    mockIsDevRegistrationAllowed.mockReturnValue(false);
    resetTrustApiRepositories();
    resetLawPersistenceScope();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("LAW_REPOSITORY_MODE", "memory");
    process.env.LAW_DEV_PERMISSIONS = "true";
    mockGetValidatedSession.mockResolvedValue(mockSession);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete process.env.LAW_DEV_PERMISSIONS;
  });

  it("validates full trust accounting workflow through REST handlers", async () => {
    const createAccountResponse = await createTrustAccount(
      new NextRequest("http://localhost/api/law/v1/trust/accounts", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({ name: "E2E Trust Account", currency: "ZAR" }),
      }),
    );
    expect(createAccountResponse.status).toBe(201);
    const trustAccountId = (await createAccountResponse.json()).data
      .trustAccountId as string;

    const diagnosticsBefore = await trustDiagnostics(
      new NextRequest("http://localhost/api/law/v1/trust/diagnostics", {
        headers: authHeaders(),
      }),
    );
    expect(diagnosticsBefore.status).toBe(200);
    const diagnosticsBeforeBody = await diagnosticsBefore.json();
    expect(diagnosticsBeforeBody.data.repositoryMode).toBe("memory");
    expect(diagnosticsBeforeBody.data.diagnostics).toBeDefined();

    const draftResponse = await createTrustTransactionDraft(
      new NextRequest("http://localhost/api/law/v1/trust/transactions", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({
          trustAccountId,
          trustTransactionType: "deposit",
          amount: 1500,
          currency: "ZAR",
          transactionDate: "2026-07-07",
          postingDate: "2026-07-07",
          clientId: CLIENT_ID,
          matterId: MATTER_A,
          narrative: "E2E validation deposit",
        }),
      }),
    );
    expect(draftResponse.status).toBe(201);
    const draftId = (await draftResponse.json()).data.draftId as string;

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
    const postBody = await postResponse.json();
    const trustTransactionId = postBody.data.transaction.trustTransactionId as string;

    allocatePostedDeposit(trustAccountId, trustTransactionId);

    const transactionsResponse = await listTrustTransactions(
      new NextRequest(
        `http://localhost/api/law/v1/trust/transactions?trustAccountId=${trustAccountId}`,
        { headers: authHeaders() },
      ),
    );
    expect(transactionsResponse.status).toBe(200);
    expect((await transactionsResponse.json()).data.length).toBeGreaterThanOrEqual(1);

    const allocationsResponse = await listTrustAllocations(
      new NextRequest(
        `http://localhost/api/law/v1/trust/allocations?trustAccountId=${trustAccountId}`,
        { headers: authHeaders() },
      ),
    );
    expect(allocationsResponse.status).toBe(200);
    expect((await allocationsResponse.json()).data.length).toBeGreaterThanOrEqual(1);

    const reconResponse = await runTrustReconciliation(
      new NextRequest(
        `http://localhost/api/law/v1/trust/reconciliation?trustAccountId=${trustAccountId}`,
        { method: "POST", headers: authHeaders() },
      ),
    );
    expect(reconResponse.status).toBe(200);

    const ruleId = seedInterestRule(trustAccountId);

    const interestListResponse = await listTrustInterestPostings(
      new NextRequest(
        `http://localhost/api/law/v1/trust/interest?trustAccountId=${trustAccountId}`,
        { headers: authHeaders() },
      ),
    );
    expect(interestListResponse.status).toBe(200);

    const interestAccrualResponse = await runTrustInterestAccrual(
      new NextRequest("http://localhost/api/law/v1/trust/interest", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({
          trustAccountId,
          trustInterestRuleId: ruleId,
          periodStart: "2026-07-01",
          periodEnd: "2026-07-31",
        }),
      }),
    );
    expect(interestAccrualResponse.status).toBe(201);

    const transferResponse = await createTrustTransfer(
      new NextRequest("http://localhost/api/law/v1/trust/transfers", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({
          sourceTrustAccountId: trustAccountId,
          sourceClientId: CLIENT_ID,
          destinationClientId: CLIENT_ID,
          sourceMatterId: MATTER_A,
          destinationMatterId: MATTER_B,
          amount: 100,
          currency: "ZAR",
          reason: "E2E validation transfer",
        }),
      }),
    );
    expect(transferResponse.status).toBe(201);

    const transfersListResponse = await listTrustTransfers(
      new NextRequest("http://localhost/api/law/v1/trust/transfers", {
        headers: authHeaders(),
      }),
    );
    expect(transfersListResponse.status).toBe(200);
    expect((await transfersListResponse.json()).data.length).toBeGreaterThanOrEqual(1);

    const approvalsResponse = await listTrustApprovals(
      new NextRequest("http://localhost/api/law/v1/trust/approvals", {
        headers: authHeaders(),
      }),
    );
    expect(approvalsResponse.status).toBe(200);

    const reportResponse = await generateTrustReport(
      new NextRequest("http://localhost/api/law/v1/trust/reports", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({ reportType: "trial_balance", trustAccountId }),
      }),
    );
    expect(reportResponse.status).toBe(201);
    const reportId = (await reportResponse.json()).data.reportId as string;

    const listReportsResponse = await listTrustReports(
      new NextRequest("http://localhost/api/law/v1/trust/reports", {
        headers: authHeaders(),
      }),
    );
    expect(listReportsResponse.status).toBe(200);
    expect((await listReportsResponse.json()).data.length).toBeGreaterThanOrEqual(1);

    const csvResponse = await exportTrustReport(
      new NextRequest(
        `http://localhost/api/law/v1/trust/reports/${reportId}/export?format=csv`,
        { headers: authHeaders() },
      ),
      { params: Promise.resolve({ reportId }) },
    );
    expect(csvResponse.status).toBe(200);
    expect(await csvResponse.text()).toContain("Scope");

    const htmlResponse = await exportTrustReport(
      new NextRequest(
        `http://localhost/api/law/v1/trust/reports/${reportId}/export?format=html`,
        { headers: authHeaders() },
      ),
      { params: Promise.resolve({ reportId }) },
    );
    expect(htmlResponse.status).toBe(200);
    expect(await htmlResponse.text()).toContain("<!DOCTYPE html>");

    const accountsResponse = await listTrustAccounts(
      new NextRequest("http://localhost/api/law/v1/trust/accounts", {
        headers: authHeaders(),
      }),
    );
    expect(accountsResponse.status).toBe(200);

    const diagnosticsAfter = await trustDiagnostics(
      new NextRequest("http://localhost/api/law/v1/trust/diagnostics", {
        headers: authHeaders(),
      }),
    );
    expect(diagnosticsAfter.status).toBe(200);
    const diagnosticsAfterBody = await diagnosticsAfter.json();
    expect(diagnosticsAfterBody.data.accountCount).toBeGreaterThanOrEqual(1);
    expect(
      diagnosticsAfterBody.data.diagnostics.pendingApprovals,
    ).toBeGreaterThanOrEqual(0);
  });
});
