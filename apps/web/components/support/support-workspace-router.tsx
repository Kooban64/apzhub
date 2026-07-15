"use client";

import { usePathname } from "next/navigation";

import type { SupportPermissionSource } from "@/lib/support/permissions";
import { resolveSupportRoute } from "@/lib/support/routes";

import { SupportAnalyticsView } from "./support-analytics-view";
import { SupportGroupsView } from "./support-groups-view";
import { SupportInboxView } from "./support-inbox-view";
import { SupportOrganizationsView } from "./support-organizations-view";
import { SupportRequestCreateView } from "./support-request-create-view";
import { SupportRequestDetailView } from "./support-request-detail-view";
import { SupportSearchView } from "./support-search-view";
import { SupportUsersView } from "./support-users-view";
import { EmptyState, PageShell } from "./support-ui";

/** Wildcard permissions so authenticated Support nav users can act; API remains authoritative. */
const DEFAULT_UI_PERMISSIONS: readonly string[] = ["support.*"];

export function SupportWorkspaceRouter({
  permissions = DEFAULT_UI_PERMISSIONS,
}: {
  readonly permissions?: SupportPermissionSource;
}) {
  const pathname = usePathname();
  const route = resolveSupportRoute(pathname);

  switch (route.kind) {
    case "inbox":
      return <SupportInboxView permissions={permissions} />;
    case "create":
      return <SupportRequestCreateView />;
    case "detail":
      return (
        <SupportRequestDetailView
          supportRequestId={route.supportRequestId}
          permissions={permissions}
        />
      );
    case "organizations":
      return <SupportOrganizationsView permissions={permissions} />;
    case "organization-detail":
      return (
        <SupportOrganizationsView
          organizationId={route.organizationId}
          permissions={permissions}
        />
      );
    case "groups":
      return <SupportGroupsView permissions={permissions} />;
    case "group-detail":
      return (
        <SupportGroupsView groupId={route.groupId} permissions={permissions} />
      );
    case "users":
      return <SupportUsersView />;
    case "user-detail":
      return <SupportUsersView userId={route.userId} />;
    case "search":
      return <SupportSearchView />;
    case "analytics":
      return <SupportAnalyticsView />;
    default:
      return (
        <PageShell title="Support">
          <EmptyState
            title="Unknown Support route"
            description="Select a Support sidebar item to continue."
          />
        </PageShell>
      );
  }
}
