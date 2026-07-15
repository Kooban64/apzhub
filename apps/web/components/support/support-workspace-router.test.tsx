import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pathnameState = vi.hoisted(() => ({ value: "/workspace/support/requests" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.value,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("./support-inbox-view", () => ({
  SupportInboxView: ({ permissions }: { permissions?: readonly string[] }) => (
    <div data-testid="route-inbox">{permissions?.join(",") ?? ""}</div>
  ),
}));
vi.mock("./support-request-create-view", () => ({
  SupportRequestCreateView: () => <div data-testid="route-create" />,
}));
vi.mock("./support-request-detail-view", () => ({
  SupportRequestDetailView: ({
    supportRequestId,
  }: {
    supportRequestId: string;
  }) => <div data-testid="route-detail">{supportRequestId}</div>,
}));
vi.mock("./support-organizations-view", () => ({
  SupportOrganizationsView: ({
    organizationId,
  }: {
    organizationId?: string;
  }) => (
    <div data-testid={organizationId ? "route-organization-detail" : "route-organizations"}>
      {organizationId ?? "list"}
    </div>
  ),
}));
vi.mock("./support-groups-view", () => ({
  SupportGroupsView: ({ groupId }: { groupId?: string }) => (
    <div data-testid={groupId ? "route-group-detail" : "route-groups"}>
      {groupId ?? "list"}
    </div>
  ),
}));
vi.mock("./support-users-view", () => ({
  SupportUsersView: ({ userId }: { userId?: string }) => (
    <div data-testid={userId ? "route-user-detail" : "route-users"}>
      {userId ?? "list"}
    </div>
  ),
}));
vi.mock("./support-search-view", () => ({
  SupportSearchView: () => <div data-testid="route-search" />,
}));
vi.mock("./support-analytics-view", () => ({
  SupportAnalyticsView: () => <div data-testid="route-analytics" />,
}));

import { SupportWorkspaceRouter } from "./support-workspace-router";

function renderRouter(pathname: string, permissions?: readonly string[]) {
  pathnameState.value = pathname;
  return render(<SupportWorkspaceRouter permissions={permissions} />);
}

describe("SupportWorkspaceRouter", () => {
  beforeEach(() => {
    pathnameState.value = "/workspace/support/requests";
  });

  it("routes inbox, create, detail, and directory kinds", () => {
    const { rerender } = renderRouter("/workspace/support/requests");
    expect(screen.getByTestId("route-inbox")).toBeTruthy();

    pathnameState.value = "/workspace/support/requests/new";
    rerender(<SupportWorkspaceRouter />);
    expect(screen.getByTestId("route-create")).toBeTruthy();

    pathnameState.value =
      "/workspace/support/requests/sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    rerender(<SupportWorkspaceRouter />);
    expect(screen.getByTestId("route-detail").textContent).toBe(
      "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    );

    pathnameState.value = "/workspace/support/organizations";
    rerender(<SupportWorkspaceRouter />);
    expect(screen.getByTestId("route-organizations")).toBeTruthy();

    pathnameState.value =
      "/workspace/support/organizations/sorg_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    rerender(<SupportWorkspaceRouter />);
    expect(screen.getByTestId("route-organization-detail")).toBeTruthy();

    pathnameState.value = "/workspace/support/groups";
    rerender(<SupportWorkspaceRouter />);
    expect(screen.getByTestId("route-groups")).toBeTruthy();

    pathnameState.value =
      "/workspace/support/groups/sgrp_ffffffffffffffffffffffffffffffff";
    rerender(<SupportWorkspaceRouter />);
    expect(screen.getByTestId("route-group-detail")).toBeTruthy();

    pathnameState.value = "/workspace/support/users";
    rerender(<SupportWorkspaceRouter />);
    expect(screen.getByTestId("route-users")).toBeTruthy();

    pathnameState.value =
      "/workspace/support/users/suser_11111111111111111111111111111111";
    rerender(<SupportWorkspaceRouter />);
    expect(screen.getByTestId("route-user-detail")).toBeTruthy();

    pathnameState.value = "/workspace/support/search";
    rerender(<SupportWorkspaceRouter />);
    expect(screen.getByTestId("route-search")).toBeTruthy();

    pathnameState.value = "/workspace/support/analytics";
    rerender(<SupportWorkspaceRouter />);
    expect(screen.getByTestId("route-analytics")).toBeTruthy();
  });

  it("renders unknown route empty state", () => {
    renderRouter("/workspace/support/not-a-section");
    expect(screen.getByText("Unknown Support route")).toBeTruthy();
  });
});
