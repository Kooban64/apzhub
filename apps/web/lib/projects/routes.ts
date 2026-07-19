/** Projects workspace route helpers (APZHUB-PROJECTS-001). */

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
  "new",
] as const;

export type ProjectsSection = (typeof PROJECTS_SECTIONS)[number];

export type ProjectsRouteResolution =
  | { readonly kind: "dashboard" }
  | { readonly kind: "list" }
  | { readonly kind: "create" }
  | { readonly kind: "detail"; readonly projectId: string; readonly tab?: string }
  | { readonly kind: "my-work" }
  | { readonly kind: "tasks" }
  | { readonly kind: "backlog" }
  | { readonly kind: "sprints" }
  | { readonly kind: "roadmap" }
  | { readonly kind: "search" }
  | { readonly kind: "health" }
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

export function projectCreatePath(): string {
  return `${PROJECTS_BASE}/new`;
}

export function projectsListPath(): string {
  return `${PROJECTS_BASE}/list`;
}
