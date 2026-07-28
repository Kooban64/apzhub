import { vi } from "vitest";

import { createPlaceholderEventBus } from "@apzhub/event-notification-framework";
import {
  getSharedTenantManagementService,
  resetSharedTenantManagement,
} from "@apzhub/platform-identity";
import {
  ClientWorkflowService,
  MatterWorkflowService,
  TimeEntryWorkflowService,
  createEmptyClientFormValues,
  createEmptyMatterFormValues,
  createEmptyTimeEntryFormValues,
  getSharedClientRepository,
  getSharedMatterRepository,
  getSharedTimeEntryRepository,
} from "@apzhub/law-platform/api";

import { DEFAULT_LAW_TENANT_ID } from "../tenant/law-tenant-ids";

export const mockGetValidatedSession = vi.fn();
export const mockIsDevRegistrationAllowed = vi.fn(() => false);

/** Controllable Platform Authorization mock for Law API route tests (RG-LAW-API-AUTHZ). */
export const mockResolveSessionAuthorization = vi.fn(
  async (_input?: unknown): Promise<{ roles: string[]; permissions: string[] }> => ({
    roles: [],
    permissions: ["*"],
  }),
);

/**
 * Deferred mock entry for `vi.mock` factories (hoisted). Do not pass the fn
 * reference directly into the factory — Vitest forbids capturing imports there.
 */
export function resolveSessionAuthorizationForLawApiTest(
  input?: unknown,
): Promise<{ roles: string[]; permissions: string[] }> {
  return mockResolveSessionAuthorization(input);
}
export function grantAllLawApiTestPermissions(): void {
  mockResolveSessionAuthorization.mockResolvedValue({
    roles: ["law.counsel"],
    permissions: ["*"],
  });
}

export function denyAllLawApiTestPermissions(): void {
  mockResolveSessionAuthorization.mockResolvedValue({
    roles: [],
    permissions: [],
  });
}

export function setupLawApiTestMocks(): void {
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
}

export const mockSession = {
  session: { id: "sess-1", expiresAt: new Date(Date.now() + 60_000).toISOString() },
  user: {
    id: "user-1",
    email: "counsel@example.com",
    name: "Alex Morgan",
    emailVerified: true,
  },
};

export function authHeaders(
  extra: Record<string, string> = {},
): Record<string, string> {
  return {
    "x-tenant-id": DEFAULT_LAW_TENANT_ID,
    ...extra,
  };
}

export function configureLawApiTestEnv(): void {
  resetSharedTenantManagement();
  getSharedTenantManagementService().assignUserToTenant({
    userId: mockSession.user.id,
    tenantId: DEFAULT_LAW_TENANT_ID,
    isPrimary: true,
  });
  mockGetValidatedSession.mockReset();
  mockIsDevRegistrationAllowed.mockReturnValue(false);
  grantAllLawApiTestPermissions();
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("LAW_REPOSITORY_MODE", "memory");
  process.env.LAW_API_ALLOW_DEV_TENANT_FALLBACK = "false";
}

export function enableDevPermissions(): void {
  mockGetValidatedSession.mockResolvedValue(mockSession);
  mockIsDevRegistrationAllowed.mockReturnValue(true);
  grantAllLawApiTestPermissions();
}

const SEED_ATTORNEY_ID = "a1000001-0001-4000-8000-000000000001";

/** Seeds a client and matter in shared in-memory repositories for entity API tests. */
export function seedLawApiClientAndMatter(): { clientId: string; matterId: string } {
  const eventBus = createPlaceholderEventBus();
  const clientWorkflow = new ClientWorkflowService({
    repository: getSharedClientRepository(),
    eventBus,
    actorId: mockSession.user.id,
  });
  const clientResult = clientWorkflow.createClient({
    ...createEmptyClientFormValues(),
    displayName: "API Test Client",
    clientType: "organisation",
    status: "active",
  });
  if (!clientResult.client || Array.isArray(clientResult.client)) {
    throw new Error("Failed to seed test client.");
  }

  const matterWorkflow = new MatterWorkflowService({
    repository: getSharedMatterRepository(),
    eventBus,
    actorId: mockSession.user.id,
  });
  const matterResult = matterWorkflow.createMatter({
    ...createEmptyMatterFormValues(),
    title: "API Test Matter",
    clientId: clientResult.client.clientId,
    leadAttorneyId: SEED_ATTORNEY_ID,
  });
  if (!matterResult.matter || Array.isArray(matterResult.matter)) {
    throw new Error("Failed to seed test matter.");
  }

  return {
    clientId: clientResult.client.clientId,
    matterId: matterResult.matter.matterId,
  };
}

/** Seeds an unbilled time entry linked to a matter for invoice API tests. */
export function seedLawApiTimeEntry(
  matterId: string,
  userId = mockSession.user.id,
): string {
  const workflow = new TimeEntryWorkflowService({
    repository: getSharedTimeEntryRepository(),
    eventBus: createPlaceholderEventBus(),
    actorId: userId,
  });
  const result = workflow.createTimeEntry({
    ...createEmptyTimeEntryFormValues(matterId),
    userId,
    durationMinutes: "60",
    narrative: "API test time entry",
  });
  if (!result.timeEntry || Array.isArray(result.timeEntry)) {
    throw new Error("Failed to seed test time entry.");
  }

  return result.timeEntry.timeEntryId;
}
