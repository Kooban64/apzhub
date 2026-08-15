"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  canAdminProjects,
  canManageProjects,
  canViewProjects,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import { projectsRoutePageTitle } from "@/lib/projects/document-title";
import { resolveProjectsRoute } from "@/lib/projects/routes";
import { useProjectsDocumentTitle } from "@/lib/projects/use-projects-document-title";
import { useProjectsPermissions } from "@/lib/projects/use-projects-permissions";

import { ProjectsSurfaceErrorBoundary } from "./projects-surface-error-boundary";

import { ProjectCreateView } from "./project-create-view";
import { ProjectDetailView } from "./project-detail-view";
import { ProjectsBacklogView } from "./projects-backlog-view";
import { OperationalWorkspaceView } from "./operational-workspace-view";
import { GovernanceProfilesAdminView } from "./governance-profiles-admin-view";
import { OperationalPoliciesAdminView } from "./operational-policies-admin-view";
import { PortfolioAdminView } from "./portfolio-admin-view";
import { PortfolioNodeWorkspaceView } from "./portfolio-node-workspace-view";
import { PortfolioScorecardView } from "./portfolio-scorecard-view";
import { PortfolioTimelineView } from "./portfolio-timeline-view";
import { PortfolioWorkspaceView } from "./portfolio-workspace-view";
import { OperationalReviewView } from "./operational-review-view";
import { ProjectsAdminDashboardView } from "./projects-admin-dashboard-view";
import { ProjectsAdminRegistryView } from "./projects-admin-registries-view";
import { ProjectsHealthView } from "./projects-health-view";
import { ReportsCatalogueView, ReportViewerView } from "./reports-catalogue-view";
import { ReviewsCalendarView } from "./reviews-calendar-view";
import { ProjectsHelpView } from "./projects-help-view";
import { ProjectsListView } from "./projects-list-view";
import { ProjectsMyWorkView } from "./projects-my-work-view";
import { ProjectsRoadmapView } from "./projects-roadmap-view";
import { ProjectsProductivityView } from "./projects-productivity-view";
import { ProjectsSearchView } from "./projects-search-view";
import { ProjectsSettingsView } from "./projects-settings-view";
import { ProjectsSprintsView } from "./projects-sprints-view";
import { ProjectsTasksView } from "./projects-tasks-view";
import { EmptyState, PageShell, LoadingState } from "./projects-ui";
import { TeamSurfaceView } from "./team-surface-view";
import { TeamsDirectoryView } from "./teams-directory-view";

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

function ProductAccessDenied() {
  return (
    <PageShell title="APZ Projects" breadcrumbs={["APZ Projects", "Product required"]}>
      <EmptyState
        title="Projects not entitled"
        description="Your organisation or account is not entitled to APZ Projects. Ask an administrator to enable the Projects package."
      />
    </PageShell>
  );
}

