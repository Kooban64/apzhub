import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getSharedTenantManagementService,
  resetSharedTenantManagement,
} from "@apzhub/platform-identity";

import { GET as getDiagnostics } from "../../app/api/law/v1/diagnostics/route";
import {
  LAW_API_CORRELATION_ID_HEADER,
  buildLawApiAuthenticatedContext,
  buildLawApiAuthDiagnostics,
  buildLawApiDiagnosticsData,
  createLawApiPersistenceContext,
  DEFAULT_LAW_TENANT_ID,
  forbiddenResponse,
  resolveLawApiPermissions,
  resolveLawApiTenant,
  resolveLawApiUser,
  runWithLawApiPersistenceScope,
  unauthorizedResponse,
  createRequestContext,
} from "./index";

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
  session: {
    id: "sess-1",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  },
  user: {
    id: "user-1",
    email: "counsel@example.com",
    name: "Alex Morgan",
    emailVerified: true,
  },
};

describe("resolveLawApiTenant", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("LAW_API_ALLOW_DEV_TENANT_FALLBACK", "false");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers tenant from auth session user claim", () => {
    const tenantId = "t0000001-0000-4000-8000-000000000099";
    const result = resolveLawApiTenant({
      session: {
        ...mockSession,
        user: { ...mockSession.user, tenantId },
      } as never,
    });

    expect(result).toEqual({ tenantId, source: "auth_session" });
  });

  it("falls back to x-tenant-id header claim", () => {
    const tenantId = "t0000002-0000-4000-8000-000000000002";
    const request = new NextRequest("http://localhost/api/law/v1/diagnostics", {
      headers: { "x-tenant-id": tenantId },
    });

    expect(resolveLawApiTenant({ request }).tenantId).toBe(tenantId);
    expect(resolveLawApiTenant({ request }).source).toBe("tenant_claim");
  });

  it("falls back to active persistence context", () => {
    const tenantId = "t0000003-0000-4000-8000-000000000003";
    const persistence = createLawApiPersistenceContext({ tenantId, actorId: "user-1" });

    runWithLawApiPersistenceScope(persistence, () => {
      expect(resolveLawApiTenant({}).tenantId).toBe(tenantId);
      expect(resolveLawApiTenant({}).source).toBe("persistence_context");
    });
  });

  it("uses development fallback when no other source is available", () => {
    vi.unstubAllEnvs();
    vi.stubEnv("NODE_ENV", "development");

    const result = resolveLawApiTenant({});

    expect(result.tenantId).toBe(DEFAULT_LAW_TENANT_ID);
    expect(result.source).toBe("development_fallback");
  });
});

describe("resolveLawApiUser", () => {
  it("maps Better Auth session to API user", () => {
    expect(resolveLawApiUser(mockSession as never)).toEqual({
      userId: "user-1",
      email: "counsel@example.com",
      name: "Alex Morgan",
      emailVerified: true,
    });
  });
});

describe("Law API auth errors", () => {
  it("returns 401 unauthorized envelope", async () => {
    const context = createRequestContext();
    const response = unauthorizedResponse(context);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 403 forbidden envelope", async () => {
    const context = createRequestContext();
    const response = forbiddenResponse(context, {
      code: "FORBIDDEN",
      message: "Denied",
    });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
  });
});

