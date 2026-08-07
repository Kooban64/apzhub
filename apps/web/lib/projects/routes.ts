/** Projects workspace route helpers (APZ Projects Native Adoption). */

export const PROJECTS_BASE = "/workspace/projects";

export const PROJECTS_SECTIONS = [
  "list",
  "my-work",
  "tasks",
  "backlog",
  "sprints",
  "roadmap",
  "search",
  "health",
  "help",
  "settings",
  "new",
  "portfolio",
  "teams",
  "admin",
  "reviews",
  "reports",
] as const;

export type ProjectsSection = (typeof PROJECTS_SECTIONS)[number];

export type ProjectsRouteResolution =
  | { readonly kind: "dashboard" }
  | { readonly kind: "list" }
  | { readonly kind: "create" }
  | {
      readonly kind: "detail";
      readonly projectId: string;
      /** Path segment after project id — cockpit intent or legacy tab. */
      readonly tab?: string;
    }
  | { readonly kind: "my-work" }
  | { readonly kind: "tasks" }
  | { readonly kind: "backlog" }
  | { readonly kind: "sprints" }
  | { readonly kind: "roadmap" }
  | { readonly kind: "search" }
  | { readonly kind: "health" }
  | { readonly kind: "help" }
  | { readonly kind: "settings" }
  | { readonly kind: "portfolio-scorecard" }
  | { readonly kind: "portfolio-workspace" }
  | { readonly kind: "portfolio-timeline" }
  | { readonly kind: "portfolio-admin" }
  | { readonly kind: "portfolio-programme"; readonly programmeId: string }
  | { readonly kind: "portfolio-initiative"; readonly initiativeId: string }
  | { readonly kind: "teams-directory" }
  | { readonly kind: "teams-detail"; readonly teamId: string }
  | { readonly kind: "admin-dashboard" }
  | { readonly kind: "admin-governance" }
  | { readonly kind: "admin-policies" }
  | { readonly kind: "admin-hierarchy" }
  | { readonly kind: "admin-delegations" }
  | { readonly kind: "admin-compliance" }
  | { readonly kind: "admin-audit" }
  | { readonly kind: "admin-retention" }
  | { readonly kind: "admin-searches" }
  | { readonly kind: "admin-roles" }
  | { readonly kind: "reviews-calendar" }
  | { readonly kind: "review-detail"; readonly reviewId: string }
  | { readonly kind: "reports-catalogue" }
  | { readonly kind: "report-viewer"; readonly reportKey: string }
  | { readonly kind: "productivity" }
  | { readonly kind: "unknown" };

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isProjectsRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === PROJECTS_BASE || normalized.startsWith(`${PROJECTS_BASE}/`);
}

