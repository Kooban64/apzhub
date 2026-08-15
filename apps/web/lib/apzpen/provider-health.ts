/**
 * Lightweight provider readiness probes for APZPEN catalogue UI.
 * Never starts scanners — read-only checks only.
 */

import { probeFaradayHealth } from "@apzhub/integration-faraday";
import { probeGreenboneHealth } from "@apzhub/integration-greenbone";

export type ProviderHealthStatus = "ok" | "degraded" | "unknown" | "down";

export type ProviderHealthRow = {
  readonly id: string;
  readonly status: ProviderHealthStatus;
  readonly detail: string;
  readonly checkedAt: string;
};

async function probeHttp(
  url: string,
  timeoutMs = 1500,
): Promise<{ ok: boolean; detail: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "manual",
    });
    return {
      ok: res.status > 0 && res.status < 500,
      detail: `HTTP ${res.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message.slice(0, 120) : "unreachable",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function probeApzpenProviderHealth(input?: {
  readonly mobsfUrl?: string;
  readonly greenboneUrl?: string;
  readonly faradayUrl?: string;
}): Promise<readonly ProviderHealthRow[]> {
  const checkedAt = new Date().toISOString();
  const mobsfUrl =
    input?.mobsfUrl?.trim() ||
    process.env.APZPEN_MOBSF_URL?.trim() ||
    "http://127.0.0.1:8000";

  const [mobsf, greenbone, faraday] = await Promise.all([
    probeHttp(mobsfUrl),
    probeGreenboneHealth(input?.greenboneUrl),
    probeFaradayHealth(input?.faradayUrl),
  ]);
  const githubApp = Boolean(
    process.env.GITHUB_APP_ID?.trim() || process.env.GITHUB_APP_PRIVATE_KEY?.trim(),
  );
  const githubPat = Boolean(
    process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim(),
  );

  const faradayConfigured = Boolean(
    input?.faradayUrl?.trim() || process.env.FARADAY_URL?.trim(),
  );

  return [
    {
      id: "mobsf",
      status: mobsf.ok ? "ok" : "down",
      detail: mobsf.ok
        ? `Reachable at ${mobsfUrl} (${mobsf.detail})`
        : `Not reachable at ${mobsfUrl} (${mobsf.detail})`,
      checkedAt,
    },
    {
      id: "greenbone",
      status: greenbone.ok ? "ok" : "down",
      detail: greenbone.detail,
      checkedAt,
    },
    {
      id: "faraday",
      status: faradayConfigured ? (faraday.ok ? "ok" : "down") : "unknown",
      detail: faraday.detail,
      checkedAt,
    },
    {
      id: "github",
      status: githubApp || githubPat ? "ok" : "unknown",
      detail: githubApp
        ? "GitHub App credentials present in env/secrets"
        : githubPat
          ? "GitHub PAT present in env/secrets"
          : "No GitHub App/PAT configured — sync uses seed/demo",
      checkedAt,
    },
    {
      id: "zap",
      status: "unknown",
      detail: "Ops cluster runner — probe via dry-run dispatch",
      checkedAt,
    },
    {
      id: "trivy",
      status: "unknown",
      detail: "Ops cluster runner — probe via dry-run dispatch",
      checkedAt,
    },
  ];
}
