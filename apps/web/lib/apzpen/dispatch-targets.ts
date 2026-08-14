/**
 * Client-safe dispatch target helpers (no Node I/O).
 */

import type { ScopeTarget } from "./types";

const FS_TOOLS = new Set([
  "semgrep",
  "gitleaks",
  "trivy",
  "syft",
  "grype",
  "osv",
  "checkov",
  "prowler",
  "kubebench",
]);

const WEB_KINDS = new Set(["web_application", "api", "domain", "host"]);

export function scopeTargetsForTool(
  tool: string,
  scope: readonly ScopeTarget[],
): readonly ScopeTarget[] {
  if (tool === "mobsf") {
    const mobile = scope.filter((s) => s.kind === "mobile");
    return mobile.length > 0 ? mobile : scope;
  }
  if (FS_TOOLS.has(tool)) {
    const repos = scope.filter((s) => s.kind === "repository");
    if (repos.length > 0) return repos;
    if (tool === "nmap" || tool === "testssl") {
      const hosts = scope.filter((s) => WEB_KINDS.has(s.kind));
      return hosts.length > 0 ? hosts : scope;
    }
    return scope;
  }
  const web = scope.filter((s) => WEB_KINDS.has(s.kind));
  return web.length > 0 ? web : scope;
}

export function defaultScopeTargetId(
  tool: string,
  scope: readonly ScopeTarget[],
): string {
  return scopeTargetsForTool(tool, scope)[0]?.identifier ?? "";
}
