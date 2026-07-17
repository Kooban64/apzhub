"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockIdentityClient,
  MOCK_IDENTITY_USER,
} from "@/lib/identity/mock-identity-client";
import {
  resetIdentityClient,
  setIdentityClient,
} from "@/lib/identity/identity-api";

import { IdentityWorkspaceRouter } from "./identity-workspace-router";
import { PlatformIdentityView } from "./platform-identity-view";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/identity/overview",
}));

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PlatformIdentityView", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    resetIdentityClient();
    setIdentityClient(createMockIdentityClient());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async () => undefined) },
    });
  });

  it("renders overview with authentication/provisioning/directory-sync banners", async () => {
    render(wrap(<PlatformIdentityView section="overview" />));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Overview" }),
      ).toBeTruthy();
      expect(screen.getByTestId("card-users-count")).toBeTruthy();
    });

    expect(screen.getByTestId("card-auth-status").textContent).toContain(
      "AUTHENTICATION NOT MANAGED HERE",
    );
    expect(screen.getByTestId("card-provisioning-status").textContent).toContain(
      "PROVISIONING NOT AVAILABLE",
    );
    expect(
      screen.getByTestId("card-directory-sync-status").textContent,
    ).toContain("DIRECTORY SYNC NOT AVAILABLE");
    expect(
      screen.getByRole("toolbar", { name: /Identity commands/i }),
    ).toBeTruthy();
  });

  it("router mounts overview from pathname", async () => {
    render(wrap(<IdentityWorkspaceRouter />));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Overview" }),
      ).toBeTruthy();
    });
  });

  it("lists users, filters, creates, activates, and deactivates without password fields", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="users" canManage />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_IDENTITY_USER.id)).toBeTruthy();
    });

    expect(screen.getByTestId("banner-auth").textContent).toContain(
      "AUTHENTICATION NOT MANAGED HERE",
    );
    expect(screen.queryByLabelText(/password/i)).toBeNull();
    expect(screen.queryByLabelText(/mfa/i)).toBeNull();
    expect(screen.queryByLabelText(/oauth/i)).toBeNull();
    expect(screen.queryByLabelText(/session/i)).toBeNull();

    await user.type(screen.getByLabelText(/User search/i), "zzz-no-match");
    await waitFor(() => {
      expect(screen.getByTestId("identity-empty")).toBeTruthy();
    });
    await user.clear(screen.getByLabelText(/User search/i));

    await waitFor(() => {
      expect(screen.getByTestId("identity-detail")).toBeTruthy();
    });

    await user.type(screen.getByLabelText(/^Display name$/i), "New User");
    await user.click(screen.getByRole("button", { name: /Create user/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: create user/i,
      );
    });

    await user.click(screen.getByRole("button", { name: /^Activate$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: activate user/i,
      );
    });

    await user.click(screen.getByRole("button", { name: /^Deactivate$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: deactivate user/i,
      );
    });

    await user.clear(screen.getByLabelText(/^Edit display name$/i));
    await user.type(
      screen.getByLabelText(/^Edit display name$/i),
      "Updated Name",
    );
    await user.click(screen.getByRole("button", { name: /Save changes/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: update user/i,
      );
    });
  });

  it("hides manage commands when canManage is false", async () => {
    render(wrap(<PlatformIdentityView section="users" canManage={false} />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_IDENTITY_USER.id)).toBeTruthy();
    });
    expect(screen.queryByRole("button", { name: /Create user/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Activate$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Save changes/i })).toBeNull();
  });

  it("creates a service assignment including the workflow-engine capability", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="service-assignments" canManage />));

    await waitFor(() => {
      expect(screen.getByLabelText(/Service capability/i)).toBeTruthy();
    });

    await user.type(
      screen.getByLabelText(/Service assignment subject id/i),
      "usr_target",
    );
    await user.selectOptions(
      screen.getByLabelText(/Service capability/i),
      "workflow-engine",
    );
    await user.click(
      screen.getByRole("button", { name: /Create service assignment/i }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: create service assignment/i,
      );
    });
  });

  it("shows invitation metadata-only banner and no email delivery notice", async () => {
    render(wrap(<PlatformIdentityView section="invitations" />));
    await waitFor(() => {
      expect(screen.getByTestId("banner-invitations").textContent).toContain(
        "NO EMAIL DELIVERY",
      );
      expect(screen.getByTestId("invitation-no-email")).toBeTruthy();
    });
  });

  it("shows diagnostics cards with authentication/provisioning/directory-sync unavailable", async () => {
    render(wrap(<PlatformIdentityView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("diag-authentication").textContent).toContain(
        "Unavailable",
      );
      expect(screen.getByTestId("diag-provisioning").textContent).toContain(
        "Unavailable",
      );
      expect(screen.getByTestId("diag-directory-sync").textContent).toContain(
        "Unavailable",
      );
      expect(screen.getByTestId("banner-auth")).toBeTruthy();
      expect(screen.getByTestId("diagnostics-health")).toBeTruthy();
    });
  });

  it("shows forbidden state when the users list fails with 403", async () => {
    setIdentityClient({
      ...createMockIdentityClient(),
      async listUsers() {
        const { IdentityClientError } = await import(
          "@/lib/identity/identity-errors"
        );
        throw new IdentityClientError({
          message: "Denied",
          status: 403,
          code: "FORBIDDEN",
        });
      },
    });

    render(wrap(<PlatformIdentityView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-forbidden")).toBeTruthy();
    });
  });

  it("shows unavailable state when the identity service is unavailable", async () => {
    setIdentityClient({
      ...createMockIdentityClient(),
      async listUsers() {
        const { IdentityClientError } = await import(
          "@/lib/identity/identity-errors"
        );
        throw new IdentityClientError({
          message: "Identity service is unavailable",
          status: 503,
          code: "IDENTITY_SERVICE_UNAVAILABLE",
        });
      },
    });

    render(wrap(<PlatformIdentityView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-unavailable")).toBeTruthy();
    });
  });

  it("shows diagnostics unavailable state for IDENTITY_SERVICE_UNAVAILABLE health errors", async () => {
    setIdentityClient({
      ...createMockIdentityClient(),
      async getHealth() {
        const { IdentityClientError } = await import(
          "@/lib/identity/identity-errors"
        );
        throw new IdentityClientError({
          message: "Identity service is unavailable",
          status: 503,
          code: "IDENTITY_SERVICE_UNAVAILABLE",
        });
      },
    });

    render(wrap(<PlatformIdentityView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-unavailable")).toBeTruthy();
    });
  });

  it("shows groups metadata create/update panel", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="groups" canManage />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-detail")).toBeTruthy();
    });
    await user.type(screen.getByLabelText(/^Group key$/i), "eng");
    await user.type(screen.getByLabelText(/^Group name$/i), "Engineering");
    await user.click(screen.getByRole("button", { name: /^Create Group$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: create group/i,
      );
    });
  });

  it("shows policies list and detail", async () => {
    render(wrap(<PlatformIdentityView section="policies" />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-detail")).toBeTruthy();
    });
  });

  it("shows audit and history read-only tables", async () => {
    render(wrap(<PlatformIdentityView section="audit" />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-audit-table")).toBeTruthy();
    });
    cleanup();
    render(wrap(<PlatformIdentityView section="history" />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-history-table")).toBeTruthy();
    });
  });

  it("shows empty state for empty lists", async () => {
    setIdentityClient({
      ...createMockIdentityClient(),
      async listGroups() {
        return { items: [], page: { limit: 0, hasMore: false } };
      },
    });
    render(wrap(<PlatformIdentityView section="groups" />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-empty")).toBeTruthy();
    });
  });

  async function exerciseEntityCrud(
    section:
      | "groups"
      | "roles"
      | "organisations"
      | "tenants"
      | "departments"
      | "positions",
    singular: string,
    options?: { organisationId?: boolean },
  ) {
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section={section} canManage />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-detail")).toBeTruthy();
    });
    await user.type(
      screen.getByLabelText(new RegExp(`^${singular} key$`, "i")),
      `${section}-key`,
    );
    await user.type(
      screen.getByLabelText(new RegExp(`^${singular} name$`, "i")),
      `${section} name`,
    );
    await user.type(
      screen.getByLabelText(new RegExp(`^${singular} description$`, "i")),
      "Desc",
    );
    if (options?.organisationId) {
      await user.type(
        screen.getByLabelText(new RegExp(`^${singular} organisation id$`, "i")),
        "org_mock_1",
      );
    }
    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^Create ${singular}$`, "i"),
      }),
    );
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: create/i,
      );
    });
    await user.type(
      screen.getByLabelText(new RegExp(`^${singular} update name$`, "i")),
      "Updated",
    );
    await user.type(
      screen.getByLabelText(
        new RegExp(`^${singular} update description$`, "i"),
      ),
      "Updated desc",
    );
    await user.type(
      screen.getByLabelText(new RegExp(`^${singular} update status$`, "i")),
      "active",
    );
    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^Update ${singular}$`, "i"),
      }),
    );
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: update/i,
      );
    });
    await user.click(screen.getByRole("button", { name: /^Copy ID$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Copied ID/i,
      );
    });
  }

  it(
    "exercises EntityCrudPanel create/update for catalogue sections",
    async () => {
      await exerciseEntityCrud("groups", "Group", { organisationId: true });
      cleanup();
      resetIdentityClient();
      setIdentityClient(createMockIdentityClient());
      await exerciseEntityCrud("roles", "Role", { organisationId: true });
      cleanup();
      resetIdentityClient();
      setIdentityClient(createMockIdentityClient());
      await exerciseEntityCrud("organisations", "Organisation");
      cleanup();
      resetIdentityClient();
      setIdentityClient(createMockIdentityClient());
      await exerciseEntityCrud("tenants", "Tenant");
      cleanup();
      resetIdentityClient();
      setIdentityClient(createMockIdentityClient());
      await exerciseEntityCrud("departments", "Department", {
        organisationId: true,
      });
      cleanup();
      resetIdentityClient();
      setIdentityClient(createMockIdentityClient());
      await exerciseEntityCrud("positions", "Position", { organisationId: true });
    },
    30_000,
  );

  it("creates and updates memberships", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="memberships" canManage />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-detail")).toBeTruthy();
    });
    await user.type(screen.getByLabelText(/Membership user id/i), "usr_mock_1");
    await user.type(screen.getByLabelText(/Membership kind/i), "group");
    await user.type(screen.getByLabelText(/Membership target id/i), "grp_mock_1");
    await user.click(screen.getByRole("button", { name: /Create membership/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: create membership/i,
      );
    });
    await user.type(
      screen.getByLabelText(/Membership new status/i),
      "suspended",
    );
    await user.click(screen.getByRole("button", { name: /^Update status$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: update membership/i,
      );
    });
  });

  it("creates invitation and updates status", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="invitations" canManage />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-detail")).toBeTruthy();
    });
    await user.type(
      screen.getByLabelText(/Invitation email/i),
      "invitee@example.com",
    );
    await user.type(
      screen.getByLabelText(/Invitation organisation id/i),
      "org_mock_1",
    );
    await user.click(screen.getByRole("button", { name: /Create invitation/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: create invitation/i,
      );
    });
    await user.type(screen.getByLabelText(/Invitation new status/i), "revoked");
    await user.click(screen.getByRole("button", { name: /^Update status$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: update invitation/i,
      );
    });
  });

  it("creates and updates policies", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="policies" canManage />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-detail")).toBeTruthy();
    });
    await user.type(screen.getByLabelText(/^Policy key$/i), "pol-key");
    await user.type(screen.getByLabelText(/^Policy name$/i), "Policy Name");
    await user.type(screen.getByLabelText(/^Policy kind$/i), "lifecycle");
    await user.type(screen.getByLabelText(/^Policy description$/i), "Desc");
    await user.click(screen.getByRole("button", { name: /Create policy/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: create policy/i,
      );
    });
    await user.type(screen.getByLabelText(/Policy update name/i), "Updated");
    await user.type(
      screen.getByLabelText(/Policy update description/i),
      "Updated desc",
    );
    await user.click(screen.getByRole("button", { name: /Update policy/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: update policy/i,
      );
    });
  });

  it("creates and updates references", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="references" canManage />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-detail")).toBeTruthy();
    });
    await user.type(screen.getByLabelText(/Reference kind/i), "document");
    await user.type(screen.getByLabelText(/Reference target/i), "doc:1");
    await user.type(screen.getByLabelText(/Reference label/i), "Doc");
    await user.type(screen.getByLabelText(/Reference user id/i), "usr_mock_1");
    await user.click(screen.getByRole("button", { name: /Create reference/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: create reference/i,
      );
    });
    await user.type(
      screen.getByLabelText(/Reference update target/i),
      "doc:2",
    );
    await user.type(
      screen.getByLabelText(/Reference update label/i),
      "Doc 2",
    );
    await user.click(screen.getByRole("button", { name: /Update reference/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: update reference/i,
      );
    });
  });

  it("updates service assignment status from detail", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="service-assignments" canManage />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-detail")).toBeTruthy();
    });
    await user.type(
      screen.getByLabelText(/Service assignment new status/i),
      "suspended",
    );
    await user.click(screen.getByRole("button", { name: /^Update status$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: update service assignment/i,
      );
    });
  });

  it("shows not-found detail state", async () => {
    setIdentityClient({
      ...createMockIdentityClient(),
      async getGroup() {
        const { IdentityClientError } = await import(
          "@/lib/identity/identity-errors"
        );
        throw new IdentityClientError({
          message: "Missing",
          status: 404,
          code: "NOT_FOUND",
        });
      },
    });
    render(wrap(<PlatformIdentityView section="groups" canManage />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-not-found")).toBeTruthy();
    });
  });

  it("toolbar refresh and Open API Metadata actions work", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="overview" />));
    await waitFor(() => {
      expect(
        screen.getByRole("toolbar", { name: /Identity commands/i }),
      ).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Refresh$/i }));
    await user.click(
      screen.getByRole("button", { name: /Open API Metadata/i }),
    );
    await waitFor(() => {
      expect(screen.getByTestId("api-metadata-panel")).toBeTruthy();
    });
  });

  it("supports keyboard row selection and history user filter", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="users" canManage />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-table")).toBeTruthy();
    });
    const dataRows = screen.getAllByRole("row").filter((row) =>
      row.hasAttribute("tabindex"),
    );
    expect(dataRows.length).toBeGreaterThan(0);
    dataRows[0]!.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(screen.getByTestId("identity-detail")).toBeTruthy();
    });
    cleanup();
    resetIdentityClient();
    setIdentityClient(createMockIdentityClient());
    render(wrap(<PlatformIdentityView section="history" />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-history-table")).toBeTruthy();
    });
    await user.type(screen.getByLabelText(/History user filter/i), "usr_mock_1");
    await waitFor(() => {
      expect(screen.getByTestId("identity-history-table")).toBeTruthy();
    });
  });

  it("surfaces mutation conflict errors safely", async () => {
    setIdentityClient({
      ...createMockIdentityClient(),
      async createGroup() {
        const { IdentityClientError } = await import(
          "@/lib/identity/identity-errors"
        );
        throw new IdentityClientError({
          message: "Conflict",
          status: 409,
          code: "CONFLICT",
        });
      },
    });
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="groups" canManage />));
    await waitFor(() => {
      expect(screen.getByLabelText(/^Group key$/i)).toBeTruthy();
    });
    await user.type(screen.getByLabelText(/^Group key$/i), "dup");
    await user.type(screen.getByLabelText(/^Group name$/i), "Dup");
    await user.click(screen.getByRole("button", { name: /^Create Group$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-action-error")).toBeTruthy();
    });
  });

  it("shows overview retry affordance for generic list errors", async () => {
    let calls = 0;
    setIdentityClient({
      ...createMockIdentityClient(),
      async listUsers() {
        calls += 1;
        if (calls === 1) {
          const { IdentityClientError } = await import(
            "@/lib/identity/identity-errors"
          );
          throw new IdentityClientError({
            message: "Temporary failure",
            status: 500,
            code: "INTERNAL",
          });
        }
        return createMockIdentityClient().listUsers();
      },
    });
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="overview" />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Retry/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));
    await waitFor(() => {
      expect(screen.getByTestId("card-users-count")).toBeTruthy();
    });
  });

  it("fills optional invitation and user edit fields", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformIdentityView section="invitations" canManage />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-detail")).toBeTruthy();
    });
    await user.type(
      screen.getByLabelText(/Invitation invited user id/i),
      "usr_invitee",
    );
    await user.type(
      screen.getByLabelText(/Invitation expiry/i),
      "2026-12-31T00:00:00.000Z",
    );
    await user.type(
      screen.getByLabelText(/Invitation email/i),
      "full@example.com",
    );
    await user.click(screen.getByRole("button", { name: /Create invitation/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: create invitation/i,
      );
    });
    cleanup();
    resetIdentityClient();
    setIdentityClient(createMockIdentityClient());
    render(wrap(<PlatformIdentityView section="users" canManage />));
    await waitFor(() => {
      expect(screen.getByTestId("identity-detail")).toBeTruthy();
    });
    await user.type(screen.getByLabelText(/^Edit email$/i), "edited@example.com");
    await user.type(
      screen.getByLabelText(/Edit auth subject reference/i),
      "subj_1",
    );
    await user.type(
      screen.getByLabelText(/Edit user organisation id/i),
      "org_mock_1",
    );
    await user.type(
      screen.getByLabelText(/Activation reason/i),
      "lifecycle test",
    );
    await user.click(screen.getByRole("button", { name: /Save changes/i }));
    await waitFor(() => {
      expect(screen.getByTestId("identity-status").textContent).toMatch(
        /Completed: update user/i,
      );
    });
  });
});
