/**
 * Faraday REST export helper — SPR-FULL-002-C.
 * Pulls vulns JSON when FARADAY_URL (+ optional token) is set; never certifies.
 */

import { normalizeFaradayPayload, type FaradayFindingSeed } from "./normalize.js";

export type FaradayExportConfig = {
  readonly baseUrl: string;
  readonly token?: string;
  readonly workspace?: string;
  readonly timeoutMs?: number;
};

export function resolveFaradayExportConfig(
  env: NodeJS.ProcessEnv = process.env,
): FaradayExportConfig | null {
  const baseUrl = env.FARADAY_URL?.trim();
  if (!baseUrl) return null;
  const token = env.FARADAY_API_TOKEN?.trim() || env.FARADAY_TOKEN?.trim();
  const workspace = env.FARADAY_WORKSPACE?.trim();
  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    ...(token ? { token } : {}),
    ...(workspace ? { workspace } : {}),
    timeoutMs: Number(env.FARADAY_TIMEOUT_MS?.trim() || "8000") || 8000,
  };
}

export function buildFaradayVulnsPath(config: FaradayExportConfig): string {
  const ws = config.workspace?.trim() || "default";
  return `/_api/v3/ws/${encodeURIComponent(ws)}/vulns`;
}

export async function fetchFaradayVulns(
  config: FaradayExportConfig,
  fetchFn: typeof fetch = fetch,
): Promise<FaradayFindingSeed[]> {
  const path = buildFaradayVulnsPath(config);
  const url = `${config.baseUrl}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs ?? 8000);
  try {
    const headers: Record<string, string> = {
      accept: "application/json",
    };
    if (config.token) {
      headers.authorization = `Token ${config.token}`;
    }
    const res = await fetchFn(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`faraday.http_${res.status}`);
    }
    const body = (await res.json()) as unknown;
    // Faraday v3 often wraps rows; also accept raw vulns/findings arrays.
    const record =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : null;
    if (Array.isArray(body)) {
      return normalizeFaradayPayload({ vulns: body });
    }
    if (record && Array.isArray(record.rows)) {
      return normalizeFaradayPayload({ vulns: record.rows });
    }
    return normalizeFaradayPayload(body);
  } finally {
    clearTimeout(timer);
  }
}

export function toFaradayArtefact(findings: readonly FaradayFindingSeed[]): {
  readonly tool: "faraday";
  readonly findings: readonly FaradayFindingSeed[];
} {
  return { tool: "faraday", findings };
}