describe("resolveLawApiPermissions", () => {
  beforeEach(() => {
    mockIsDevRegistrationAllowed.mockReturnValue(false);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("denies permissions without user context in production mode", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const checker = await resolveLawApiPermissions({
      user: { userId: "user-1", email: "a@b.com", name: "A", emailVerified: true },
      permissions: [],
    });

    expect(checker.can("legal.nav.dashboard.view")).toBe(false);
  });

  it("allows wildcard permissions when explicitly granted", async () => {
    const checker = await resolveLawApiPermissions({
      user: { userId: "user-1", email: "a@b.com", name: "A", emailVerified: true },
      permissions: ["*"],
    });

    expect(checker.can("legal.nav.dashboard.view")).toBe(true);
  });

  it("does not inject * when grants are empty even if dev registration is allowed", async () => {
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const checker = await resolveLawApiPermissions({
      user: { userId: "user-1", email: "a@b.com", name: "A", emailVerified: true },
      permissions: [],
    });

    expect(checker.adapterKind).toBe("auth");
    expect(checker.permissions).toEqual([]);
    expect(checker.can("legal.nav.dashboard.view")).toBe(false);
  });

  it("honours legal.* namespace grants via pattern match", async () => {
    const checker = await resolveLawApiPermissions({
      user: { userId: "user-1", email: "a@b.com", name: "A", emailVerified: true },
      permissions: ["legal.*"],
    });

    expect(checker.can("legal.nav.dashboard.view")).toBe(true);
    expect(checker.can("platform.impersonation.use")).toBe(false);
  });
});

describe("buildLawApiAuthenticatedContext", () => {
  beforeEach(() => {
    resetSharedTenantManagement();
    getSharedTenantManagementService().assignUserToTenant({
      userId: "user-1",
      tenantId: DEFAULT_LAW_TENANT_ID,
      isPrimary: true,
    });
    mockGetValidatedSession.mockReset();
    mockIsDevRegistrationAllowed.mockReturnValue(false);
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("LAW_API_ALLOW_DEV_TENANT_FALLBACK", "false");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 for unauthenticated protected requests", async () => {
    mockGetValidatedSession.mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/law/v1/diagnostics");
    const result = await buildLawApiAuthenticatedContext(request, {
      requireAuth: true,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
  });

  it("creates authenticated context with tenant and persistence binding", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);

    const request = new NextRequest("http://localhost/api/law/v1/diagnostics", {
      headers: {
        [LAW_API_CORRELATION_ID_HEADER]: "corr-auth-1",
        "x-tenant-id": "t0000001-0000-4000-8000-000000000001",
      },
    });

    const result = await buildLawApiAuthenticatedContext(request, {
      requireAuth: true,
      requireTenant: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.context.authenticated).toBe(true);
      expect(result.context.user?.userId).toBe("user-1");
      expect(result.context.tenantId).toBe("t0000001-0000-4000-8000-000000000001");
      expect(result.context.correlationId).toBe("corr-auth-1");
      expect(result.context.persistenceContext?.actorId).toBe("user-1");
      expect(result.context.repositoryMode).toBe("memory");
    }
  });

  it("returns 403 when required permission is missing", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    vi.stubEnv("NODE_ENV", "production");

    const request = new NextRequest("http://localhost/api/law/v1/diagnostics", {
      headers: { "x-tenant-id": "t0000001-0000-4000-8000-000000000001" },
    });

    // Default provisioned Law roles grant legal.* / law.* / trust.* — use a key outside that set.
    const result = await buildLawApiAuthenticatedContext(request, {
      requireAuth: true,
      requireTenant: true,
      requiredPermission: "platform.impersonation.use",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
    }
  });

  it("allows legal.* wildcard grants for Law navigation permissions", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    vi.stubEnv("NODE_ENV", "production");

    const request = new NextRequest("http://localhost/api/law/v1/diagnostics", {
      headers: { "x-tenant-id": "t0000001-0000-4000-8000-000000000001" },
    });

    const result = await buildLawApiAuthenticatedContext(request, {
      requireAuth: true,
      requireTenant: true,
      requiredPermission: "legal.nav.dashboard.view",
    });

    expect(result.ok).toBe(true);
  });
});

describe("Law API auth diagnostics", () => {
  beforeEach(() => {
    resetSharedTenantManagement();
    getSharedTenantManagementService().assignUserToTenant({
      userId: "user-1",
      tenantId: DEFAULT_LAW_TENANT_ID,
      isPrimary: true,
    });
    mockGetValidatedSession.mockReset();
    mockIsDevRegistrationAllowed.mockReturnValue(false);
    vi.stubEnv("LAW_API_ALLOW_DEV_TENANT_FALLBACK", "false");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports authentication status without secrets", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);

    const request = new NextRequest("http://localhost/api/law/v1/diagnostics", {
      headers: { "x-tenant-id": "t0000001-0000-4000-8000-000000000001" },
    });
    const result = await buildLawApiAuthenticatedContext(request, {
      requireAuth: true,
      requireTenant: true,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const diagnostics = buildLawApiDiagnosticsData(result.context);
    const auth = buildLawApiAuthDiagnostics(result.context);

    expect(diagnostics.capabilities.authentication).toBe(true);
    expect(auth.authenticated).toBe(true);
    expect(auth.principal.userId).toBe("user-1");
    expect(JSON.stringify(diagnostics)).not.toMatch(/secret|password|token/i);
  });
});

describe("GET /api/law/v1/diagnostics route", () => {
  beforeEach(() => {
    resetSharedTenantManagement();
    getSharedTenantManagementService().assignUserToTenant({
      userId: "user-1",
      tenantId: DEFAULT_LAW_TENANT_ID,
      isPrimary: true,
    });
    mockGetValidatedSession.mockReset();
    mockIsDevRegistrationAllowed.mockReturnValue(false);
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("LAW_API_ALLOW_DEV_TENANT_FALLBACK", "false");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns diagnostics for authenticated requests", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    mockIsDevRegistrationAllowed.mockReturnValue(true);

    const response = await getDiagnostics(
      new NextRequest("http://localhost/api/law/v1/diagnostics", {
        headers: { "x-tenant-id": "t0000001-0000-4000-8000-000000000001" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.auth.authenticated).toBe(true);
    expect(body.data.capabilities.authentication).toBe(true);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetValidatedSession.mockResolvedValue(null);

    const response = await getDiagnostics(
      new NextRequest("http://localhost/api/law/v1/diagnostics"),
    );

    expect(response.status).toBe(401);
  });
});