function useProjectsProductEntitled(): boolean | null {
  const [entitled, setEntitled] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/me/home-context", { cache: "no-store" });
        const body = (await res.json()) as {
          data?: { entitlements?: { productKeys?: readonly string[] } };
        };
        if (cancelled) return;
        const keys = body.data?.entitlements?.productKeys ?? [];
        // Soft: if entitlements absent/empty (bootstrap), allow; else require projects.
        setEntitled(keys.length === 0 || keys.includes("projects"));
      } catch {
        if (!cancelled) setEntitled(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return entitled;
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
  const productEntitled = useProjectsProductEntitled();
  // Baseline title before the active view refines it (loading / crash safety).
  useProjectsDocumentTitle(projectsRoutePageTitle(route));

  if (productEntitled === null) {
    return (
      <PageShell title="APZ Projects" breadcrumbs={["APZ Projects"]}>
        <LoadingState label="Checking product access…" />
      </PageShell>
    );
  }
  if (!productEntitled) {
    return <ProductAccessDenied />;
  }

  return (
    <ProjectsSurfaceErrorBoundary>
      <ProjectsRouteSwitch route={route} permissions={permissions} />
    </ProjectsSurfaceErrorBoundary>
  );
}

function ProjectsRouteSwitch({
  route,
  permissions,
}: {
  readonly route: ReturnType<typeof resolveProjectsRoute>;
  readonly permissions: ReturnType<typeof useProjectsPermissions>;
}) {
  switch (route.kind) {
    case "dashboard":
      return <OperationalWorkspaceView permissions={permissions} />;
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
    case "productivity":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="view productivity aids" />;
      }
      return <ProjectsProductivityView />;
    case "health":
      if (!canAdminProjects(permissions)) {
        return <PermissionDenied action="view APZ Projects readiness" />;
      }
      return <ProjectsHealthView />;
    case "help":
      return <ProjectsHelpView />;
    case "settings":
      return <ProjectsSettingsView />;
    case "portfolio-scorecard":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="view portfolio" />;
      }
      return <PortfolioScorecardView permissions={permissions} />;
    case "portfolio-workspace":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="view portfolio workspace" />;
      }
      return <PortfolioWorkspaceView permissions={permissions} />;
    case "portfolio-timeline":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="view portfolio timeline" />;
      }
      return <PortfolioTimelineView permissions={permissions} />;
    case "portfolio-admin":
      if (!canManageProjects(permissions) && !canAdminProjects(permissions)) {
        return <PermissionDenied action="administer portfolio hierarchy" />;
      }
      return <PortfolioAdminView permissions={permissions} />;
    case "portfolio-programme":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="view programme workspace" />;
      }
      return (
        <PortfolioNodeWorkspaceView
          kind="programme"
          nodeId={route.programmeId}
          permissions={permissions}
        />
      );
    case "portfolio-initiative":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="view initiative workspace" />;
      }
      return (
        <PortfolioNodeWorkspaceView
          kind="initiative"
          nodeId={route.initiativeId}
          permissions={permissions}
        />
      );
    case "teams-directory":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="view teams directory" />;
      }
      return <TeamsDirectoryView permissions={permissions} />;
    case "teams-detail":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="view team surface" />;
      }
      return <TeamSurfaceView teamId={route.teamId} permissions={permissions} />;
    case "admin-dashboard":
      if (!canAdminProjects(permissions)) {
        return <PermissionDenied action="administer APZ Projects" />;
      }
      return <ProjectsAdminDashboardView permissions={permissions} />;
    case "admin-governance":
      if (!canAdminProjects(permissions)) {
        return <PermissionDenied action="administer governance profiles" />;
      }
      return <GovernanceProfilesAdminView permissions={permissions} />;
    case "admin-policies":
      if (!canAdminProjects(permissions)) {
        return <PermissionDenied action="administer operational policies" />;
      }
      return <OperationalPoliciesAdminView permissions={permissions} />;
    case "admin-hierarchy":
      if (!canAdminProjects(permissions)) {
        return <PermissionDenied action="view configuration hierarchy" />;
      }
      return (
        <ProjectsAdminRegistryView registry="hierarchy" permissions={permissions} />
      );
    case "admin-delegations":
      if (!canAdminProjects(permissions)) {
        return <PermissionDenied action="manage delegations" />;
      }
      return (
        <ProjectsAdminRegistryView registry="delegations" permissions={permissions} />
      );
    case "admin-compliance":
      if (!canAdminProjects(permissions)) {
        return <PermissionDenied action="view governance compliance" />;
      }
      return (
        <ProjectsAdminRegistryView registry="compliance" permissions={permissions} />
      );
    case "admin-audit":
      if (!canAdminProjects(permissions)) {
        return <PermissionDenied action="view governance audit" />;
      }
      return <ProjectsAdminRegistryView registry="audit" permissions={permissions} />;
    case "admin-retention":
      if (!canAdminProjects(permissions)) {
        return <PermissionDenied action="administer retention" />;
      }
      return (
        <ProjectsAdminRegistryView registry="retention" permissions={permissions} />
      );
    case "admin-searches":
      if (!canAdminProjects(permissions)) {
        return <PermissionDenied action="administer governed searches" />;
      }
      return (
        <ProjectsAdminRegistryView registry="searches" permissions={permissions} />
      );
    case "admin-roles":
      if (!canAdminProjects(permissions)) {
        return <PermissionDenied action="administer operational roles" />;
      }
      return <ProjectsAdminRegistryView registry="roles" permissions={permissions} />;
    case "reviews-calendar":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="view reviews" />;
      }
      return <ReviewsCalendarView permissions={permissions} />;
    case "review-detail":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="view operational review" />;
      }
      return (
        <OperationalReviewView reviewId={route.reviewId} permissions={permissions} />
      );
    case "reports-catalogue":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="view reports" />;
      }
      return <ReportsCatalogueView permissions={permissions} />;
    case "report-viewer":
      if (!canViewProjects(permissions)) {
        return <PermissionDenied action="view report" />;
      }
      return <ReportViewerView reportKey={route.reportKey} permissions={permissions} />;
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
