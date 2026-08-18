import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type LocalSecretsLoadResult = {
  readonly root: string;
  readonly loadedFiles: readonly string[];
  readonly appliedKeys: readonly string[];
};

function resolveSecretsRoot(explicit?: string): string {
  if (explicit && explicit.trim()) {
    return path.resolve(explicit.trim());
  }
  if (process.env.APZHUB_SECRETS_DIR?.trim()) {
    return path.resolve(process.env.APZHUB_SECRETS_DIR.trim());
  }
  if (process.env.APZHUB_WORKSPACE_ROOT?.trim()) {
    return path.resolve(process.env.APZHUB_WORKSPACE_ROOT.trim(), ".secrets");
  }
  return path.resolve(process.cwd(), ".secrets");
}

function parseKeyValueFile(contents: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function applyIfAbsent(key: string, value: string, applied: string[]): void {
  const current = process.env[key];
  if (current !== undefined && current.trim() !== "") {
    return;
  }
  process.env[key] = value;
  applied.push(key);
}

/**
 * Load operator secrets from `.secrets/` into `process.env` (fill-only).
 * Never overwrites variables already set in the environment / `.env`.
 *
 * Expected files (gitignored):
 * - `.secrets/smtp` — SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 * - `.secrets/openai` — raw key or OPENAI_API_KEY=...
 * - `.secrets/git` — ghp_… token and/or GITHUB_TOKEN=…, username=, login=
 * - `.secrets/meilisearch` — MEILI_MASTER_KEY / SEARCH_MEILISEARCH_API_KEY
 * - `.secrets/plane` — PLANE_API_TOKEN (+ optional PLANE_WORKSPACE_ID / WEBHOOK_SECRET)
 * - `.secrets/zammad` — ZAMMAD_API_TOKEN
 * - `.secrets/kimai` — KIMAI_API_TOKEN
 * - `.secrets/metabase` — METABASE_API_KEY
 * - `.secrets/n8n` — APZHUB_WORKFLOW_ENGINE_API_KEY (or N8N_API_KEY)
 * - `.secrets/paperless` — PAPERLESS_API_TOKEN
 * - `.secrets/github-app` — GITHUB_APP_ID / INSTALLATION_ID / PRIVATE_KEY (+ optional webhook secret)
 * - `.secrets/payfast-production.env` — PAYFAST_MERCHANT_ID / KEY / PASSPHRASE / SANDBOX
 */
export function loadLocalSecrets(options?: {
  readonly secretsDir?: string;
}): LocalSecretsLoadResult {
  const root = resolveSecretsRoot(options?.secretsDir);
  const loadedFiles: string[] = [];
  const applied: string[] = [];

  if (!existsSync(root)) {
    return { root, loadedFiles, appliedKeys: applied };
  }

  const smtpPath = path.join(root, "smtp");
  if (existsSync(smtpPath)) {
    loadedFiles.push("smtp");
    const kv = parseKeyValueFile(readFileSync(smtpPath, "utf8"));
    for (const key of [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASS",
      "SMTP_FROM",
    ] as const) {
      const value = kv[key];
      if (value) {
        applyIfAbsent(
          key,
          key === "SMTP_PASS" ? value.replace(/\s+/g, "") : value,
          applied,
        );
      }
    }
    if (kv.SMTP_FROM) {
      applyIfAbsent("EMAIL_FROM", kv.SMTP_FROM, applied);
    }
  }

  const openaiPath = path.join(root, "openai");
  if (existsSync(openaiPath)) {
    loadedFiles.push("openai");
    const raw = readFileSync(openaiPath, "utf8").trim();
    const kv = parseKeyValueFile(raw);
    const key =
      kv.OPENAI_API_KEY?.trim() ||
      (raw.includes("=")
        ? undefined
        : raw
            .split(/\r?\n/)
            .find((l) => l.trim() && !l.startsWith("#"))
            ?.trim());
    if (key) {
      applyIfAbsent("OPENAI_API_KEY", key, applied);
    }
  }

  const gitPath = path.join(root, "git");
  if (existsSync(gitPath)) {
    loadedFiles.push("git");
    const raw = readFileSync(gitPath, "utf8").trim();
    const kv = parseKeyValueFile(raw);
    const token =
      kv.GITHUB_TOKEN?.trim() ||
      kv.GH_TOKEN?.trim() ||
      raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find((l) => l.startsWith("ghp_") || l.startsWith("github_pat_"));
    if (token) {
      applyIfAbsent("GITHUB_TOKEN", token, applied);
      applyIfAbsent("APZHUB_SCM_GITHUB_TOKEN", token, applied);
    }
    if (kv.username) {
      applyIfAbsent("GITHUB_USERNAME", kv.username, applied);
    }
    if (kv.login) {
      applyIfAbsent("GITHUB_LOGIN", kv.login, applied);
    }
  }

  const meiliPath = path.join(root, "meilisearch");
  if (existsSync(meiliPath)) {
    loadedFiles.push("meilisearch");
    const raw = readFileSync(meiliPath, "utf8").trim();
    const kv = parseKeyValueFile(raw);
    const key =
      kv.SEARCH_MEILISEARCH_API_KEY?.trim() ||
      kv.MEILI_MASTER_KEY?.trim() ||
      kv.MEILI_KEY?.trim() ||
      (raw.includes("=")
        ? undefined
        : raw
            .split(/\r?\n/)
            .map((l) => l.trim())
            .find((l) => l && !l.startsWith("#")));
    if (key) {
      applyIfAbsent("MEILI_MASTER_KEY", key, applied);
      applyIfAbsent("SEARCH_MEILISEARCH_API_KEY", key, applied);
    }
  }

  const planePath = path.join(root, "plane");
  if (existsSync(planePath)) {
    loadedFiles.push("plane");
    const kv = parseKeyValueFile(readFileSync(planePath, "utf8"));
    if (kv.PLANE_API_TOKEN) {
      applyIfAbsent("PLANE_API_TOKEN", kv.PLANE_API_TOKEN.replace(/\s+/g, ""), applied);
    }
    if (kv.PLANE_WORKSPACE_ID) {
      applyIfAbsent("PLANE_WORKSPACE_ID", kv.PLANE_WORKSPACE_ID.trim(), applied);
    }
    if (kv.PLANE_WEBHOOK_SECRET) {
      applyIfAbsent("PLANE_WEBHOOK_SECRET", kv.PLANE_WEBHOOK_SECRET.trim(), applied);
    }
  }

  const zammadPath = path.join(root, "zammad");
  if (existsSync(zammadPath)) {
    loadedFiles.push("zammad");
    const kv = parseKeyValueFile(readFileSync(zammadPath, "utf8"));
    if (kv.ZAMMAD_API_TOKEN) {
      applyIfAbsent(
        "ZAMMAD_API_TOKEN",
        kv.ZAMMAD_API_TOKEN.replace(/\s+/g, ""),
        applied,
      );
    }
  }

  const kimaiPath = path.join(root, "kimai");
  if (existsSync(kimaiPath)) {
    loadedFiles.push("kimai");
    const kv = parseKeyValueFile(readFileSync(kimaiPath, "utf8"));
    if (kv.KIMAI_API_TOKEN) {
      applyIfAbsent("KIMAI_API_TOKEN", kv.KIMAI_API_TOKEN.replace(/\s+/g, ""), applied);
    }
  }

  const metabasePath = path.join(root, "metabase");
  if (existsSync(metabasePath)) {
    loadedFiles.push("metabase");
    const raw = readFileSync(metabasePath, "utf8");
    const kv = parseKeyValueFile(raw);
    let apiKey = kv.METABASE_API_KEY?.replace(/\s+/g, "");
    if (!apiKey) {
      // Allow raw mb_… key file (legacy portal-v2 layout).
      const trimmed = raw.trim().replace(/\s+/g, "");
      if (trimmed.startsWith("mb_")) {
        apiKey = trimmed;
      }
    }
    if (apiKey) {
      applyIfAbsent("METABASE_API_KEY", apiKey, applied);
    }
  }

  const n8nPath = path.join(root, "n8n");
  if (existsSync(n8nPath)) {
    loadedFiles.push("n8n");
    const raw = readFileSync(n8nPath, "utf8");
    const kv = parseKeyValueFile(raw);
    let apiKey =
      kv.APZHUB_WORKFLOW_ENGINE_API_KEY?.replace(/\s+/g, "") ||
      kv.N8N_API_KEY?.replace(/\s+/g, "");
    if (!apiKey) {
      // Allow raw JWT / opaque key file (legacy portal-v2 layout).
      const trimmed = raw.trim().replace(/\s+/g, "");
      if (trimmed.length >= 16) {
        apiKey = trimmed;
      }
    }
    if (apiKey) {
      applyIfAbsent("APZHUB_WORKFLOW_ENGINE_API_KEY", apiKey, applied);
    }
  }

  const paperlessPath = path.join(root, "paperless");
  if (existsSync(paperlessPath)) {
    loadedFiles.push("paperless");
    const raw = readFileSync(paperlessPath, "utf8");
    const kv = parseKeyValueFile(raw);
    const apiToken =
      kv.PAPERLESS_API_TOKEN?.replace(/\s+/g, "") ||
      (raw.includes("=") ? undefined : raw.trim().replace(/\s+/g, ""));
    if (apiToken) {
      applyIfAbsent("PAPERLESS_API_TOKEN", apiToken, applied);
    }
  }

  const githubAppPath = path.join(root, "github-app");
  if (existsSync(githubAppPath)) {
    loadedFiles.push("github-app");
    const raw = readFileSync(githubAppPath, "utf8");
    const kv = parseKeyValueFile(raw);
    if (kv.GITHUB_APP_ID) applyIfAbsent("GITHUB_APP_ID", kv.GITHUB_APP_ID, applied);
    if (kv.GITHUB_APP_INSTALLATION_ID) {
      applyIfAbsent(
        "GITHUB_APP_INSTALLATION_ID",
        kv.GITHUB_APP_INSTALLATION_ID,
        applied,
      );
    }
    if (kv.APZPEN_GITHUB_WEBHOOK_SECRET) {
      applyIfAbsent(
        "APZPEN_GITHUB_WEBHOOK_SECRET",
        kv.APZPEN_GITHUB_WEBHOOK_SECRET,
        applied,
      );
    }
    let privateKey = kv.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
    if (!privateKey) {
      const begin = raw.indexOf("-----BEGIN");
      const end = raw.indexOf("-----END");
      if (begin >= 0 && end > begin) {
        const endLine = raw.indexOf("\n", end);
        privateKey = raw.slice(begin, endLine >= 0 ? endLine : raw.length).trim();
      }
    }
    if (privateKey) {
      applyIfAbsent("GITHUB_APP_PRIVATE_KEY", privateKey, applied);
    }
  }

  const githubAppPem = path.join(root, "github-app.pem");
  if (existsSync(githubAppPem)) {
    loadedFiles.push("github-app.pem");
    const pem = readFileSync(githubAppPem, "utf8").trim();
    if (pem.includes("BEGIN")) {
      applyIfAbsent("GITHUB_APP_PRIVATE_KEY", pem, applied);
    }
  }

  const payfastPath = path.join(root, "payfast-production.env");
  if (existsSync(payfastPath)) {
    loadedFiles.push("payfast-production.env");
    const kv = parseKeyValueFile(readFileSync(payfastPath, "utf8"));
    for (const key of [
      "PAYFAST_MERCHANT_ID",
      "PAYFAST_MERCHANT_KEY",
      "PAYFAST_PASSPHRASE",
      "PAYFAST_SANDBOX",
    ] as const) {
      const value = kv[key];
      if (value !== undefined && value !== "") {
        applyIfAbsent(key, value, applied);
      } else if (key === "PAYFAST_PASSPHRASE" && kv[key] === "") {
        applyIfAbsent(key, "", applied);
      }
    }
    if (kv.PAYFAST_SANDBOX) {
      applyIfAbsent("PAYFAST_SANDBOX", kv.PAYFAST_SANDBOX, applied);
    }
  }

  return { root, loadedFiles, appliedKeys: applied };
}

let loaded = false;

/** Idempotent process-wide load (safe to call from getEnv / instrumentation). */
export function ensureLocalSecretsLoaded(options?: {
  readonly secretsDir?: string;
}): LocalSecretsLoadResult {
  if (loaded && !options?.secretsDir) {
    return {
      root: resolveSecretsRoot(),
      loadedFiles: [],
      appliedKeys: [],
    };
  }
  const result = loadLocalSecrets(options);
  loaded = true;
  return result;
}

/** @internal */
export function resetLocalSecretsLoadForTests(): void {
  loaded = false;
}
