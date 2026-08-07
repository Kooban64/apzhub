import type { ProjectsRouteResolution } from "./routes";

/** Document title suffix for every APZ Projects surface (WCAG 2.4.2). */
export const PROJECTS_DOCUMENT_TITLE_SUFFIX = "APZ Projects · APZHUB";

/**
 * Builds a non-empty, meaningful document title for Projects screens.
 * Never returns an empty string — blank titles are release-blocking (HD-H2-01).
 */
export function buildProjectsDocumentTitle(pageTitle?: string | null): string {
  const trimmed = pageTitle?.trim() ?? "";
  if (!trimmed || trimmed === "APZ Projects") {
    return PROJECTS_DOCUMENT_TITLE_SUFFIX;
  }
  if (
    trimmed.endsWith(PROJECTS_DOCUMENT_TITLE_SUFFIX) ||
    trimmed === "APZHUB" ||
    trimmed.endsWith("· APZHUB")
  ) {
    return trimmed;
  }
  return `${trimmed} · ${PROJECTS_DOCUMENT_TITLE_SUFFIX}`;
}

/** Human page label for a resolved Projects route (before view-specific refinement). */
export function projectsRoutePageTitle(route: ProjectsRouteResolution): string {
  switch (route.kind) {
    case "dashboard":
      return "Operational Workspace";
    case "list":
      return "All Projects";
    case "create":
      return "Initiate Project";
    case "detail":
      return "Project";
    case "my-work":
      return "My Work";
    case "tasks":
      return "Tasks";
    case "backlog":
      return "Backlog";
    case "sprints":
      return "Sprints";
    case "roadmap":
      return "Roadmap";
    case "search":
      return "Search";
    case "health":
      return "Readiness";
    case "help":
      return "Help";
    case "settings":
      return "Settings";
    case "portfolio-scorecard":
      return "Portfolio Scorecard";
    case "portfolio-workspace":
      return "Portfolio Workspace";
    case "portfolio-timeline":
      return "Portfolio Timeline";
    case "portfolio-admin":
      return "Portfolio Admin";
    case "portfolio-programme":
      return "Programme";
    case "portfolio-initiative":
      return "Initiative";
    case "teams-directory":
      return "Teams";
    case "teams-detail":
      return "Team";
    case "admin-dashboard":
      return "Administration";
    case "admin-governance":
      return "Governance Profiles";
    case "admin-policies":
      return "Operational Policies";
    case "admin-hierarchy":
      return "Hierarchy";
    case "admin-delegations":
      return "Delegations";
    case "admin-compliance":
      return "Compliance";
    case "admin-audit":
      return "Audit";
    case "admin-retention":
      return "Retention";
    case "admin-searches":
      return "Saved Searches";
    case "admin-roles":
      return "Roles";
    case "reviews-calendar":
      return "Reviews";
    case "review-detail":
      return "Review";
    case "reports-catalogue":
      return "Reports";
    case "report-viewer":
      return "Report";
    case "productivity":
      return "Productivity";
    case "unknown":
    default:
      return "APZ Projects";
  }
}

export function projectsRouteDocumentTitle(route: ProjectsRouteResolution): string {
  return buildProjectsDocumentTitle(projectsRoutePageTitle(route));
}

/**
 * Applies a Projects document title in the browser.
 * Safe to call during render so a child throw cannot leave a blank title.
 */
export function applyProjectsDocumentTitle(pageTitle?: string | null): string {
  const next = buildProjectsDocumentTitle(pageTitle);
  if (typeof document !== "undefined" && document.title !== next) {
    document.title = next;
  }
  return next;
}
