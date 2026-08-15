export const FARADAY_INTEGRATION_VERSION = "0.1.0";

export type FaradayFindingSeed = {
  readonly title: string;
  readonly severity: string;
  readonly host?: string;
  readonly message?: string;
};

export type FaradayHealthResult = {
  readonly ok: boolean;
  readonly detail: string;
};

const PLANNED_DETAIL = "compose not deployed — ingest via artefact";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function seedFromRecord(f: Record<string, unknown>, index: number): FaradayFindingSeed {
  const severity = String(f.severity ?? f.level ?? f.threat ?? "info").toLowerCase();
  const message =
    typeof f.message === "string"
      ? f.message
      : typeof f.description === "string"
        ? f.description
        : undefined;
  const title = String(
    f.name ?? f.message ?? f.title ?? f.ruleId ?? `Finding ${index}`,
  ).slice(0, 160);
  const host =
    typeof f.target === "string"
      ? f.target
      : typeof f.host === "string"
        ? f.host
        : undefined;
  return {
    title,
    severity,
    ...(host ? { host } : {}),
    ...(message ? { message } : {}),
  };
}

/**
 * Normalize Faraday JSON into finding seeds.
 * Accepts `{ vulns: [{ name, severity, target }] }` or simplified
 * `{ findings: [{ level|severity, message|name, host }] }`.
 */
export function normalizeFaradayPayload(payload: unknown): FaradayFindingSeed[] {
  const root = asRecord(payload);
  if (!root) return [];

  const list = Array.isArray(root.vulns)
    ? root.vulns
    : Array.isArray(root.findings)
      ? root.findings
      : null;
  if (!list) return [];

  const out: FaradayFindingSeed[] = [];
  let i = 0;
  for (const item of list) {
    const f = asRecord(item);
    if (!f) continue;
    i += 1;
    out.push(seedFromRecord(f, i));
  }
  return out;
}

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
