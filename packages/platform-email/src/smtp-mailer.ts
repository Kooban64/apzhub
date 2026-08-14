import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

import {
  isSmtpConfigured,
  resolveSmtpTransportConfig,
  resolveSmtpTransportConfigFromPlatformEnv,
} from "./smtp-config";
import type {
  PlatformEmailHealth,
  SendPlatformEmailInput,
  SendPlatformEmailResult,
  SmtpTransportConfig,
} from "./types";

type Mailer = {
  sendMail: (
    options: SMTPTransport.Options,
  ) => Promise<{ messageId?: string; accepted?: unknown[] }>;
  verify: () => Promise<true>;
};

let cached: { readonly key: string; readonly mailer: Mailer } | undefined;

function cacheKey(config: SmtpTransportConfig): string {
  return `${config.host}|${config.port}|${config.user}|${config.secure ? "s" : "p"}`;
}

function createMailer(config: SmtpTransportConfig): Mailer {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  }) as unknown as Mailer;
}

function getMailer(config: SmtpTransportConfig): Mailer {
  const key = cacheKey(config);
  if (cached?.key === key) {
    return cached.mailer;
  }
  const mailer = createMailer(config);
  cached = { key, mailer };
  return mailer;
}

export function resetPlatformEmailForTests(): void {
  cached = undefined;
}

export async function sendPlatformEmail(
  input: SendPlatformEmailInput,
): Promise<SendPlatformEmailResult> {
  // Prefer process.env (after secrets load) so blank optional SMTP_* never
  // trip platformEnvSchema during send-path probes / tests.
  const config =
    resolveSmtpTransportConfig(process.env) ??
    resolveSmtpTransportConfigFromPlatformEnv();
  if (!config) {
    throw new Error(
      "SMTP is not configured. Provide `.secrets/smtp` or SMTP_HOST/SMTP_USER/SMTP_PASS.",
    );
  }
  const mailer = getMailer(config);
  const info = await mailer.sendMail({
    from: input.from ?? config.from,
    to: Array.isArray(input.to) ? [...input.to] : input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    headers: input.headers ? { ...input.headers } : undefined,
  });
  const accepted = (info.accepted ?? []).map(String);
  return {
    ok: true,
    messageId: info.messageId ?? "",
    accepted,
  };
}

export async function probePlatformEmailHealth(
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<PlatformEmailHealth> {
  const checkedAt = new Date().toISOString();
  const config = resolveSmtpTransportConfig(env);
  if (!config) {
    return {
      configured: false,
      status: "unconfigured",
      message: "SMTP_HOST/SMTP_USER/SMTP_PASS not set",
      checkedAt,
    };
  }
  try {
    const mailer = getMailer(config);
    await mailer.verify();
    return {
      configured: true,
      status: "healthy",
      host: config.host,
      port: config.port,
      from: config.from,
      checkedAt,
    };
  } catch (error) {
    return {
      configured: true,
      status: "unhealthy",
      host: config.host,
      port: config.port,
      from: config.from,
      message: error instanceof Error ? error.message : "SMTP verify failed",
      checkedAt,
    };
  }
}

export { isSmtpConfigured, resolveSmtpTransportConfig };
