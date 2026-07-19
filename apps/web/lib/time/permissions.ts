/**
 * UI-only Time permission helpers.
 * Server remains authoritative — these only hide/disable controls.
 */

export type TimePermissionSource =
  readonly string[] | ReadonlySet<string> | undefined | null;

function asSet(source: TimePermissionSource): ReadonlySet<string> {
  if (!source) return new Set();
  if (source instanceof Set) return source;
  return new Set(source);
}

function matches(granted: ReadonlySet<string>, required: string): boolean {
  if (granted.has("*") || granted.has("time.*")) return true;
  if (granted.has(required)) return true;
  const [ns, resource] = required.split(".");
  if (ns && resource && granted.has(`${ns}.${resource}.*`)) return true;
  return false;
}

export function hasTimePermission(
  source: TimePermissionSource,
  permission: string,
): boolean {
  return matches(asSet(source), permission);
}

export function canViewTime(source: TimePermissionSource): boolean {
  return hasTimePermission(source, "time.view");
}

export function canManageTime(source: TimePermissionSource): boolean {
  return hasTimePermission(source, "time.manage");
}

export function canListTimesheets(source: TimePermissionSource): boolean {
  return (
    hasTimePermission(source, "time.timesheet.list") ||
    hasTimePermission(source, "time.view") ||
    canManageTime(source)
  );
}

export function canCreateTimesheets(source: TimePermissionSource): boolean {
  return hasTimePermission(source, "time.timesheet.create") || canManageTime(source);
}

export function canManageTimesheets(source: TimePermissionSource): boolean {
  return (
    hasTimePermission(source, "time.timesheet.manage") ||
    hasTimePermission(source, "time.timesheet.update") ||
    canManageTime(source)
  );
}

export function canListActivities(source: TimePermissionSource): boolean {
  return (
    hasTimePermission(source, "time.activity.list") ||
    hasTimePermission(source, "time.view") ||
    canManageTime(source)
  );
}

export function canCreateActivities(source: TimePermissionSource): boolean {
  return hasTimePermission(source, "time.activity.create") || canManageTime(source);
}

export function canListCustomers(source: TimePermissionSource): boolean {
  return (
    hasTimePermission(source, "time.customer.list") ||
    hasTimePermission(source, "time.view") ||
    canManageTime(source)
  );
}

export function canCreateCustomers(source: TimePermissionSource): boolean {
  return hasTimePermission(source, "time.customer.create") || canManageTime(source);
}

export function canListTags(source: TimePermissionSource): boolean {
  return (
    hasTimePermission(source, "time.tag.list") ||
    hasTimePermission(source, "time.view") ||
    canManageTime(source)
  );
}

export function canCreateTags(source: TimePermissionSource): boolean {
  return hasTimePermission(source, "time.tag.create") || canManageTime(source);
}
