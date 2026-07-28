"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import type { SupportPermissionSource } from "@/lib/support/permissions";
import { resolveSupportRoute } from "@/lib/support/routes";

import { SupportAnalyticsView } from "./support-analytics-view";
import { SupportGroupsView } from "./support-groups-view";
import { SupportInboxView } from "./support-inbox-view";
import { SupportOrganizationsView } from "./support-organizations-view";
import { SupportRealtimeProvider } from "./support-realtime-provider";
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

  let content: ReactNode;
  switch (route.kind) {
    case "inbox":
      content = <SupportInboxView permissions={permissions} />;
      break;
    case "create":
      content = <SupportRequestCreateView />;
      break;
    case "detail":
      content = (
        <SupportRequestDetailView
          supportRequestId={route.supportRequestId}
          permissions={permissions}
        />
      );
      break;
    case "organizations":
      content = <SupportOrganizationsView permissions={permissions} />;
      break;
    case "organization-detail":
      content = (
        <SupportOrganizationsView
          organizationId={route.organizationId}
          permissions={permissions}
        />
      );
      break;
    case "groups":
      content = <SupportGroupsView permissions={permissions} />;
      break;
    case "group-detail":
      content = <SupportGroupsView groupId={route.groupId} permissions={permissions} />;
      break;
    case "users":
      content = <SupportUsersView />;
      break;
    case "user-detail":
      content = <SupportUsersView userId={route.userId} />;
      break;
    case "search":
      content = <SupportSearchView />;
      break;
    case "analytics":
      content = <SupportAnalyticsView />;
      break;
    default:
      content = (
        <PageShell title="Support">
          <EmptyState
            title="Unknown Support route"
            description="Select a Support sidebar item to continue."
          />
        </PageShell>
      );
  }

  return <SupportRealtimeProvider>{content}</SupportRealtimeProvider>;
}
