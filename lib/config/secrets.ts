import { readFileSync } from "node:fs";

import { z } from "zod";

function readTrimmedFile(path: string | undefined): string | undefined {
  if (!path?.trim()) {
    return undefined;
  }
  try {
    return readFileSync(path.trim(), "utf8").trim();
  } catch {
    return undefined;
  }
}

function envOrFile(envKey: string, fileEnvKey: string): string | undefined {
  const direct = process.env[envKey]?.trim();
  if (direct) {
    return direct;
  }
  const filePath = process.env[fileEnvKey]?.trim();
  return readTrimmedFile(filePath);
}

const smtpSchema = z.object({
  host: z.string().min(1).optional(),
  port: z.coerce.number().int().positive().optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  from: z.string().email().optional(),
});

const appSecretsSchema = z.object({
  databaseUrl: z.string().min(1).optional(),
  /** Required for local identity signed cookies (`s2.` transport). */
  sessionSigningSecret: z.string().min(32).optional(),
  tokenSigningSecret: z.string().min(32).optional(),
  encryptionSecret: z.string().min(32).optional(),
  smtp: smtpSchema.default({}),
});

export type AppSecrets = z.infer<typeof appSecretsSchema>;

let cached: AppSecrets | null = null;

/**
 * Typed secrets and config (env + optional `*_FILE` paths for mounted `.secrets`).
 * Call from server-only code; never import into client bundles.
 */
export function loadAppSecrets(): AppSecrets {
  if (cached) {
    return cached;
  }
  const databaseUrl = envOrFile("APZHUB_DATABASE_URL", "APZHUB_DATABASE_URL_FILE") ?? process.env.DATABASE_URL?.trim();

  const sessionSigningSecret =
    envOrFile("APZHUB_SESSION_SIGNING_SECRET", "APZHUB_SESSION_SIGNING_SECRET_FILE");

  const tokenSigningSecret =
    envOrFile("APZHUB_TOKEN_SIGNING_SECRET", "APZHUB_TOKEN_SIGNING_SECRET_FILE") ??
    envOrFile("APZHUB_SESSION_SIGNING_SECRET", "APZHUB_SESSION_SIGNING_SECRET_FILE");

  const encryptionSecret = envOrFile("APZHUB_ENCRYPTION_SECRET", "APZHUB_ENCRYPTION_SECRET_FILE");

  const smtp = smtpSchema.parse({
    host: envOrFile("APZHUB_SMTP_HOST", "APZHUB_SMTP_HOST_FILE"),
    port: process.env.APZHUB_SMTP_PORT,
    user: envOrFile("APZHUB_SMTP_USER", "APZHUB_SMTP_USER_FILE"),
    password: envOrFile("APZHUB_SMTP_PASSWORD", "APZHUB_SMTP_PASSWORD_FILE"),
    from: envOrFile("APZHUB_SMTP_FROM", "APZHUB_SMTP_FROM_FILE"),
  });

  const parsed = appSecretsSchema.parse({
    databaseUrl,
    sessionSigningSecret,
    tokenSigningSecret,
    encryptionSecret,
    smtp,
  });
  cached = parsed;
  return parsed;
}

export function resetAppSecretsCache(): void {
  cached = null;
}

export function isSmtpConfigured(secrets: AppSecrets = loadAppSecrets()): boolean {
  const { smtp } = secrets;
  return Boolean(smtp.host && smtp.port && smtp.from);
}
