/**
 * Prefer engagement source bindings, then repository scope, for SCM sync.
 * Supports GitHub and GitLab CE (SPR-APZPEN-014).
 */

import {
  listProjectSourceBindings,
  type ProjectSourceBinding,
} from "@/lib/commercial/project-source-bindings";
import { addScopeTarget, getTenantEngagement } from "@/lib/apzpen/service";
import type { Engagement } from "@/lib/apzpen/types";

const SCM_HOST_PREFIXES = [/^https?:\/\/github\.com\//i, /^https?:\/\/gitlab\.com\//i];

export function parseOwnerRepo(identifier: string): {
  owner: string;
  repo: string;
  full: string;
} | null {
  let cleaned = identifier.trim();
  for (const re of SCM_HOST_PREFIXES) {
    cleaned = cleaned.replace(re, "");
  }
  cleaned = cleaned
    .replace(/\.git$/i, "")
    .replace(/^\/shared\/repos\/?/i, "")
    .replace(/^\//, "")
    .trim();
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const owner = parts[0]!;
  const repo = parts[1]!;
  return { owner, repo, full: `${owner}/${repo}` };
}

export function listEngagementSourceBindings(
  tenantId: string,
  engagementId: string,
): readonly ProjectSourceBinding[] {
  return listProjectSourceBindings({
    tenantId,
    productKey: "pentest",
    projectId: engagementId,
  });
}

const LIVE_SCM_PROVIDERS = new Set(["github", "gitlab"]);

/**
 * Ensure each GitHub/GitLab source binding appears as a repository scope target.
 */
export function ensureRepositoryScopeFromSourceBindings(
  tenantId: string,
  engagementId: string,
): Engagement {
  const bindings = listEngagementSourceBindings(tenantId, engagementId);
  let eng = getTenantEngagement(tenantId, engagementId);
  for (const binding of bindings) {
    if (!LIVE_SCM_PROVIDERS.has(binding.providerId)) continue;
    const parsed = parseOwnerRepo(binding.externalRef);
    if (!parsed) continue;
    const exists = eng.scope.some(
      (s) =>
        s.kind === "repository" &&
        (parseOwnerRepo(s.identifier)?.full === parsed.full ||
          parseOwnerRepo(s.label)?.full === parsed.full),
    );
    if (exists) continue;
    eng = addScopeTarget(tenantId, engagementId, {
      kind: "repository",
      label: binding.displayName || parsed.full,
      identifier: parsed.full,
      environment: eng.environment,
      notes: `source:${binding.providerId}:${binding.mode}`,
    });
  }
  return eng;
}

export function pickRepositoryForEngagement(engagement: Engagement): string | null {
  const bindings = listEngagementSourceBindings(
    engagement.tenantId,
    engagement.engagementId,
  );
  for (const binding of bindings) {
    if (!LIVE_SCM_PROVIDERS.has(binding.providerId)) continue;
    const parsed = parseOwnerRepo(binding.externalRef);
    if (parsed) return parsed.full;
  }
  const repoScope = engagement.scope.find((s) => s.kind === "repository");
  if (repoScope) {
    const parsed = parseOwnerRepo(repoScope.identifier);
    if (parsed) return parsed.full;
    const fromLabel = parseOwnerRepo(repoScope.label);
    if (fromLabel) return fromLabel.full;
  }
  return null;
}
