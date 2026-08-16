/**
 * UI-only Support permission helpers.
 * Server remains authoritative — these only hide/disable controls.
 *
 * APZ-SUPPORT-NATIVE-001-N02: consume APZHUB session grants via hydration.
 * Never hardcode `support.*` as a UI default. Never map engine roles.
 */

export type SupportPermissionSource =
  readonly string[] | ReadonlySet<string> | undefined | null;

function asSet(source: SupportPermissionSource): ReadonlySet<string> {
  if (!source) return new Set();
  if (source instanceof Set) return source;
  return new Set(source);
}

function matches(granted: ReadonlySet<string>, required: string): boolean {
  if (granted.has("*") || granted.has("support.*")) return true;
  if (granted.has(required)) return true;
  const [ns, resource] = required.split(".");
  if (ns && resource && granted.has(`${ns}.${resource}.*`)) return true;
  return false;
}

export function hasSupportPermission(
  source: SupportPermissionSource,
  permission: string,
): boolean {
  return matches(asSet(source), permission);
}

export function canListSupportRequests(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.requests.list");
}

export function canCreateSupportRequest(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.requests.create");
}

export function canUpdateSupportRequest(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.requests.update");
}

export function canAssignSupportRequest(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.requests.assign");
}

export function canTransitionSupportRequest(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.requests.transition");
}

export function canCreateSupportArticle(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.articles.create");
}

export function canListSupportArticles(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.articles.list");
}

export function canReadSupportArticles(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.articles.read");
}

export function canListOrganizations(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.organizations.list");
}

export function canCreateOrganization(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.organizations.create");
}

export function canUpdateOrganization(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.organizations.update");
}

export function canArchiveOrganization(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.organizations.archive");
}

export function canListGroups(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.groups.list");
}

export function canCreateGroup(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.groups.create");
}

export function canUpdateGroup(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.groups.update");
}

export function canListSupportUsers(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.users.list");
}

export function canExecuteSupportSearch(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.search.execute");
}

export function canReadSupportAnalytics(source: SupportPermissionSource): boolean {
  return hasSupportPermission(source, "support.analytics.read");
}

/**
 * Agent vs requester UX mode (Stream 4).
 * Agents can assign/transition; requesters only see their simple request experience.
 */
export function isSupportAgent(source: SupportPermissionSource): boolean {
  return (
    canAssignSupportRequest(source) ||
    canTransitionSupportRequest(source) ||
    hasSupportPermission(source, "support.groups.list") ||
    hasSupportPermission(source, "support.users.list")
  );
}

export function isSupportRequesterOnly(source: SupportPermissionSource): boolean {
  return canListSupportRequests(source) && !isSupportAgent(source);
}
