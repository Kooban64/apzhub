import { ensureLocalSecretsLoaded, getEnv } from "@apzhub/config";

import type { SmtpTransportConfig } from "./types";

export function resolveSmtpTransportConfig(
  env: Readonly<Record<string, string | undefined>> = process.env,
): SmtpTransportConfig | null {
  ensureLocalSecretsLoaded();
  const host = env.SMTP_HOST?.trim();
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS?.trim().replace(/\s+/g, "");
  if (!host || !user || !pass) {
    return null;
  }
  const portRaw = env.SMTP_PORT?.trim();
  const port = portRaw ? Number(portRaw) : 587;
  if (!Number.isFinite(port) || port <= 0) {
    return null;
  }
  const secure = env.SMTP_SECURE?.trim().toLowerCase() === "true" || port === 465;
  const from = env.SMTP_FROM?.trim() || env.EMAIL_FROM?.trim() || user;
  return { host, port, secure, user, pass, from };
}

export function resolveSmtpTransportConfigFromPlatformEnv(): SmtpTransportConfig | null {
  ensureLocalSecretsLoaded();
  const env = getEnv();
  return resolveSmtpTransportConfig({
    SMTP_HOST: env.SMTP_HOST,
    SMTP_PORT: env.SMTP_PORT !== undefined ? String(env.SMTP_PORT) : undefined,
    SMTP_USER: env.SMTP_USER,
    SMTP_PASS: env.SMTP_PASS,
    SMTP_FROM: env.SMTP_FROM,
    SMTP_SECURE:
      env.SMTP_SECURE === undefined ? undefined : env.SMTP_SECURE ? "true" : "false",
    EMAIL_FROM: env.EMAIL_FROM,
  });
}

export function isSmtpConfigured(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  return resolveSmtpTransportConfig(env) !== null;
}
