"use client";

import { usePathname } from "next/navigation";

import {
  canAdminProjects,
  canManageProjects,
  canViewProjects,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import { resolveProjectsRoute } from "@/lib/projects/routes";
import { useProjectsPermissions } from "@/lib/projects/use-projects-permissions";

import { ProjectCreateView } from "./project-create-view";
import { ProjectDetailView } from "./project-detail-view";
import { ProjectsBacklogView } from "./projects-backlog-view";
import { ProjectsDashboardView } from "./projects-dashboard-view";
import { ProjectsHealthView } from "./projects-health-view";
import { ProjectsHelpView } from "./projects-help-view";
import { ProjectsListView } from "./projects-list-view";
import { ProjectsMyWorkView } from "./projects-my-work-view";
import { ProjectsRoadmapView } from "./projects-roadmap-view";
import { ProjectsSearchView } from "./projects-search-view";
import { ProjectsSettingsView } from "./projects-settings-view";
import { ProjectsSprintsView } from "./projects-sprints-view";
import { ProjectsTasksView } from "./projects-tasks-view";
import { EmptyState, PageShell } from "./projects-ui";

function PermissionDenied({ action }: { readonly action: string }) {
  return (
    <PageShell
      title="APZ Projects"
      breadcrumbs={["APZ Projects", "Permission required"]}
    >
      <EmptyState
        title="Permission required"
        description={`You do not have permission to ${action}. Contact your APZHUB administrator if you need access.`}
      />
    </PageShell>
  );
}

/**
 * Projects workspace router — consumes APZHUB session permissions.
 * Never defaults to `projects.*`. Never exposes engine identity/roles.
 */
export function ProjectsWorkspaceRouter({
  permissions: permissionsOverride,
}: {
  readonly permissions?: ProjectsPermissionSource;
} = {}) {
  const pathname = usePathname();
  const route = resolveProjectsRoute(pathname);
  const permissions = useProjectsPermissions(permissionsOverride);

  switch (route.kind) {
    case "dashboard":
      return <ProjectsDashboardView permissions={permissions} />;
    case "list":
      return <ProjectsListView permissions={permissions} />;
    case "create":
      if (!canManageProjects(permissions)) {
        return <PermissionDenied action="create projects" />;
      }
      return <ProjectCreateView />;
    case "detail":
      return (
        <ProjectDetailView
          projectId={route.projectId}
          tab={route.tab}
          permissions={permissions}
        />
      );
    case "my-work":
      return <ProjectsMyWorkView permissions={permissions} />;
    case "tasks":
      return <ProjectsTasksView permissions={permissions} />;
    case "backlog":
      return <ProjectsBacklogView permissions={permissions} />;
    case "sprints":
      return <ProjectsSprintsView permissions={permissions} />;
    case "roadmap":
      return <ProjectsRoadmapView permissions={permissions} />;
    case "search":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="search APZ Projects" />;
      }
      return <ProjectsSearchView />;
    case "health":
      if (!canAdminProjects(permissions)) {
        return <PermissionDenied action="view APZ Projects readiness" />;
      }
      return <ProjectsHealthView />;
    case "help":
      return <ProjectsHelpView />;
    case "settings":
      return <ProjectsSettingsView />;
    default:
      return (
        <PageShell title="APZ Projects">
          <EmptyState
            title="Unknown APZ Projects route"
            description="Select an APZ Projects sidebar item to continue."
          />
        </PageShell>
      );
  }
}
