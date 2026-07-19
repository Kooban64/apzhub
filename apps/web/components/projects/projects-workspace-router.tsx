"use client";

import { usePathname } from "next/navigation";

import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import { resolveProjectsRoute } from "@/lib/projects/routes";

import { ProjectCreateView } from "./project-create-view";
import { ProjectDetailView } from "./project-detail-view";
import { ProjectsBacklogView } from "./projects-backlog-view";
import { ProjectsDashboardView } from "./projects-dashboard-view";
import { ProjectsHealthView } from "./projects-health-view";
import { ProjectsListView } from "./projects-list-view";
import { ProjectsMyWorkView } from "./projects-my-work-view";
import { ProjectsRoadmapView } from "./projects-roadmap-view";
import { ProjectsSearchView } from "./projects-search-view";
import { ProjectsSprintsView } from "./projects-sprints-view";
import { ProjectsTasksView } from "./projects-tasks-view";
import { EmptyState, PageShell } from "./projects-ui";

const DEFAULT_UI_PERMISSIONS: readonly string[] = ["projects.*"];

export function ProjectsWorkspaceRouter({
  permissions = DEFAULT_UI_PERMISSIONS,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const pathname = usePathname();
  const route = resolveProjectsRoute(pathname);

  switch (route.kind) {
    case "dashboard":
      return <ProjectsDashboardView permissions={permissions} />;
    case "list":
      return <ProjectsListView permissions={permissions} />;
    case "create":
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
      return <ProjectsSearchView />;
    case "health":
      return <ProjectsHealthView />;
    default:
      return (
        <PageShell title="Projects">
          <EmptyState
            title="Unknown Projects route"
            description="Select a Projects sidebar item to continue."
          />
        </PageShell>
      );
  }
}
