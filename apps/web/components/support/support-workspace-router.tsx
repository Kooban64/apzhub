"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  canCreateSupportRequest,
  canExecuteSupportSearch,
  canListSupportUsers,
  canReadSupportAnalytics,
  type SupportPermissionSource,
} from "@/lib/support/permissions";
import { resolveSupportRoute } from "@/lib/support/routes";
import { useSupportPermissions } from "@/lib/support/use-support-permissions";

import { SupportAnalyticsView } from "./support-analytics-view";
import { SupportGroupsView } from "./support-groups-view";
import { SupportHelpView } from "./support-help-view";
import { SupportInboxView } from "./support-inbox-view";
import { SupportOrganizationsView } from "./support-organizations-view";
import { SupportRealtimeProvider } from "./support-realtime-provider";
import { SupportRequestCreateView } from "./support-request-create-view";
import { SupportRequestDetailView } from "./support-request-detail-view";
import { SupportSearchView } from "./support-search-view";
import { SupportSettingsView } from "./support-settings-view";
import { SupportUsersView } from "./support-users-view";
import { EmptyState, PageShell } from "./support-ui";

function PermissionDenied({ action }: { readonly action: string }) {
  return (
    <PageShell title="APZ Support" breadcrumbs={["APZ Support", "Permission required"]}>
      <EmptyState
        title="Permission required"
        description={`You do not have permission to ${action}. Contact your APZHUB administrator if you need access.`}
      />
    </PageShell>
  );
}

/**
 * Support workspace router — consumes APZHUB session permissions.
 * Never defaults to `support.*`. Never exposes engine identity/roles.
 */
export function SupportWorkspaceRouter({
  permissions: permissionsOverride,
}: {
  readonly permissions?: SupportPermissionSource;
} = {}) {
  const pathname = usePathname();
  const route = resolveSupportRoute(pathname);
  const permissions = useSupportPermissions(permissionsOverride);

  let content: ReactNode;
  switch (route.kind) {
    case "inbox":
      content = <SupportInboxView permissions={permissions} />;
      break;
    case "create":
      if (!canCreateSupportRequest(permissions)) {
        content = <PermissionDenied action="create support requests" />;
        break;
      }
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
      if (!canListSupportUsers(permissions)) {
        content = <PermissionDenied action="view support users" />;
        break;
      }
      content = <SupportUsersView />;
      break;
    case "user-detail":
      if (!canListSupportUsers(permissions)) {
        content = <PermissionDenied action="view support users" />;
        break;
      }
      content = <SupportUsersView userId={route.userId} />;
      break;
    case "search":
      if (!canExecuteSupportSearch(permissions)) {
        content = <PermissionDenied action="search APZ Support" />;
        break;
      }
      content = <SupportSearchView />;
      break;
    case "analytics":
      if (!canReadSupportAnalytics(permissions)) {
        content = <PermissionDenied action="view support analytics" />;
        break;
      }
      content = <SupportAnalyticsView />;
      break;
    case "help":
      content = <SupportHelpView />;
      break;
    case "settings":
      content = <SupportSettingsView />;
      break;
    default:
      content = (
        <PageShell title="APZ Support" breadcrumbs={["APZ Support", "Unknown"]}>
          <EmptyState
            title="Unknown APZ Support route"
            description="Select an APZ Support sidebar item to continue."
          />
        </PageShell>
      );
  }

  return <SupportRealtimeProvider>{content}</SupportRealtimeProvider>;
}
