/**
 * GitHub App JWT + installation access token.
 * Private key from env (loaded via `.secrets/github-app`) — never log key material.
 */

import { createSign, createPrivateKey } from "node:crypto";

import { ensureLocalSecretsLoaded } from "@apzhub/config";

import type { EnvVars } from "@/lib/env-vars";
export type GithubAuthMode = "github_app" | "pat" | "none";

export type GithubAuthStatus = {
  readonly mode: GithubAuthMode;
  readonly appConfigured: boolean;
  readonly patConfigured: boolean;
  readonly appIdPresent: boolean;
  readonly installationIdPresent: boolean;
  readonly privateKeyPresent: boolean;
};

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function getGithubAuthStatus(env: EnvVars = process.env): GithubAuthStatus {
  ensureLocalSecretsLoaded();
  const appIdPresent = Boolean(env.GITHUB_APP_ID?.trim());
  const installationIdPresent = Boolean(env.GITHUB_APP_INSTALLATION_ID?.trim());
  const privateKeyPresent = Boolean(env.GITHUB_APP_PRIVATE_KEY?.trim());
  const appConfigured = appIdPresent && installationIdPresent && privateKeyPresent;
  const patConfigured = Boolean(
    env.GITHUB_TOKEN?.trim() || env.APZHUB_SCM_GITHUB_TOKEN?.trim(),
  );
  let mode: GithubAuthMode = "none";
  if (appConfigured) mode = "github_app";
  else if (patConfigured) mode = "pat";
  return {
    mode,
    appConfigured,
    patConfigured,
    appIdPresent,
    installationIdPresent,
    privateKeyPresent,
  };
}

/** Create a short-lived GitHub App JWT (RS256). */
export function createGithubAppJwt(input: {
  readonly appId: string;
  readonly privateKeyPem: string;
  readonly nowSec?: number;
}): string {
  const now = input.nowSec ?? Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: input.appId,
    }),
  );
  const data = `${header}.${payload}`;
  const key = createPrivateKey(input.privateKeyPem);
  const signer = createSign("RSA-SHA256");
  signer.update(data);
  signer.end();
  const signature = b64url(signer.sign(key));
  return `${data}.${signature}`;
}

export type GithubTokenResult = {
  readonly token: string;
  readonly mode: Exclude<GithubAuthMode, "none">;
  readonly expiresAt?: string;
};

type FetchLike = typeof fetch;

/**
 * Resolve a GitHub API bearer token — App installation token preferred, else PAT.
 */
export async function resolveGithubAccessToken(input?: {
  readonly env?: EnvVars;
  readonly fetchFn?: FetchLike;
  readonly apiBaseUrl?: string;
}): Promise<GithubTokenResult | null> {
  ensureLocalSecretsLoaded();
  const env = input?.env ?? process.env;
  const status = getGithubAuthStatus(env);
  const fetchFn = input?.fetchFn ?? fetch;
  const apiBase = (input?.apiBaseUrl ?? "https://api.github.com").replace(/\/$/, "");

  if (status.appConfigured) {
    const jwt = createGithubAppJwt({
      appId: env.GITHUB_APP_ID!.trim(),
      privateKeyPem: env.GITHUB_APP_PRIVATE_KEY!.trim(),
    });
    const installationId = env.GITHUB_APP_INSTALLATION_ID!.trim();
    const res = await fetchFn(
      `${apiBase}/app/installations/${installationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${jwt}`,
          "x-github-api-version": "2022-11-28",
          "user-agent": "APZPEN-SecurityAssurance",
        },
      },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `GitHub App installation token failed (${res.status}): ${body.slice(0, 200)}`,
      );
    }
    const json = (await res.json()) as {
      token?: string;
      expires_at?: string;
    };
    if (!json.token) {
      throw new Error("GitHub App token response missing token.");
    }
    return {
      token: json.token,
      mode: "github_app",
      expiresAt: json.expires_at,
    };
  }

  const pat = env.GITHUB_TOKEN?.trim() || env.APZHUB_SCM_GITHUB_TOKEN?.trim();
  if (pat) {
    return { token: pat, mode: "pat" };
  }
  return null;
}

export async function githubApiFetch(input: {
  readonly path: string;
  readonly method?: string;
  readonly token: string;
  readonly body?: unknown;
  readonly fetchFn?: FetchLike;
  readonly apiBaseUrl?: string;
}): Promise<Response> {
  const fetchFn = input.fetchFn ?? fetch;
  const apiBase = (input.apiBaseUrl ?? "https://api.github.com").replace(/\/$/, "");
  const path = input.path.startsWith("/") ? input.path : `/${input.path}`;
  return fetchFn(`${apiBase}${path}`, {
    method: input.method ?? "GET",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${input.token}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "APZPEN-SecurityAssurance",
      ...(input.body ? { "content-type": "application/json" } : {}),
    },
    body: input.body ? JSON.stringify(input.body) : undefined,
  });
}
