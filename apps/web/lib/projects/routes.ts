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
