/** Platform Configuration route helpers — HTTP (APZCONFIG-003) + workspace (APZCONFIG-004). */

export const CONFIGURATION_API_BASE = "/api/v1/configuration";

/** Workspace base path for the Configuration Workbench (metadata UI only). */
export const CONFIGURATION_WORKSPACE_BASE = "/workspace/configuration";

export const CONFIGURATION_SECTIONS = [
  "overview",
  "configurations",
  "namespaces",
  "groups",
  "versions",
  "overrides",
  "scopes",
  "validation",
  "references",
  "audit",
  "diagnostics",
] as const;

export type ConfigurationSection = (typeof CONFIGURATION_SECTIONS)[number];

/** Forbidden HTTP segments — never shipped under /api/v1/configuration. */
export const CONFIGURATION_FORBIDDEN_HTTP_SEGMENTS = [
  "resolve",
  "effective",
  "evaluate",
  "apply",
  "inject",
  "reload",
  "hot-reload",
  "rollout",
  "rollback",
  "feature-flags",
  "flags",
  "secrets",
  "vault",
  "environment",
  "env",
  "kubernetes",
  "configmaps",
  "events",
  "subscribe",
  "stream",
  "runtime",
] as const;

export function isConfigurationApiPath(pathname: string): boolean {
  return (
    pathname === CONFIGURATION_API_BASE ||
    pathname.startsWith(`${CONFIGURATION_API_BASE}/`)
  );
}

export function assertConfigurationApiPath(pathname: string): void {
  if (!isConfigurationApiPath(pathname)) {
    throw new Error("Configuration client may only call /api/v1/configuration");
  }
  for (const segment of CONFIGURATION_FORBIDDEN_HTTP_SEGMENTS) {
    if (pathname.includes(`/${segment}/`) || pathname.endsWith(`/${segment}`)) {
      throw new Error(`Forbidden configuration HTTP segment: ${segment}`);
    }
  }
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isConfigurationRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return (
    normalized === CONFIGURATION_WORKSPACE_BASE ||
    normalized.startsWith(`${CONFIGURATION_WORKSPACE_BASE}/`)
  );
}

export function resolveConfigurationSection(pathname: string): ConfigurationSection {
  const normalized = normalizePath(pathname);
  if (normalized === CONFIGURATION_WORKSPACE_BASE) return "overview";
  const suffix = normalized.slice(CONFIGURATION_WORKSPACE_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (CONFIGURATION_SECTIONS.includes(section as ConfigurationSection)) {
    return section as ConfigurationSection;
  }
  return "overview";
}

export function configurationSectionPath(section?: ConfigurationSection): string {
  if (!section || section === "overview") {
    return `${CONFIGURATION_WORKSPACE_BASE}/overview`;
  }
  return `${CONFIGURATION_WORKSPACE_BASE}/${section}`;
}
