export const FARADAY_INTEGRATION_VERSION = "0.1.1";

export type FaradayHealthResult = {
  readonly ok: boolean;
  readonly detail: string;
};

export { normalizeFaradayPayload, type FaradayFindingSeed } from "./normalize.js";

export {
  buildFaradayVulnsPath,
  fetchFaradayVulns,
  resolveFaradayExportConfig,
  toFaradayArtefact,
  type FaradayExportConfig,
} from "./export-client.js";

const PLANNED_DETAIL = "compose not deployed — ingest via artefact";

/**
 * Probe Faraday health. Without FARADAY_URL (or baseUrl), returns planned/not deployed.
 */
export async function probeFaradayHealth(
  baseUrl?: string,
): Promise<FaradayHealthResult> {
  const raw = baseUrl?.trim() || process.env.FARADAY_URL?.trim();
  if (!raw) {
    return { ok: false, detail: PLANNED_DETAIL };
  }
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
