/**
 * UI-only Projects permission helpers.
 * Server remains authoritative — these only hide/disable controls.
 */

export type ProjectsPermissionSource =
  readonly string[] | ReadonlySet<string> | undefined | null;

function asSet(source: ProjectsPermissionSource): ReadonlySet<string> {
  if (!source) return new Set();
  if (source instanceof Set) return source;
  return new Set(source);
}

function matches(granted: ReadonlySet<string>, required: string): boolean {
  if (granted.has("*") || granted.has("projects.*")) return true;
  if (granted.has(required)) return true;
  const [ns, resource] = required.split(".");
  if (ns && resource && granted.has(`${ns}.${resource}.*`)) return true;
  return false;
}

export function hasProjectsPermission(
  source: ProjectsPermissionSource,
  permission: string,
): boolean {
  return matches(asSet(source), permission);
}

export function canViewProjects(source: ProjectsPermissionSource): boolean {
  return hasProjectsPermission(source, "projects.view");
}

export function canManageProjects(source: ProjectsPermissionSource): boolean {
  return hasProjectsPermission(source, "projects.manage");
}

export function canViewTasks(source: ProjectsPermissionSource): boolean {
  return hasProjectsPermission(source, "projects.task.view");
}

export function canManageTasks(source: ProjectsPermissionSource): boolean {
  return hasProjectsPermission(source, "projects.task.manage");
}

export function canViewSprints(source: ProjectsPermissionSource): boolean {
  return hasProjectsPermission(source, "projects.sprint.view");
}

export function canAdminProjects(source: ProjectsPermissionSource): boolean {
  return hasProjectsPermission(source, "projects.admin");
}