export function resolveProjectsRoute(pathname: string): ProjectsRouteResolution {
  const normalized = normalizePath(pathname);
  if (!isProjectsRoute(normalized)) {
    return { kind: "unknown" };
  }

  if (normalized === PROJECTS_BASE) {
    return { kind: "dashboard" };
  }

  if (normalized === `${PROJECTS_BASE}/list`) {
    return { kind: "list" };
  }

  if (
    normalized === `${PROJECTS_BASE}/new` ||
    normalized === `${PROJECTS_BASE}/create`
  ) {
    return { kind: "create" };
  }

  if (normalized === `${PROJECTS_BASE}/my-work`) {
    return { kind: "my-work" };
  }

  if (normalized === `${PROJECTS_BASE}/tasks`) {
    return { kind: "tasks" };
  }

  if (normalized === `${PROJECTS_BASE}/backlog`) {
    return { kind: "backlog" };
  }

  if (normalized === `${PROJECTS_BASE}/sprints`) {
    return { kind: "sprints" };
  }

  if (normalized === `${PROJECTS_BASE}/roadmap`) {
    return { kind: "roadmap" };
  }

  if (normalized === `${PROJECTS_BASE}/search`) {
    return { kind: "search" };
  }

  if (normalized === `${PROJECTS_BASE}/health`) {
    return { kind: "health" };
  }

  if (normalized === `${PROJECTS_BASE}/help`) {
    return { kind: "help" };
  }

  if (normalized === `${PROJECTS_BASE}/settings`) {
    return { kind: "settings" };
  }

  if (normalized === `${PROJECTS_BASE}/portfolio`) {
    return { kind: "portfolio-scorecard" };
  }
  if (normalized === `${PROJECTS_BASE}/portfolio/workspace`) {
    return { kind: "portfolio-workspace" };
  }
  if (normalized === `${PROJECTS_BASE}/portfolio/timeline`) {
    return { kind: "portfolio-timeline" };
  }
  if (normalized === `${PROJECTS_BASE}/portfolio/admin`) {
    return { kind: "portfolio-admin" };
  }

  if (normalized === `${PROJECTS_BASE}/teams`) {
    return { kind: "teams-directory" };
  }
  const teamMatch = normalized.match(new RegExp(`^${PROJECTS_BASE}/teams/([^/]+)$`));
  if (teamMatch?.[1]) {
    return {
      kind: "teams-detail",
      teamId: decodeURIComponent(teamMatch[1]),
    };
  }

  if (normalized === `${PROJECTS_BASE}/admin`) {
    return { kind: "admin-dashboard" };
  }
  if (normalized === `${PROJECTS_BASE}/admin/governance`) {
    return { kind: "admin-governance" };
  }
  if (normalized === `${PROJECTS_BASE}/admin/policies`) {
    return { kind: "admin-policies" };
  }
  if (normalized === `${PROJECTS_BASE}/admin/hierarchy`) {
    return { kind: "admin-hierarchy" };
  }
  if (normalized === `${PROJECTS_BASE}/admin/delegations`) {
    return { kind: "admin-delegations" };
  }
  if (normalized === `${PROJECTS_BASE}/admin/compliance`) {
    return { kind: "admin-compliance" };
  }
  if (normalized === `${PROJECTS_BASE}/admin/audit`) {
    return { kind: "admin-audit" };
  }
  if (normalized === `${PROJECTS_BASE}/admin/retention`) {
    return { kind: "admin-retention" };
  }
  if (normalized === `${PROJECTS_BASE}/admin/searches`) {
    return { kind: "admin-searches" };
  }
  if (normalized === `${PROJECTS_BASE}/admin/roles`) {
    return { kind: "admin-roles" };
  }

  if (normalized === `${PROJECTS_BASE}/reviews`) {
    return { kind: "reviews-calendar" };
  }
  const reviewMatch = normalized.match(
    new RegExp(`^${PROJECTS_BASE}/reviews/([^/]+)$`),
  );
  if (reviewMatch?.[1]) {
    return {
      kind: "review-detail",
      reviewId: decodeURIComponent(reviewMatch[1]),
    };
  }

  if (normalized === `${PROJECTS_BASE}/productivity`) {
    return { kind: "productivity" };
  }

  if (normalized === `${PROJECTS_BASE}/reports`) {
    return { kind: "reports-catalogue" };
  }
  const reportMatch = normalized.match(
    new RegExp(`^${PROJECTS_BASE}/reports/([^/]+)$`),
  );
  if (reportMatch?.[1]) {
    return {
      kind: "report-viewer",
      reportKey: decodeURIComponent(reportMatch[1]),
    };
  }

  const programmeMatch = normalized.match(
    new RegExp(`^${PROJECTS_BASE}/portfolio/programmes/([^/]+)$`),
  );
  if (programmeMatch?.[1]) {
    return {
      kind: "portfolio-programme",
      programmeId: decodeURIComponent(programmeMatch[1]),
    };
  }

  const initiativeMatch = normalized.match(
    new RegExp(`^${PROJECTS_BASE}/portfolio/initiatives/([^/]+)$`),
  );
  if (initiativeMatch?.[1]) {
    return {
      kind: "portfolio-initiative",
      initiativeId: decodeURIComponent(initiativeMatch[1]),
    };
  }

  const prefix = `${PROJECTS_BASE}/`;
  if (normalized.startsWith(prefix)) {
    const rest = normalized.slice(prefix.length);
    const [first, second] = rest.split("/");
    if (
      first &&
      !PROJECTS_SECTIONS.includes(first as ProjectsSection) &&
      first.startsWith("proj_")
    ) {
      return {
        kind: "detail",
        projectId: first,
        tab: second || undefined,
      };
    }
  }

  return { kind: "unknown" };
}

