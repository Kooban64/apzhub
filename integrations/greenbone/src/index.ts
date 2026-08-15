export const GREENBONE_INTEGRATION_VERSION = "0.1.1";

export type GreenboneFindingSeed = {
  readonly title: string;
  readonly severity: string;
  readonly host?: string;
  readonly message?: string;
};

export type GreenboneHealthResult = {
  readonly ok: boolean;
  readonly detail: string;
};

export {
  buildGmpAuthenticateCommand,
  buildGmpGetResultsCommand,
  buildGmpGetVersionCommand,
  fetchGmpResults,
  fetchGmpVersion,
  parseGmpResultsXml,
  parseGmpVersionXml,
  resolveGmpConfigFromEnv,
  toGreenboneSimplifiedArtefact,
  withGmpSession,
  type GmpClientConfig,
  type GmpVersionInfo,
} from "./gmp-client.js";

const DEFAULT_GREENBONE_UI_URL = "http://127.0.0.1:9392";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/**
 * Normalize Greenbone simplified JSON artefacts into finding seeds.
 * Accepts `{ findings: [{ level|severity, message|name, host }], tool? }`.
 */
export function normalizeGreenboneSimplified(payload: unknown): GreenboneFindingSeed[] {
  const root = asRecord(payload);
  if (!root || !Array.isArray(root.findings)) return [];

  const out: GreenboneFindingSeed[] = [];
  let i = 0;
  for (const item of root.findings) {
    const f = asRecord(item);
    if (!f) continue;
    i += 1;
    const severity = String(f.severity ?? f.level ?? f.threat ?? "info").toLowerCase();
    const message =
      typeof f.message === "string"
        ? f.message
        : typeof f.description === "string"
          ? f.description
          : undefined;
    const title = String(f.message ?? f.name ?? f.ruleId ?? `Finding ${i}`).slice(
      0,
      160,
    );
    const host = typeof f.host === "string" ? f.host : undefined;
    out.push({
      title,
      severity,
      ...(host ? { host } : {}),
      ...(message ? { message } : {}),
    });
  }
  return out;
}

/**
 * Probe Greenbone UI (default localhost:9392 or GREENBONE_UI_URL).
 * Read-only — never starts scans.
 */
export async function probeGreenboneHealth(
  baseUrl?: string,
): Promise<GreenboneHealthResult> {
  const raw =
    baseUrl?.trim() || process.env.GREENBONE_UI_URL?.trim() || DEFAULT_GREENBONE_UI_URL;
  const url = raw.replace(/\/$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "manual",
    });
    const ok = res.status > 0 && res.status < 500;
    return {
      ok,
      detail: ok
        ? `Reachable at ${url} (HTTP ${res.status})`
        : `HTTP ${res.status} from ${url}`,
    };
  } catch (error) {
    return {
      ok: false,
      detail:
        error instanceof Error
          ? `${url}: ${error.message.slice(0, 120)}`
          : `${url}: unreachable`,
    };
  } finally {
    clearTimeout(timer);
  }
}
