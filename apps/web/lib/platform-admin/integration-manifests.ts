/**
 * Load integration manifests from disk — source of truth for Providers surface.
 * Never invent Healthy without a real health signal.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type IntegrationManifestSummary = {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly capabilities: readonly string[];
  readonly healthEnabled: boolean;
  readonly path: string;
};

function integrationsRoot(): string {
  const cwd = process.cwd();
  const candidates = [
    join(cwd, "integrations"),
    join(cwd, "..", "integrations"),
    join(cwd, "../..", "integrations"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return join(cwd, "integrations");
}

/** Minimal YAML field extraction — enough for integration.yaml inventory. */
function parseSimpleYaml(text: string): Record<string, unknown> {
  const lines = text.split(/\r?\n/);
  const root: Record<string, unknown> = {};
  let section: string | null = null;
  let listKey: string | null = null;
  const lists: Record<string, string[]> = {};

  for (const raw of lines) {
    const line = raw.replace(/\t/g, "  ");
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const indent = line.match(/^ */)?.[0].length ?? 0;
    const trimmed = line.trim();

    if (indent === 0 && trimmed.endsWith(":") && !trimmed.includes(" ")) {
      section = trimmed.slice(0, -1);
      listKey = null;
      if (!(section in root)) root[section] = {};
      continue;
    }

    if (indent === 0 && trimmed.includes(":")) {
      const idx = trimmed.indexOf(":");
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      root[key] = val;
      section = null;
      listKey = null;
      continue;
    }

    if (section && indent === 2 && trimmed.endsWith(":") && !trimmed.startsWith("-")) {
      const key = trimmed.slice(0, -1);
      listKey = `${section}.${key}`;
      lists[listKey] = [];
      (root[section] as Record<string, unknown>)[key] = lists[listKey];
      continue;
    }

    if (section && indent === 2 && trimmed.includes(":") && !trimmed.startsWith("-")) {
      const idx = trimmed.indexOf(":");
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val === "true") (root[section] as Record<string, unknown>)[key] = true;
      else if (val === "false") (root[section] as Record<string, unknown>)[key] = false;
      else (root[section] as Record<string, unknown>)[key] = val;
      listKey = null;
      continue;
    }

    if (listKey && trimmed.startsWith("- ")) {
      lists[listKey]!.push(trimmed.slice(2).trim());
    }
  }
  return root;
}

/**
 * Capability display name from integration tags (APZ language).
 * Provider id remains implementation language.
 */
export function capabilityFromTags(tags: readonly string[]): string {
  const map: Record<string, string> = {
    projects: "Projects",
    support: "Support",
    time: "Time",
    workflow: "Workflow",
    analytics: "Analytics",
    documents: "Documents",
    search: "Search",
    pentest: "Security",
    qa: "Quality",
    source: "Source",
    cicd: "Source",
    adapter: "",
  };
  for (const tag of tags) {
    const cap = map[tag.toLowerCase()];
    if (cap) return cap;
  }
  return "Platform";
}

export function listIntegrationManifestsFromDisk(): readonly IntegrationManifestSummary[] {
  const root = integrationsRoot();
  if (!existsSync(root)) return [];
  const out: IntegrationManifestSummary[] = [];
  for (const dir of readdirSync(root, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const path = join(root, dir.name, "integration.yaml");
    if (!existsSync(path)) continue;
    try {
      const raw = readFileSync(path, "utf8");
      const parsed = parseSimpleYaml(raw);
      const metadata = (parsed.metadata ?? {}) as Record<string, unknown>;
      const integration = (parsed.integration ?? {}) as Record<string, unknown>;
      const health = (parsed.health ?? {}) as Record<string, unknown>;
      const tags = Array.isArray(metadata.tags) ? (metadata.tags as string[]) : [];
      const capabilities = Array.isArray(integration.capabilities)
        ? (integration.capabilities as string[])
        : [];
      out.push({
        id: String(parsed.id ?? dir.name),
        name: String(parsed.name ?? dir.name),
        version: String(parsed.version ?? ""),
        description: String(metadata.description ?? ""),
        tags,
        capabilities,
        healthEnabled: health.enabled === true,
        path,
      });
    } catch {
      // skip malformed
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

/** Env-based connection posture — never claims Healthy without a live probe. */
export function providerConnectionPosture(providerId: string): {
  readonly connectionConfigured: boolean;
  readonly authConfigured: boolean;
} {
  switch (providerId) {
    case "plane":
      return {
        connectionConfigured: Boolean(
          process.env.PLANE_BASE_URL?.trim() ||
          process.env.PROJECTS_ENGINE_BASE_URL?.trim(),
        ),
        authConfigured: Boolean(
          process.env.PLANE_API_TOKEN?.trim() || process.env.PROJECTS_API_TOKEN?.trim(),
        ),
      };
    case "zammad":
      return {
        connectionConfigured: Boolean(
          process.env.ZAMMAD_BASE_URL?.trim() ||
          process.env.SUPPORT_ENGINE_BASE_URL?.trim(),
        ),
        authConfigured: Boolean(
          process.env.ZAMMAD_API_TOKEN?.trim() || process.env.SUPPORT_API_TOKEN?.trim(),
        ),
      };
    case "kimai":
      return {
        connectionConfigured: Boolean(process.env.KIMAI_BASE_URL?.trim()),
        authConfigured: Boolean(
          process.env.KIMAI_API_TOKEN?.trim() || process.env.KIMAI_TOKEN?.trim(),
        ),
      };
    case "n8n":
      return {
        connectionConfigured: Boolean(process.env.N8N_BASE_URL?.trim()),
        authConfigured: Boolean(process.env.N8N_API_KEY?.trim()),
      };
    case "metabase":
      return {
        connectionConfigured: Boolean(process.env.METABASE_BASE_URL?.trim()),
        authConfigured: Boolean(
          process.env.METABASE_API_KEY?.trim() ||
          process.env.METABASE_SESSION_TOKEN?.trim(),
        ),
      };
    case "paperless":
      return {
        connectionConfigured: Boolean(process.env.PAPERLESS_BASE_URL?.trim()),
        authConfigured: Boolean(process.env.PAPERLESS_TOKEN?.trim()),
      };
    case "meilisearch":
      return {
        connectionConfigured: Boolean(
          process.env.MEILI_HOST?.trim() || process.env.MEILISEARCH_HOST?.trim(),
        ),
        authConfigured: Boolean(
          process.env.MEILI_MASTER_KEY?.trim() ||
          process.env.MEILISEARCH_API_KEY?.trim(),
        ),
      };
    case "github-actions":
    case "gitlab-ci":
    case "qep-github":
      return {
        connectionConfigured: Boolean(
          process.env.GITHUB_TOKEN?.trim() ||
          process.env.GITLAB_TOKEN?.trim() ||
          process.env.SOURCE_GIT_TOKEN?.trim(),
        ),
        authConfigured: Boolean(
          process.env.GITHUB_TOKEN?.trim() ||
          process.env.GITLAB_TOKEN?.trim() ||
          process.env.SOURCE_GIT_TOKEN?.trim(),
        ),
      };
    default:
      return { connectionConfigured: false, authConfigured: false };
  }
}