export function projectDetailPath(projectId: string, tab?: string): string {
  return tab ? `${PROJECTS_BASE}/${projectId}/${tab}` : `${PROJECTS_BASE}/${projectId}`;
}

/** @deprecated Prefer cockpitPath from cockpit-intents for intent-aware URLs. */
export function projectCockpitPath(
  projectId: string,
  intent?: string,
  surface?: string,
): string {
  const base =
    !intent || intent === "overview"
      ? `${PROJECTS_BASE}/${projectId}`
      : `${PROJECTS_BASE}/${projectId}/${intent}`;
  if (!surface) return base;
  return `${base}?surface=${encodeURIComponent(surface)}`;
}

export function projectCreatePath(resumeProjectId?: string): string {
  if (resumeProjectId) {
    return `${PROJECTS_BASE}/new?resume=${encodeURIComponent(resumeProjectId)}`;
  }
  return `${PROJECTS_BASE}/new`;
}

export function projectsListPath(): string {
  return `${PROJECTS_BASE}/list`;
}

export function projectsHelpPath(): string {
  return `${PROJECTS_BASE}/help`;
}

export function projectsSettingsPath(): string {
  return `${PROJECTS_BASE}/settings`;
}

export function projectsDashboardPath(): string {
  return PROJECTS_BASE;
}

export function projectsSearchPath(): string {
  return `${PROJECTS_BASE}/search`;
}

export function portfolioScorecardPath(): string {
  return `${PROJECTS_BASE}/portfolio`;
}

export function portfolioWorkspacePath(): string {
  return `${PROJECTS_BASE}/portfolio/workspace`;
}

export function portfolioTimelinePath(): string {
  return `${PROJECTS_BASE}/portfolio/timeline`;
}

export function portfolioProgrammePath(programmeId: string): string {
  return `${PROJECTS_BASE}/portfolio/programmes/${encodeURIComponent(programmeId)}`;
}

export function portfolioInitiativePath(initiativeId: string): string {
  return `${PROJECTS_BASE}/portfolio/initiatives/${encodeURIComponent(initiativeId)}`;
}

export function portfolioAdminPath(): string {
  return `${PROJECTS_BASE}/portfolio/admin`;
}

export function teamsDirectoryPath(): string {
  return `${PROJECTS_BASE}/teams`;
}

export function teamSurfacePath(teamId: string): string {
  return `${PROJECTS_BASE}/teams/${encodeURIComponent(teamId)}`;
}

export function projectsAdminPath(): string {
  return `${PROJECTS_BASE}/admin`;
}

export function projectsAdminGovernancePath(): string {
  return `${PROJECTS_BASE}/admin/governance`;
}

export function projectsAdminPoliciesPath(): string {
  return `${PROJECTS_BASE}/admin/policies`;
}

export function projectsAdminHierarchyPath(): string {
  return `${PROJECTS_BASE}/admin/hierarchy`;
}

export function projectsAdminDelegationsPath(): string {
  return `${PROJECTS_BASE}/admin/delegations`;
}

export function projectsAdminCompliancePath(): string {
  return `${PROJECTS_BASE}/admin/compliance`;
}

export function projectsAdminAuditPath(): string {
  return `${PROJECTS_BASE}/admin/audit`;
}

export function projectsAdminRetentionPath(): string {
  return `${PROJECTS_BASE}/admin/retention`;
}

export function projectsAdminSearchesPath(): string {
  return `${PROJECTS_BASE}/admin/searches`;
}

export function projectsAdminRolesPath(): string {
  return `${PROJECTS_BASE}/admin/roles`;
}

export function reviewsCalendarPath(): string {
  return `${PROJECTS_BASE}/reviews`;
}

export function reviewDetailPath(reviewId: string): string {
  return `${PROJECTS_BASE}/reviews/${encodeURIComponent(reviewId)}`;
}

export function reportsCataloguePath(): string {
  return `${PROJECTS_BASE}/reports`;
}

export function reportViewerPath(reportKey: string): string {
  return `${PROJECTS_BASE}/reports/${encodeURIComponent(reportKey)}`;
}

export function projectsProductivityPath(): string {
  return `${PROJECTS_BASE}/productivity`;
}
